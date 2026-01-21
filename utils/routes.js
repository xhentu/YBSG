import { getDb } from "./database";

// Get all routes
export async function getAllRoutes() {
  const db = getDb();
  if (!db) throw new Error("DB not initialized");

  return await db.getAllAsync("SELECT * FROM routes ORDER BY CAST(id AS INTEGER) ASC;");
}

// Get details + stops for one route
// export async function getRouteFullDetails(routeId) {
//   const db = getDb();
//   if (!db) throw new Error("DB not initialized");

//   // 1. Get route info
//   const route = await db.getFirstAsync(
//     "SELECT * FROM routes WHERE id = ?",
//     [routeId]
//   );

//   // 2. Get all stops for that route
//   const stops = await db.getAllAsync(
//     `
//       SELECT s.*
//       FROM route_stops rs
//       JOIN stops s ON s.id = rs.stop_id
//       WHERE rs.route_id = ?
//       ORDER BY rs.order_index ASC
//     `,
//     [routeId]
//   );



//   return { ...route, stops };
// }
export async function getRouteFullDetails(routeId) {
  const db = getDb();
  if (!db) throw new Error("DB not initialized");

  // 1. Get route info
  const route = await db.getFirstAsync(
    "SELECT * FROM routes WHERE id = ?",
    [routeId]
  );

  // 2. Get all stops (may contain duplicates)
  const stops = await db.getAllAsync(
    `
      SELECT s.*
      FROM route_stops rs
      JOIN stops s ON s.id = rs.stop_id
      WHERE rs.route_id = ?
      ORDER BY rs.order_index ASC
    `,
    [routeId]
  );

  // 3. Remove duplicates based on stop_id
  const uniqueStops = [];
  const seen = new Set();

  for (const s of stops) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      uniqueStops.push(s);
    }
  }

  return { ...route, stops: uniqueStops };
}
