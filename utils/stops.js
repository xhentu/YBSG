import { getDb } from "./database";

// 1. Get the list of townships (Used for the UI chips and loading order)
export async function getTownshipList() {
  const db = getDb();
  if (!db) return [];
  // We group by township to know exactly how many stops we are about to load
  return await db.getAllAsync(`
    SELECT township_en, COUNT(*) as stop_count 
    FROM stops 
    WHERE township_en IS NOT NULL 
    GROUP BY township_en 
    ORDER BY stop_count DESC
  `);
}

// 2. Fetch stops for one specific township (including Route Strings)
export async function getStopsByTownship(townshipName) {
  const db = getDb();
  if (!db) return [];
  try {
    return await db.getAllAsync(`
      SELECT 
        s.id, s.lat, s.lng, s.name_en, s.name_mm, s.township_en,
        p.route_ids_string
      FROM stops s
      LEFT JOIN stop_route_packed p ON s.id = p.stop_id
      WHERE s.township_en = ?
    `, [townshipName]);
  } catch (e) {
    console.error("Error fetching township stops", e);
    return [];
  }
}

// 3. Lightweight search (Only names and IDs to keep the RAM cool)
export async function getStopsForSearch() {
  const db = getDb();
  if (!db) return [];
  return await db.getAllAsync("SELECT id, name_en, name_mm, lat, lng FROM stops");
}

export async function getRouteDetailsByIds(routeIdsString) {
  const db = getDb();
  if (!db || !routeIdsString) return [];
  
  // Convert "36,65" into ["36", "65"]
  const ids = routeIdsString.split(',').map(id => `'${id.trim()}'`).join(',');
  
  try {
    return await db.getAllAsync(`
      SELECT id, name, color 
      FROM routes 
      WHERE id IN (${ids})
    `);
  } catch (e) {
    console.error("Error fetching route details", e);
    return [];
  }
}