// ─── Date helpers ────────────────────────────────────────────────────────────
export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function timeOfDay() {
  const h = new Date().getHours();
  if (h < 10) return 'matin';
  if (h < 14) return 'midi';
  if (h < 18) return 'après-midi';
  return 'soir';
}

// ─── Storage ─────────────────────────────────────────────────────────────────
const KEYS = {
  PROFILE: 'nh_profile_v2',
  DAYS: 'nh_days_v2',
  FAVORITES: 'nh_favorites_v2',
  WEIGHT: 'nh_weight_v2',
  SPORT: 'nh_sport_v2',
};

function load(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// Profile
export function loadProfile() { return load(KEYS.PROFILE); }
export function saveProfile(p) { save(KEYS.PROFILE, p); }

// Day data
export function loadDay(date) {
  const days = load(KEYS.DAYS, {});
  return days[date] || { meals: [], supplements: getDefaultSupplements(), steps: 0, summary: '' };
}

export function saveDay(date, data) {
  const days = load(KEYS.DAYS, {});
  days[date] = data;
  save(KEYS.DAYS, days);
}

export function loadAllDays() { return load(KEYS.DAYS, {}); }

// Favorites
export function loadFavorites() { return load(KEYS.FAVORITES, getDefaultFavorites()); }
export function saveFavorites(favs) { save(KEYS.FAVORITES, favs); }

// Weight
export function loadWeight() { return load(KEYS.WEIGHT, []); }
export function saveWeight(entries) { save(KEYS.WEIGHT, entries); }

// Sport
export function loadSport() { return load(KEYS.SPORT, []); }
export function saveSport(sessions) { save(KEYS.SPORT, sessions); }

// ─── Default data ─────────────────────────────────────────────────────────────
export function getDefaultSupplements() {
  return [
    { id: 1, name: 'Magnésium bisglycinate', taken: false },
    { id: 2, name: 'Multi PRZ multivitamine', taken: false },
    { id: 3, name: 'Sélénium', taken: false },
    { id: 4, name: 'Bromélaïne', taken: false },
    { id: 5, name: 'Nu3 Vegan Protein 3K', taken: false },
    { id: 6, name: 'Oméga-3', taken: false },
  ];
}

export function mergeSupplements(stored) {
  const defaults = getDefaultSupplements();
  return defaults.map(def => stored.find(s => s.id === def.id) || def);
}

export function getDefaultFavorites() {
  return [
    {
      id: 'fav_porridge',
      emoji: '🥣',
      name: 'Overnight porridge',
      description: 'Flocons avoine + lait avoine choco + chia + Skyr Siggi\'s + chocolat noir + coco râpé',
      calories: 454, protein: 21, carbs: 60, fat: 14,
      tag: 'Petit-déjeuner',
    },
    {
      id: 'fav_bjorg',
      emoji: '🍎',
      name: 'Bjorg choco lait + pomme',
      description: '3 biscuits Bjorg fourrés chocolat lait + 1 pomme',
      calories: 438, protein: 5, carbs: 71, fat: 15,
      tag: 'Goûter',
    },
    {
      id: 'fav_salade_pates',
      emoji: '🥗',
      name: 'Salade pâtes complètes',
      description: 'Pâtes complètes + tomates cerises + mozzarella + bœuf séché + huile d\'olive',
      calories: 350, protein: 25, carbs: 25, fat: 17,
      tag: 'Déjeuner',
    },
    {
      id: 'fav_shaker',
      emoji: '🥤',
      name: 'Shaker Nu3 + banane',
      description: 'Nu3 Vegan Protein 3K 30g (300ml eau) + banane moyenne',
      calories: 214, protein: 23, carbs: 28, fat: 2,
      tag: 'Collation',
    },
  ];
}

// ─── Nutrition calc ───────────────────────────────────────────────────────────
export function calcTargets(profile) {
  const { weight, height, age, activityLevel, goal } = profile;
  const bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, athlete: 1.9 };
  const tdee = bmr * (multipliers[activityLevel] || 1.55);
  let calories = Math.round(tdee);
  if (goal === 'lose') calories = Math.round(tdee - 300);
  if (goal === 'gain') calories = Math.round(tdee + 200);
  const protein = Math.round(weight * 2.0);
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return { calories, protein, carbs, fat };
}

export function calcDayTotals(meals) {
  return meals.reduce((a, m) => ({
    calories: a.calories + (m.calories || 0),
    protein: a.protein + (m.protein || 0),
    carbs: a.carbs + (m.carbs || 0),
    fat: a.fat + (m.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

// ─── Sport helpers ────────────────────────────────────────────────────────────
export const SPORT_TYPES = [
  { id: 'hyrox', label: 'Hyrox', emoji: '🏆', calPer30: 320 },
  { id: 'running', label: 'Running', emoji: '🏃‍♀️', calPer30: 280 },
  { id: 'strength', label: 'Force / Be.Strong', emoji: '🏋️‍♀️', calPer30: 200 },
  { id: 'hiit', label: 'HIIT / Be.Training', emoji: '⚡', calPer30: 300 },
  { id: 'rowing', label: 'Rowing', emoji: '🚣‍♀️', calPer30: 260 },
  { id: 'ski_erg', label: 'Ski Erg', emoji: '⛷️', calPer30: 270 },
  { id: 'bike', label: 'Vélo / Assault Bike', emoji: '🚴‍♀️', calPer30: 250 },
  { id: 'other', label: 'Autre', emoji: '🎯', calPer30: 200 },
];

export function exportSportCSV(sessions) {
  const headers = ['Date', 'Type', 'Durée (min)', 'Intensité', 'Calories estimées', 'Notes'];
  const rows = sessions.map(s => [
    s.date, s.type, s.duration, s.intensity, s.calories, s.notes || ''
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'sport_hyrox.csv'; a.click();
  URL.revokeObjectURL(url);
}

export function importSportCSV(text) {
  const lines = text.trim().split('\n').slice(1);
  return lines.map((line, i) => {
    const [date, type, duration, intensity, calories, notes] = line.split(',');
    return { id: `import_${i}`, date, type, duration: +duration, intensity, calories: +calories, notes: notes || '' };
  }).filter(s => s.date);
}

// ─── API ──────────────────────────────────────────────────────────────────────
// Use proxy to avoid CORS issues on mobile Safari
const API_URL = '/api/claude';
const USER_CONTEXT = `
PROFIL ATHLÈTE Hyrox:
- Femme, compétition duo mixte octobre 2026
- Entraînement: 5-6 sessions/semaine (Be.Strong, Be.Training, running, Hyrox duo)
- Objectif: perdre du poids tout en restant performante et sèche
- NE MANGE PAS: betterave, avocat, poisson, fruits de mer, choux, brocolis
- Intolérance lactose (pas de lait, fromage, yaourt, beurre, crème)
- Cuisine rapide: moins de 15 min max
- Compléments: Magnésium bisglycinate, Multi PRZ, Sélénium, Bromélaïne, Nu3 Vegan Protein 3K, Oméga-3
`;

export async function estimateMealAI(description, context, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Estime les valeurs nutritionnelles de: "${description}". Repas du ${context}.
Retourne UNIQUEMENT ce JSON sans markdown: {"name":"${description}","calories":0,"protein":0,"carbs":0,"fat":0,"description":"détail"}`
        }]
      })
    });
    clearTimeout(timeout);
    if (!res.ok) return { error: 'api' };
    const data = await res.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '{}';
    try {
      return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      const match = text.match(/\{[\s\S]*?\}/);
      if (match) return JSON.parse(match[0]);
      return null;
    }
  } catch (e) {
    clearTimeout(timeout);
    return { error: e.name === 'AbortError' ? 'timeout' : 'network' };
  }
}

export async function getDailySummaryAI(profile, meals, targets, supplements, steps, apiKey) {
  const totals = calcDayTotals(meals);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `${USER_CONTEXT}
Poids: ${profile.weight}kg. Cibles: ${targets.calories}kcal, ${targets.protein}g prot, ${targets.carbs}g gluc, ${targets.fat}g lip.
Repas: ${meals.map(m => m.name).join(', ') || 'aucun'}.
Totaux: ${totals.calories}kcal, ${totals.protein}g prot, ${totals.carbs}g gluc, ${totals.fat}g lip.
Compléments pris: ${supplements.filter(s => s.taken).map(s => s.name).join(', ') || 'aucun'}.
Pas: ${steps || 0}.
Fais un bilan de fin de journée en 3-4 phrases: points positifs, ce qui manque, 1 conseil concret pour demain adapté à ses contraintes. Sois directe, bienveillante, motivante. Texte simple sans markdown.`
        }]
      })
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.find(b => b.type === 'text')?.text || null;
  } catch (e) {
    clearTimeout(timeout);
    return null;
  }
}

export async function getMealIdeaAI(profile, meals, targets, apiKey) {
  const totals = calcDayTotals(meals);
  const remaining = { calories: targets.calories - totals.calories, protein: targets.protein - totals.protein, carbs: targets.carbs - totals.carbs };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `${USER_CONTEXT}
Poids: ${profile.weight}kg. Il est ${timeOfDay()}. Déjà mangé: ${meals.map(m => m.name).join(', ') || 'rien'}.
Reste à combler: ~${remaining.calories}kcal, ~${remaining.protein}g prot, ~${remaining.carbs}g gluc.
Propose 3 idées repas/snacks sans lactose, sans betterave/avocat/poisson/fruits de mer/choux, préparables en <15min.
Format: - Nom (~cal kcal, ~prot g prot)\n  → pourquoi adapté (1 phrase)\nTexte simple sans markdown.`
        }]
      })
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.find(b => b.type === 'text')?.text || null;
  } catch (e) {
    clearTimeout(timeout);
    return null;
  }
}

export async function getWeeklySummaryAI(profile, targets, weekData, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `${USER_CONTEXT}
Cibles: ${targets.calories}kcal, ${targets.protein}g prot.
Données de la semaine (7 jours): ${JSON.stringify(weekData)}.
Fais un bilan hebdomadaire: moyenne calorique, régularité des protéines, points forts, points à améliorer, 2 conseils concrets pour la semaine prochaine orientés performance Hyrox. 5-6 phrases max. Texte simple sans markdown.`
        }]
      })
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.find(b => b.type === 'text')?.text || null;
  } catch (e) {
    clearTimeout(timeout);
    return null;
  }
}
