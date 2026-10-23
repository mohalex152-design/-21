"use strict";

const $ = (id) => document.getElementById(id);

const screens = [
  "welcome-screen",
  "menu-screen",
  "modes-screen",
  "settings-screen",
  "loading-screen",
  "game-screen",
  "result-screen",
  "encyclopedia-screen",
  "profile-screen",
  "review-screen",
  "history-screen",
  "world-map-screen",
  "online-screen"
].map($);

const el = {
  startForm: $("start-form"),
  name: $("player-name"),
  startButton: $("start-button"),
  menuPlayer: $("menu-player"),
  menuStart: $("menu-start"),
  menuShop: $("menu-shop"),
  menuOnline: $("menu-online"),
  menuModes: $("menu-modes"),
  modesBack: $("modes-back"),
  recordsPanel: $("records-panel"),
  recordsContent: $("records-content"),
  questionHint: $("question-hint"),
  modeStatus: $("mode-status"),
  mapChallenge: $("map-challenge"),
  answerFact: $("answer-fact"),
  menuSettings: $("menu-settings"),
  menuEncyclopedia: $("menu-encyclopedia"),
  countryTotal: $("country-total"),
  settingsError: $("settings-error"),
  saveSettings: $("save-settings"),
  settingsBack: $("settings-back"),
  playerDisplay: $("player-display"),
  questionNumber: $("question-number"),
  questionTotal: $("question-total"),
  progressTrack: $("progress-track"),
  progressBar: $("progress-bar"),
  flag: $("flag-image"),
  flagFallback: $("flag-fallback"),
  choices: $("choices"),
  feedback: $("feedback"),
  next: $("next-button"),
  quit: $("quit-game"),
  resultPlayer: $("result-player"),
  finalScore: $("final-score"),
  resultMessage: $("result-message"),
  correctCount: $("correct-count"),
  wrongCount: $("wrong-count"),
  percentage: $("percentage"),
  timerDisplay: $("timer-display"),
  resultRewards: $("result-rewards"),
  downloadResult: $("download-result"),
  menuDaily: $("menu-daily"),
  menuProfile: $("menu-profile"),
  menuReview: $("menu-review"),
  menuMap: $("menu-map"),
  menuHistory: $("menu-history"),
  menuProfileAvatar: $("menu-profile-avatar"),
  menuProfileName: $("menu-profile-name"),
  menuProfileMeta: $("menu-profile-meta"),
  menuProfileProgress: $("menu-profile-progress"),
  profileAvatar: $("profile-avatar"),
  profileDisplayName: $("profile-display-name"),
  profileTitleDisplay: $("profile-title-display"),
  profileXPLine: $("profile-xp-line"),
  profileNameInput: $("profile-name-input"),
  profileAvatarSelect: $("profile-avatar-select"),
  profileTitleSelect: $("profile-title-select"),
  saveProfile: $("save-profile"),
  profileLevel: $("profile-level"),
  profileNextLevel: $("profile-next-level"),
  profileXPBar: $("profile-xp-bar"),
  achievementsGrid: $("achievements-grid"),
  reviewList: $("review-list"),
  reviewPractice: $("review-practice"),
  historySummary: $("history-summary"),
  historyList: $("history-list"),
  worldCountrySelect: $("world-country-select"),
  worldMapWrap: $("world-map-frame-wrap"),
  worldMapDetail: $("world-map-detail"),
  selectAllContinents: $("select-all-continents"),
  clearContinents: $("clear-continents"),
  restart: $("restart-button"),
  resultMenu: $("result-menu-button"),
  search: $("country-search"),
  encyclopediaStatus: $("encyclopedia-status"),
  countryGrid: $("country-grid"),
  encyclopediaBack: $("encyclopedia-back"),
  error: $("error-message")
};

/*
 * الإصلاح الأساسي:
 * لازم تعريف activeUserKey يسبق تهيئة state،
 * لأن state تستدعي loadSavedRecords() و loadProfile().
 */
let activeUserKey = "guest";

function accountStorageKey(base) {
  return `${base}:${activeUserKey}`;
}

function safeRead(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadSavedRecords() {
  return safeRead(accountStorageKey("guessFlagsRecords"), {});
}

function loadProfile() {
  return safeRead(accountStorageKey("guessFlagsProfile"), {});
}

function saveProfileData() {
  try {
    localStorage.setItem(
      accountStorageKey("guessFlagsProfile"),
      JSON.stringify(state.profile)
    );
  } catch (error) {
    console.warn(error);
  }
}

function loadMissed() {
  return safeRead(accountStorageKey("guessFlagsMissed"), {});
}

function saveMissed(value) {
  try {
    localStorage.setItem(
      accountStorageKey("guessFlagsMissed"),
      JSON.stringify(value)
    );
  } catch (error) {
    console.warn(error);
  }
}

function loadHistory() {
  return safeRead(accountStorageKey("guessFlagsHistory"), []);
}

function saveHistory(value) {
  try {
    localStorage.setItem(
      accountStorageKey("guessFlagsHistory"),
      JSON.stringify(value.slice(0, 30))
    );
  } catch (error) {
    console.warn(error);
  }
}

function saveSavedRecords() {
  try {
    localStorage.setItem(
      accountStorageKey("guessFlagsRecords"),
      JSON.stringify(state.records)
    );
  } catch (error) {
    console.warn("تعذر حفظ السجلات", error);
  }
}

function getXP() {
  try {
    return Number(
      localStorage.getItem(accountStorageKey("guessFlagsXP")) || 0
    );
  } catch {
    return 0;
  }
}

function setXP(number) {
  try {
    localStorage.setItem(
      accountStorageKey("guessFlagsXP"),
      String(Math.max(0, Number(number) || 0))
    );
  } catch (error) {
    console.warn(error);
  }
}

function activateLocalAccount(name) {
  const normalized = String(name || "player")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 24) || "player";

  const key = normalized.normalize("NFKC");
  const first = !localStorage.getItem(
    "guessFlagsAccountMigrationDone"
  );

  activeUserKey = encodeURIComponent(key);

  if (first) {
    const oldXP = localStorage.getItem("guessFlagsXP");

    if (
      oldXP !== null &&
      localStorage.getItem(
        accountStorageKey("guessFlagsXP")
      ) === null
    ) {
      localStorage.setItem(
        accountStorageKey("guessFlagsXP"),
        oldXP
      );
    }

    for (const base of [
      "guessFlagsRecords",
      "guessFlagsProfile",
      "guessFlagsHistory",
      "guessFlagsMissed"
    ]) {
      const old = localStorage.getItem(base);

      if (
        old !== null &&
        localStorage.getItem(accountStorageKey(base)) === null
      ) {
        localStorage.setItem(accountStorageKey(base), old);
      }
    }

    localStorage.setItem(
      "guessFlagsAccountMigrationDone",
      "1"
    );
  }

  state.records = loadSavedRecords();
  state.profile = loadProfile();
  state.player = name.trim().slice(0, 24);
  state.profile.name = state.player;

  saveProfileData();
}

const state = {
  player: "",
  countries: [],
  questions: [],
  current: 0,
  correct: 0,
  wrong: 0,
  answered: false,
  loadingPromise: null,
  timerInterval: null,
  timeLeft: 0,

  settings: {
    count: "20",
    custom: 15,
    difficulties: ["easy"],
    continents: [
      "africa",
      "asia",
      "europe",
      "north-america",
      "south-america",
      "oceania",
      "antarctica"
    ],
    timer: "open"
  },

  lastScreen: "menu-screen",
  mode: "classic",
  combo: 0,
  maxCombo: 0,
  xpEarned: 0,
  p2: "اللاعب 2",
  activePlayer: 1,
  playerScores: [0, 0],
  wrongCountries: [],
  records: loadSavedRecords(),
  profile: loadProfile(),
  daily: false
};

/* =====================================================================
   منطق اللعبة (تمت إعادة بنائه بعد ما الملف الأصلي اتقطع)
   ===================================================================== */

const MODE_INFO = {
  classic:    { mult: 1,  unlock: 0,     label: "المود الأساسي" },
  daily:      { mult: 1,  unlock: 0,     label: "تحدي اليوم" },
  review:     { mult: 1,  unlock: 0,     label: "مراجعة الأخطاء" },
  speed:      { mult: 2,  unlock: 100,   label: "طور السرعة" },
  memory:     { mult: 4,  unlock: 1000,  label: "تحدي الذاكرة" },
  map:        { mult: 8,  unlock: 2000,  label: "تحدي الخرائط" },
  combo:      { mult: 13, unlock: 4000,  label: "مود الكومبو" },
  continents: { mult: 16, unlock: 6000,  label: "مراحل القارات" },
  facts:      { mult: 20, unlock: 8000,  label: "معلومات بعد الإجابة" },
  duo:        { mult: 25, unlock: 12000, label: "لاعبان على جهاز واحد" },
  xp:         { mult: 30, unlock: 15000, label: "تحدي الخبرة" }
};

const CONTINENT_LABELS = {
  africa: "أفريقيا", asia: "آسيا", europe: "أوروبا",
  "north-america": "أمريكا الشمالية", "south-america": "أمريكا الجنوبية",
  oceania: "أوقيانوسيا", antarctica: "القارة القطبية"
};

const ARAB_LEAGUE = {
  DZ: "الجزائر", BH: "البحرين", KM: "جزر القمر", DJ: "جيبوتي", EG: "مصر", IQ: "العراق",
  JO: "الأردن", KW: "الكويت", LB: "لبنان", LY: "ليبيا", MR: "موريتانيا", MA: "المغرب",
  OM: "عُمان", PS: "فلسطين", QA: "قطر", SA: "السعودية", SO: "الصومال", SD: "السودان",
  SY: "سوريا", TN: "تونس", AE: "الإمارات", YE: "اليمن"
};
const WORLD_SHOP = {
  US: "الولايات المتحدة", GB: "بريطانيا", FR: "فرنسا", DE: "ألمانيا", JP: "اليابان", BR: "البرازيل",
  IT: "إيطاليا", ES: "إسبانيا", TR: "تركيا", CA: "كندا", AU: "أستراليا", KR: "كوريا الجنوبية",
  IN: "الهند", CN: "الصين", RU: "روسيا", AR: "الأرجنتين"
};

const flagEmoji = (code) =>
  String(code).toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));

const SHOP_ITEMS = [
  ...Object.entries(ARAB_LEAGUE).map(([code, name]) => ({ id: "arab-" + code, cat: "arab", icon: flagEmoji(code), name: "علم " + name, price: 50 })),
  ...Object.entries(WORLD_SHOP).map(([code, name]) => ({ id: "world-" + code, cat: "world", icon: flagEmoji(code), name: "علم " + name, price: 80 })),
  { id: "hist-tut", cat: "history", icon: "🏺", name: "توت عنخ آمون", price: 120 },
  { id: "hist-cleo", cat: "history", icon: "🏛️", name: "كليوباترا", price: 120 },
  { id: "hist-salah", cat: "history", icon: "⚔️", name: "صلاح الدين", price: 150 },
  { id: "hist-battuta", cat: "history", icon: "🧭", name: "ابن بطوطة", price: 150 },
  { id: "hist-haitham", cat: "history", icon: "🔭", name: "ابن الهيثم", price: 150 },
  { id: "hist-fatih", cat: "history", icon: "🏰", name: "محمد الفاتح", price: 150 },
  { id: "frame-gold", cat: "frames", icon: "🟡", name: "إطار ذهبي", price: 200 },
  { id: "frame-blue", cat: "frames", icon: "🔵", name: "إطار أزرق", price: 150 },
  { id: "frame-rainbow", cat: "frames", icon: "🌈", name: "إطار قوس قزح", price: 250 },
  { id: "fx-spark", cat: "effects", icon: "✨", name: "لمعان", price: 100 },
  { id: "fx-fire", cat: "effects", icon: "🔥", name: "شعلة", price: 150 },
  { id: "fx-gem", cat: "effects", icon: "💎", name: "جوهرة", price: 300 },
  { id: "fx-crown", cat: "effects", icon: "👑", name: "تاج", price: 400 }
];

const ACHIEVEMENTS = [
  { icon: "🎮", name: "البداية", desc: "أنهِ جولة واحدة", test: (s) => s.rounds >= 1 },
  { icon: "✅", name: "10 إجابات صح", desc: "10 إجابات صحيحة إجمالًا", test: (s) => s.totalCorrect >= 10 },
  { icon: "💯", name: "100 إجابة صح", desc: "100 إجابة صحيحة إجمالًا", test: (s) => s.totalCorrect >= 100 },
  { icon: "🌟", name: "جولة مثالية", desc: "جولة كلها صح (5 أسئلة أو أكتر)", test: (s) => s.perfect >= 1 },
  { icon: "🔥", name: "كومبو 5", desc: "5 إجابات صحيحة ورا بعض", test: (s) => s.bestCombo >= 5 },
  { icon: "📅", name: "لاعب يومي", desc: "أنهِ تحدي اليوم", test: (s) => s.daily >= 1 },
  { icon: "🚀", name: "المستوى 5", desc: "اوصل للمستوى 5", test: (s, xp) => levelOf(xp) >= 5 },
  { icon: "🔓", name: "فتحت مود", desc: "اجمع 100 XP أو أكتر", test: (s, xp) => xp >= 100 }
];

/* ---------- أدوات صغيرة ---------- */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const levelOf = (xp) => Math.floor(xp / 100) + 1;

function shuffle(arr, rnd = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function seededRandom(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function notify(message) {
  let box = document.getElementById("toast");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast";
    box.setAttribute("role", "status");
    box.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);max-width:90vw;padding:12px 18px;border-radius:12px;background:#38271d;color:#fff;z-index:9999;font-size:14px;text-align:center;box-shadow:0 8px 24px #0006";
    document.body.appendChild(box);
  }
  box.textContent = message;
  box.style.display = "block";
  clearTimeout(notify.t);
  notify.t = setTimeout(() => { box.style.display = "none"; }, 3200);
}

function playerStats() {
  const p = state.profile;
  p.stats = Object.assign({ rounds: 0, totalCorrect: 0, perfect: 0, bestCombo: 0, daily: 0 }, p.stats || {});
  return p.stats;
}

/* ---------- التنقل بين الشاشات ---------- */
function showScreen(id) {
  screens.forEach((s) => { if (s) s.classList.toggle("hidden", s.id !== id); });
  if (!["game-screen", "loading-screen", "result-screen"].includes(id)) state.lastScreen = id;
  window.scrollTo({ top: 0 });
  if (id === "menu-screen") refreshMenu();
}

function refreshMenu() {
  const xp = getXP();
  const p = state.profile;
  el.menuPlayer.textContent = state.player;
  el.menuProfileAvatar.textContent = p.avatar || "🌍";
  el.menuProfileName.textContent = p.nick || state.player || "ملف اللاعب";
  el.menuProfileMeta.textContent = `المستوى ${levelOf(xp)} • ${xp} XP`;
  el.menuProfileProgress.style.width = (xp % 100) + "%";
  updateCountryTotal();
}

function updateCountryTotal() {
  el.countryTotal.textContent = state.countries.length
    ? `${state.countries.length} دولة جاهزة للعب`
    : "سيتم تحميل بيانات الدول عند بدء اللعبة.";
}

/* ---------- بيانات الدول ---------- */
function continentOf(c) {
  const r = c.region, s = c.subregion || "";
  if (r === "Africa") return "africa";
  if (r === "Asia") return "asia";
  if (r === "Europe") return "europe";
  if (r === "Oceania") return "oceania";
  if (r === "Antarctic" || r === "Antarctica") return "antarctica";
  if (r === "Americas" || /America|Caribbean/.test(s)) return /South America/.test(s) ? "south-america" : "north-america";
  return "asia";
}

function normalizeCountry(c) {
  const code = c.cca2;
  const pop = c.population || 0;
  return {
    code,
    name: (c.translations && c.translations.ara && c.translations.ara.common) || c.name.common,
    english: c.name.common,
    capital: (c.capital && c.capital[0]) || "—",
    region: c.region,
    subregion: c.subregion || "",
    continent: continentOf(c),
    latlng: c.latlng || [0, 0],
    population: pop,
    flag: (c.flags && (c.flags.png || c.flags.svg)) || `https://flagcdn.com/w640/${String(code).toLowerCase()}.png`,
    difficulty: pop >= 30e6 ? "easy" : pop >= 3e6 ? "medium" : "hard"
  };
}

function loadCountries() {
  if (state.countries.length) return Promise.resolve(state.countries);
  if (state.loadingPromise) return state.loadingPromise;
  const apply = (list) => {
    state.countries = list
      .filter((c) => c && c.cca2 && c.cca2 !== "IL")
      .map(normalizeCountry)
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
    updateCountryTotal();
    return state.countries;
  };
  state.loadingPromise = (async () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=cca2,name,translations,capital,region,subregion,latlng,population,area,flags",
        { signal: ctrl.signal }
      );
      clearTimeout(timer);
      const json = await res.json();
      if (Array.isArray(json) && json.length > 100) return apply(json);
    } catch (e) { /* نكمل بالبيانات المحلية */ }
    return apply(window.BUNDLED_COUNTRIES || []);
  })();
  return state.loadingPromise;
}

/* ---------- الإعدادات ---------- */
const settingsKey = () => accountStorageKey("guessFlagsSettings");

function loadSettings() {
  const saved = safeRead(settingsKey(), null);
  if (saved && typeof saved === "object") Object.assign(state.settings, saved);
}

function syncSettingsUI() {
  const s = state.settings;
  const check = (sel, val) => { const e = document.querySelector(sel); if (e) e.checked = val; };
  document.querySelectorAll('input[name="question-count"]').forEach((i) => { i.checked = i.value === String(s.count); });
  document.querySelectorAll('input[name="timer-mode"]').forEach((i) => { i.checked = i.value === String(s.timer); });
  document.querySelectorAll('input[name="difficulty"]').forEach((i) => { i.checked = s.difficulties.includes(i.value); });
  document.querySelectorAll('input[name="continent"]').forEach((i) => { i.checked = s.continents.includes(i.value); });
  $("custom-count").value = s.custom;
  el.settingsError.classList.add("hidden");
}

function saveSettingsFromUI() {
  const val = (name) => { const e = document.querySelector(`input[name="${name}"]:checked`); return e ? e.value : null; };
  const all = (name) => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);
  const next = {
    count: val("question-count") || "20",
    custom: Math.max(1, Math.min(196, Number($("custom-count").value) || 15)),
    difficulties: all("difficulty"),
    continents: all("continent"),
    timer: val("timer-mode") || "open"
  };
  let err = "";
  if (!next.difficulties.length) err = "اختار مستوى صعوبة واحد على الأقل.";
  else if (!next.continents.length) err = "اختار قارة واحدة على الأقل.";
  if (err) {
    el.settingsError.textContent = err;
    el.settingsError.classList.remove("hidden");
    return;
  }
  Object.assign(state.settings, next);
  try { localStorage.setItem(settingsKey(), JSON.stringify(state.settings)); } catch (e) { console.warn(e); }
  notify("✅ تم حفظ الإعدادات");
  showScreen("menu-screen");
}

/* ---------- بناء الأسئلة ---------- */
function settingsPool() {
  const s = state.settings;
  return state.countries.filter((c) => s.continents.includes(c.continent) && s.difficulties.includes(c.difficulty));
}

function makeQuestion(country, rnd = Math.random) {
  const wrong = shuffle(state.countries.filter((x) => x.code !== country.code), rnd).slice(0, 3);
  return { country, options: shuffle([country, ...wrong], rnd).map((x) => ({ code: x.code, name: x.name })) };
}

function roundSize(available) {
  const s = state.settings;
  const n = s.count === "all" ? available : s.count === "custom" ? Number(s.custom) : Number(s.count);
  return Math.max(1, Math.min(n || 20, available));
}

function buildQuestions(mode) {
  if (mode === "daily") {
    const rnd = seededRandom(Number(todayKey().replace(/-/g, "")));
    return shuffle(state.countries, rnd).slice(0, 10).map((c) => makeQuestion(c, rnd));
  }
  if (mode === "review") {
    const missed = loadMissed();
    const list = shuffle(state.countries.filter((c) => missed[c.code])).slice(0, 20);
    return list.map((c) => makeQuestion(c));
  }
  if (mode === "continents") {
    const list = [];
    ["africa", "asia", "europe", "north-america", "south-america", "oceania"].forEach((cont) => {
      list.push(...shuffle(state.countries.filter((c) => c.continent === cont)).slice(0, 5));
    });
    return list.map((c) => makeQuestion(c));
  }
  const pool = shuffle(settingsPool());
  let n = roundSize(pool.length);
  if (mode === "memory") n = Math.min(n, 10);
  return pool.slice(0, n).map((c) => makeQuestion(c));
}

/* ---------- الجولة ---------- */
async function startRound(mode) {
  const info = MODE_INFO[mode] || MODE_INFO.classic;
  if (getXP() < info.unlock) {
    notify(`🔒 المود ده بيفتح عند ${info.unlock.toLocaleString("en")} XP`);
    return;
  }
  const backTo = state.lastScreen || "menu-screen";
  showScreen("loading-screen");
  await loadCountries();
  if (state.countries.length < 4) {
    showScreen(backTo);
    notify("تعذر تحميل بيانات الدول.");
    return;
  }
  const questions = buildQuestions(mode);
  if (!questions.length) {
    showScreen(backTo);
    notify(mode === "review" ? "مفيش أخطاء محفوظة للمراجعة 👏" : "الإعدادات الحالية ملهاش دول مناسبة. غيّرها من الإعدادات.");
    return;
  }
  if (mode === "duo") {
    let name = "";
    try { name = window.prompt("اسم اللاعب الثاني:", "اللاعب 2") || ""; } catch (e) { /* ignore */ }
    state.p2 = name.trim().slice(0, 24) || "اللاعب 2";
  }
  Object.assign(state, {
    mode, questions, current: 0, correct: 0, wrong: 0, answered: false,
    combo: 0, maxCombo: 0, playerScores: [0, 0], activePlayer: 1, wrongCountries: [],
    xpEarned: 0, daily: mode === "daily"
  });
  showScreen("game-screen");
  renderQuestion();
}

function clearTimer() {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
}

function startTimer(seconds) {
  state.timeLeft = seconds;
  el.timerDisplay.classList.remove("hidden");
  el.timerDisplay.textContent = "⏱ " + seconds;
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    el.timerDisplay.textContent = "⏱ " + Math.max(0, state.timeLeft);
    if (state.timeLeft <= 0) { clearTimer(); answer(null); }
  }, 1000);
}

function mapFrame(c) {
  const [lat, lon] = c.latlng;
  const d = 14;
  const bbox = [lon - d, lat - d * 0.6, lon + d, lat + d * 0.6].map((n) => n.toFixed(2)).join("%2C");
  return `<iframe class="map-frame" title="موقع الدولة على الخريطة" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}"></iframe>`;
}

function updateModeStatus() {
  const q = state.questions[state.current];
  let text = "";
  switch (state.mode) {
    case "speed": text = "⚡ طور السرعة — 10 ثوانٍ لكل سؤال"; break;
    case "combo": text = `🔥 كومبو ×${state.combo}`; break;
    case "continents": text = `🌍 المرحلة: ${CONTINENT_LABELS[q.country.continent] || ""}`; break;
    case "memory": text = "🧠 العلم هيختفي بعد ثانيتين — افتكره!"; break;
    case "facts": text = "📚 هتتعلم معلومة بعد كل إجابة"; break;
    case "duo": text = `👥 الدور على: ${state.activePlayer === 1 ? state.player : state.p2}  |  ${state.playerScores[0]} - ${state.playerScores[1]}`; break;
    case "daily": text = "📅 تحدي اليوم"; break;
    case "review": text = "🧠 مراجعة أخطائك"; break;
    case "xp": text = "🏆 تحدي الخبرة — مضاعف ×30"; break;
    case "map": text = "🗺️ تحدي الخرائط"; break;
  }
  el.modeStatus.textContent = text;
  el.modeStatus.classList.toggle("hidden", !text);
}

function renderQuestion() {
  const q = state.questions[state.current];
  const country = q.country;
  state.answered = false;
  clearTimer();
  el.questionNumber.textContent = state.current + 1;
  el.questionTotal.textContent = state.questions.length;
  el.progressBar.style.width = ((state.current / state.questions.length) * 100) + "%";
  el.playerDisplay.textContent = state.mode === "duo" ? (state.activePlayer === 1 ? state.player : state.p2) : state.player;
  el.feedback.classList.add("hidden");
  el.answerFact.classList.add("hidden");
  el.next.classList.add("hidden");
  el.choices.innerHTML = "";
  q.options.forEach((o) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "choice-button";
    b.dataset.code = o.code;
    b.textContent = o.name;
    b.addEventListener("click", () => answer(o.code));
    el.choices.appendChild(b);
  });

  const isMap = state.mode === "map";
  el.flag.parentElement.classList.toggle("hidden", isMap);
  el.mapChallenge.classList.toggle("hidden", !isMap);
  el.flagFallback.classList.add("hidden");
  el.flag.classList.remove("hidden");
  el.flag.style.visibility = "visible";
  if (isMap) {
    el.mapChallenge.innerHTML = mapFrame(country);
    el.questionHint.textContent = "الدولة دي موجودة فين على الخريطة؟";
  } else {
    el.flag.src = country.flag;
    el.questionHint.textContent = "الدولة صاحبة العلم ده هي إيه؟";
  }
  if (state.mode === "memory") {
    const idx = state.current;
    setTimeout(() => {
      if (state.current === idx && !state.answered && state.mode === "memory") {
        el.flag.style.visibility = "hidden";
        el.questionHint.textContent = "العلم اختفى! اختار الدولة من ذاكرتك.";
      }
    }, 2000);
  }
  updateModeStatus();

  const seconds = state.mode === "speed" ? 10 : (state.settings.timer === "open" ? 0 : Number(state.settings.timer));
  if (seconds > 0) startTimer(seconds);
  else el.timerDisplay.classList.add("hidden");
}

function factFor(c) {
  return `📚 عاصمة ${c.name} هي ${c.capital}، وبتقع في ${CONTINENT_LABELS[c.continent] || c.region}` +
    (c.population ? ` وعدد سكانها حوالي ${Number(c.population).toLocaleString("en")} نسمة.` : ".");
}

function answer(code) {
  if (state.answered) return;
  state.answered = true;
  clearTimer();
  const q = state.questions[state.current];
  const right = code === q.country.code;
  [...el.choices.children].forEach((b) => {
    b.disabled = true;
    if (b.dataset.code === q.country.code) b.classList.add("correct");
    else if (b.dataset.code === code) b.classList.add("wrong");
  });
  el.flag.style.visibility = "visible";

  const missed = loadMissed();
  if (right) {
    state.correct++;
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    if (state.mode === "duo") state.playerScores[state.activePlayer - 1]++;
    if (state.mode === "review") delete missed[q.country.code];
  } else {
    state.wrong++;
    state.combo = 0;
    state.wrongCountries.push(q.country.code);
    missed[q.country.code] = (missed[q.country.code] || 0) + 1;
  }
  saveMissed(missed);

  el.feedback.className = "feedback " + (right ? "correct-text" : "wrong-text");
  el.feedback.textContent = right
    ? "✅ إجابة صحيحة!" + (state.mode === "combo" && state.combo > 1 ? ` 🔥 كومبو ×${state.combo}` : "")
    : (code ? "❌ إجابة غلط." : "⏰ انتهى الوقت.") + ` الإجابة الصحيحة: ${q.country.name}`;
  if (state.mode === "facts") {
    el.answerFact.textContent = factFor(q.country);
    el.answerFact.classList.remove("hidden");
  }
  updateModeStatus();
  const last = state.current + 1 >= state.questions.length;
  el.next.textContent = last ? "عرض النتيجة 🏁" : "السؤال التالي ←";
  el.next.classList.remove("hidden");
  el.progressBar.style.width = (((state.current + 1) / state.questions.length) * 100) + "%";
}

function nextQuestion() {
  if (!state.answered) return;
  if (state.current + 1 >= state.questions.length) { finishRound(); return; }
  state.current++;
  if (state.mode === "duo") state.activePlayer = state.activePlayer === 1 ? 2 : 1;
  renderQuestion();
}

function finishRound() {
  clearTimer();
  const total = state.questions.length;
  const pct = Math.round((state.correct / total) * 100);
  const info = MODE_INFO[state.mode] || MODE_INFO.classic;
  const base = state.correct * 10 + (state.mode === "combo" ? state.maxCombo * 5 : 0) + (state.correct === total && total >= 5 ? 20 : 0);
  const xp = Math.round(base * info.mult);
  const oldXP = getXP();
  const newXP = oldXP + xp;
  setXP(newXP);
  state.xpEarned = xp;

  const st = playerStats();
  st.rounds++;
  st.totalCorrect += state.correct;
  if (state.correct === total && total >= 5) st.perfect++;
  st.bestCombo = Math.max(st.bestCombo, state.maxCombo);
  if (state.mode === "daily") {
    const key = todayKey();
    state.profile.dailyLog = state.profile.dailyLog || {};
    if (!state.profile.dailyLog[key]) st.daily++;
    state.profile.dailyLog[key] = Math.max(state.profile.dailyLog[key] || 0, state.correct);
  }
  state.profile.xb = (state.profile.xb || 0) + xp;
  saveProfileData();

  const history = loadHistory();
  history.unshift({ t: Date.now(), mode: state.mode, correct: state.correct, total, pct, xp });
  saveHistory(history);

  const rec = state.records[state.mode] || { best: 0, bestPct: 0, rounds: 0, total: 0 };
  rec.rounds++;
  if (pct > rec.bestPct || (pct === rec.bestPct && state.correct > rec.best)) { rec.best = state.correct; rec.total = total; rec.bestPct = pct; }
  state.records[state.mode] = rec;
  saveSavedRecords();

  let scoreText = String(state.correct), message;
  if (state.mode === "duo") {
    const [a, b] = state.playerScores;
    scoreText = `${a} - ${b}`;
    message = a === b ? "🤝 تعادل!" : `🏆 الفائز: ${a > b ? state.player : state.p2}`;
  } else {
    message = pct === 100 ? "🌟 ممتاز! جولة مثالية." : pct >= 70 ? "👏 شغل جامد!" : pct >= 40 ? "👍 كويس، كمّل تدريب." : "💪 حاول تاني، هتتحسن.";
  }
  el.resultPlayer.textContent = state.mode === "duo" ? `${state.player} و ${state.p2}` : state.player;
  el.finalScore.textContent = scoreText;
  el.resultMessage.textContent = message;
  el.correctCount.textContent = state.correct;
  el.wrongCount.textContent = state.wrong;
  el.percentage.textContent = pct + "%";

  const unlocked = Object.entries(MODE_INFO)
    .filter(([, m]) => m.unlock > oldXP && m.unlock <= newXP).map(([, m]) => m.label);
  let rewards = `<p>⭐ +${xp} XP (×${info.mult})</p><p>🪙 +${xp} XB</p>`;
  if (levelOf(newXP) > levelOf(oldXP)) rewards += `<p>🚀 ترقية! وصلت للمستوى ${levelOf(newXP)}</p>`;
  if (unlocked.length) rewards += `<p>🔓 اتفتح: ${unlocked.map(esc).join("، ")}</p>`;
  el.resultRewards.innerHTML = rewards;

  state.lastResult = { player: el.resultPlayer.textContent, mode: info.label, score: scoreText, total, pct, xp };
  showScreen("result-screen");
}

function downloadResultCard() {
  const r = state.lastResult;
  if (!r) return;
  const c = document.createElement("canvas");
  c.width = 900; c.height = 500;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 900, 500);
  g.addColorStop(0, "#805334"); g.addColorStop(1, "#38271d");
  x.fillStyle = g; x.fillRect(0, 0, 900, 500);
  x.direction = "rtl"; x.textAlign = "center"; x.fillStyle = "#fff";
  x.font = "bold 54px Tahoma, Arial"; x.fillText("خمن أعلام 🌍", 450, 100);
  x.font = "34px Tahoma, Arial"; x.fillText(`${r.player} — ${r.mode}`, 450, 175);
  x.font = "bold 110px Tahoma, Arial"; x.fillText(r.score, 450, 305);
  x.font = "32px Tahoma, Arial"; x.fillText(`${r.pct}% من ${r.total} سؤال  •  +${r.xp} XP`, 450, 380);
  x.font = "22px Tahoma, Arial"; x.fillStyle = "#f0dcc2"; x.fillText(new Date().toLocaleDateString("ar-EG"), 450, 450);
  c.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "guess-flags-result.png";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }, "image/png");
}

/* ---------- المودات الإضافية ---------- */
function renderModes() {
  const xp = getXP();
  $("mode-wallet").innerHTML = `رصيدك الحالي: <b>${xp.toLocaleString("en")}</b> XP`;
  document.querySelectorAll(".mode-card[data-mode]").forEach((card) => {
    const unlock = Number(card.dataset.unlock || 0);
    const locked = xp < unlock;
    card.classList.toggle("mode-locked", locked);
    const tier = card.querySelector(".mode-tier");
    if (tier) tier.textContent = locked
      ? `🔒 يفتح عند ${unlock.toLocaleString("en")} XP • ×${card.dataset.multiplier}`
      : `✅ مفتوح • ×${card.dataset.multiplier} XP`;
  });
  el.recordsPanel.classList.add("hidden");
}

function renderRecords() {
  const rows = Object.entries(state.records || {}).filter(([, r]) => r && r.rounds)
    .map(([mode, r]) => `<div class="history-item"><b>${esc((MODE_INFO[mode] || {}).label || mode)}</b><span>أفضل نتيجة: ${r.best}/${r.total} (${r.bestPct}%) • ${r.rounds} جولة</span></div>`);
  el.recordsContent.innerHTML = rows.length ? rows.join("") : "<p class='muted-note'>لسه مفيش أرقام قياسية. العب جولة الأول!</p>";
  el.recordsPanel.classList.remove("hidden");
}

function onModeCard(card) {
  const mode = card.dataset.mode;
  if (mode === "records") { renderRecords(); return; }
  const unlock = Number(card.dataset.unlock || 0);
  if (getXP() < unlock) { notify(`🔒 المود ده بيفتح عند ${unlock.toLocaleString("en")} XP`); return; }
  startRound(mode);
}

/* ---------- الموسوعة ---------- */
async function openEncyclopedia() {
  showScreen("encyclopedia-screen");
  el.encyclopediaStatus.textContent = "جاري تحميل الدول...";
  await loadCountries();
  renderEncyclopedia();
}

function renderEncyclopedia() {
  const q = el.search.value.trim().toLowerCase();
  const list = state.countries.filter((c) => !q || c.name.toLowerCase().includes(q) || c.english.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q));
  el.encyclopediaStatus.textContent = list.length ? `${list.length} دولة` : "مفيش نتائج مطابقة.";
  el.countryGrid.innerHTML = list.map((c) => `<article class="country-card"><img src="${esc(c.flag)}" alt="علم ${esc(c.name)}" loading="lazy"><h3>${esc(c.name)}</h3><p class="english-name">${esc(c.english)}</p><p>🏛️ العاصمة: ${esc(c.capital)}</p><p>🌍 ${esc(CONTINENT_LABELS[c.continent] || c.region)}</p></article>`).join("");
}

/* ---------- خريطة العالم ---------- */
async function openWorldMap() {
  showScreen("world-map-screen");
  el.worldCountrySelect.innerHTML = "<option>جاري التحميل...</option>";
  await loadCountries();
  renderWorld(state.worldContinent || "africa");
}

function renderWorld(cont) {
  state.worldContinent = cont;
  document.querySelectorAll("[data-world-continent]").forEach((b) => b.classList.toggle("active", b.dataset.worldContinent === cont));
  const list = state.countries.filter((c) => c.continent === cont);
  el.worldCountrySelect.innerHTML = list.map((c) => `<option value="${esc(c.code)}">${esc(c.name)}</option>`).join("") || "<option>مفيش دول</option>";
  if (list.length) showOnMap(list[0]);
  else { el.worldMapWrap.innerHTML = ""; el.worldMapDetail.textContent = "مفيش دول في القارة دي في البيانات الحالية."; }
}

function showOnMap(c) {
  el.worldMapWrap.innerHTML = mapFrame(c);
  el.worldMapDetail.textContent = `${c.name} (${c.english}) — العاصمة: ${c.capital} — ${CONTINENT_LABELS[c.continent] || c.region}`;
}

/* ---------- السجل والمراجعة ---------- */
function renderHistory() {
  const h = loadHistory();
  const rounds = h.length;
  const avg = rounds ? Math.round(h.reduce((s, r) => s + r.pct, 0) / rounds) : 0;
  const best = rounds ? Math.max(...h.map((r) => r.pct)) : 0;
  const stat = (n, label) => `<div class="stat-card"><span class="stat-number">${n}</span>${label}</div>`;
  el.historySummary.innerHTML = stat(rounds, "جولات") + stat(avg + "%", "المتوسط") + stat(best + "%", "أفضل نتيجة");
  el.historyList.innerHTML = rounds
    ? h.map((r) => `<div class="history-item"><b>${esc((MODE_INFO[r.mode] || {}).label || r.mode)}</b><span>${r.correct}/${r.total} (${r.pct}%) • +${r.xp} XP • ${new Date(r.t).toLocaleDateString("ar-EG")}</span></div>`).join("")
    : "<p class='muted-note'>لسه مفيش جولات. ابدأ أول جولة!</p>";
}

async function renderReview() {
  showScreen("review-screen");
  await loadCountries();
  const missed = loadMissed();
  const list = state.countries.filter((c) => missed[c.code]);
  el.reviewList.innerHTML = list.length
    ? list.map((c) => `<div class="review-item"><img class="review-flag" src="${esc(c.flag)}" alt="علم ${esc(c.name)}" loading="lazy"><b>${esc(c.name)}</b><span>أخطأت ${missed[c.code]} مرة</span></div>`).join("")
    : "<p class='muted-note'>مفيش أخطاء محفوظة. ممتاز! 👏</p>";
}

/* ---------- الملف الشخصي والسوق ---------- */
function ownedItems() {
  const owned = state.profile.owned || [];
  return SHOP_ITEMS.filter((i) => owned.includes(i.id));
}

function renderProfile() {
  const xp = getXP();
  const p = state.profile;
  const st = playerStats();
  el.profileAvatar.textContent = p.avatar || "🌍";
  el.profileDisplayName.textContent = p.nick || state.player || "اللاعب";
  el.profileTitleDisplay.textContent = p.title || "مستكشف الأعلام";
  el.profileXPLine.textContent = `${xp.toLocaleString("en")} XP • ${(p.xb || 0).toLocaleString("en")} XB`;
  el.profileNameInput.value = p.nick || state.player || "";
  const base = ["🌍", "🧭", "🏆", "🚀", "🦊", "🐼", "🐉", "⭐"];
  const extra = ownedItems().map((i) => i.icon).filter((i) => !base.includes(i));
  el.profileAvatarSelect.innerHTML = [...base, ...extra].map((a) => `<option>${a}</option>`).join("");
  el.profileAvatarSelect.value = p.avatar || "🌍";
  el.profileTitleSelect.value = p.title || "مستكشف الأعلام";
  el.profileLevel.textContent = `المستوى ${levelOf(xp)}`;
  el.profileNextLevel.textContent = `${xp % 100} / 100 XP`;
  el.profileXPBar.style.width = (xp % 100) + "%";
  el.achievementsGrid.innerHTML = ACHIEVEMENTS.map((a) => {
    const done = a.test(st, xp);
    return `<div class="achievement-card${done ? " unlocked" : ""}" style="${done ? "" : "opacity:.45"}"><span>${a.icon}</span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small><em>${done ? "✅" : "🔒"}</em></div>`;
  }).join("");
  renderShop();
}

function saveProfileFromUI() {
  const p = state.profile;
  p.nick = el.profileNameInput.value.trim().slice(0, 24);
  p.avatar = el.profileAvatarSelect.value;
  p.title = el.profileTitleSelect.value;
  saveProfileData();
  renderProfile();
  refreshMenu();
  notify("✅ تم حفظ الملف الشخصي");
}

function renderShop() {
  const p = state.profile;
  const cat = state.shopCat || "arab";
  $("shop-coins").textContent = p.coins || 0;
  $("shop-xb-balance").textContent = `رصيد XB: ${p.xb || 0}`;
  document.querySelectorAll(".shop-tab").forEach((b) => b.classList.toggle("active", b.dataset.shopCategory === cat));
  const owned = p.owned || [];
  const items = cat === "owned" ? SHOP_ITEMS.filter((i) => owned.includes(i.id)) : SHOP_ITEMS.filter((i) => i.cat === cat);
  $("shop-items").innerHTML = items.length
    ? items.map((i) => `<div class="shop-item"><span class="shop-item-icon">${i.icon}</span><b>${esc(i.name)}</b><button type="button" class="shop-buy" data-item="${i.id}"${owned.includes(i.id) ? " disabled" : ""}>${owned.includes(i.id) ? "✅ مملوك" : i.price + " 🪙"}</button></div>`).join("")
    : "<p class='muted-note'>لسه معندكش مقتنيات.</p>";
}

function shopMessage(text) { $("shop-message").textContent = text; }

function buyItem(id) {
  const item = SHOP_ITEMS.find((i) => i.id === id);
  const p = state.profile;
  if (!item) return;
  p.owned = p.owned || [];
  if (p.owned.includes(id)) { shopMessage("اشتريت العنصر ده قبل كده."); return; }
  if ((p.coins || 0) < item.price) { shopMessage(`عملاتك مش كفاية — محتاج ${item.price} 🪙.`); return; }
  p.coins -= item.price;
  p.owned.push(id);
  saveProfileData();
  renderProfile();
  shopMessage(`🎉 اشتريت: ${item.name}`);
}

function convertXB() {
  const p = state.profile;
  const amount = Number($("xb-convert-amount").value);
  if (!Number.isInteger(amount) || amount < 100 || amount % 100 !== 0) { shopMessage("المبلغ لازم يكون من مضاعفات 100."); return; }
  if (amount > (p.xb || 0)) { shopMessage("رصيد XB مش كفاية."); return; }
  p.xb -= amount;
  p.coins = (p.coins || 0) + amount / 100;
  saveProfileData();
  renderProfile();
  shopMessage(`✅ حوّلت ${amount} XB إلى ${amount / 100} عملة سوق.`);
}

/* ---------- ربط الأزرار ---------- */
function goMenu() { clearTimer(); showScreen("menu-screen"); }

window.onPlayerLogin = function (name) {
  loadSettings();
  refreshMenu();
  loadCountries().catch(() => {});
};

function bindEvents() {
  try { el.name.value = localStorage.getItem("guessFlagsPlayerName") || ""; } catch (e) { /* ignore */ }

  el.menuStart.addEventListener("click", () => startRound("classic"));
  el.menuDaily.addEventListener("click", () => startRound("daily"));
  el.menuSettings.addEventListener("click", () => { syncSettingsUI(); showScreen("settings-screen"); });
  el.menuEncyclopedia.addEventListener("click", openEncyclopedia);
  el.menuMap.addEventListener("click", openWorldMap);
  el.menuHistory.addEventListener("click", () => { renderHistory(); showScreen("history-screen"); });
  el.menuReview.addEventListener("click", renderReview);
  el.menuProfile.addEventListener("click", () => { renderProfile(); showScreen("profile-screen"); });
  el.menuShop.addEventListener("click", () => {
    state.shopCat = "arab"; renderProfile(); showScreen("profile-screen");
    const shop = document.querySelector(".shop-panel"); if (shop) shop.scrollIntoView();
  });
  el.menuModes.addEventListener("click", () => { renderModes(); showScreen("modes-screen"); });
  el.menuOnline.addEventListener("click", () => {
    if (typeof window.openOnlineLobby === "function") window.openOnlineLobby();
    else showScreen("online-screen");
  });

  document.querySelectorAll(".back-menu").forEach((b) => b.addEventListener("click", goMenu));
  el.modesBack.addEventListener("click", goMenu);
  el.settingsBack.addEventListener("click", goMenu);
  el.encyclopediaBack.addEventListener("click", goMenu);

  document.querySelectorAll(".mode-card[data-mode]").forEach((c) => c.addEventListener("click", () => onModeCard(c)));

  el.saveSettings.addEventListener("click", saveSettingsFromUI);
  el.selectAllContinents.addEventListener("click", () => document.querySelectorAll('input[name="continent"]').forEach((i) => { i.checked = true; }));
  el.clearContinents.addEventListener("click", () => document.querySelectorAll('input[name="continent"]').forEach((i) => { i.checked = false; }));

  el.next.addEventListener("click", nextQuestion);
  el.quit.addEventListener("click", goMenu);
  el.flag.addEventListener("error", () => { el.flag.classList.add("hidden"); el.flagFallback.classList.remove("hidden"); });
  el.flag.addEventListener("load", () => { el.flag.classList.remove("hidden"); el.flagFallback.classList.add("hidden"); });

  el.restart.addEventListener("click", () => startRound(state.mode));
  el.resultMenu.addEventListener("click", goMenu);
  el.downloadResult.addEventListener("click", downloadResultCard);

  el.search.addEventListener("input", renderEncyclopedia);

  document.querySelectorAll("[data-world-continent]").forEach((b) => b.addEventListener("click", () => renderWorld(b.dataset.worldContinent)));
  el.worldCountrySelect.addEventListener("change", () => {
    const c = state.countries.find((x) => x.code === el.worldCountrySelect.value);
    if (c) showOnMap(c);
  });

  el.reviewPractice.addEventListener("click", () => startRound("review"));

  el.saveProfile.addEventListener("click", saveProfileFromUI);
  el.profileAvatarSelect.addEventListener("change", () => { el.profileAvatar.textContent = el.profileAvatarSelect.value; });
  document.querySelectorAll(".shop-tab").forEach((t) => t.addEventListener("click", () => { state.shopCat = t.dataset.shopCategory; renderShop(); }));
  $("shop-items").addEventListener("click", (e) => { const b = e.target.closest(".shop-buy"); if (b) buyItem(b.dataset.item); });
  $("xb-convert-button").addEventListener("click", convertXB);
}

bindEvents();
