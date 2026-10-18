/**
 * Storage service for User Auth, Saved Dashboards, and Settings
 * Supports both LocalStorage cache and Supabase Cloud Database synchronization
 */
import {
  isSupabaseConfigured,
  fetchDashboardsFromSupabase,
  saveDashboardToSupabase,
  deleteDashboardFromSupabase,
} from "./supabase";

const STORAGE_KEYS = {
  USER: "sddb_current_user",
  SAVED_DASHBOARDS: "sddb_saved_dashboards",
  THEME: "sddb_current_theme",
  STUDENT_INFO: "sddb_student_info",
};

export const DEFAULT_STUDENT_INFO = {
  studentName: "Alex Morgan",
  collegeName: "Department of Computer Science & Engineering",
  universityName: "Institute of Technology & Sciences",
  projectYear: "2025 - 2026",
  projectTitle: "Smart Data Dashboard Builder (Power BI Inspired)",
  rollNo: "CS-2024-8841",
};

export function getStoredUser() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data
      ? JSON.parse(data)
      : {
          name: "Student Analyst",
          email: "student@university.edu",
          isAuthenticated: true,
          avatarColor: "#f59e0b",
        };
  } catch (e) {
    return {
      name: "Student Analyst",
      email: "student@university.edu",
      isAuthenticated: true,
      avatarColor: "#f59e0b",
    };
  }
}

export function saveStoredUser(user) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user:", e);
  }
}

export function getSavedDashboards() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_DASHBOARDS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Saves dashboard to LocalStorage immediately and syncs with Supabase in the background
 */
export function saveDashboardToStorage(dashboard) {
  try {
    const existing = getSavedDashboards();
    const index = existing.findIndex((d) => d.id === dashboard.id);
    let updated;
    const itemToSave = {
      ...dashboard,
      updatedAt: new Date().toISOString(),
      isCloudSynced: isSupabaseConfigured,
    };

    if (index >= 0) {
      updated = [...existing];
      updated[index] = itemToSave;
    } else {
      updated = [itemToSave, ...existing];
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_DASHBOARDS, JSON.stringify(updated));

    // Async sync to Supabase Cloud if configured
    if (isSupabaseConfigured) {
      saveDashboardToSupabase(itemToSave).catch((err) =>
        console.warn("Could not sync dashboard to Supabase:", err)
      );
    }

    return updated;
  } catch (e) {
    console.error("Failed to save dashboard:", e);
    return [];
  }
}

/**
 * Deletes dashboard from LocalStorage and Supabase Cloud
 */
export function deleteDashboardFromStorage(id) {
  try {
    const existing = getSavedDashboards();
    const updated = existing.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_DASHBOARDS, JSON.stringify(updated));

    // Async delete from Supabase Cloud
    if (isSupabaseConfigured) {
      deleteDashboardFromSupabase(id).catch((err) =>
        console.warn("Could not delete dashboard from Supabase:", err)
      );
    }

    return updated;
  } catch (e) {
    return [];
  }
}

/**
 * Synchronize dashboards between LocalStorage and Supabase Cloud
 */
export async function syncDashboardsWithCloud() {
  if (!isSupabaseConfigured) return getSavedDashboards();

  try {
    const { data: cloudDashboards, error } = await fetchDashboardsFromSupabase();
    if (error || !cloudDashboards) {
      return getSavedDashboards();
    }

    const localDashboards = getSavedDashboards();
    const map = new Map();

    // Add local dashboards first
    localDashboards.forEach((d) => map.set(d.id, d));

    // Cloud dashboards overwrite or add if present
    cloudDashboards.forEach((d) => map.set(d.id, d));

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    );

    localStorage.setItem(STORAGE_KEYS.SAVED_DASHBOARDS, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn("Error syncing with cloud:", err);
    return getSavedDashboards();
  }
}

export function getStudentInfo() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENT_INFO);
    return data ? JSON.parse(data) : DEFAULT_STUDENT_INFO;
  } catch (e) {
    return DEFAULT_STUDENT_INFO;
  }
}

export function saveStudentInfo(info) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENT_INFO, JSON.stringify(info));
  } catch (e) {
    console.error("Failed to save student info:", e);
  }
}
