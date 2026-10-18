import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rtuwpjsigzafcskrpilj.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_FSmfIPUP46n95w7u2iQ9uA_xtNSzrjY";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch dashboards from Supabase 'dashboards' table.
 * Falls back gracefully if table is not yet created or offline.
 */
export async function fetchDashboardsFromSupabase() {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  try {
    const { data, error } = await supabase
      .from("dashboards")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetchDashboards warning:", error.message);
      return { data: null, error };
    }

    // Map table schema back to dashboard objects
    const mapped = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      datasetName: row.dataset_name,
      purpose: row.purpose,
      data: row.data || [],
      rawData: row.raw_data || [],
      kpiCards: row.kpi_cards || [],
      charts: row.charts || [],
      filters: row.filters || {},
      theme: row.theme || "amber",
      rowCount: row.row_count || (row.data ? row.data.length : 0),
      updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      isCloudSynced: true,
    }));

    return { data: mapped, error: null };
  } catch (err) {
    console.warn("Supabase fetch error:", err);
    return { data: null, error: err };
  }
}

/**
 * Upsert dashboard to Supabase 'dashboards' table.
 */
export async function saveDashboardToSupabase(dashboard) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  try {
    const payload = {
      id: dashboard.id,
      title: dashboard.title || dashboard.datasetName || "Untitled Dashboard",
      dataset_name: dashboard.datasetName || "",
      purpose: dashboard.purpose || "",
      data: dashboard.data || [],
      raw_data: dashboard.rawData || [],
      kpi_cards: dashboard.kpiCards || [],
      charts: dashboard.charts || [],
      filters: dashboard.filters || {},
      theme: dashboard.theme || "amber",
      row_count: dashboard.rowCount || (dashboard.data ? dashboard.data.length : 0),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("dashboards")
      .upsert(payload, { onConflict: "id" })
      .select();

    if (error) {
      console.warn("Supabase saveDashboard error:", error.message);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.warn("Supabase save exception:", err);
    return { data: null, error: err };
  }
}

/**
 * Delete a dashboard by ID from Supabase
 */
export async function deleteDashboardFromSupabase(id) {
  if (!supabase) return { error: new Error("Supabase is not configured") };
  try {
    const { error } = await supabase.from("dashboards").delete().eq("id", id);
    if (error) {
      console.warn("Supabase deleteDashboard error:", error.message);
      return { error };
    }
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Test Supabase connectivity
 */
export async function testSupabaseConnection() {
  if (!supabase) return { connected: false, message: "Missing credentials" };
  try {
    // Light test call to verify API response
    const { error } = await supabase.from("dashboards").select("id").limit(1);
    if (error && error.code === "42P01") {
      // Table doesn't exist yet, but connection itself succeeded!
      return { connected: true, tableExists: false, message: "Connected! Table 'dashboards' needs to be created in SQL editor." };
    }
    if (error) {
      return { connected: true, tableExists: false, message: error.message };
    }
    return { connected: true, tableExists: true, message: "Connected to Supabase successfully" };
  } catch (err) {
    return { connected: false, message: err.message };
  }
}
