// utils/calcQuery.js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('busSystem.db');

/* ---------- SEARCH STOPS ---------- */
export const searchStops = async (query) => {
  if (!query || query.length < 2) return [];

  const sql = `
    SELECT 
      id, 
      name_en, name_mm,
      road_en, township_en,
      lat, lng
    FROM stops
    WHERE name_en LIKE ? OR name_mm LIKE ?
    ORDER BY name_en
    LIMIT 15
  `;

  return await db.getAllAsync(sql, [`%${query}%`, `%${query}%`]);
};

/* ---------- ROUTE CALCULATION ---------- */
export const getHumanFriendlyRoutes = async (startStop, endStop) => {
  const solutions = [];
  const seen = new Set();

  /* ---- 1. DIRECT ROUTES ---- */
  const directSql = `
    SELECT 
      r.id,
      r.name,
      r.color,
      r.geometry
    FROM route_stops rs1
    JOIN route_stops rs2 ON rs1.route_id = rs2.route_id
    JOIN routes r ON r.id = rs1.route_id
    WHERE rs1.stop_id = ?
      AND rs2.stop_id = ?
      AND rs1.order_index < rs2.order_index
  `;

  const directs = await db.getAllAsync(directSql, [
    startStop.id,
    endStop.id
  ]);

  for (const row of directs) {
    const key = `D-${row.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    solutions.push({
      id: key,
      type: 'DIRECT',
      busNumbers: [row.name.split(' ')[0]],
      startStop,
      endStop,
      legs: [{
        route_id: row.id,
        name: row.name,
        color: row.color,
        geometry: row.geometry
      }]
    });
  }

  /* ---- 2. ONE TRANSFER ---- */
  const transferSql = `
    SELECT DISTINCT
      r1.id AS r1_id, r1.name AS r1_name, r1.color AS r1_color, r1.geometry AS r1_geo,
      r2.id AS r2_id, r2.name AS r2_name, r2.color AS r2_color, r2.geometry AS r2_geo,
      s.id  AS mid_id, s.name_en AS mid_name, s.lat, s.lng
    FROM route_stops rs_start
    JOIN route_stops rs_m1 ON rs_start.route_id = rs_m1.route_id
    JOIN route_stops rs_m2 ON rs_m1.stop_id = rs_m2.stop_id
    JOIN route_stops rs_end ON rs_m2.route_id = rs_end.route_id
    JOIN routes r1 ON r1.id = rs_start.route_id
    JOIN routes r2 ON r2.id = rs_end.route_id
    JOIN stops s ON s.id = rs_m1.stop_id
    WHERE rs_start.stop_id = ?
      AND rs_end.stop_id = ?
      AND rs_start.route_id != rs_end.route_id
      AND rs_start.order_index < rs_m1.order_index
      AND rs_m2.order_index < rs_end.order_index
    LIMIT 10
  `;

  const transfers = await db.getAllAsync(transferSql, [
    startStop.id,
    endStop.id
  ]);

  for (const row of transfers) {
    const key = `T-${row.r1_id}-${row.r2_id}-${row.mid_id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    solutions.push({
      id: key,
      type: 'TRANSFER',
      busNumbers: [
        row.r1_name.split(' ')[0],
        row.r2_name.split(' ')[0]
      ],
      startStop,
      endStop,
      midStop: {
        id: row.mid_id,
        name: row.mid_name,
        lat: row.lat,
        lng: row.lng
      },
      legs: [
        { route_id: row.r1_id, name: row.r1_name, color: row.r1_color, geometry: row.r1_geo },
        { route_id: row.r2_id, name: row.r2_name, color: row.r2_color, geometry: row.r2_geo }
      ]
    });
  }

  return solutions;
};

// // Gemini
// import * as SQLite from 'expo-sqlite';

// const db = SQLite.openDatabaseSync('busSystem.db');

// // Search for stops by name
// export const searchStops = async (query) => {
//     if (!query || query.length < 2) return [];
//     try {
//       // Select road and township to help users differentiate
//       const sql = `
//         SELECT id, name_en, name_mm, road_en, township_en, lat, lng 
//         FROM stops 
//         WHERE name_en LIKE ? OR name_mm LIKE ? 
//         LIMIT 10`;
//       return await db.getAllAsync(sql, [`%${query}%`, `%${query}%`]);
//     } catch (error) {
//       console.error("Search Error:", error);
//       return [];
//     }
//   };

// // The Human-Thinking Routing Logic
// export const getHumanFriendlyRoutes = async (startStop, endStop) => {
//   let solutions = [];
//   try {
//     // 1. Direct Routes (0 Transfers)
//     const directSql = `
//       SELECT r.id, r.name, r.color, r.geometry
//       FROM route_stops rs1
//       JOIN route_stops rs2 ON rs1.route_id = rs2.route_id
//       JOIN routes r ON rs1.route_id = r.id
//       WHERE rs1.stop_id = ? AND rs2.stop_id = ? AND rs1.order_index < rs2.order_index
//     `;
//     const directs = await db.getAllAsync(directSql, [startStop.id, endStop.id]);
//     directs.forEach((row, i) => {
//       solutions.push({
//         id: `sol-d-${i}`,
//         type: 'DIRECT',
//         busNumbers: [row.name.split(' ')[0]],
//         startStop, endStop,
//         legs: [{ route_id: row.id, name: row.name, color: row.color, geometry: row.geometry }]
//       });
//     });

//     // 2. Transfer Routes (1 Transfer)
//     const transferSql = `
//       SELECT 
//         r1.id as r1_id, r1.name as r1_name, r1.color as r1_c, r1.geometry as r1_g,
//         r2.id as r2_id, r2.name as r2_name, r2.color as r2_c, r2.geometry as r2_g,
//         s.id as m_id, s.name_en as m_name, s.lat as m_lat, s.lng as m_lng
//       FROM route_stops rs_start
//       JOIN route_stops rs_m1 ON rs_start.route_id = rs_m1.route_id
//       JOIN route_stops rs_m2 ON rs_m1.stop_id = rs_m2.stop_id
//       JOIN route_stops rs_end ON rs_m2.route_id = rs_end.route_id
//       JOIN routes r1 ON rs_start.route_id = r1.id
//       JOIN routes r2 ON rs_end.route_id = r2.id
//       JOIN stops s ON rs_m1.stop_id = s.id
//       WHERE rs_start.stop_id = ? AND rs_end.stop_id = ?
//       AND rs_start.order_index < rs_m1.order_index
//       AND rs_m2.order_index < rs_end.order_index
//       AND r1.id != r2.id LIMIT 10
//     `;
//     const transfers = await db.getAllAsync(transferSql, [startStop.id, endStop.id]);
//     transfers.forEach((row, i) => {
//       solutions.push({
//         id: `sol-t-${i}`,
//         type: 'TRANSFER',
//         busNumbers: [row.r1_name.split(' ')[0], row.r2_name.split(' ')[0]],
//         startStop, endStop,
//         midStop: { id: row.m_id, name: row.m_name, lat: row.m_lat, lng: row.m_lng },
//         legs: [
//           { route_id: row.r1_id, name: row.r1_name, color: row.r1_c, geometry: row.r1_g },
//           { route_id: row.r2_id, name: row.r2_name, color: row.r2_c, geometry: row.r2_g }
//         ]
//       });
//     });

//     return solutions;
//   } catch (e) { console.error(e); return []; }
// };