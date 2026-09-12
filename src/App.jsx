import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Moon, Zap, Smile, Frown, Activity, Droplet, Heart, TrendingUp, Users,
  Calendar, AlertTriangle, CheckCircle2, LogOut, Shield, ChevronRight,
  Clock, Apple, Dumbbell, X, Loader2, BarChart3, ShieldAlert, Settings,
  Plus, Key, UserCog, Trash2, RotateCcw, Check, Pencil, HelpCircle,
  ArrowRight, ClipboardList, Printer
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

/* ============================== THEME (couleurs historiques AJA : blanc bordé de bleu) ============================== */
const C = {
  navy: "#0B1F3F",
  navyDeep: "#071630",
  blue: "#0B3D91",
  blueBright: "#1E5FD6",
  white: "#FFFFFF",
  cream: "#F5F7FB",
  gold: "#D4A537",
  rose: "#E0688C",
  roseSoft: "#F6DCE4",
  green: "#3E9C6E",
  amber: "#E0A63E",
  red: "#D9503F",
  ink: "#152238",
  mist: "#8496B8",
  line: "#E1E6F0",
};

const FONT_HEAD = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    .aja-root { font-family: ${FONT_BODY}; color: ${C.ink}; }
    .aja-head { font-family: ${FONT_HEAD}; letter-spacing: 0.01em; }
    .aja-scroll::-webkit-scrollbar { width: 6px; }
    .aja-scroll::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 4px; }
    .needle { transition: transform 900ms cubic-bezier(.22,1,.36,1); }
    .fadein { animation: fadein .35s ease both; }
    @keyframes fadein { from { opacity:0; transform: translateY(6px);} to {opacity:1; transform:none;} }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    input[type=range] { -webkit-appearance:none; height:6px; border-radius:99px; background:${C.line}; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:${C.blue}; border:3px solid white; box-shadow:0 1px 4px rgba(0,0,0,.3); cursor:pointer; margin-top:-8px; }
    input[type=range]::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:${C.blue}; border:3px solid white; box-shadow:0 1px 4px rgba(0,0,0,.3); cursor:pointer; }
    input[type=date] { font-family: inherit; }
    button { font-family: inherit; cursor:pointer; }
    @media (prefers-reduced-motion: reduce) { .needle, .fadein, .spin { transition:none; animation:none; } }
    @media print {
      body * { visibility: hidden; }
      #aja-print-area, #aja-print-area * { visibility: visible; }
      #aja-print-area { position: static !important; width: 100%; padding: 0; }
      .aja-print-modal-bg { position: static !important; inset: auto !important; background: none !important; display: block !important; padding: 0 !important; height: auto !important; width: 100% !important; }
      .aja-print-modal-card { position: static !important; max-height: none !important; max-width: none !important; overflow: visible !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; margin: 0 !important; }
      .aja-no-print { display: none !important; }
    }
  `}</style>
);

/* ============================== EMBLÈME (original, couleurs du club — pas l'écusson officiel) ============================== */
function ClubEmblem({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 116" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 2 L96 16 V56 C96 90 76 106 50 114 C24 106 4 90 4 56 V16 Z" fill={C.blue} />
      <path d="M50 2 L96 16 V56 C96 90 76 106 50 114 Z" fill={C.blueBright} opacity="0.35" />
      <path d="M50 10 L88 21 V56 C88 84 71 98 50 105 C29 98 12 84 12 56 V21 Z" fill={C.white} />
      <text x="50" y="70" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="800" fontSize="40" fill={C.blue} letterSpacing="1">AJA</text>
      <rect x="38" y="78" width="24" height="4" rx="2" fill={C.gold} />
    </svg>
  );
}

/* ============================== DATA / CONTENT ============================== */
const WELLNESS_ITEMS = [
  { key: "mood", label: "Humeur", icon: Smile, lo: "Très mauvaise", hi: "Excellente" },
  { key: "sleep", label: "Sommeil", icon: Moon, lo: "Très mauvais", hi: "Excellent" },
  { key: "energy", label: "Énergie", icon: Zap, lo: "Épuisée", hi: "Pleine d'énergie" },
  { key: "soreness", label: "Courbatures", icon: Activity, lo: "Beaucoup", hi: "Aucune" },
  { key: "muscularPain", label: "Douleurs musculaires", icon: Frown, lo: "Fortes", hi: "Aucune" },
  { key: "stress", label: "Stress", icon: Heart, lo: "Très élevé", hi: "Aucun" },
];

const PHASES = {
  menstruelle: { label: "Menstruation", color: C.red, short: "Règles" },
  folliculaire: { label: "Phase folliculaire", color: C.gold, short: "Folliculaire" },
  ovulation: { label: "Ovulation", color: C.blueBright, short: "Ovulation" },
  premenstruelle: { label: "Phase prémenstruelle", color: C.rose, short: "Prémenstruelle" },
};

const NUTRITION = {
  menstruelle: { title: "Reconstituer & apaiser", items: [
    { what: "Aliments riches en fer (viande rouge, lentilles, épinards, boudin noir)", why: "pour lutter contre la perte de sang liée aux règles." },
    { what: "Antioxydants (abricots secs, graines de tournesol, volaille, soja, lentilles)", why: "pour réduire les symptômes de la période de menstruation." },
    { what: "Bonne hydratation et repas chauds, faciles à digérer", why: "pour le confort digestif pendant cette phase." },
  ]},
  folliculaire: { title: "Construire & réparer", items: [
    { what: "Augmenter l'apport en glucides", why: "cette phase est propice à la haute intensité, l'organisme a besoin de plus d'énergie disponible." },
    { what: "Collagène (bouillon d'os, blancs d'œufs, poisson)", why: "pour aider à maintenir une structure osseuse forte et stable, et favoriser la récupération des muscles." },
    { what: "Vitamine C (kiwi, poivrons, agrumes)", why: "pour favoriser la production de collagène." },
  ]},
  ovulation: { title: "Énergie & hydratation", items: [
    { what: "Bons lipides (beurre de cacahuète, graines de lin ou de chia, huile d'olive)", why: "cette phase est propice à l'endurance, les lipides sont une source d'énergie adaptée à l'effort prolongé." },
    { what: "Augmenter les apports hydriques (eau, jus de cerise)", why: "la température corporelle monte, ce qui augmente la transpiration durant l'exercice." },
  ]},
  premenstruelle: { title: "Anti-inflammatoire & apaisant", items: [
    { what: "Antioxydants et anti-inflammatoires (fruits rouges, myrtilles, framboises)", why: "pour réduire les symptômes prémenstruels." },
    { what: "Viande, poisson blanc, légumes verts", why: "pour un bon apport en protéines et nutriments essentiels pendant cette phase." },
    { what: "Limiter sucre rapide et caféine en fin de phase", why: "pour amortir les variations d'humeur avant l'arrivée des règles." },
  ]},
};

/* Consignes d'entraînement détaillées, avec distinction début/fin de phase */
const TRAINING_DETAIL = {
  menstruelle: {
    title: "Période de règles",
    bullets: [
      "Forme majoritairement plus basse, stress accru, humeur changeante : réduire la charge d'entraînement.",
      "Contrôle neuromusculaire plus faible : vigilance sur la pliométrie et les réceptions.",
      "Échauffement plus complet et plus progressif.",
      "Privilégier le travail aérobie, le core training et le gainage.",
      "Attention au valgus de genou ; en salle, privilégier les appuis stables et réduire le nombre de séries.",
    ],
  },
  folliculaire_early: {
    title: "Folliculaire (début / milieu) — fenêtre haute intensité",
    bullets: [
      "Meilleure période pour la haute intensité énergétique et musculaire.",
      "Travail de force +++ et entraînement à haute intensité +++.",
      "Moment idéal pour augmenter la charge de travail.",
    ],
  },
  folliculaire_late: {
    title: "Fin de phase folliculaire — vigilance LCA",
    bullets: [
      "Attention sauts, atterrissages, pliométrie — risque accru de rupture du LCA.",
      "Laxité articulaire en hausse : vigilance sur la position des genoux et les changements de direction.",
      "Possible de garder une charge élevée mais en sécurisant la technique de réception et de pivot.",
    ],
  },
  ovulation_early: {
    title: "Ovulation — cardio & force",
    bullets: [
      "Travailler le cardio ++ et la force ++.",
      "Encore une bonne fenêtre de travail, capacités physiques élevées.",
    ],
  },
  ovulation_late: {
    title: "Fin d'ovulation — hydratation",
    bullets: [
      "Sudation importante en fin de période : rappeler à la joueuse de bien s'hydrater avant, pendant et après.",
      "Cardio/force toujours possibles, surveiller les signes de déshydratation en conditions chaudes.",
    ],
  },
  premenstruelle_early: {
    title: "Prémenstruelle — alléger progressivement",
    bullets: [
      "Réduire l'intensité et le volume d'entraînement.",
      "Limiter le travail cognitif complexe (tactique dense, prises de décision rapides).",
    ],
  },
  premenstruelle_late: {
    title: "Fin de prémenstruelle — réduire encore la charge",
    bullets: [
      "Dans les tout derniers jours avant les règles : réduire encore la charge globale.",
      "Anticiper le passage en phase menstruelle : privilégier récupération et travail technique léger.",
    ],
  },
};

/* ============================== HELPERS ============================== */
const todayStr = () => new Date().toISOString().slice(0, 10);
const timeStr = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const dateFR = (d) => new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
const dateFRlong = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
const diffDays = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

/* Bascule automatique de la date locale à minuit */
function useTodayDate() {
  const [date, setDate] = useState(todayStr());
  useEffect(() => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    const timer = setTimeout(() => setDate(todayStr()), next - now);
    return () => clearTimeout(timer);
  }, [date]);
  return date;
}

async function hashPassword(pw) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) { /* fall through to fallback */ }
  let h = 0;
  for (let i = 0; i < pw.length; i++) h = (Math.imul(h, 31) + pw.charCodeAt(i)) >>> 0;
  return "fb" + h.toString(16);
}

function computeCycle(profile, dateStr) {
  if (!profile || profile.unknown || !profile.lastPeriodStart) return null;
  const cycleLength = profile.cycleLength || 28;
  const periodLength = profile.periodLength || 5;
  let daysSince = diffDays(profile.lastPeriodStart, dateStr);
  if (daysSince < 0) daysSince = 0;
  const cycleDay = (daysSince % cycleLength) + 1;
  const ovulationDay = Math.max(periodLength + 2, cycleLength - 14);
  const ovStart = ovulationDay - 1;
  const ovEnd = ovulationDay + 1;
  let phase;
  if (cycleDay <= periodLength) phase = "menstruelle";
  else if (cycleDay < ovStart) phase = "folliculaire";
  else if (cycleDay <= ovEnd) phase = "ovulation";
  else phase = "premenstruelle";
  const nextPeriodEstimate = addDays(profile.lastPeriodStart, cycleLength);
  return { cycleDay, cycleLength, periodLength, ovulationDay, ovStart, ovEnd, phase, nextPeriodEstimate };
}

/* Sous-phase : où en est la joueuse à l'intérieur de sa phase (début / fin) */
function getSubPhase(cycle) {
  if (!cycle) return null;
  const { phase, cycleDay, ovStart, ovulationDay, cycleLength } = cycle;
  if (phase === "menstruelle") return "menstruelle";
  if (phase === "folliculaire") return cycleDay >= ovStart - 2 ? "folliculaire_late" : "folliculaire_early";
  if (phase === "ovulation") return cycleDay >= ovulationDay ? "ovulation_late" : "ovulation_early";
  if (phase === "premenstruelle") return cycleDay >= cycleLength - 2 ? "premenstruelle_late" : "premenstruelle_early";
  return null;
}

function wellnessLevel(total) {
  if (total >= 22) return { label: "Excellent", color: C.green, icon: CheckCircle2 };
  if (total >= 19) return { label: "Bon", color: C.blueBright, icon: CheckCircle2 };
  if (total >= 14) return { label: "Vigilance", color: C.amber, icon: AlertTriangle };
  return { label: "À risque", color: C.red, icon: ShieldAlert };
}

/* Recommandation concrète du jour : combine wellness + sous-phase du cycle, avec consignes détaillées */
function getAdaptation(entry, cycle) {
  if (!entry) return { status: "unknown", label: "Pas de wellness", color: C.mist, bg: C.line, reason: "N'a pas encore répondu aujourd'hui.", bullets: ["Relancer la joueuse pour qu'elle remplisse son wellness du jour."] };
  if (entry.total < 14) {
    return {
      status: "reduce", label: "Wellness bas — charge à réduire", color: C.red, bg: "#FBE4E0",
      reason: `Wellness bas (${entry.total}/30).`,
      bullets: [
        "Séance allégée ou individualisée, prioriser la récupération.",
        "Surveiller sommeil, douleurs et stress dans les prochains jours.",
        "Réévaluer avant de remettre la joueuse sur une charge normale.",
      ],
    };
  }
  const sub = getSubPhase(cycle);
  if (sub) {
    const detail = TRAINING_DETAIL[sub];
    const statusMap = { menstruelle: "reduce", folliculaire_late: "caution", folliculaire_early: "normal", ovulation_early: "normal", ovulation_late: "caution", premenstruelle_early: "caution", premenstruelle_late: "reduce" };
    const colorMap = { reduce: C.red, caution: C.amber, normal: C.green };
    const bgMap = { reduce: "#FBE4E0", caution: "#FBF0DD", normal: "#E1F3EA" };
    const status = statusMap[sub];
    return { status, label: detail.title, color: colorMap[status], bg: bgMap[status], reason: detail.bullets[0], bullets: detail.bullets };
  }
  if (entry.total <= 18) {
    return { status: "caution", label: "Vigilance wellness", color: C.amber, bg: "#FBF0DD", reason: `Wellness en vigilance (${entry.total}/30).`, bullets: ["Wellness en zone de vigilance : observer l'évolution, adapter l'intensité si besoin.", "Vérifier sommeil et stress avec la joueuse avant la séance."] };
  }
  return { status: "normal", label: "Charge normale possible", color: C.green, bg: "#E1F3EA", reason: "Wellness bon, pas de restriction liée au cycle.", bullets: ["Aucune restriction particulière aujourd'hui.", "Wellness bon et cycle sans contre-indication connue."] };
}

const FILTER_DEFS = [
  { key: "all", label: "Toute l'équipe" },
  { key: "notdone", label: "N'ont pas répondu" },
  { key: "risk", label: "À risque" },
  { key: "reduce", label: "Charge à réduire" },
  { key: "caution", label: "Vigilance" },
];
function filterPlayers(players, filter) {
  return players.filter((p) => {
    if (filter === "risk") return p.entry && p.entry.total < 14;
    if (filter === "notdone") return !p.entry;
    if (filter === "reduce") return getAdaptation(p.entry, p.cycle).status === "reduce";
    if (filter === "caution") return getAdaptation(p.entry, p.cycle).status === "caution";
    return true;
  });
}
/* Fenêtre de risque LCA : fin de phase folliculaire (approche de l'ovulation) */
function isACLWindow(cycle) {
  return !!cycle && cycle.phase === "folliculaire" && cycle.cycleDay >= cycle.ovStart - 2;
}

/* ============================== STORAGE LAYER (Supabase) ============================== */
import { getJSON, setJSON, delKey, listKeys } from "./storage";
async function findAdmin() {
  const keys = await listKeys("user:");
  for (const k of keys) { const u = await getJSON(k); if (u && u.role === "admin") return u; }
  return null;
}
async function migrateUsername(oldUsername, newUsername, userObj) {
  const clash = await getJSON(`user:${newUsername}`);
  if (clash) throw new Error("Cet identifiant est déjà pris.");
  const entryKeys = await listKeys(`entry:${oldUsername}:`);
  for (const k of entryKeys) {
    const v = await getJSON(k);
    const date = k.split(":")[2];
    if (v) await setJSON(`entry:${newUsername}:${date}`, v);
    await delKey(k);
  }
  const profile = await getJSON(`cycleProfile:${oldUsername}`);
  if (profile) { await setJSON(`cycleProfile:${newUsername}`, profile); await delKey(`cycleProfile:${oldUsername}`); }
  const updated = { ...userObj, username: newUsername };
  await setJSON(`user:${newUsername}`, updated);
  await delKey(`user:${oldUsername}`);
  return updated;
}

/* ============================== GAUGE ============================== */
function CycleGauge({ cycle, size = 210 }) {
  if (!cycle) {
    return (
      <div style={{ width: size, height: size }} className="rounded-full flex items-center justify-center mx-auto">
        <div className="text-center px-6">
          <Droplet size={22} color={C.mist} style={{ margin: "0 auto 6px" }} />
          <p style={{ color: C.mist, fontSize: 13 }}>Cycle non renseigné</p>
        </div>
      </div>
    );
  }
  const { cycleDay, cycleLength, periodLength, ovStart, ovEnd, phase } = cycle;
  const p1 = (periodLength / cycleLength) * 100;
  const p2 = (Math.max(ovStart - 1, periodLength) / cycleLength) * 100;
  const p3 = (ovEnd / cycleLength) * 100;
  const gradient = `conic-gradient(from -90deg, ${C.red} 0% ${p1}%, ${C.gold} ${p1}% ${p2}%, ${C.blueBright} ${p2}% ${p3}%, ${C.rose} ${p3}% 100%)`;
  const angle = ((cycleDay - 0.5) / cycleLength) * 360;
  const inner = size - 34;
  return (
    <div style={{ width: size, height: size, position: "relative" }} className="mx-auto">
      <div style={{ width: size, height: size, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: inner, height: inner, borderRadius: "50%", background: C.white, boxShadow: "inset 0 0 0 1px rgba(11,31,63,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span className="aja-head" style={{ fontSize: 40, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{cycleDay}</span>
          <span style={{ fontSize: 11, color: C.mist }}>sur {cycleLength} jours</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: PHASES[phase].color, marginTop: 6 }}>{PHASES[phase].short}</span>
        </div>
      </div>
      <div className="needle" style={{ position: "absolute", left: "50%", top: "50%", width: 3, height: size / 2 - 6, background: C.navyDeep, transformOrigin: "50% 0%", transform: `translate(-50%, 0) rotate(${angle}deg)`, borderRadius: 3 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.navyDeep, position: "absolute", top: -4, left: -3 }} />
      </div>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 10, height: 10, borderRadius: "50%", background: C.white, border: `2px solid ${C.navyDeep}`, transform: "translate(-50%,-50%)" }} />
    </div>
  );
}

/* ============================== SMALL UI ============================== */
const Badge = ({ children, color, bg }) => (
  <span style={{ background: bg, color, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 5 }}>{children}</span>
);
const Card = ({ children, style, className }) => (
  <div className={className} style={{ background: C.white, borderRadius: 18, boxShadow: "0 1px 2px rgba(11,31,63,.06), 0 8px 24px -12px rgba(11,31,63,.12)", ...style }}>{children}</div>
);
const PrimaryButton = ({ children, onClick, disabled, style }) => (
  <button onClick={onClick} disabled={disabled} style={{ background: disabled ? C.mist : C.navy, color: C.white, border: "none", borderRadius: 12, padding: "12px 20px", fontWeight: 600, fontSize: 15, opacity: disabled ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...style }}>{children}</button>
);
const GhostButton = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{ background: "white", color: C.navy, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "10px 16px", fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, ...style }}>{children}</button>
);
const inputStyle = { flex: 1, border: `1.5px solid ${C.line}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, outline: "none", width: "100%" };

/* ============================== BOOTSTRAP ADMIN ============================== */
function BootstrapAdmin({ onCreated }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!form.firstName || !form.lastName || !form.username || !form.password) { setError("Tous les champs sont requis."); return; }
    if (form.password.length < 4) { setError("Mot de passe trop court (4 caractères min)."); return; }
    setBusy(true);
    try {
      const uname = form.username.trim().toLowerCase();
      const passwordHash = await hashPassword(form.password);
      const user = { username: uname, passwordHash, role: "admin", firstName: form.firstName.trim(), lastName: form.lastName.trim(), createdAt: new Date().toISOString() };
      const res = await setJSON(`user:${uname}`, user);
      if (!res) throw new Error("Échec d'enregistrement — la sauvegarde n'a pas fonctionné.");
      onCreated(user);
    } catch (err) {
      setError(err.message || "Erreur lors de la création du compte.");
    }
    setBusy(false);
  };

  return (
    <div className="aja-root" style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.navyDeep} 0%, ${C.navy} 55%, ${C.blue} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }} className="fadein">
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <ClubEmblem size={68} />
          <h1 className="aja-head" style={{ color: C.white, fontSize: 30, fontWeight: 800, margin: "12px 0 2px" }}>AJ AUXERRE FÉM</h1>
          <p style={{ color: "#B9C6E6", fontSize: 13.5 }}>Configuration initiale — crée ton compte responsable</p>
        </div>
        <Card style={{ padding: 26 }}>
          <p style={{ fontSize: 13, color: C.mist, marginTop: 0, marginBottom: 16 }}>Aucun compte administrateur n'existe encore. Ce compte est le tien : c'est lui qui pourra ensuite créer les identifiants des joueuses et du staff.</p>
          <div onKeyDown={(e) => { if (e.key === "Enter") submit(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="Prénom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle} />
              <input placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle} />
            </div>
            <input placeholder="Identifiant" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={inputStyle} />
            <input placeholder="Mot de passe" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            {error && <p style={{ color: C.red, fontSize: 13, margin: 0 }}>{error}</p>}
            <PrimaryButton onClick={submit} disabled={busy}>
              {busy ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
              Créer mon compte responsable
            </PrimaryButton>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================== LOGIN ============================== */
function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(""); setBusy(true);
    try {
      const uname = form.username.trim().toLowerCase();
      if (!uname || !form.password) { setError("Identifiant et mot de passe requis."); setBusy(false); return; }
      const user = await getJSON(`user:${uname}`);
      if (!user) { setError("Identifiant introuvable."); setBusy(false); return; }
      const passwordHash = await hashPassword(form.password);
      if (passwordHash !== user.passwordHash) { setError("Mot de passe incorrect."); setBusy(false); return; }
      onLogin(user);
    } catch (err) {
      setError("Erreur de connexion : " + (err.message || "réessaie."));
    }
    setBusy(false);
  };

  return (
    <div className="aja-root" style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.navyDeep} 0%, ${C.navy} 55%, ${C.blue} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }} className="fadein">
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <ClubEmblem size={68} />
          <h1 className="aja-head" style={{ color: C.white, fontSize: 34, fontWeight: 800, margin: "12px 0 2px" }}>AJ AUXERRE FÉM</h1>
          <p style={{ color: "#B9C6E6", fontSize: 14 }}>Suivi wellness &amp; cycle — accès privé de l'équipe</p>
        </div>
        <Card style={{ padding: 26 }}>
          <div onKeyDown={(e) => { if (e.key === "Enter") submit(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Identifiant" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={inputStyle} autoCapitalize="none" />
            <input placeholder="Mot de passe" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            {error && <p style={{ color: C.red, fontSize: 13, margin: 0 }}>{error}</p>}
            <PrimaryButton onClick={submit} disabled={busy} style={{ marginTop: 4 }}>
              {busy ? <Loader2 size={16} className="spin" /> : <Key size={16} />}
              Se connecter
            </PrimaryButton>
          </div>
        </Card>
        <p style={{ textAlign: "center", color: "#8FA0C8", fontSize: 12, marginTop: 16 }}>Ton identifiant et mot de passe te sont donnés par le staff. Tu pourras les modifier dans « Paramètres » une fois connectée.</p>
      </div>
    </div>
  );
}

/* ============================== SETTINGS ============================== */
function SettingsModal({ user, onClose, onUpdated }) {
  const [username, setUsername] = useState(user.username);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const saveUsername = async () => {
    setMsg(null);
    const clean = username.trim().toLowerCase();
    if (!clean || clean === user.username) return;
    setBusy(true);
    try {
      const updated = await migrateUsername(user.username, clean, user);
      onUpdated(updated);
      setMsg({ type: "ok", text: "Identifiant mis à jour." });
    } catch (err) { setMsg({ type: "err", text: err.message }); }
    setBusy(false);
  };

  const savePassword = async () => {
    setMsg(null);
    if (!currentPw || !newPw || !confirmPw) { setMsg({ type: "err", text: "Complète les 3 champs." }); return; }
    if (newPw !== confirmPw) { setMsg({ type: "err", text: "Les deux nouveaux mots de passe ne correspondent pas." }); return; }
    if (newPw.length < 4) { setMsg({ type: "err", text: "4 caractères minimum." }); return; }
    setBusy(true);
    try {
      const currentHash = await hashPassword(currentPw);
      if (currentHash !== user.passwordHash) { setMsg({ type: "err", text: "Mot de passe actuel incorrect." }); setBusy(false); return; }
      const newHash = await hashPassword(newPw);
      const updated = { ...user, passwordHash: newHash };
      await setJSON(`user:${user.username}`, updated);
      onUpdated(updated);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setMsg({ type: "ok", text: "Mot de passe mis à jour." });
    } catch (err) { setMsg({ type: "err", text: "Erreur : " + err.message }); }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,22,48,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="fadein" style={{ background: C.cream, borderRadius: 20, width: "100%", maxWidth: 420, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 className="aja-head" style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.navy }}>Paramètres</h2>
          <button onClick={onClose} style={{ background: "white", border: "none", borderRadius: 10, padding: 8 }}><X size={16} /></button>
        </div>
        <Card style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><UserCog size={15} color={C.blue} /> Identifiant</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
            <button onClick={saveUsername} disabled={busy} style={{ background: C.navy, color: "white", border: "none", borderRadius: 10, padding: "0 14px", fontSize: 13, fontWeight: 600 }}>Enregistrer</button>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Key size={15} color={C.blue} /> Mot de passe</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input type="password" placeholder="Mot de passe actuel" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Nouveau mot de passe" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Confirme le nouveau mot de passe" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} style={inputStyle} />
            <PrimaryButton onClick={savePassword} disabled={busy}>Mettre à jour le mot de passe</PrimaryButton>
          </div>
        </Card>
        {msg && <p style={{ color: msg.type === "ok" ? C.green : C.red, fontSize: 13, marginTop: 12, marginBottom: 0 }}>{msg.text}</p>}
      </div>
    </div>
  );
}

/* ============================== TOPBAR ============================== */
function TopBar({ user, onLogout, onOpenSettings }) {
  return (
    <div style={{ background: C.navy, padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ClubEmblem size={34} />
        <div>
          <div className="aja-head" style={{ color: C.white, fontWeight: 700, fontSize: 18, lineHeight: 1 }}>AJ AUXERRE FÉM</div>
          <div style={{ color: "#9DB0DA", fontSize: 11 }}>{user.role === "admin" ? "Responsable" : user.role === "staff" ? "Espace staff" : "Espace joueuse"}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#D7E0F5", fontSize: 13 }}>{user.firstName} {user.lastName}</span>
        <button onClick={onOpenSettings} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 9, padding: 8, display: "flex" }}><Settings size={16} color="white" /></button>
        <button onClick={onLogout} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 9, padding: 8, display: "flex" }}><LogOut size={16} color="white" /></button>
      </div>
    </div>
  );
}

/* ============================== CYCLE SETUP (date des dernières règles) ============================== */
function CycleSetup({ user, profile, today, onSaved }) {
  const [dateVal, setDateVal] = useState(profile?.lastPeriodStart || today);
  const [dontKnow, setDontKnow] = useState(profile?.unknown || false);
  const [cycleLen, setCycleLen] = useState(profile?.cycleLength || 28);
  const [editing, setEditing] = useState(!profile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (!dontKnow && !dateVal) { setError("Choisis une date ou coche « je ne sais pas »."); return; }
    if (!dontKnow && dateVal > today) { setError("La date ne peut pas être dans le futur."); return; }
    const len = Number(cycleLen) || 28;
    if (len < 21 || len > 40) { setError("Durée de cycle inhabituelle (attendu entre 21 et 40 jours)."); return; }
    setBusy(true);
    const newProfile = dontKnow
      ? { unknown: true, cycleLength: 28, periodLength: 5, lastPeriodStart: null, history: [], updatedAt: new Date().toISOString() }
      : { unknown: false, cycleLength: len, periodLength: (profile && profile.periodLength) || 5, lastPeriodStart: dateVal, history: [{ start: dateVal }], updatedAt: new Date().toISOString() };
    await setJSON(`cycleProfile:${user.username}`, newProfile);
    onSaved(newProfile);
    setEditing(false);
    setBusy(false);
  };

  if (!editing && profile && !profile.unknown) return null;

  return (
    <Card style={{ padding: 22 }} className="fadein">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Droplet size={16} color={C.rose} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Date de tes dernières règles</h3></div>
      <p style={{ fontSize: 12.5, color: C.mist, margin: "0 0 14px" }}>Indique le premier jour de tes dernières règles : l'app calcule automatiquement où tu en es dans ton cycle et l'estimation de tes prochaines règles.</p>
      <input type="date" value={dateVal} max={today} disabled={dontKnow} onChange={(e) => setDateVal(e.target.value)} style={{ ...inputStyle, marginBottom: 10, opacity: dontKnow ? 0.5 : 1 }} />
      {!dontKnow && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12.5, color: C.ink, fontWeight: 600, display: "block", marginBottom: 6 }}>Durée moyenne de ton cycle (jours) — 28 par défaut si tu ne sais pas</label>
          <input type="number" min={21} max={40} value={cycleLen} onChange={(e) => setCycleLen(e.target.value)} style={inputStyle} />
        </div>
      )}
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.ink, marginBottom: 14, cursor: "pointer" }}>
        <input type="checkbox" checked={dontKnow} onChange={(e) => setDontKnow(e.target.checked)} />
        Je ne sais pas / je ne souhaite pas renseigner
      </label>
      {error && <p style={{ color: C.red, fontSize: 13, margin: "0 0 10px" }}>{error}</p>}
      <PrimaryButton onClick={save} disabled={busy} style={{ width: "100%" }}>{busy ? "Enregistrement..." : "Valider"}</PrimaryButton>
      {profile && <GhostButton onClick={() => setEditing(false)} style={{ width: "100%", marginTop: 8 }}>Annuler</GhostButton>}
    </Card>
  );
}

function ConfirmNewPeriod({ user, profile, today, onSaved }) {
  const [open, setOpen] = useState(false);
  const [dateVal, setDateVal] = useState(today);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    // La durée de cycle n'est JAMAIS recalculée automatiquement ici : elle reste celle
    // définie par la joueuse/le staff, pour éviter des écarts inattendus (ex. 31 au lieu de 28).
    const newProfile = { ...profile, unknown: false, lastPeriodStart: dateVal, history: [...(profile.history || []), { start: dateVal }], updatedAt: new Date().toISOString() };
    await setJSON(`cycleProfile:${user.username}`, newProfile);
    onSaved(newProfile);
    setOpen(false);
    setBusy(false);
  };

  if (!open) {
    return <GhostButton onClick={() => setOpen(true)} style={{ width: "100%", marginTop: 12 }}><Droplet size={14} /> Confirmer le début de mes nouvelles règles</GhostButton>;
  }
  return (
    <div style={{ marginTop: 12, background: C.cream, borderRadius: 12, padding: 14 }} className="fadein">
      <p style={{ fontSize: 12.5, color: C.ink, margin: "0 0 8px", fontWeight: 600 }}>Premier jour de tes nouvelles règles :</p>
      <input type="date" value={dateVal} max={today} onChange={(e) => setDateVal(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <PrimaryButton onClick={confirm} disabled={busy} style={{ flex: 1 }}>Confirmer</PrimaryButton>
        <GhostButton onClick={() => setOpen(false)} style={{ flex: 1 }}>Annuler</GhostButton>
      </div>
    </div>
  );
}

function CycleCard({ user, profile, cycle, today, onProfileChange }) {
  const [correcting, setCorrecting] = useState(false);
  if (!profile || correcting) {
    return <CycleSetup user={user} profile={profile} today={today} onSaved={(p) => { onProfileChange(p); setCorrecting(false); }} />;
  }
  if (profile.unknown) {
    return (
      <Card style={{ padding: 22, textAlign: "center" }} className="fadein">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}><HelpCircle size={16} color={C.mist} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Cycle non renseigné</h3></div>
        <p style={{ fontSize: 12.5, color: C.mist, marginBottom: 14 }}>Tu as indiqué ne pas connaître la date de tes dernières règles.</p>
        <GhostButton onClick={() => setCorrecting(true)} style={{ margin: "0 auto" }}><Pencil size={13} /> Renseigner une date</GhostButton>
      </Card>
    );
  }
  return (
    <Card style={{ padding: 22, textAlign: "center" }} className="fadein">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
        <Calendar size={16} color={C.rose} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Mon cycle</h3>
      </div>
      <CycleGauge cycle={cycle} />
      <p style={{ fontSize: 13, color: C.ink, marginTop: 14, marginBottom: 2 }}>
        Jour <b>{cycle.cycleDay}</b> · <span style={{ color: PHASES[cycle.phase].color, fontWeight: 600 }}>{PHASES[cycle.phase].label}</span>
      </p>
      <p style={{ fontSize: 12.5, color: C.mist, margin: 0 }}>Prochaines règles estimées : <b>{dateFRlong(cycle.nextPeriodEstimate)}</b> <span style={{ fontStyle: "italic" }}>(estimation)</span></p>
      {profile.updatedAt && <p style={{ fontSize: 10.5, color: C.mist, marginTop: 4 }}>Dernière mise à jour : {timeStr(profile.updatedAt)}</p>}
      <ConfirmNewPeriod user={user} profile={profile} today={today} onSaved={onProfileChange} />
      <button onClick={() => setCorrecting(true)} style={{ background: "none", border: "none", color: C.mist, fontSize: 12, marginTop: 10, textDecoration: "underline" }}>Corriger la date de dernières règles</button>
    </Card>
  );
}

/* ============================== PLAYER: DAILY FORM ============================== */
function DailyForm({ user, today, existing, onSaved }) {
  const [vals, setVals] = useState(existing ? { mood: existing.mood, sleep: existing.sleep, energy: existing.energy, soreness: existing.soreness, muscularPain: existing.muscularPain, stress: existing.stress } : { mood: 3, sleep: 3, energy: 3, soreness: 3, muscularPain: 3, stress: 3 });
  const [cyclePain, setCyclePain] = useState(existing?.cyclePain || false);
  const [cyclePainLevel, setCyclePainLevel] = useState(existing?.cyclePainLevel || 2);
  const [saving, setSaving] = useState(false);

  const total = Object.values(vals).reduce((a, b) => a + b, 0);

  const submit = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const entry = {
      ...vals, total, cyclePain, cyclePainLevel: cyclePain ? cyclePainLevel : null,
      submittedAt: existing?.submittedAt || now,
      lastEditedAt: existing ? now : null,
    };
    await setJSON(`entry:${user.username}:${today}`, entry);
    onSaved(entry);
    setSaving(false);
  };

  return (
    <Card style={{ padding: 24 }} className="fadein">
      <h2 className="aja-head" style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: C.navy }}>{existing ? "Modifier mon wellness" : "Wellness du jour"}</h2>
      <p style={{ color: C.mist, fontSize: 13, margin: "0 0 20px" }}>5 = en pleine forme sur cet item. Une seule réponse comptée par jour ; tu peux la modifier jusqu'à minuit.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {WELLNESS_ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.key}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon size={16} color={C.blue} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{it.label}</span>
                <span className="aja-head" style={{ marginLeft: "auto", fontWeight: 800, fontSize: 20, color: C.navy }}>{vals[it.key]}</span>
              </div>
              <input type="range" min={1} max={5} step={1} value={vals[it.key]} onChange={(e) => setVals({ ...vals, [it.key]: Number(e.target.value) })} style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.mist, marginTop: 2 }}><span>{it.lo}</span><span>{it.hi}</span></div>
            </div>
          );
        })}
      </div>
      <div style={{ borderTop: `1px solid ${C.line}`, margin: "22px 0 16px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Heart size={16} color={C.rose} /><span style={{ fontWeight: 600, fontSize: 14 }}>Douleurs liées au cycle aujourd'hui ?</span></div>
        <ToggleYesNo value={cyclePain} onChange={setCyclePain} />
      </div>
      {cyclePain && (
        <div style={{ marginTop: 10 }}>
          <input type="range" min={1} max={5} value={cyclePainLevel} onChange={(e) => setCyclePainLevel(Number(e.target.value))} style={{ width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.mist }}><span>Légère</span><span>Intensité : {cyclePainLevel}/5</span><span>Forte</span></div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22, background: C.cream, borderRadius: 14, padding: "14px 16px" }}>
        <span style={{ fontSize: 13, color: C.mist, fontWeight: 600 }}>Score total</span>
        <span className="aja-head" style={{ fontSize: 28, fontWeight: 800, color: C.navy }}>{total}<span style={{ fontSize: 14, color: C.mist, fontWeight: 500 }}> /30</span></span>
      </div>
      <PrimaryButton onClick={submit} disabled={saving} style={{ width: "100%", marginTop: 16 }}>{saving ? "Enregistrement..." : existing ? "Enregistrer les modifications" : "Valider mon wellness"}</PrimaryButton>
    </Card>
  );
}

const ToggleYesNo = ({ value, onChange }) => (
  <div style={{ display: "flex", background: C.cream, borderRadius: 99, padding: 3 }}>
    {[["Non", false], ["Oui", true]].map(([l, v]) => (
      <button key={l} onClick={() => onChange(v)} style={{ border: "none", borderRadius: 99, padding: "6px 14px", fontSize: 13, fontWeight: 600, background: value === v ? C.navy : "transparent", color: value === v ? "white" : C.mist }}>{l}</button>
    ))}
  </div>
);

function TodaySummary({ entry, onEdit }) {
  const lvl = wellnessLevel(entry.total);
  const Icon = lvl.icon;
  return (
    <Card style={{ padding: 24, textAlign: "center" }} className="fadein">
      <Icon size={30} color={lvl.color} style={{ margin: "0 auto 8px" }} />
      <p style={{ color: C.mist, fontSize: 13, margin: 0 }}>
        Wellness envoyé aujourd'hui à {timeStr(entry.submittedAt)}
        {entry.lastEditedAt && <> · modifié à {timeStr(entry.lastEditedAt)}</>}
      </p>
      <div className="aja-head" style={{ fontSize: 44, fontWeight: 800, color: C.navy, margin: "6px 0" }}>{entry.total}<span style={{ fontSize: 16, color: C.mist, fontWeight: 500 }}>/30</span></div>
      <Badge color={lvl.color} bg={lvl.color + "1A"}>{lvl.label}</Badge>
      {entry.cyclePain && <div style={{ marginTop: 8 }}><Badge color={C.red} bg="#FBE4E0">Douleurs cycle · {entry.cyclePainLevel}/5</Badge></div>}
      <div style={{ marginTop: 16 }}><GhostButton onClick={onEdit} style={{ margin: "0 auto" }}><Pencil size={13} /> Modifier mes réponses</GhostButton></div>
      <p style={{ fontSize: 11.5, color: C.mist, marginTop: 12 }}>Modifiable jusqu'à minuit — demain, un nouveau suivi t'attendra.</p>
    </Card>
  );
}

function HistoryChart({ history }) {
  const data = history.map((h) => ({ date: dateFR(h.date).slice(0, 6), total: h.total }));
  return (
    <Card style={{ padding: 20 }} className="fadein">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><TrendingUp size={16} color={C.blue} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Historique wellness</h3></div>
      {data.length === 0 ? <p style={{ color: C.mist, fontSize: 13 }}>Pas encore d'historique.</p> : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.mist }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 30]} tick={{ fontSize: 11, fill: C.mist }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke={C.blue} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

/* Regroupe l'historique complet par semaine (lundi -> dimanche) */
function getWeekStart(dateStr) {
  const d = new Date(dateStr);
  const day = (d.getUTCDay() + 6) % 7; // lundi = 0
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - day);
  return monday.toISOString().slice(0, 10);
}
function groupByWeek(history) {
  const map = new Map();
  history.forEach((h) => {
    const wk = getWeekStart(h.date);
    if (!map.has(wk)) map.set(wk, []);
    map.get(wk).push(h);
  });
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([weekStart, entries]) => {
      const sorted = entries.slice().sort((a, b) => a.date.localeCompare(b.date));
      const avg = Math.round(entries.reduce((s, e) => s + e.total, 0) / entries.length);
      return { weekStart, weekEnd: addDays(weekStart, 6), entries: sorted, avg, count: entries.length };
    });
}

function WeeklyHistoryCard({ history }) {
  const [openWeek, setOpenWeek] = useState(null);
  const weeks = useMemo(() => groupByWeek(history), [history]);

  return (
    <Card style={{ padding: 20 }} className="fadein">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Calendar size={16} color={C.blue} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Historique wellness par semaine</h3></div>
      {weeks.length === 0 ? <p style={{ color: C.mist, fontSize: 13 }}>Pas encore d'historique.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {weeks.map((w) => {
            const lvl = wellnessLevel(w.avg);
            const isOpen = openWeek === w.weekStart;
            return (
              <div key={w.weekStart} style={{ background: C.cream, borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => setOpenWeek(isOpen ? null : w.weekStart)} style={{ width: "100%", background: "none", border: "none", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>Semaine du {dateFRlong(w.weekStart)} au {dateFRlong(w.weekEnd)}</div>
                    <div style={{ fontSize: 11, color: C.mist }}>{w.count} réponse(s)</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge color={lvl.color} bg={lvl.color + "1A"}>Moy. {w.avg}/30 · {lvl.label}</Badge>
                    <ChevronRight size={14} color={C.mist} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
                  </div>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 12px 12px" }}>
                    {w.entries.map((e) => {
                      const l = wellnessLevel(e.total);
                      return (
                        <div key={e.date} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderTop: `1px solid ${C.line}` }}>
                          <span style={{ fontSize: 11.5, color: C.ink }}>{dateFR(e.date)}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {e.cyclePain && <Badge color={C.red} bg="#FBE4E0">Douleur cycle</Badge>}
                            <Badge color={l.color} bg={l.color + "1A"}>{e.total}/30</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function AdviceCard({ phase }) {
  const data = NUTRITION[phase];
  return (
    <Card style={{ padding: 20 }} className="fadein">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Apple size={16} color={PHASES[phase].color} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{data.title}</h3></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.items.map((it, i) => (
          <div key={i}>
            <div style={{ fontSize: 13.5, color: C.ink, fontWeight: 600, lineHeight: 1.4 }}>{it.what}</div>
            <div style={{ fontSize: 12.5, color: C.mist, marginTop: 2 }}>Pourquoi : {it.why}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* Carte de consignes concrètes (entraînement du jour), basée sur wellness + sous-phase précise du cycle */
function GuidanceCard({ guidance, subtitle }) {
  return (
    <Card style={{ padding: 20, borderLeft: `4px solid ${guidance.color}` }} className="fadein">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><Dumbbell size={16} color={guidance.color} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: guidance.color }}>{guidance.label}</h3></div>
      {subtitle && <p style={{ fontSize: 11.5, color: C.mist, margin: "0 0 10px" }}>{subtitle}</p>}
      <ul style={{ margin: "10px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>{guidance.bullets.map((b, i) => <li key={i} style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.4 }}>{b}</li>)}</ul>
    </Card>
  );
}

/* ============================== PLAYER APP ============================== */
function PlayerApp({ user }) {
  const today = useTodayDate();
  const [todayEntry, setTodayEntry] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const e = await getJSON(`entry:${user.username}:${today}`);
    const p = await getJSON(`cycleProfile:${user.username}`);
    setTodayEntry(e); setProfile(p); setEditMode(false);
    const keys = await listKeys(`entry:${user.username}:`);
    const items = (await Promise.all(keys.map(async (k) => {
      const v = await getJSON(k);
      return v ? { date: k.split(":")[2], ...v } : null;
    }))).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
    setHistory(items);
    setLoading(false);
  }, [user.username, today]);

  useEffect(() => { load(); }, [load]);
  const cycle = useMemo(() => computeCycle(profile, today), [profile, today]);
  if (loading) return <CenterLoader />;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 60px", display: "flex", flexDirection: "column", gap: 16 }}>
      {todayEntry && !editMode
        ? <TodaySummary entry={todayEntry} onEdit={() => setEditMode(true)} />
        : <DailyForm user={user} today={today} existing={todayEntry} onSaved={(e) => { setTodayEntry(e); setEditMode(false); load(); }} />}

      <CycleCard user={user} profile={profile} cycle={cycle} today={today} onProfileChange={(p) => { setProfile(p); }} />

      {cycle && <AdviceCard phase={cycle.phase} />}
      <HistoryChart history={history} />
    </div>
  );
}

const CenterLoader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}><Loader2 size={26} color={C.blue} className="spin" /></div>
);

/* ============================== STAFF: PLAYER DETAIL ============================== */
function PlayerDetail({ player, today, onClose }) {
  const [entry, setEntry] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const e = await getJSON(`entry:${player.username}:${today}`);
    const p = await getJSON(`cycleProfile:${player.username}`);
    setEntry(e); setProfile(p);
    const keys = await listKeys(`entry:${player.username}:`);
    const items = (await Promise.all(keys.map(async (k) => {
      const v = await getJSON(k);
      return v ? { date: k.split(":")[2], ...v } : null;
    }))).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
    setHistory(items);
    if (!silent) setLoading(false);
  }, [player.username, today]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const interval = setInterval(() => load(true), 20000);
    return () => clearInterval(interval);
  }, [load]);

  const cycle = useMemo(() => computeCycle(profile, today), [profile, today]);
  const lvl = entry ? wellnessLevel(entry.total) : null;
  const adapt = getAdaptation(entry, cycle);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,22,48,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="aja-scroll fadein" style={{ background: C.cream, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", borderRadius: "22px 22px 0 0", padding: "22px 20px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h2 className="aja-head" style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.navy }}>{player.firstName} {player.lastName}</h2>
            <span style={{ fontSize: 12, color: C.mist }}>@{player.username}</span>
          </div>
          <button onClick={onClose} style={{ background: "white", border: "none", borderRadius: 10, padding: 8 }}><X size={18} /></button>
        </div>
        {loading ? <CenterLoader /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GuidanceCard guidance={adapt} subtitle={cycle ? `Jour ${cycle.cycleDay} sur ${cycle.cycleLength} · ${PHASES[cycle.phase].label}` : undefined} />

            <Card style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.mist }}>Wellness aujourd'hui</span>
                {entry ? (
                  <span style={{ fontSize: 12, color: C.mist, display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={12} />
                    {entry.lastEditedAt ? <>modifié à {timeStr(entry.lastEditedAt)} <span style={{ color: C.mist }}>(1ʳᵉ réponse {timeStr(entry.submittedAt)})</span></> : <>envoyé à {timeStr(entry.submittedAt)}</>}
                  </span>
                ) : <Badge color={C.mist} bg={C.line}>Pas de réponse</Badge>}
              </div>
              {entry && (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                    <span className="aja-head" style={{ fontSize: 36, fontWeight: 800, color: C.navy }}>{entry.total}<span style={{ fontSize: 14, color: C.mist, fontWeight: 500 }}>/30</span></span>
                    <Badge color={lvl.color} bg={lvl.color + "1A"}>{lvl.label}</Badge>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 14 }}>
                    {WELLNESS_ITEMS.map((it) => (
                      <div key={it.key} style={{ background: C.cream, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 10.5, color: C.mist }}>{it.label}</div>
                        <div className="aja-head" style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{entry[it.key]}</div>
                      </div>
                    ))}
                  </div>
                  {entry.cyclePain && <div style={{ marginTop: 12 }}><Badge color={C.red} bg="#FBE4E0"><Heart size={12} /> Douleurs liées au cycle · {entry.cyclePainLevel}/5</Badge></div>}
                </>
              )}
            </Card>

            <Card style={{ padding: 18, textAlign: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.mist }}>Cycle menstruel</span>
              <div style={{ marginTop: 10 }}><CycleGauge cycle={cycle} size={180} /></div>
              {cycle ? (
                <>
                  <p style={{ fontSize: 12.5, color: C.mist, marginTop: 8, marginBottom: 2 }}>Jour {cycle.cycleDay} · {PHASES[cycle.phase].label}</p>
                  <p style={{ fontSize: 11.5, color: C.mist, margin: 0 }}>Prochaines règles estimées : {dateFRlong(cycle.nextPeriodEstimate)}</p>
                  {profile?.updatedAt && <p style={{ fontSize: 10.5, color: C.mist, margin: "2px 0 0" }}>Cycle mis à jour à {timeStr(profile.updatedAt)}</p>}
                </>
              ) : <p style={{ fontSize: 12.5, color: C.mist, marginTop: 8 }}>{profile?.unknown ? "La joueuse n'a pas renseigné de date." : "Cycle non renseigné."}</p>}
            </Card>

            <HistoryChart history={history.slice(-30)} />
            <WeeklyHistoryCard history={history} />
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerRow({ p, onClick }) {
  const adapt = getAdaptation(p.entry, p.cycle);
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", background: "white", border: "none", borderLeft: `4px solid ${adapt.color}`, borderRadius: 16, padding: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 2px rgba(11,31,63,.06)" }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.navy, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{p.firstName[0]}{p.lastName[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.firstName} {p.lastName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
          <Badge color={adapt.color} bg={adapt.bg}>{adapt.label}</Badge>
          {p.entry && <span style={{ fontSize: 12, color: C.mist, display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {p.entry.lastEditedAt ? `modifié ${timeStr(p.entry.lastEditedAt)}` : timeStr(p.entry.submittedAt)}</span>}
          {p.cycle && <Badge color={PHASES[p.cycle.phase].color} bg={PHASES[p.cycle.phase].color + "1A"}><Droplet size={11} /> {PHASES[p.cycle.phase].short}</Badge>}
        </div>
      </div>
      <ChevronRight size={18} color={C.mist} />
    </button>
  );
}

/* ============================== ADMIN : GESTION DES COMPTES ============================== */
function AccountsPanel({ onChanged }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ role: "joueuse", firstName: "", lastName: "", username: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resetFor, setResetFor] = useState(null);
  const [resetPw, setResetPw] = useState("");
  const [deleteFor, setDeleteFor] = useState(null);
  const [backupUrl, setBackupUrl] = useState(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const [lastBackupAt, setLastBackupAt] = useState(null);

  const prepareBackup = async () => {
    setBackupBusy(true);
    if (backupUrl) URL.revokeObjectURL(backupUrl);
    const userKeys = await listKeys("user:");
    const users = (await Promise.all(userKeys.map((k) => getJSON(k)))).filter(Boolean).map(({ passwordHash, ...rest }) => rest);
    const entryKeys = await listKeys("entry:");
    const entries = (await Promise.all(entryKeys.map(async (k) => { const v = await getJSON(k); return v ? { key: k, ...v } : null; }))).filter(Boolean);
    const profileKeys = await listKeys("cycleProfile:");
    const cycleProfiles = (await Promise.all(profileKeys.map(async (k) => { const v = await getJSON(k); return v ? { key: k, ...v } : null; }))).filter(Boolean);
    const dump = { club: "AJ Auxerre Fém", exportedAt: new Date().toISOString(), users, entries, cycleProfiles };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    setBackupUrl(URL.createObjectURL(blob));
    const now = new Date().toISOString();
    await setJSON("meta:lastBackupAt", { at: now });
    setLastBackupAt(now);
    setBackupBusy(false);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const keys = await listKeys("user:");
    const users = (await Promise.all(keys.map((k) => getJSON(k)))).filter(Boolean).sort((a, b) => (a.role + a.lastName).localeCompare(b.role + b.lastName));
    setAccounts(users);
    const meta = await getJSON("meta:lastBackupAt");
    setLastBackupAt(meta?.at || null);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const daysSinceBackup = lastBackupAt ? diffDays(lastBackupAt, todayStr()) : null;
  const backupDue = daysSinceBackup === null || daysSinceBackup >= 7;

  const createAccount = async () => {
    setMsg(null);
    if (!form.firstName || !form.lastName || !form.username || !form.password) { setMsg({ type: "err", text: "Tous les champs sont requis." }); return; }
    setBusy(true);
    const uname = form.username.trim().toLowerCase();
    const clash = await getJSON(`user:${uname}`);
    if (clash) { setMsg({ type: "err", text: "Cet identifiant existe déjà." }); setBusy(false); return; }
    const passwordHash = await hashPassword(form.password);
    const user = { username: uname, passwordHash, role: form.role, firstName: form.firstName.trim(), lastName: form.lastName.trim(), createdAt: new Date().toISOString() };
    await setJSON(`user:${uname}`, user);
    setForm({ role: "joueuse", firstName: "", lastName: "", username: "", password: "" });
    setMsg({ type: "ok", text: `Compte créé pour ${user.firstName} ${user.lastName}.` });
    load(); onChanged && onChanged();
    setBusy(false);
  };

  const doResetPw = async (u) => {
    if (!resetPw || resetPw.length < 4) { setMsg({ type: "err", text: "4 caractères minimum." }); return; }
    const passwordHash = await hashPassword(resetPw);
    await setJSON(`user:${u.username}`, { ...u, passwordHash });
    setResetFor(null); setResetPw("");
    setMsg({ type: "ok", text: `Mot de passe réinitialisé pour ${u.firstName}.` });
    load();
  };

  const doRemoveAccount = async (u) => {
    await delKey(`user:${u.username}`);
    setDeleteFor(null);
    setMsg({ type: "ok", text: `Compte de ${u.firstName} ${u.lastName} supprimé.` });
    load(); onChanged && onChanged();
  };

  return (
    <Card style={{ padding: 20, marginBottom: 18 }} className="fadein">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><UserCog size={16} color={C.blue} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Gestion des comptes</h3></div>

      <div style={{ background: backupDue ? "#FFF8EC" : "#EAF1FD", border: backupDue ? `1px solid ${C.amber}` : "none", borderRadius: 12, padding: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: backupDue ? "#7A5310" : C.blue, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          {backupDue && <AlertTriangle size={14} />} Sauvegarde des données
        </div>
        <p style={{ fontSize: 12, color: backupDue ? "#7A5310" : C.ink, margin: "0 0 10px" }}>
          {lastBackupAt
            ? `Dernière sauvegarde : il y a ${daysSinceBackup} jour(s) (${dateFRlong(lastBackupAt.slice(0, 10))}).${backupDue ? " Il est temps d'en refaire une." : ""}`
            : "Aucune sauvegarde n'a encore été faite. Fais-en une maintenant, puis vise un rythme hebdomadaire."}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <GhostButton onClick={prepareBackup}>{backupBusy ? "Préparation..." : "Préparer la sauvegarde"}</GhostButton>
          {backupUrl && (
            <a href={backupUrl} download={`aja-fem-sauvegarde-${todayStr()}.json`} style={{ background: C.navy, color: "white", border: "none", borderRadius: 12, padding: "10px 16px", fontWeight: 600, fontSize: 13.5, textDecoration: "none" }}>
              Télécharger le fichier .json
            </a>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[["joueuse", "Joueuse"], ["staff", "Staff"]].map(([v, l]) => (
          <button key={v} onClick={() => setForm({ ...form, role: v })} style={{ flex: 1, padding: "7px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1.5px solid ${form.role === v ? C.blue : C.line}`, background: form.role === v ? "#EAF1FD" : "white", color: form.role === v ? C.blue : C.mist }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <input placeholder="Prénom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={{ ...inputStyle, minWidth: 120 }} />
        <input placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={{ ...inputStyle, minWidth: 120 }} />
        <input placeholder="Identifiant" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={{ ...inputStyle, minWidth: 120 }} />
        <input placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ ...inputStyle, minWidth: 120 }} />
      </div>
      <PrimaryButton onClick={createAccount} disabled={busy} style={{ width: "100%" }}><Plus size={16} /> Créer le compte</PrimaryButton>
      {msg && <p style={{ color: msg.type === "ok" ? C.green : C.red, fontSize: 13, marginTop: 10 }}>{msg.text}</p>}
      <div style={{ borderTop: `1px solid ${C.line}`, margin: "18px 0 12px" }} />
      <p style={{ fontSize: 12.5, color: C.mist, margin: "0 0 10px" }}>{loading ? "Chargement…" : `${accounts.length} compte(s)`}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }} className="aja-scroll">
        {accounts.map((a) => (
          <div key={a.username} style={{ background: C.cream, borderRadius: 12, padding: "8px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13.5 }}><b>{a.firstName} {a.lastName}</b> <span style={{ color: C.mist }}>· @{a.username}</span></div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Badge color={a.role === "admin" ? C.gold : a.role === "staff" ? C.blue : C.rose} bg={C.white}>{a.role}</Badge>
                {a.role !== "admin" && (
                  <>
                    <button onClick={() => { setResetFor(resetFor === a.username ? null : a.username); setDeleteFor(null); }} title="Réinitialiser le mot de passe" style={{ background: "white", border: "none", borderRadius: 8, padding: 6 }}><RotateCcw size={13} /></button>
                    <button onClick={() => { setDeleteFor(deleteFor === a.username ? null : a.username); setResetFor(null); }} title="Supprimer" style={{ background: "white", border: "none", borderRadius: 8, padding: 6 }}><Trash2 size={13} color={C.red} /></button>
                  </>
                )}
              </div>
            </div>
            {resetFor === a.username && (
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input placeholder="Nouveau mot de passe" value={resetPw} onChange={(e) => setResetPw(e.target.value)} style={{ ...inputStyle, padding: "7px 10px", fontSize: 13 }} />
                <button onClick={() => doResetPw(a)} style={{ background: C.navy, color: "white", border: "none", borderRadius: 8, padding: "0 12px", fontSize: 12.5, fontWeight: 600 }}>OK</button>
              </div>
            )}
            {deleteFor === a.username && (
              <div style={{ marginTop: 8, background: "#FBE4E0", borderRadius: 9, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#8A2E20" }}>Supprimer {a.firstName} {a.lastName} ? (son historique est conservé)</span>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => doRemoveAccount(a)} style={{ background: C.red, color: "white", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600 }}>Confirmer</button>
                  <button onClick={() => setDeleteFor(null)} style={{ background: "white", border: `1px solid ${C.line}`, borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600 }}>Annuler</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================== STAFF : PANNEAU DE RECOMMANDATIONS DU JOUR ============================== */
const STATUS_ORDER = { reduce: 0, caution: 1, normal: 2, unknown: 3 };

function AdaptationPanel({ players, onSelect }) {
  const groups = useMemo(() => {
    const map = new Map();
    players.forEach((p) => {
      const g = getAdaptation(p.entry, p.cycle);
      if (!map.has(g.label)) map.set(g.label, { ...g, players: [] });
      map.get(g.label).players.push(p);
    });
    return Array.from(map.values()).sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
  }, [players]);

  return (
    <Card style={{ padding: 18 }} className="fadein">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><ClipboardList size={16} color={C.navy} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Recommandations du jour — quoi faire, pour qui</h3></div>
      <p style={{ fontSize: 12, color: C.mist, margin: "0 0 14px" }}>Groupes calculés à partir du wellness et de la position exacte de chaque joueuse dans son cycle (début/fin de phase).</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groups.map((g) => (
          <div key={g.label} style={{ background: g.bg, borderRadius: 14, padding: 14, borderLeft: `4px solid ${g.color}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: g.color }}>{g.label}</span>
              <span className="aja-head" style={{ fontSize: 17, fontWeight: 800, color: C.navy }}>{g.players.length}</span>
            </div>
            <ul style={{ margin: "0 0 10px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
              {g.bullets.map((b, i) => <li key={i} style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.4 }}>{b}</li>)}
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {g.players.map((p) => (
                <button key={p.username} onClick={() => onSelect(p)} style={{ background: "white", border: `1px solid ${g.color}55`, borderRadius: 99, padding: "5px 11px", fontSize: 12, fontWeight: 600, color: C.ink, display: "flex", alignItems: "center", gap: 4 }}>
                  {p.firstName} {p.lastName}{p.cycle ? ` · J${p.cycle.cycleDay}` : ""}
                  <ArrowRight size={11} color={C.mist} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================== ALERTE AUTOMATIQUE LCA ============================== */
function ACLAlertBanner({ players, onSelect }) {
  const atRiskACL = players.filter((p) => isACLWindow(p.cycle));
  if (atRiskACL.length === 0) return null;
  return (
    <Card style={{ padding: 18, marginBottom: 18, border: `1.5px solid ${C.amber}`, background: "#FFF8EC" }} className="fadein">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <AlertTriangle size={20} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#7A5310" }}>Alerte automatique — fin de phase folliculaire</div>
          <p style={{ fontSize: 13, color: "#7A5310", margin: "4px 0 10px" }}>
            Attention sauts, atterrissages, pliométrie — risque accru de rupture du LCA pour les joueuses ci-dessous.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {atRiskACL.map((p) => (
              <button key={p.username} onClick={() => onSelect(p)} style={{ background: "white", border: `1px solid ${C.amber}`, borderRadius: 99, padding: "5px 12px", fontSize: 12.5, fontWeight: 600, color: "#7A5310" }}>
                {p.firstName} {p.lastName} · J{p.cycle.cycleDay}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ============================== FICHE IMPRIMABLE ============================== */
/* ============================== FICHE IMPRIMABLE ============================== */
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function downloadFile(filename, content, type = "text/html") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function groupByGuidance(list) {
  const map = new Map();
  list.forEach((p) => {
    const g = getAdaptation(p.entry, p.cycle);
    if (!map.has(g.label)) map.set(g.label, { ...g, players: [] });
    map.get(g.label).players.push(p);
  });
  return Array.from(map.values()).sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
}

function buildPrintableHTML(list, filterLabel, today) {
  const rows = list.map((p) => {
    const adapt = getAdaptation(p.entry, p.cycle);
    const aclFlag = p.cycle && isACLWindow(p.cycle) ? " ⚠️LCA" : "";
    return `<tr>
      <td class="name">${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</td>
      <td>${p.entry ? p.entry.total : "—"}</td>
      <td>${p.entry ? p.entry.mood : "—"}</td>
      <td>${p.entry ? p.entry.sleep : "—"}</td>
      <td>${p.entry ? p.entry.energy : "—"}</td>
      <td>${p.entry ? p.entry.soreness : "—"}</td>
      <td>${p.entry ? p.entry.muscularPain : "—"}</td>
      <td>${p.entry ? p.entry.stress : "—"}</td>
      <td>${p.entry?.cyclePain ? `Oui (${p.entry.cyclePainLevel}/5)` : p.entry ? "Non" : "—"}</td>
      <td>${p.cycle ? `J${p.cycle.cycleDay}` : "—"}</td>
      <td>${p.cycle ? escapeHtml(PHASES[p.cycle.phase].short) + aclFlag : "—"}</td>
      <td class="adapt" style="color:${adapt.color}">${escapeHtml(adapt.label)}</td>
    </tr>`;
  }).join("");

  const groups = groupByGuidance(list);
  const groupsHtml = groups.map((g) => `
    <div class="group" style="border-left:4px solid ${g.color}; background:${g.bg}22;">
      <div class="group-head"><span style="color:${g.color}">${escapeHtml(g.label)}</span><span class="count">${g.players.length}</span></div>
      <ul>${g.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
      <div class="names">${g.players.map((p) => `${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}`).join(" · ")}</div>
    </div>`).join("");

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
  <title>AJ Auxerre Fém — Fiche wellness (${escapeHtml(filterLabel)})</title>
  <style>
    @page { size: A4 landscape; margin: 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #152238; margin: 0; padding: 16px; }
    h1 { font-size: 20px; margin: 0 0 2px; color: #0B1F3F; }
    h2 { font-size: 15px; margin: 18px 0 8px; color: #0B1F3F; }
    .sub { font-size: 12px; color: #8496B8; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    th, td { border: 1px solid #E1E6F0; padding: 6px 6px; text-align: left; }
    th { background: #0B1F3F; color: white; }
    tr:nth-child(even) td { background: #F7F9FD; }
    .name { font-weight: 700; }
    .adapt { font-weight: 700; }
    .toolbar { margin-bottom: 14px; }
    .toolbar button { background: #0B1F3F; color: white; border: none; border-radius: 8px; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; }
    footer { font-size: 10px; color: #8496B8; margin-top: 10px; }
    .group { border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; page-break-inside: avoid; }
    .group-head { display: flex; justify-content: space-between; font-weight: 700; font-size: 12.5px; margin-bottom: 4px; }
    .group ul { margin: 0 0 6px; padding-left: 16px; font-size: 11px; }
    .group .names { font-size: 11px; font-weight: 600; }
    @media print { .toolbar { display: none; } }
  </style></head>
  <body>
    <div class="toolbar"><button onclick="window.print()">Imprimer cette page</button></div>
    <h1>AJ AUXERRE FÉM — Fiche wellness &amp; cycle</h1>
    <div class="sub">${escapeHtml(dateFRlong(today))} · Liste : ${escapeHtml(filterLabel)} · ${list.length} joueuse(s)</div>
    <table>
      <thead><tr><th>Joueuse</th><th>Total /30</th><th>Humeur</th><th>Sommeil</th><th>Énergie</th><th>Courb.</th><th>Doul. musc.</th><th>Stress</th><th>Douleur cycle</th><th>Jour cycle</th><th>Phase</th><th>Statut du jour</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <h2>Consignes concrètes pour la séance</h2>
    ${groupsHtml}
    <footer>Généré automatiquement — AJ Auxerre Fém · Suivi wellness &amp; cycle.</footer>
  </body></html>`;
}

function PrintSheet({ players, initialFilter, today, onClose }) {
  const [filter, setFilter] = useState(initialFilter || "all");
  const list = filterPlayers(players, filter);
  const filterLabel = FILTER_DEFS.find((f) => f.key === filter)?.label || "Toute l'équipe";

  const [downloadUrl, setDownloadUrl] = useState(null);
  useEffect(() => {
    const html = buildPrintableHTML(list, filterLabel, today);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, today, players.length]);

  return (
    <div className="aja-print-modal-bg" style={{ position: "fixed", inset: 0, background: "rgba(7,22,48,.6)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="aja-scroll fadein aja-print-modal-card" style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 980, maxHeight: "92vh", overflowY: "auto", padding: 22 }}>
        <div className="aja-no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTER_DEFS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{ border: `1.5px solid ${filter === f.key ? C.navy : C.line}`, background: filter === f.key ? C.navy : "white", color: filter === f.key ? "white" : C.ink, borderRadius: 99, padding: "6px 12px", fontSize: 12.5, fontWeight: 600 }}>{f.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {downloadUrl && (
              <a href={downloadUrl} download={`aja-fem-fiche-${filter}-${today}.html`} style={{ background: C.navy, color: C.white, border: "none", borderRadius: 12, padding: "12px 20px", fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}>
                <Printer size={15} /> Télécharger la fiche
              </a>
            )}
            <GhostButton onClick={onClose}><X size={15} /> Fermer</GhostButton>
          </div>
        </div>
        <p className="aja-no-print" style={{ fontSize: 12, color: "#7A5310", background: "#FFF8EC", border: `1px solid ${C.amber}`, borderRadius: 10, padding: "10px 12px", margin: "0 0 14px" }}>
          <b>Le plus simple et le plus fiable :</b> laisse cette fenêtre ouverte et fais <b>Ctrl+P</b> (Windows) ou <b>Cmd+P</b> (Mac) sur ton clavier — le raccourci natif du navigateur imprime uniquement ce tableau. Si le bouton « Télécharger la fiche » ci-dessus ne réagit pas, c'est ce raccourci clavier qu'il faut utiliser à la place.
        </p>

        <div id="aja-print-area">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <ClubEmblem size={36} />
            <div>
              <div className="aja-head" style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>AJ AUXERRE FÉM — Fiche wellness &amp; cycle</div>
              <div style={{ fontSize: 12, color: C.mist }}>{dateFRlong(today)} · Liste : {filterLabel} · {list.length} joueuse(s)</div>
            </div>
          </div>
          {list.length === 0 ? (
            <p style={{ fontSize: 13, color: C.mist, marginTop: 20, padding: 20, textAlign: "center", border: `1px dashed ${C.line}`, borderRadius: 10 }}>
              Aucune joueuse dans la catégorie « {filterLabel} » aujourd'hui — la fiche est intentionnellement vide, ce n'est pas une erreur.
            </p>
          ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14, fontSize: 11.5 }}>
            <thead>
              <tr style={{ background: C.navy, color: "white" }}>
                {["Joueuse", "Total /30", "Humeur", "Sommeil", "Énergie", "Courb.", "Doul. musc.", "Stress", "Douleur cycle", "Jour cycle", "Phase", "Statut du jour"].map((h) => (
                  <th key={h} style={{ padding: "6px 6px", textAlign: "left", border: `1px solid ${C.line}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((p, i) => {
                const adapt = getAdaptation(p.entry, p.cycle);
                return (
                  <tr key={p.username} style={{ background: i % 2 ? "#F7F9FD" : "white" }}>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}`, fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.entry ? p.entry.total : "—"}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.entry ? p.entry.mood : "—"}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.entry ? p.entry.sleep : "—"}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.entry ? p.entry.energy : "—"}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.entry ? p.entry.soreness : "—"}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.entry ? p.entry.muscularPain : "—"}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.entry ? p.entry.stress : "—"}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.entry?.cyclePain ? `Oui (${p.entry.cyclePainLevel}/5)` : p.entry ? "Non" : "—"}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.cycle ? `J${p.cycle.cycleDay}` : "—"}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}` }}>{p.cycle ? PHASES[p.cycle.phase].short : "—"}{p.cycle && isACLWindow(p.cycle) ? " ⚠️LCA" : ""}</td>
                    <td style={{ padding: "6px 6px", border: `1px solid ${C.line}`, fontWeight: 600, color: adapt.color }}>{adapt.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}

          {list.length > 0 && (<>
          <h3 className="aja-head" style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: "18px 0 8px" }}>Consignes concrètes pour la séance</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {groupByGuidance(list).map((g) => (
              <div key={g.label} style={{ background: g.bg, borderLeft: `4px solid ${g.color}`, borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 12.5, color: g.color, marginBottom: 4 }}>
                  <span>{g.label}</span><span>{g.players.length}</span>
                </div>
                <ul style={{ margin: "0 0 6px", paddingLeft: 16, fontSize: 11 }}>{g.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{g.players.map((p) => `${p.firstName} ${p.lastName}`).join(" · ")}</div>
              </div>
            ))}
          </div>
          </>)}

          <p style={{ fontSize: 10, color: C.mist, marginTop: 10 }}>Généré automatiquement — AJ Auxerre Fém · Suivi wellness &amp; cycle.</p>
        </div>
      </div>
    </div>
  );
}

/* ============================== STAFF APP ============================== */
function StaffApp({ user }) {
  const today = useTodayDate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [printOpen, setPrintOpen] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const keys = await listKeys("user:");
    const users = (await Promise.all(keys.map((k) => getJSON(k)))).filter((u) => u && u.role === "joueuse");
    const enriched = await Promise.all(users.map(async (u) => {
      const entry = await getJSON(`entry:${u.username}:${today}`);
      const profile = await getJSON(`cycleProfile:${u.username}`);
      const cycle = computeCycle(profile, today);
      return { ...u, entry, profile, cycle };
    }));
    enriched.sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
    setPlayers(enriched);
    setLastSync(new Date().toISOString());
    if (!silent) setLoading(false);
  }, [today]);

  useEffect(() => { load(); }, [load]);

  /* Actualisation automatique en arrière-plan : le coach voit les réponses des joueuses
     apparaître sans avoir à recharger la page manuellement. */
  useEffect(() => {
    const interval = setInterval(() => load(true), 25000);
    return () => clearInterval(interval);
  }, [load]);

  const submittedCount = players.filter((p) => p.entry).length;
  const atRisk = players.filter((p) => p.entry && p.entry.total < 14);
  const phaseCounts = useMemo(() => {
    const c = { menstruelle: 0, folliculaire: 0, ovulation: 0, premenstruelle: 0, aucune: 0 };
    players.forEach((p) => { if (p.cycle) c[p.cycle.phase]++; else c.aucune++; });
    return c;
  }, [players]);
  const pieData = Object.entries(phaseCounts).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k === "aucune" ? "Non renseigné" : PHASES[k].label, value: v, color: k === "aucune" ? C.line : PHASES[k].color }));
  const filtered = filterPlayers(players, filter);

  if (loading) return <CenterLoader />;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 10 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />
        <span style={{ fontSize: 11.5, color: C.mist }}>En direct — dernière synchro {lastSync ? timeStr(lastSync) : "…"}</span>
      </div>

      {user.role === "admin" && <AccountsPanel onChanged={load} />}

      <ACLAlertBanner players={players} onSelect={setSelected} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard icon={Users} label="Effectif" value={players.length} color={C.navy} />
        <StatCard icon={CheckCircle2} label="Ont répondu" value={`${submittedCount}/${players.length}`} color={C.green} />
        <StatCard icon={ShieldAlert} label="À risque" value={atRisk.length} color={C.red} />
        <StatCard icon={Droplet} label="En règles" value={phaseCounts.menstruelle} color={C.rose} />
      </div>

      <div style={{ marginBottom: 18 }}><AdaptationPanel players={players} onSelect={setSelected} /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 18 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><BarChart3 size={16} color={C.blue} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Répartition des phases du cycle</h3></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart><Pie data={pieData} dataKey="value" innerRadius={35} outerRadius={60} paddingAngle={2}>{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie></PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pieData.map((d) => (<div key={d.name} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, display: "inline-block" }} />{d.name} — <b>{d.value}</b></div>))}
            </div>
          </div>
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><ShieldAlert size={16} color={C.red} /><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>À surveiller</h3></div>
          {atRisk.length === 0 ? <p style={{ fontSize: 13, color: C.mist }}>Aucune joueuse à risque aujourd'hui.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {atRisk.map((p) => (<div key={p.username} onClick={() => setSelected(p)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", fontSize: 13.5 }}><span>{p.firstName} {p.lastName}</span><Badge color={C.red} bg="#FBE4E0">{p.entry.total}/30</Badge></div>))}
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTER_DEFS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ border: `1.5px solid ${filter === f.key ? C.navy : C.line}`, background: filter === f.key ? C.navy : "white", color: filter === f.key ? "white" : C.ink, borderRadius: 99, padding: "7px 14px", fontSize: 12.5, fontWeight: 600 }}>{f.label}</button>
          ))}
        </div>
        <GhostButton onClick={() => setPrintOpen(true)}><Printer size={14} /> Imprimer une fiche</GhostButton>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? <p style={{ color: C.mist, fontSize: 13, textAlign: "center", padding: 30 }}>Aucune joueuse dans ce filtre.</p> : filtered.map((p) => <PlayerRow key={p.username} p={p} onClick={() => setSelected(p)} />)}
      </div>

      {selected && <PlayerDetail player={selected} today={today} onClose={() => { setSelected(null); load(); }} />}
      {printOpen && <PrintSheet players={players} initialFilter={filter} today={today} onClose={() => setPrintOpen(false)} />}
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card style={{ padding: "14px 16px" }}>
    <Icon size={16} color={color} />
    <div className="aja-head" style={{ fontSize: 24, fontWeight: 800, color: C.navy, marginTop: 6 }}>{value}</div>
    <div style={{ fontSize: 11.5, color: C.mist }}>{label}</div>
  </Card>
);

/* ============================== ROOT APP ============================== */
export default function App() {
  const [user, setUser] = useState(null);
  const [adminExists, setAdminExists] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { if (!user) findAdmin().then((a) => setAdminExists(!!a)); }, [user]);

  return (
    <div className="aja-root" style={{ minHeight: "100vh", background: C.cream }}>
      <GlobalStyle />
      {!user ? (
        adminExists === null ? <CenterLoader /> : adminExists ? <LoginScreen onLogin={setUser} /> : <BootstrapAdmin onCreated={setUser} />
      ) : (
        <>
          <TopBar user={user} onLogout={() => setUser(null)} onOpenSettings={() => setShowSettings(true)} />
          {user.role === "joueuse" ? <PlayerApp user={user} /> : <StaffApp user={user} />}
          {showSettings && <SettingsModal user={user} onClose={() => setShowSettings(false)} onUpdated={(u) => setUser(u)} />}
        </>
      )}
    </div>
  );
}
