// Word reveal site script.js
// Debounced auto-submit (200ms). Change: do NOT auto-submit when the normalized input
// exactly matches a name that the user has already entered previously.
// If the name still has unrevealed matches (or was only given-up), auto-submit proceeds.
// Accepted guesses (new reveal / already-revealed acceptance / nidoran multi-reveal)
// clear the input and show a brief success flash. Manual Enter still submits immediately.

const wordsData = [
  { word: "Bulbasaur", secret: "A small, seed-backed Pokémon that absorbs sunlight to grow stronger." },
  { word: "Ivysaur", secret: "A plant and animal blend; its bud blooms as it stores energy for evolution." },
  { word: "Venusaur", secret: "A massive plant Pokémon whose large flower releases nourishing scents and power." },
  { word: "Charmander", secret: "A fire-lizard Pokémon whose tail flame reflects its health and mood." },
  { word: "Charmeleon", secret: "A fierce, fiery Pokémon that grows more aggressive as it gains strength." },
  { word: "Charizard", secret: "A flying fire Pokémon that breathes scorching flames and soars skillfully." },
  { word: "Squirtle", secret: "A tiny turtle Pokémon that shelters itself in its shell and sprays water." },
  { word: "Wartortle", secret: "A shelled swimmer with powerful limbs and a keen sense for water currents." },
  { word: "Blastoise", secret: "A heavy, cannon-backed Pokémon that fires high-pressure jets of water." },
  { word: "Caterpie", secret: "A small insect Pokémon that moves by gripping with many prolegs." },
  { word: "Metapod", secret: "A hardened cocoon stage; it conserves energy while preparing to evolve." },
  { word: "Butterfree", secret: "A graceful winged Pokémon that flutters through forests, scattering spores." },
  { word: "Weedle", secret: "A caterpillar-like Pokémon with a sharp stinger it uses for defense." },
  { word: "Kakuna", secret: "An immobile cocoon Pokémon that waits patiently for its wings to form." },
  { word: "Beedrill", secret: "A stinging, fast insect Pokémon that attacks in coordinated swarms." },
  { word: "Pidgey", secret: "A small, common bird Pokémon that navigates using strong instincts." },
  { word: "Pidgeotto", secret: "A vigilant bird Pokémon that patrols the skies and dives at prey." },
  { word: "Pidgeot", secret: "A majestic bird with powerful wings that commands wide territories." },
  { word: "Rattata", secret: "A nimble, quick-to-breed rodent Pokémon that scavenges for food." },
  { word: "Raticate", secret: "A larger rodent Pokémon with strong teeth used for gnawing and defense." },
  { word: "Spearow", secret: "An aggressive little bird that will bravely defend its turf." },
  { word: "Fearow", secret: "A long-beaked bird Pokémon that chases prey across open fields." },
  { word: "Ekans", secret: "A sly, coiling snake Pokémon that lurks and strikes with stealth." },
  { word: "Arbok", secret: "A large serpent whose intimidating hood pattern wards off threats." },
  { word: "Pikachu", secret: "A small electric mouse that stores electricity in its cheeks for quick jolts." },
  { word: "Raichu", secret: "A powerful electric rodent that unleashes stronger shocks when provoked." },
  { word: "Sandshrew", secret: "A burrowing Pokémon that curls into a ball and hides beneath the sand." },
  { word: "Sandslash", secret: "A spiny digger Pokémon that can slash foes with its hardened claws." },
  { word: "Nidoran", secret: "A cautious, pointy-eared Pokémon that protects itself with sharp quills." }, // female display
  { word: "Nidorina", secret: "A slightly larger female Pokémon that is caring yet ready to defend." },
  { word: "Nidoqueen", secret: "A strong female Pokémon with a sturdy build adapted for protection." },
  { word: "Nidoran", secret: "A headstrong little Pokémon covered in prickly spines for defense." }, // male display
  { word: "Nidorino", secret: "A bolder male Pokémon whose developing horn is used in battle." },
  { word: "Nidoking", secret: "A powerful male Pokémon with massive horn and great offensive strength." },
  { word: "Clefairy", secret: "A gentle, mystical Pokémon often associated with nighttime lights and play." },
  { word: "Clefable", secret: "A soft, fairy-like Pokémon known for its soothing presence and leaps." },
  { word: "Vulpix", secret: "A small fox Pokémon with multiple tails that radiate gentle heat." },
  { word: "Ninetales", secret: "An elegant fox whose many tails are said to hold mysterious powers." },
  { word: "Jigglypuff", secret: "A round, singing Pokémon whose melody lulls listeners to sleep." },
  { word: "Wigglytuff", secret: "A soft, balloon-like Pokémon that sings to comfort and calm others." },
  { word: "Zubat", secret: "A winged, blind cave Pokémon that senses surroundings with echoes." },
  { word: "Golbat", secret: "A larger bat-like Pokémon that drains energy from its targets." },
  { word: "Oddish", secret: "A small plant Pokémon that absorbs moonlight and hides by day." },
  { word: "Gloom", secret: "A drooping plant Pokémon that emits a strong sweet scent when blooming." },
  { word: "Vileplume", secret: "A floral Pokémon with a large, fragrant bloom that attracts pollinators." },
  { word: "Paras", secret: "A mushroom-symbiotic bug that carries fungal growths on its back." },
  { word: "Parasect", secret: "A bug whose mushroom has overtaken it, controlling its behavior." },
  { word: "Venonat", secret: "A fuzzy, nocturnal bug Pokémon with big compound eyes and keen senses." },
  { word: "Venomoth", secret: "A moth Pokémon that scatters powdery scales and subtle toxins." },
  { word: "Diglett", secret: "A tiny ground dweller that tunnels quickly through soft soil." },
  { word: "Dugtrio", secret: "Three-headed tunnelers that move in perfect coordination underground." },
  { word: "Meowth", secret: "A curious cat Pokémon attracted to shiny objects and clever tricks." },
  { word: "Persian", secret: "A sleek, elegant feline Pokémon that values comfort and pride." },
  { word: "Psyduck", secret: "A confused duck Pokémon prone to headaches with mysterious powers." },
  { word: "Golduck", secret: "A swift swimmer whose psychic-like focus aids it in water battles." },
  { word: "Mankey", secret: "A temperamental, fast-moving monkey Pokémon that fights fiercely." },
  { word: "Primeape", secret: "An enraged fighter whose uncontrolled energy drives its battles." },
  { word: "Growlithe", secret: "A loyal, flame-maned pup Pokémon that guards its trainer devotedly." },
  { word: "Arcanine", secret: "A large, majestic canine Pokémon famed for speed and noble bearing." },
  { word: "Poliwag", secret: "A tadpole-like Pokémon with a swirling belly pattern and aquatic agility." },
  { word: "Poliwhirl", secret: "A sturdy swimmer Pokémon that trains hard to master water moves." },
  { word: "Poliwrath", secret: "A tough, muscle-bound Pokémon that mixes strength and water power." },
  { word: "Abra", secret: "A timid psychic Pokémon that teleports away when threatened." },
  { word: "Kadabra", secret: "A psychic Pokémon that uses telekinesis and odd spoon-bending tricks." },
  { word: "Alakazam", secret: "An extremely intelligent psychic Pokémon with formidable powers." },
  { word: "Machop", secret: "A small but determined fighter that trains its body through constant exercise." },
  { word: "Machoke", secret: "A bulky fighter that helps carry heavy loads while refining technique." },
  { word: "Machamp", secret: "A four-armed powerhouse that delivers rapid, crushing punches." },
  { word: "Bellsprout", secret: "A sprouting plant Pokémon that traps prey with its vine-like body." },
  { word: "Weepinbell", secret: "A carnivorous plant that snaps up prey with its gaping mouth." },
  { word: "Victreebel", secret: "A large pitcher-plant Pokémon that lures prey with sweet nectar." },
  { word: "Tentacool", secret: "A jelly-like sea Pokémon that uses tentacles and stinging cells." },
  { word: "Tentacruel", secret: "A larger sea predator with many tentacles and poisonous attacks." },
  { word: "Geodude", secret: "A rock-bodied Pokémon that clings to cliffs and rolls to move." },
  { word: "Graveler", secret: "A rolling boulder Pokémon with rugged strength and rough edges." },
  { word: "Golem", secret: "A massive rock Pokémon with a shell-like exterior and great power." },
  { word: "Ponyta", secret: "A fiery horse Pokémon whose hooves leave sparks as it runs." },
  { word: "Rapidash", secret: "An elegant, blazing steed that outruns most opponents with grace." },
  { word: "Slowpoke", secret: "A slow-moving, simple-minded Pokémon that takes its time for everything." },
  { word: "Slowbro", secret: "A relaxed Pokémon with a shell companion that grants odd strength." },
  { word: "Magnemite", secret: "A floating metallic Pokémon that generates magnetic fields." },
  { word: "Magneton", secret: "Three magnetic units fused together, producing strong electromagnetic force." },
  { word: "Farfetch'd", secret: "A wild duck Pokémon that carries a prized stalk used in battle." },
  { word: "Doduo", secret: "A two-headed bird that runs fast and communicates with its pair of heads." },
  { word: "Dodrio", secret: "A three-headed runner whose heads act independently but in unison." },
  { word: "Seel", secret: "A playful sea mammal that swims gracefully and enjoys cold waters." },
  { word: "Dewgong", secret: "A sleek, icy swimmer known for graceful movement through the sea." },
  { word: "Grimer", secret: "A sludge Pokémon formed from toxic waste that thrives in filth." },
  { word: "Muk", secret: "A large, oily sludge creature that leaves a foul, sticky trail." },
  { word: "Shellder", secret: "A bivalve Pokémon that clamps down with a powerful shell bite." },
  { word: "Cloyster", secret: "A spiny shell Pokémon that shelters a razor-sharp inner shell." },
  { word: "Gastly", secret: "A gaseous phantom that drifts through walls and startles foes." },
  { word: "Haunter", secret: "A mischievous spirit that delights in making people uneasy." },
  { word: "Gengar", secret: "A shadowy Pokémon that lurks in darkness and thrives on mischief." },
  { word: "Onix", secret: "A towering rock serpent that tunnels by crushing earth with its body." },
  { word: "Drowzee", secret: "A hypnotic, sleep-related Pokémon that manipulates dreams." },
  { word: "Hypno", secret: "A hypnotist Pokémon that carries a pendulum to lull others to sleep." },
  { word: "Krabby", secret: "A crustacean Pokémon with strong pincers used to grab and fight." },
  { word: "Kingler", secret: "A heavy-clawed crab Pokémon whose large pincer delivers great force." },
  { word: "Voltorb", secret: "A spherical electric Pokémon that can explode if disturbed." },
  { word: "Electrode", secret: "A speedy electric sphere that discharges powerful jolts." },
  { word: "Exeggcute", secret: "A cluster of egg-like seeds that react sensitively to sound and light." },
  { word: "Exeggutor", secret: "A tall palm-like Pokémon made of several heads that act as one." },
  { word: "Cubone", secret: "A solitary young Pokémon that wears its mother's skull as a helmet." },
  { word: "Marowak", secret: "A tougher, bone-wielding fighter that guards its territory fiercely." },
  { word: "Hitmonlee", secret: "A stretchy-legged fighter that strikes with devastating kicks." },
  { word: "Hitmonchan", secret: "A fast, boxing-style fighter trained to land precise punches." },
  { word: "Lickitung", secret: "A long-tongued Pokémon that explores and feeds using its sticky tongue." },
  { word: "Koffing", secret: "A floating poison gas Pokémon that emits toxic fumes from its body." },
  { word: "Weezing", secret: "A pair of linked gas sacs that spew heavy, noxious smoke." },
  { word: "Rhyhorn", secret: "A rugged, horned Pokémon that charges headfirst into obstacles." },
  { word: "Rhydon", secret: "A powerful horned Pokémon with thick armor and pounding strength." },
  { word: "Chansey", secret: "A kind, egg-bearing Pokémon that cares for the weak and injured." },
  { word: "Tangela", secret: "A vine-covered Pokémon that constantly sweeps and entangles its surroundings." },
  { word: "Kangaskhan", secret: "A maternal Pokémon that fiercely protects its young in its pouch." },
  { word: "Horsea", secret: "A small sea horse that drifts in currents and sprays water to defend." },
  { word: "Seadra", secret: "A sharp-snouted swimmer that darts through reefs with agility." },
  { word: "Goldeen", secret: "A graceful fish Pokémon that swims in elegant, arcing patterns." },
  { word: "Seaking", secret: "A proud, horned fish Pokémon that defends its waters vigorously." },
  { word: "Staryu", secret: "A star-shaped sea creature that flashes a core when touched." },
  { word: "Starmie", secret: "A radiant, rotating star Pokémon with a glowing central core." },
  { word: "Mr. Mime", secret: "A performer Pokémon that mimics shapes and creates invisible barriers." },
  { word: "Scyther", secret: "A nimble mantis Pokémon that slices swiftly with its sharp scythes." },
  { word: "Jynx", secret: "A humanoid ice-dancing Pokémon known for graceful movement and charm." },
  { word: "Electabuzz", secret: "A volatile electric Pokémon that crackles aggressively when pumped." },
  { word: "Magmar", secret: "A fiery, heat-loving Pokémon whose body blazes with intense warmth." },
  { word: "Pinsir", secret: "A strong-horned bug Pokémon that clamps and tosses opponents powerfully." },
  { word: "Tauros", secret: "A wild, charging bovine that battles with relentless energy." },
  { word: "Magikarp", secret: "A splashy, weak fish that keeps flopping until it grows stronger." },
  { word: "Gyarados", secret: "A ferocious sea serpent Pokémon that causes destruction when enraged." },
  { word: "Lapras", secret: "A gentle, ferrying Pokémon known for carrying people across waters." },
  { word: "Ditto", secret: "A shape-shifting blob that can copy other creatures' forms and moves." },
  { word: "Eevee", secret: "A highly adaptable Pokémon capable of evolving in various ways." },
  { word: "Vaporeon", secret: "A water-adapted evolution that glides through water like mist." },
  { word: "Jolteon", secret: "A twitchy electric evolution that stores power in its spiky fur." },
  { word: "Flareon", secret: "A warm, flame-bodied evolution that radiates intense heat." },
  { word: "Porygon", secret: "A digital, virtual Pokémon created from computer code and data." },
  { word: "Omanyte", secret: "An ancient, shelled creature revived from fossilized remains." },
  { word: "Omastar", secret: "A spiral-shelled predator that uses tentacles to grasp prey." },
  { word: "Kabuto", secret: "A hardy fossil Pokémon that clings to rocks and filters water." },
  { word: "Kabutops", secret: "A scythe-armed swimmer that hunts swiftly along ancient sea floors." },
  { word: "Aerodactyl", secret: "A resurrected flying reptile that swoops and bites with fierce jaws." },
  { word: "Snorlax", secret: "A huge, sleepy Pokémon that eats a lot and sleeps deeply afterward." },
  { word: "Articuno", secret: "A graceful ice bird whose presence brings frigid winds and snow." },
  { word: "Zapdos", secret: "An electric bird that crackles with lightning and storms when it flies." },
  { word: "Moltres", secret: "A fiery avian Pokémon that soars trailing embers and warmth." },
  { word: "Dratini", secret: "A serpentine dragon in an early, graceful stage that sheds skin often." },
  { word: "Dragonair", secret: "An elegant dragon Pokémon that radiates a calming, mystical aura." },
  { word: "Dragonite", secret: "A kind-hearted but powerful dragon that can circle the globe swiftly." },
  { word: "Mewtwo", secret: "A genetically engineered powerhouse created for battle and intellect." },
  { word: "Mew", secret: "A rare, elusive creature said to carry the genetic data of all Pokémon." }
];

// STORAGE_KEY stores: { all: [indices], user: [indices] }
const STORAGE_KEY = "revealedWords_v1";

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

// Load storage and support old format (array of normalized strings) for backward compatibility
let storedRaw;
try {
  storedRaw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
} catch (e) {
  storedRaw = null;
}

// revealed: ordered array of indices into wordsData that have been revealed (in reveal order)
let revealed = [];
// userRevealed: set of indices revealed by the user (not from give-up)
let userRevealed = new Set();

if (Array.isArray(storedRaw)) {
  // legacy: array of normalized names - convert to indices by matching in order
  const legacy = storedRaw.slice();
  const used = new Array(wordsData.length).fill(false);
  for (const norm of legacy) {
    // find next unused index that normalizes to this value
    const idx = wordsData.findIndex((w, i) => !used[i] && normalizeText(w.word) === norm);
    if (idx !== -1) {
      used[idx] = true;
      revealed.push(idx);
      userRevealed.add(idx);
    }
  }
} else if (storedRaw && typeof storedRaw === "object") {
  // new format: { all: [indices], user: [indices] }
  if (Array.isArray(storedRaw.all)) {
    // ensure numbers
    revealed = storedRaw.all.map(x => Number(x)).filter(n => Number.isFinite(n) && n >= 0 && n < wordsData.length);
  }
  if (Array.isArray(storedRaw.user)) {
    storedRaw.user.forEach(x => {
      const n = Number(x);
      if (Number.isFinite(n) && n >= 0 && n < wordsData.length) userRevealed.add(n);
    });
  }
} else {
  revealed = [];
  userRevealed = new Set();
}

let currentIndex = revealed.length > 0 ? revealed.length - 1 : -1;

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
  return map;
}
const normalizedIndexMap = buildNormalizedIndexMap();

// Save to localStorage
function save() {
  const toStore = { all: revealed, user: Array.from(userRevealed) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

function isIndexRevealed(idx) {
  return revealed.indexOf(idx) !== -1;
}
function isUserIndex(idx) {
  return userRevealed.has(idx);
}

// Developer/testing flag (keeps list visible if true)
const showVisibleList = false;

function renderWordList() {
  wordsUL.innerHTML = "";
  wordsData.forEach((item, idx) => {
    const li = document.createElement("li");
    const lower = item.word.toLowerCase();
    li.dataset.word = lower;

    if (isIndexRevealed(idx)) {
      if (isUserIndex(idx)) {
        li.classList.add("found");
      } else {
        li.classList.add("given-up");
      }
      li.textContent = item.word;
    } else {
      li.classList.add("hidden");
      li.textContent = showVisibleList ? item.word : `Hidden #${idx + 1}`;
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
    navInfo.textContent = "";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const card = document.createElement("div");
  card.className = "card";
  if (!isUserIndex(idx)) card.classList.add("given-up");
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

// Helper: clear input and flash success color briefly
function acceptFeedback() {
  input.value = "";
  try { input.focus(); } catch(e){}
  const prev = input.style.backgroundColor;
  input.style.transition = "background-color 180ms ease";
  input.style.backgroundColor = "#e6ffef"; // light green
  setTimeout(() => {
    input.style.backgroundColor = prev || "";
    setTimeout(() => { input.style.transition = ""; }, 200);
  }, 180);
}

// Celebration helpers (unchanged)
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
  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  banner.appendChild(sparkle);
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

  setTimeout(() => {
    overlay.remove();
    banner.remove();
  }, 6500);
}

// Debounced auto-submit logic (revised to skip if user already typed this name)
const AUTO_DEBOUNCE_MS = 200;
let autoTimer = null;
let isAutoSubmitting = false;

function scheduleAutoSubmit() {
  if (input.disabled) return;
  if (autoTimer) clearTimeout(autoTimer);
  autoTimer = setTimeout(() => {
    autoTimer = null;
    attemptAutoSubmit();
  }, AUTO_DEBOUNCE_MS);
}

function attemptAutoSubmit() {
  const raw = input.value;
  if (!raw || !raw.trim()) return;
  const normalized = normalizeText(raw);
  if (!normalized) return;
  const matching = normalizedIndexMap[normalized];
  if (!matching || matching.length === 0) return;

  // NEW: Do not auto-submit if the user has already *typed* (userRevealed) all matching entries.
  // If there is at least one matching entry not in userRevealed, allow auto-submit.
  const hasUnenteredMatch = matching.some(idx => !userRevealed.has(idx));
  if (!hasUnenteredMatch) {
    // skip auto-submit because the user already entered this name previously
    return;
  }

  isAutoSubmitting = true;
  setTimeout(() => {
    handleSubmit();
    setTimeout(() => { isAutoSubmitting = false; }, 120);
  }, 8);
}

// Matching & submit handlers (reuse previous logic)
function findIndexByInput(rawInput) {
  const normalizedInput = normalizeText(rawInput);
  if (!normalizedInput) return null;
  const matching = normalizedIndexMap[normalizedInput];
  if (!matching || matching.length === 0) return null;
  for (const idx of matching) {
    if (!isIndexRevealed(idx)) return { idx, item: wordsData[idx], alreadyRevealed: false };
  }
  return { idx: matching[0], item: wordsData[matching[0]], alreadyRevealed: true };
}

function showMessage(text, opts = {}) {
  messageEl.textContent = text;
  if (opts.positive) messageEl.style.color = "var(--success)";
  else if (opts.warning) messageEl.style.color = "var(--danger)";
  else messageEl.style.color = "var(--muted)";
}

function handleSubmit() {
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }

  const raw = input.value.trim();
  if (!raw) {
    showMessage("Please type a word to guess.", { positive: false });
    return;
  }

  const res = findIndexByInput(raw);
  if (!res) {
    showMessage(`"${raw}" is not a secret word (or it's misspelled).`, { positive: false });
    if (!isAutoSubmitting) input.select();
    return;
  }

  const { idx, item, alreadyRevealed } = res;

  // Special-case nidoran -> reveal all matches
  if (normalizeText(raw) === "nidoran") {
    const matching = normalizedIndexMap["nidoran"] || [];
    const unrevealed = matching.filter(i => !isIndexRevealed(i));
    if (unrevealed.length === 0) {
      const firstPos = revealed.indexOf(matching[0]);
      if (firstPos !== -1) currentIndex = firstPos;
      renderRevealed();
      let converted = 0;
      for (const i of matching) {
        if (!isUserIndex(i)) { userRevealed.add(i); converted++; }
      }
      if (converted) { save(); renderWordList(); }
      showMessage(`You already revealed Nidoran — showing it now.`, { positive: false });
      acceptFeedback();
      return;
    }
    for (const i of unrevealed) {
      revealed.push(i);
      userRevealed.add(i);
    }
    save();
    renderWordList();
    currentIndex = revealed.length - 1;
    renderRevealed();
    showMessage(`Revealed ${unrevealed.length} Nidoran!`, { positive: true });
    acceptFeedback();
    if (userRevealed.size === wordsData.length && revealed.length === wordsData.length) triggerCelebration();
    return;
  }

  if (alreadyRevealed) {
    const firstPos = revealed.indexOf(idx);
    if (firstPos !== -1) currentIndex = firstPos;
    renderRevealed();
    if (!isUserIndex(idx)) {
      userRevealed.add(idx);
      save();
      renderWordList();
    }
    showMessage(`You already revealed "${item.word}". Showing it now.`, { positive: false });
    acceptFeedback();
    return;
  }

  // New reveal
  revealed.push(idx);
  userRevealed.add(idx);
  save();
  renderWordList();
  currentIndex = revealed.length - 1;
  renderRevealed();
  showMessage(`Nice! "${item.word}" revealed.`, { positive: true });
  acceptFeedback();
  if (userRevealed.size === wordsData.length && revealed.length === wordsData.length) triggerCelebration();
}

// Reset / give up / navigation
function handleReset() {
  const ok = window.confirm("Reset progress? This will clear all revealed words and cannot be undone.");
  if (!ok) { showMessage("Reset cancelled.", { positive: false }); return; }
  revealed = [];
  userRevealed = new Set();
  currentIndex = -1;
  save();
  renderWordList();
  renderRevealed();
  input.disabled = false;
  submitBtn.disabled = false;
  giveUpBtn.disabled = false;
  showMessage("Progress has been reset.", { positive: true });
  input.value = "";
  input.focus();
}

function handleGiveUp() {
  if (revealed.length === wordsData.length) { showMessage("All targets are already revealed.", { positive: false }); return; }
  const ok = window.confirm("Give up and reveal all remaining Pokémon? This will show all secrets and cannot be undone (you can reset to clear).");
  if (!ok) { showMessage("Give up cancelled.", { positive: false }); return; }
  wordsData.forEach((_, i) => { if (!isIndexRevealed(i)) revealed.push(i); });
  save();
  renderWordList();
  currentIndex = revealed.length - 1;
  renderRevealed();
  input.disabled = true;
  submitBtn.disabled = true;
  giveUpBtn.disabled = true;
  showMessage("You gave up — all remaining secrets are revealed. Your prior finds are highlighted; use Reset to start over.", { warning: true });
}

function handlePrev() { if (currentIndex > 0) { currentIndex--; renderRevealed(); } }
function handleNext() { if (currentIndex < revealed.length - 1) { currentIndex++; renderRevealed(); } }

// Wire events
submitBtn.addEventListener("click", () => {
  const prevAuto = isAutoSubmitting;
  isAutoSubmitting = false;
  handleSubmit();
  isAutoSubmitting = prevAuto;
});
input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const prevAuto = isAutoSubmitting;
    isAutoSubmitting = false;
    handleSubmit();
    isAutoSubmitting = prevAuto;
  }
});
input.addEventListener("input", scheduleAutoSubmit);
resetBtn.addEventListener("click", handleReset);
giveUpBtn.addEventListener("click", handleGiveUp);
prevBtn.addEventListener("click", handlePrev);
nextBtn.addEventListener("click", handleNext);

// initialize UI
renderWordList();
renderRevealed();