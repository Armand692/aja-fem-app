import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants. Vérifie les variables d'environnement (fichier .env en local, ou réglages du projet sur Vercel)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cette couche reproduit volontairement l'API clé-valeur (getJSON/setJSON/delKey/listKeys)
 * utilisée dans App.jsx, pour ne quasiment rien changer à la logique métier existante.
 * Clés gérées : "user:<username>", "entry:<username>:<date>", "cycleProfile:<username>", "meta:<key>"
 */

function parseKey(key) {
  const parts = key.split(":");
  return { table: parts[0], rest: parts.slice(1) };
}

function userFromRow(r) {
  if (!r) return null;
  return { username: r.username, passwordHash: r.password_hash, role: r.role, firstName: r.first_name, lastName: r.last_name, createdAt: r.created_at };
}
function entryFromRow(r) {
  if (!r) return null;
  return {
    mood: r.mood, sleep: r.sleep, energy: r.energy, soreness: r.soreness,
    muscularPain: r.muscular_pain, stress: r.stress, total: r.total,
    cyclePain: r.cycle_pain, cyclePainLevel: r.cycle_pain_level,
    submittedAt: r.submitted_at, lastEditedAt: r.last_edited_at,
  };
}
function profileFromRow(r) {
  if (!r) return null;
  return { unknown: r.unknown, lastPeriodStart: r.last_period_start, cycleLength: r.cycle_length, periodLength: r.period_length, history: r.history || [], updatedAt: r.updated_at };
}

export async function getJSON(key) {
  const { table, rest } = parseKey(key);
  try {
    if (table === "user") {
      const { data } = await supabase.from("app_users").select("*").eq("username", rest[0]).maybeSingle();
      return userFromRow(data);
    }
    if (table === "entry") {
      const [username, date] = rest;
      const { data } = await supabase.from("wellness_entries").select("*").eq("username", username).eq("entry_date", date).maybeSingle();
      return entryFromRow(data);
    }
    if (table === "cycleProfile") {
      const { data } = await supabase.from("cycle_profiles").select("*").eq("username", rest[0]).maybeSingle();
      return profileFromRow(data);
    }
    if (table === "meta") {
      const { data } = await supabase.from("app_meta").select("*").eq("key", rest.join(":")).maybeSingle();
      return data ? data.value : null;
    }
  } catch (e) {
    console.error("getJSON error", key, e);
    return null;
  }
  return null;
}

export async function setJSON(key, val) {
  const { table, rest } = parseKey(key);
  try {
    if (table === "user") {
      const row = { username: val.username, password_hash: val.passwordHash, role: val.role, first_name: val.firstName, last_name: val.lastName, created_at: val.createdAt };
      const { error } = await supabase.from("app_users").upsert(row);
      if (error) throw error;
      return true;
    }
    if (table === "entry") {
      const [username, date] = rest;
      const row = {
        username, entry_date: date, mood: val.mood, sleep: val.sleep, energy: val.energy, soreness: val.soreness,
        muscular_pain: val.muscularPain, stress: val.stress, total: val.total,
        cycle_pain: val.cyclePain, cycle_pain_level: val.cyclePainLevel,
        submitted_at: val.submittedAt, last_edited_at: val.lastEditedAt,
      };
      const { error } = await supabase.from("wellness_entries").upsert(row);
      if (error) throw error;
      return true;
    }
    if (table === "cycleProfile") {
      const row = { username: rest[0], unknown: !!val.unknown, last_period_start: val.lastPeriodStart, cycle_length: val.cycleLength, period_length: val.periodLength, history: val.history || [], updated_at: val.updatedAt || new Date().toISOString() };
      const { error } = await supabase.from("cycle_profiles").upsert(row);
      if (error) throw error;
      return true;
    }
    if (table === "meta") {
      const { error } = await supabase.from("app_meta").upsert({ key: rest.join(":"), value: val, updated_at: new Date().toISOString() });
      if (error) throw error;
      return true;
    }
  } catch (e) {
    console.error("setJSON error", key, e);
    return null;
  }
  return null;
}

export async function delKey(key) {
  const { table, rest } = parseKey(key);
  try {
    if (table === "user") { const { error } = await supabase.from("app_users").delete().eq("username", rest[0]); if (error) throw error; return true; }
    if (table === "cycleProfile") { const { error } = await supabase.from("cycle_profiles").delete().eq("username", rest[0]); if (error) throw error; return true; }
    if (table === "entry") { const [username, date] = rest; const { error } = await supabase.from("wellness_entries").delete().eq("username", username).eq("entry_date", date); if (error) throw error; return true; }
  } catch (e) {
    console.error("delKey error", key, e);
    return null;
  }
  return null;
}

export async function listKeys(prefix) {
  try {
    if (prefix === "user:") {
      const { data, error } = await supabase.from("app_users").select("username");
      if (error) throw error;
      return (data || []).map((r) => `user:${r.username}`);
    }
    if (prefix === "entry:") {
      const { data, error } = await supabase.from("wellness_entries").select("username, entry_date");
      if (error) throw error;
      return (data || []).map((r) => `entry:${r.username}:${r.entry_date}`);
    }
    if (prefix.startsWith("entry:")) {
      const username = prefix.split(":")[1];
      const { data, error } = await supabase.from("wellness_entries").select("entry_date").eq("username", username);
      if (error) throw error;
      return (data || []).map((r) => `entry:${username}:${r.entry_date}`);
    }
    if (prefix === "cycleProfile:") {
      const { data, error } = await supabase.from("cycle_profiles").select("username");
      if (error) throw error;
      return (data || []).map((r) => `cycleProfile:${r.username}`);
    }
  } catch (e) {
    console.error("listKeys error", prefix, e);
    return [];
  }
  return [];
}
