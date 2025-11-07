// script.js - updated list switcher UI (segmented buttons) + theme toggle.
// Minimal functional changes: replaces the ugly <select> with a compact segmented control
// (two pill buttons) for switching lists. Buttons show active state and are keyboard accessible.
// The rest of the app (auto-submit, per-list persistence, sprites, confetti, dark mode) is unchanged.

let wordsData = []; // populated by loadList()
const STORAGE_KEY_BASE = "revealedWords_v1"; // actual key: STORAGE_KEY_BASE + "_" + listId
const THEME_KEY = "prefTheme";

const wordsUL = document.getElementById("wordsUL");
const revealedList = document.getElementById("revealedList");
const progressEl = document.getElementById("progress");
const messageEl = document.getElementById("message");
const input = document.getElementById("wordInput");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const giveUpBtn = document.getElementById("giveUpBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const navInfo = document.getElementById("navInfo");

// App state (per list)
let currentListId = "gen1"; // "gen1" or "gen2"
let revealed = [];
let userRevealed = new Set();
let currentIndex = -1;
let normalizedIndexMap = {};
let isAutoSubmitting = false;
let listGaveUp = false;

// ---------------- Theme helpers ----------------
function applyTheme(theme) {
  const doc = document.documentElement;
  if (theme === "dark") doc.setAttribute("data-theme", "dark");
  else doc.setAttribute("data-theme", "light");
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = theme === "dark" ? "🌙 Dark" : "☀️ Light";
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}
function loadSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") { applyTheme(saved); return; }
  } catch (e) {}
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
}

// ---------------- UI insertion (segmented control) ----------------
function insertListSelector() {
  if (document.getElementById("listSwitcher")) return;

  const container = document.createElement("div");
  container.className = "list-switcher";
  container.id = "listSwitcher";
  container.style.display = "flex";
  container.style.gap = "0.5rem";
  container.style.alignItems = "center";
  container.style.marginBottom = "0.5rem";

  const label = document.createElement("div");
  label.textContent = "List:";
  label.setAttribute("aria-hidden", "true");
  label.style.fontSize = "0.95rem";
  label.style.color = "var(--muted)";
  label.style.marginLeft = "4px";

  // segmented control container
  const segmented = document.createElement("div");
  segmented.className = "segmented";
  segmented.setAttribute("role", "tablist");
  segmented.style.display = "inline-flex";
  segmented.style.borderRadius = "999px";
  segmented.style.background = "transparent";
  segmented.style.border = "1px solid var(--card-contrast)";
  segmented.style.padding = "4px";

  // Gen1 button
  const btn1 = document.createElement("button");
  btn1.id = "btn-gen1";
  btn1.type = "button";
  btn1.className = "list-btn";
  btn1.textContent = "Gen 1";
  btn1.setAttribute("role", "tab");
  btn1.setAttribute("aria-pressed", currentListId === "gen1" ? "true" : "false");
  btn1.addEventListener("click", async () => {
    if (currentListId === "gen1") return;
    await loadList("gen1");
    updateSegmentedActive();
  });
  btn1.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") document.getElementById("btn-gen2").focus();
  });

  // Gen2 button
  const btn2 = document.createElement("button");
  btn2.id = "btn-gen2";
  btn2.type = "button";
  btn2.className = "list-btn";
  btn2.textContent = "Gen 2";
  btn2.setAttribute("role", "tab");
  btn2.setAttribute("aria-pressed", currentListId === "gen2" ? "true" : "false");
  btn2.addEventListener("click", async () => {
    if (currentListId === "gen2") return;
    await loadList("gen2");
    updateSegmentedActive();
  });
  btn2.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") document.getElementById("btn-gen1").focus();
  });

  segmented.appendChild(btn1);
  segmented.appendChild(btn2);

  // Theme toggle button
  const themeBtn = document.createElement("button");
  themeBtn.id = "themeToggleBtn";
  themeBtn.type = "button";
  themeBtn.className = "secondary";
  themeBtn.style.padding = "6px 10px";
  themeBtn.style.fontSize = "0.95rem";
  themeBtn.addEventListener("click", toggleTheme);

  container.appendChild(label);
  container.appendChild(segmented);
  container.appendChild(themeBtn);

  const ref = document.getElementById("controls") || input;
  if (ref && ref.parentNode) {
    ref.parentNode.insertBefore(container, ref);
  } else {
    document.body.insertBefore(container, document.body.firstChild);
  }

  // set initial active visual
  updateSegmentedActive();
  loadSavedTheme();
}

function updateSegmentedActive() {
  const b1 = document.getElementById("btn-gen1");
  const b2 = document.getElementById("btn-gen2");
  if (!b1 || !b2) return;
  if (currentListId === "gen1") {
    b1.classList.add("active");
    b1.setAttribute("aria-pressed", "true");
    b2.classList.remove("active");
    b2.setAttribute("aria-pressed", "false");
  } else {
    b2.classList.add("active");
    b2.setAttribute("aria-pressed", "true");
    b1.classList.remove("active");
    b1.setAttribute("aria-pressed", "false");
  }
}

// ---------------- Normalization & index map ----------------
function normalizeText(s) {
  if (!s || typeof s !== "string") return "";
  s = s.replace(/\u2640/g, "f"); // ♀ -> f
  s = s.replace(/\u2642/g, "m"); // ♂ -> m
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function buildNormalizedIndexMap() {
  const map = {};
  wordsData.forEach((item, idx) => {
    const n = normalizeText(item.word);
    if (!map[n]) map[n] = [];
    map[n].push(idx);
  });
  normalizedIndexMap = map;
}

// ---------------- persistence per list ----------------
function storageKeyForList(listId) {
  return `${STORAGE_KEY_BASE}_${listId}`;
}
function loadStoredProgress(listId) {
  let storedRaw;
  try {
    storedRaw = JSON.parse(localStorage.getItem(storageKeyForList(listId)) || "null");
  } catch (e) {
    storedRaw = null;
  }
  revealed = [];
  userRevealed = new Set();
  listGaveUp = false;
  if (Array.isArray(storedRaw)) {
    const legacy = storedRaw.slice();
    const used = new Array(wordsData.length).fill(false);
    for (const norm of legacy) {
      const idx = wordsData.findIndex((w, i) => !used[i] && normalizeText(w.word) === norm);
      if (idx !== -1) {
        used[idx] = true;
        revealed.push(idx);
        userRevealed.add(idx);
      }
    }
  } else if (storedRaw && typeof storedRaw === "object") {
    if (Array.isArray(storedRaw.all)) {
      revealed = storedRaw.all.map(x => Number(x)).filter(n => Number.isFinite(n) && n >= 0 && n < wordsData.length);
    }
    if (Array.isArray(storedRaw.user)) {
      storedRaw.user.forEach(x => {
        const n = Number(x);
        if (Number.isFinite(n) && n >= 0 && n < wordsData.length) userRevealed.add(n);
      });
    }
    if (typeof storedRaw.gaveUp === "boolean") listGaveUp = storedRaw.gaveUp;
  } else {
    revealed = [];
    userRevealed = new Set();
    listGaveUp = false;
  }
  currentIndex = revealed.length > 0 ? revealed.length - 1 : -1;
}
function saveProgressForCurrentList() {
  const toStore = { all: revealed, user: Array.from(userRevealed), gaveUp: !!listGaveUp };
  try {
    localStorage.setItem(storageKeyForList(currentListId), JSON.stringify(toStore));
  } catch (e) {
    console.error("Failed to save progress:", e);
  }
}

// ---------------- render helpers (grid layout keeps width consistent) ----------------
function renderWordList() {
  wordsUL.innerHTML = "";
  wordsData.forEach((item, idx) => {
    const li = document.createElement("li");
    li.dataset.idx = idx;
    li.dataset.word = item.word.toLowerCase();
    li.style.display = "grid";
    li.style.gridTemplateColumns = "1fr 48px";
    li.style.alignItems = "center";
    li.style.columnGap = "10px";
    li.style.minHeight = "52px";
    const nameSpan = document.createElement("span");
    nameSpan.className = "word-name";
    if (revealed.indexOf(idx) !== -1) {
      if (userRevealed.has(idx)) li.className = "found";
      else li.className = "given-up";
      nameSpan.textContent = item.word;
      const img = document.createElement("img");
      img.className = "sprite";
      let fileName = item.word.toLowerCase()
        .replace(/\u2640/g, "f")
        .replace(/\u2642/g, "m")
        .replace(/['.(),]/g, "")
        .replace(/[\s]+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      img.src = `https://img.pokemondb.net/sprites/home/normal/${fileName}.png`;
      img.alt = item.word + " sprite";
      img.loading = "lazy";
      img.onerror = () => { img.style.display = "none"; };
      li.appendChild(nameSpan);
      li.appendChild(img);
    } else {
      li.className = "hidden";
      nameSpan.textContent = `Hidden #${idx + 1}`;
      const placeholder = document.createElement("span");
      placeholder.className = "sprite-placeholder";
      placeholder.style.display = "block";
      placeholder.style.width = "48px";
      li.appendChild(nameSpan);
      li.appendChild(placeholder);
    }
    wordsUL.appendChild(li);
  });
  progressEl.textContent = `${revealed.length} / ${wordsData.length} found`;
}

function renderRevealed() {
  revealedList.innerHTML = "";
  if (revealed.length === 0 || currentIndex < 0) {
    navInfo.textContent = "";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    revealedList.textContent = "Nothing revealed yet — try guessing a secret word.";
    return;
  }
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > revealed.length - 1) currentIndex = revealed.length - 1;
  const idx = revealed[currentIndex];
  const item = wordsData[idx];
  if (!item) { revealedList.textContent = "Unexpected error: revealed word not found in data."; return; }
  const card = document.createElement("div");
  card.className = "card";
  if (!userRevealed.has(idx)) card.classList.add("given-up");
  const h3 = document.createElement("h3"); h3.textContent = item.word;
  const p = document.createElement("p"); p.textContent = item.secret;
  card.appendChild(h3); card.appendChild(p);
  revealedList.appendChild(card);
  navInfo.textContent = `Showing ${currentIndex + 1} of ${revealed.length}`;
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex >= revealed.length - 1;
}

// ---------------- visuals & interaction ----------------
function flashElement(el, color, duration = 220) {
  if (!el) return;
  const prev = el.style.backgroundColor;
  el.style.transition = `background-color ${Math.min(duration,300)}ms ease`;
  el.style.backgroundColor = color;
  setTimeout(() => {
    el.style.backgroundColor = prev || "";
    setTimeout(() => { el.style.transition = ""; }, 250);
  }, duration);
}
function acceptAndClearNew() { input.value = ""; try { input.focus(); } catch (e) {} flashElement(input, "#e6ffef"); }
function acceptAndClearAlready(idx) { input.value = ""; try { input.focus(); } catch (e) {} flashElement(input, "#fff7df"); const li = wordsUL.querySelector(`li[data-idx="${idx}"]`); if (li) flashElement(li, "#fff7df"); }

// ---------------- matching & submit logic ----------------
function findIndexByInput(rawInput) {
  const normalizedInput = normalizeText(rawInput);
  if (!normalizedInput) return null;
  const matching = normalizedIndexMap[normalizedInput];
  if (!matching || matching.length === 0) return null;
  for (const idx of matching) {
    if (revealed.indexOf(idx) === -1) return { idx, item: wordsData[idx], alreadyRevealed: false };
  }
  return { idx: matching[0], item: wordsData[matching[0]], alreadyRevealed: true };
}
function showMessage(text, opts = {}) {
  messageEl.textContent = text;
  if (opts.positive) messageEl.style.color = "var(--success)";
  else if (opts.warning) messageEl.style.color = "var(--danger)";
  else messageEl.style.color = "var(--muted)";
}
function showAlreadyTypedHintIfApplicable(raw) {
  const normalized = normalizeText(raw);
  if (!normalized) { if (messageEl.dataset.hint === "already-typed") { showMessage("", {}); delete messageEl.dataset.hint; } return false; }
  const matching = normalizedIndexMap[normalized];
  if (!matching || matching.length === 0) { if (messageEl.dataset.hint === "already-typed") { showMessage("", {}); delete messageEl.dataset.hint; } return false; }
  const allTyped = matching.every(idx => userRevealed.has(idx));
  if (allTyped) {
    const display = wordsData[matching[0]].word;
    showMessage(`You already entered "${display}". Press Enter to view it.`, { positive: false });
    messageEl.dataset.hint = "already-typed";
    return true;
  } else {
    if (messageEl.dataset.hint === "already-typed") { showMessage("", {}); delete messageEl.dataset.hint; }
    return false;
  }
}
function onInputImmediate() {
  if (input.disabled) return;
  const raw = input.value;
  const hinted = showAlreadyTypedHintIfApplicable(raw);
  if (hinted) return;
  const normalized = normalizeText(raw);
  if (!normalized) return;
  if (!normalizedIndexMap.hasOwnProperty(normalized)) return;
  const matching = normalizedIndexMap[normalized];
  const hasUnenteredMatch = matching.some(idx => !userRevealed.has(idx));
  if (!hasUnenteredMatch) { showAlreadyTypedHintIfApplicable(raw); return; }
  if (isAutoSubmitting) return;
  isAutoSubmitting = true;
  setTimeout(() => { handleSubmit(); setTimeout(() => { isAutoSubmitting = false; }, 120); }, 0);
}
function handleSubmit() {
  const raw = input.value.trim();
  if (!raw) { showMessage("Please type a word to guess.", { positive: false }); return; }
  const normalized = normalizeText(raw);
  if (!normalized) { showMessage("Please type a valid word.", { positive: false }); return; }
  if (normalized === "nidoran") {
    const matching = normalizedIndexMap["nidoran"] || [];
    const unrevealed = matching.filter(i => revealed.indexOf(i) === -1);
    if (unrevealed.length === 0) {
      const firstPos = revealed.indexOf(matching[0]);
      if (firstPos !== -1) currentIndex = firstPos;
      renderRevealed();
      let converted = 0;
      for (const i of matching) { if (!userRevealed.has(i)) { userRevealed.add(i); converted++; } }
      if (converted) { saveProgressForCurrentList(); renderWordList(); }
      showMessage(`You already revealed Nidoran — showing it now.`, { positive: false });
      acceptAndClearAlready(matching[0] || 0);
      return;
    }
    for (const i of unrevealed) { revealed.push(i); userRevealed.add(i); }
    saveProgressForCurrentList();
    renderWordList();
    currentIndex = revealed.length - 1;
    renderRevealed();
    showMessage(`Revealed ${unrevealed.length} Nidoran!`, { positive: true });
    acceptAndClearNew();
    if (userRevealed.size === wordsData.length && revealed.length === wordsData.length) triggerCelebration();
    return;
  }
  const res = findIndexByInput(raw);
  if (!res) { showMessage(`"${raw}" is not a secret word (or it's misspelled).`, { positive: false }); if (!isAutoSubmitting) input.select(); return; }
  const { idx, item, alreadyRevealed } = res;
  if (alreadyRevealed) {
    const firstPos = revealed.indexOf(idx);
    if (firstPos !== -1) currentIndex = firstPos;
    renderRevealed();
    if (!userRevealed.has(idx)) { userRevealed.add(idx); saveProgressForCurrentList(); renderWordList(); }
    showMessage(`You already revealed "${item.word}". Showing it now.`, { positive: false });
    acceptAndClearAlready(idx);
    return;
  }
  revealed.push(idx);
  userRevealed.add(idx);
  saveProgressForCurrentList();
  renderWordList();
  currentIndex = revealed.length - 1;
  renderRevealed();
  showMessage(`Nice! "${item.word}" revealed.`, { positive: true });
  acceptAndClearNew();
  if (userRevealed.size === wordsData.length && revealed.length === wordsData.length) triggerCelebration();
}

// ---------------- navigation / give up / reset ----------------
function handlePrev() { if (currentIndex > 0) { currentIndex--; renderRevealed(); } }
function handleNext() { if (currentIndex < revealed.length - 1) { currentIndex++; renderRevealed(); } }
function handleReset() {
  const ok = window.confirm("Reset progress? This will clear all revealed words and cannot be undone.");
  if (!ok) { showMessage("Reset cancelled.", { positive: false }); return; }
  revealed = []; userRevealed = new Set(); currentIndex = -1;
  listGaveUp = false;
  saveProgressForCurrentList();
  renderWordList();
  renderRevealed();
  input.disabled = false; submitBtn.disabled = false; giveUpBtn.disabled = false;
  showMessage("Progress has been reset.", { positive: true });
  input.value = ""; input.focus();
}
function handleGiveUp() {
  if (revealed.length === wordsData.length) { showMessage("All targets are already revealed.", { positive: false }); return; }
  const ok = window.confirm("Give up and reveal all remaining Pokémon? This will show all secrets and cannot be undone (you can reset to clear).");
  if (!ok) { showMessage("Give up cancelled.", { positive: false }); return; }
  wordsData.forEach((_, i) => { if (revealed.indexOf(i) === -1) revealed.push(i); });
  saveProgressForCurrentList();
  renderWordList();
  currentIndex = revealed.length - 1;
  renderRevealed();
  listGaveUp = true;
  saveProgressForCurrentList();
  input.disabled = true; submitBtn.disabled = true; giveUpBtn.disabled = true;
  showMessage("You gave up — all remaining secrets are revealed for this list. Use Reset to start over.", { warning: true });
}

// ---------------- list loading & switching ----------------
const listFiles = { gen1: "words-gen1.json", gen2: "words-gen2.json" };
async function loadList(listId) {
  if (listId === currentListId && wordsData.length > 0) return;
  currentListId = listId;
  try {
    const res = await fetch(listFiles[listId]);
    if (!res.ok) throw new Error(`Failed to fetch ${listFiles[listId]}`);
    wordsData = await res.json();
  } catch (e) {
    console.error("Failed to load list file:", e);
    wordsData = [{ word: "Pidgeot", secret: "Fallback entry." }];
  }
  buildNormalizedIndexMap();
  loadStoredProgress(listId);
  renderWordList();
  renderRevealed();
  input.disabled = !!listGaveUp;
  submitBtn.disabled = !!listGaveUp;
  giveUpBtn.disabled = listGaveUp || (revealed.length === wordsData.length);
  if (messageEl.dataset.hint === "already-typed") { showMessage("", {}); delete messageEl.dataset.hint; }
  updateSegmentedActive();
}

// ---------------- initialization ----------------
async function initApp() {
  insertListSelector();
  await loadList("gen1");
  submitBtn.addEventListener("click", () => { const prevAuto = isAutoSubmitting; isAutoSubmitting = false; handleSubmit(); isAutoSubmitting = prevAuto; });
  input.addEventListener("keydown", e => { if (e.key === "Enter") { const prevAuto = isAutoSubmitting; isAutoSubmitting = false; handleSubmit(); isAutoSubmitting = prevAuto; } });
  input.addEventListener("input", onInputImmediate);
  resetBtn.addEventListener("click", handleReset);
  giveUpBtn.addEventListener("click", handleGiveUp);
  prevBtn.addEventListener("click", handlePrev);
  nextBtn.addEventListener("click", handleNext);
  loadSavedTheme();
}
initApp();
