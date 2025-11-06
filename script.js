<<<<<<< HEAD
// script.js - supports switching between Gen 1 and Gen 2 lists (Gen 1 default).
// Minimal changes: script injects a list selector into the page and loads words.json
// (Gen 1) or words-gen2.json (Gen 2). Progress is kept per-list in localStorage
// using separate storage keys so switching preserves each list's progress.
// No HTML edits required (script will insert the selector). CSS file is reused.
=======
// script.js - expects words.json (same directory) and loads it at startup.
//
// Behavior change per request:
// - Immediate auto-submit: when your normalized input exactly matches a stored name,
//   the script will submit immediately (no debounce) *unless* every matching entry
//   for that normalized name was already entered by you earlier (userRevealed).
// - If every matching entry was already entered, the app shows a hint message
//   ("You already entered 'Pidgeot'. Press Enter to view it.") and does NOT auto-submit.
// - Accepted guesses (new reveal / already-revealed acceptance / nidoran multi-reveal)
//   clear the input and provide visual feedback (green for new, yellow for already).
// - Manual Enter still works as before.
// Note: fetch("words.json") requires serving via HTTP (file:// will often be blocked).
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528

let wordsData = []; // populated by loadList()
const STORAGE_KEY_BASE = "revealedWords_v1"; // actual key: STORAGE_KEY_BASE + "_" + listId

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
<<<<<<< HEAD
=======

// Flags for auto-submit in progress to avoid reentrancy
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
let isAutoSubmitting = false;

// --- small helper to insert list selector UI (minimal DOM changes) ---
function insertListSelector() {
  // only insert once
  if (document.getElementById("listSelect")) return;

  const container = document.createElement("div");
  container.className = "list-switcher";
  container.style.display = "flex";
  container.style.gap = "0.5rem";
  container.style.alignItems = "center";
  container.style.marginBottom = "0.5rem";

  const label = document.createElement("label");
  label.textContent = "List:";
  label.setAttribute("for", "listSelect");
  label.style.fontSize = "0.95rem";
  label.style.color = "var(--muted)";

  const select = document.createElement("select");
  select.id = "listSelect";
  const opt1 = document.createElement("option");
  opt1.value = "gen1";
  opt1.text = "Gen 1";
  const opt2 = document.createElement("option");
  opt2.value = "gen2";
  opt2.text = "Gen 2";
  select.appendChild(opt1);
  select.appendChild(opt2);
  select.value = currentListId;

  select.addEventListener("change", async (e) => {
    const next = e.target.value;
    if (next === currentListId) return;
    // preserve and switch to new list: load new data and rehydrate progress for that list
    await loadList(next);
  });

  container.appendChild(label);
  container.appendChild(select);

  // insert the selector above the input if possible, else at top of body
  const ref = document.getElementById("controls") || input;
  if (ref && ref.parentNode) {
    ref.parentNode.insertBefore(container, ref);
  } else {
    document.body.insertBefore(container, document.body.firstChild);
  }
}

// --- Normalization & index map ---
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

<<<<<<< HEAD
// --- persistence per list ---
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

  if (Array.isArray(storedRaw)) {
    // legacy format: array of normalized names
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
  } else {
    // nothing stored
    revealed = [];
    userRevealed = new Set();
  }

  currentIndex = revealed.length > 0 ? revealed.length - 1 : -1;
}

function saveProgressForCurrentList() {
  const toStore = { all: revealed, user: Array.from(userRevealed) };
  try {
    localStorage.setItem(storageKeyForList(currentListId), JSON.stringify(toStore));
  } catch (e) {
    console.error("Failed to save progress:", e);
  }
}

// --- render helpers (unchanged) ---
=======
// Save/load
function save() {
  const toStore = { all: revealed, user: Array.from(userRevealed) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

// --- Rendering ---
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
function renderWordList() {
  wordsUL.innerHTML = "";
  wordsData.forEach((item, idx) => {
    const li = document.createElement("li");
    li.dataset.idx = idx;
    li.dataset.word = item.word.toLowerCase();

    if (revealed.indexOf(idx) !== -1) {
      if (userRevealed.has(idx)) li.className = "found";
      else li.className = "given-up";
      li.textContent = item.word;
    } else {
      li.className = "hidden";
      li.textContent = `Hidden #${idx + 1}`;
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
  if (!item) {
    revealedList.textContent = "Unexpected error: revealed word not found in data.";
    return;
  }
  const card = document.createElement("div");
  card.className = "card";
  if (!userRevealed.has(idx)) card.classList.add("given-up");
  const h3 = document.createElement("h3");
  h3.textContent = item.word;
  const p = document.createElement("p");
  p.textContent = item.secret;
  card.appendChild(h3);
  card.appendChild(p);
  revealedList.appendChild(card);

  navInfo.textContent = `Showing ${currentIndex + 1} of ${revealed.length}`;
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex >= revealed.length - 1;
}

// flash helper
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
<<<<<<< HEAD
function acceptAndClearNew() {
  input.value = "";
  try { input.focus(); } catch (e) {}
  flashElement(input, "#e6ffef");
=======

// Accept + clear helpers (clear input immediately then flash)
function acceptAndClearNew() {
  input.value = "";
  try { input.focus(); } catch (e) {}
  flashElement(input, "#e6ffef"); // light green
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
}
function acceptAndClearAlready(idx) {
  input.value = "";
  try { input.focus(); } catch (e) {}
<<<<<<< HEAD
  flashElement(input, "#fff7df");
=======
  flashElement(input, "#fff7df"); // light yellow
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
  const li = wordsUL.querySelector(`li[data-idx="${idx}"]`);
  if (li) flashElement(li, "#fff7df");
}

<<<<<<< HEAD
// --- matching & submit logic (kept behavior) ---
=======
// Celebration
function createOverlayContainer() {
  const overlay = document.createElement("div");
  overlay.className = "celebration-overlay";
  overlay.style.pointerEvents = "none";
  document.body.appendChild(overlay);
  return overlay;
}
function triggerCelebration() {
  const overlay = createOverlayContainer();
  const banner = document.createElement("div");
  banner.className = "celebration-banner";
  banner.textContent = "Congratulations — all found!";
  document.body.appendChild(banner);

  const colors = ["#FF5A5F","#FFB400","#00A699","#7B61FF","#FF6B6B","#00D1B2","#FFD166"];
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const pieces = 120;
  for (let i = 0; i < pieces; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    const left = Math.random() * vw;
    const size = 8 + Math.random() * 14;
    el.style.left = `${left}px`;
    el.style.top = `${-20 - Math.random() * 40}px`;
    el.style.width = `${size}px`;
    el.style.height = `${Math.round(size * 1.4)}px`;
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    const duration = 3000 + Math.random() * 3000;
    const delay = Math.random() * 500;
    el.style.animationDuration = `${duration}ms`;
    el.style.animationDelay = `${delay}ms`;
    el.style.transform = `rotate(${Math.floor(Math.random()*360)}deg)`;
    overlay.appendChild(el);
  }
  setTimeout(() => { overlay.remove(); banner.remove(); }, 6500);
}

// Matching logic
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
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

<<<<<<< HEAD
=======
// Show hint if user has already entered all matches for this normalized input
function showAlreadyTypedHintIfApplicable(raw) {
  const normalized = normalizeText(raw);
  if (!normalized) {
    if (messageEl.dataset.hint === "already-typed") {
      showMessage("", {}); delete messageEl.dataset.hint;
    }
    return false;
  }

  const matching = normalizedIndexMap[normalized];
  if (!matching || matching.length === 0) {
    if (messageEl.dataset.hint === "already-typed") {
      showMessage("", {}); delete messageEl.dataset.hint;
    }
    return false;
  }

  const allTyped = matching.every(idx => userRevealed.has(idx));
  if (allTyped) {
    const display = wordsData[matching[0]].word;
    showMessage(`You already entered "${display}". Press Enter to view it.`, { positive: false });
    messageEl.dataset.hint = "already-typed";
    return true;
  } else {
    if (messageEl.dataset.hint === "already-typed") {
      showMessage("", {}); delete messageEl.dataset.hint;
    }
    return false;
  }
}

// Immediate auto-submit on input (no debounce) except when showAlreadyTypedHint applies
function onInputImmediate() {
  if (input.disabled) return;
  const raw = input.value;
  // If hint applies (already entered everything), show hint and DO NOT auto-submit
  const hinted = showAlreadyTypedHintIfApplicable(raw);
  if (hinted) return;

  // Otherwise check if normalized input exactly matches a stored name
  const normalized = normalizeText(raw);
  if (!normalized) return;
  if (!normalizedIndexMap.hasOwnProperty(normalized)) return;

  // If at least one matching index is NOT in userRevealed, auto-submit immediately.
  const matching = normalizedIndexMap[normalized];
  const hasUnenteredMatch = matching.some(idx => !userRevealed.has(idx));
  if (!hasUnenteredMatch) {
    // This case should have been caught by hint logic, but be defensive: show hint and skip
    showAlreadyTypedHintIfApplicable(raw);
    return;
  }

  // Prevent re-entrancy
  if (isAutoSubmitting) return;
  isAutoSubmitting = true;
  // small microtask delay so input handler finishes (helps some browsers)
  setTimeout(() => {
    handleSubmit();
    // quick cooldown
    setTimeout(() => { isAutoSubmitting = false; }, 120);
  }, 0);
}

// --- Submit handler ---
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
function showMessage(text, opts = {}) {
  messageEl.textContent = text;
  if (opts.positive) messageEl.style.color = "var(--success)";
  else if (opts.warning) messageEl.style.color = "var(--danger)";
  else messageEl.style.color = "var(--muted)";
}

<<<<<<< HEAD
// When user types a normalized name that they have already entered for this list,
// show a hint and DO NOT auto-submit.
function showAlreadyTypedHintIfApplicable(raw) {
  const normalized = normalizeText(raw);
  if (!normalized) {
    if (messageEl.dataset.hint === "already-typed") {
      showMessage("", {}); delete messageEl.dataset.hint;
    }
    return false;
  }
  const matching = normalizedIndexMap[normalized];
  if (!matching || matching.length === 0) {
    if (messageEl.dataset.hint === "already-typed") {
      showMessage("", {}); delete messageEl.dataset.hint;
    }
    return false;
  }
  const allTyped = matching.every(idx => userRevealed.has(idx));
  if (allTyped) {
    const display = wordsData[matching[0]].word;
    showMessage(`You already entered "${display}". Press Enter to view it.`, { positive: false });
    messageEl.dataset.hint = "already-typed";
    return true;
  } else {
    if (messageEl.dataset.hint === "already-typed") {
      showMessage("", {}); delete messageEl.dataset.hint;
    }
    return false;
  }
}

// Immediate auto-submit on input unless already-typed hint applies
function onInputImmediate() {
  if (input.disabled) return;
  const raw = input.value;
  const hinted = showAlreadyTypedHintIfApplicable(raw);
  if (hinted) return;

  const normalized = normalizeText(raw);
  if (!normalized) return;
  if (!normalizedIndexMap.hasOwnProperty(normalized)) return;

  // Ensure at least one matching index not already typed by user (so we auto-submit only for new)
  const matching = normalizedIndexMap[normalized];
  const hasUnenteredMatch = matching.some(idx => !userRevealed.has(idx));
  if (!hasUnenteredMatch) {
    showAlreadyTypedHintIfApplicable(raw);
    return;
  }

  if (isAutoSubmitting) return;
  isAutoSubmitting = true;
  setTimeout(() => {
    handleSubmit();
    setTimeout(() => { isAutoSubmitting = false; }, 120);
  }, 0);
}

// submit handler (same behavior; clears input on accept)
function handleSubmit() {
  const raw = input.value.trim();
  if (!raw) {
    showMessage("Please type a word to guess.", { positive: false });
    return;
  }
  const normalized = normalizeText(raw);
=======
function handleSubmit() {
  // Cancel any pending hint/auto behavior is handled in onInputImmediate
  const raw = input.value.trim();
  if (!raw) {
    showMessage("Please type a word to guess.", { positive: false });
    return;
  }

  const normalized = normalizeText(raw);
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
  if (!normalized) {
    showMessage("Please type a valid word.", { positive: false });
    return;
  }

  if (normalized === "nidoran") {
    const matching = normalizedIndexMap["nidoran"] || [];
    const unrevealed = matching.filter(i => revealed.indexOf(i) === -1);
    if (unrevealed.length === 0) {
      const firstPos = revealed.indexOf(matching[0]);
      if (firstPos !== -1) currentIndex = firstPos;
      renderRevealed();
      let converted = 0;
      for (const i of matching) {
        if (!userRevealed.has(i)) { userRevealed.add(i); converted++; }
      }
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
  if (!res) {
    showMessage(`"${raw}" is not a secret word (or it's misspelled).`, { positive: false });
<<<<<<< HEAD
    // don't change selection behavior for immediate auto-submits (they clear input on success).
    input.select();
=======
    // manual selection only if this was not auto-submitting
    if (!isAutoSubmitting) input.select();
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
    return;
  }

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

  // new reveal
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

// navigation / give up / reset
function handlePrev() { if (currentIndex > 0) { currentIndex--; renderRevealed(); } }
function handleNext() { if (currentIndex < revealed.length - 1) { currentIndex++; renderRevealed(); } }

function handleReset() {
  const ok = window.confirm("Reset progress? This will clear all revealed words and cannot be undone.");
  if (!ok) { showMessage("Reset cancelled.", { positive: false }); return; }
  revealed = []; userRevealed = new Set(); currentIndex = -1;
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
  currentIndex = revealed.length - 1; renderRevealed();
  input.disabled = true; submitBtn.disabled = true; giveUpBtn.disabled = true;
  showMessage("You gave up — all remaining secrets are revealed. Your prior finds are highlighted; use Reset to start over.", { warning: true });
}

// --- List loading & switching (new) ---
// mapping listId -> filename
const listFiles = {
  gen1: "words-gen1.json",
  gen2: "words-gen2.json"
};

async function loadList(listId) {
  // if switching to same list, do nothing
  if (listId === currentListId && wordsData.length > 0) return;

  // optionally confirm if there is unsaved progress? We persist per-list so no need.
  currentListId = listId;
  // fetch JSON
  try {
    const res = await fetch(listFiles[listId]);
    if (!res.ok) throw new Error(`Failed to fetch ${listFiles[listId]}`);
    wordsData = await res.json();
  } catch (e) {
    console.error("Failed to load list file:", e);
    // fallback to empty minimal list to avoid breaking UI
    wordsData = [{ word: "Pidgeot", secret: "Fallback entry." }];
  }

  // after loading words, rebuild index map and rehydrate progress for this list
  buildNormalizedIndexMap();
  loadStoredProgress(listId);
  renderWordList();
  renderRevealed();

  // update select UI if present
  const sel = document.getElementById("listSelect");
  if (sel) sel.value = currentListId;
}

// --- Initialization ---
async function initApp() {
  insertListSelector();
  // load default list (gen1)
  await loadList("gen1");

  // wire up event handlers (once)
  submitBtn.addEventListener("click", () => { const prevAuto = isAutoSubmitting; isAutoSubmitting = false; handleSubmit(); isAutoSubmitting = prevAuto; });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const prevAuto = isAutoSubmitting; isAutoSubmitting = false; handleSubmit(); isAutoSubmitting = prevAuto;
    }
  });
<<<<<<< HEAD
  // immediate input handling (auto-submit or hint)
  input.addEventListener("input", onInputImmediate);

=======
  // immediate auto-submit on each input change (subject to already-typed hint)
  input.addEventListener("input", onInputImmediate);
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
  resetBtn.addEventListener("click", handleReset);
  giveUpBtn.addEventListener("click", handleGiveUp);
  prevBtn.addEventListener("click", handlePrev);
  nextBtn.addEventListener("click", handleNext);
}

<<<<<<< HEAD
// start the app
initApp();
=======
// start
initApp();
>>>>>>> a0de702f99bfc3e5fdbfb6ac332abae19568f528
