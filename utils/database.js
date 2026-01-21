// import * as FileSystem from "expo-file-system/legacy";
// import { openDatabase } from 'expo-sqlite';
// import { Asset } from "expo-asset";

// const DB_NAME = "busSystem.db";   // <-- FIXED
// let db = null;

// export async function initDatabase() {
//   const sqliteFolder = `${FileSystem.documentDirectory}SQLite`;
//   const dbPath = `${sqliteFolder}/${DB_NAME}`;

//   const folderInfo = await FileSystem.getInfoAsync(sqliteFolder);
//   if (!folderInfo.exists) {
//     await FileSystem.makeDirectoryAsync(sqliteFolder, { intermediates: true });
//   }

//   const fileInfo = await FileSystem.getInfoAsync(dbPath);

//   if (!fileInfo.exists) {
//     console.log("Copying db from assets...");
//     const asset = Asset.fromModule(require("../assets/db/busSystem.db"));  // <-- FIXED
//     await asset.downloadAsync();

//     await FileSystem.copyAsync({
//       from: asset.localUri,
//       to: dbPath,
//     });
//   }

//   db = SQLite.openDatabase(DB_NAME);
//   return db;
// }

// export function getDb() {
//   return db;
// }

import * as FileSystem from "expo-file-system/legacy";
// Using the modern Async Driver by importing from the /next subpath.
import { openDatabaseAsync } from 'expo-sqlite'; 
import { Asset } from "expo-asset";

const DB_NAME = "busSystem.db";
const DATABASE_DIR = FileSystem.documentDirectory + "SQLite/";

let db = null;

/**
 * Initializes the database connection.
 * It checks if the database asset exists on the device, copies it if necessary,
 * and opens the connection using the modern async driver.
 */
// FIX: Renamed the function back to 'initDatabase' to match the component's import.
export async function initDatabase() {
    // 1. Return existing connection if available
    if (db) {
        console.log("Database connection already established.");
        return db;
    }

    // Define the full path for the local DB file
    await FileSystem.makeDirectoryAsync(DATABASE_DIR, { intermediates: true });
    const localDbUri = DATABASE_DIR + DB_NAME;

    console.log("Checking database file path:", localDbUri);
    
    try {
        // Check file status
        let info = await FileSystem.getInfoAsync(localDbUri);

        // 2. Copy the asset if the local file doesn't exist or is empty
        if (!info.exists || info.size === 0) {
            console.log("Database not found or empty. Copying from asset...");
            
            // Corrected the path to match your structure: ../assets/db/busSystem.db
            const asset = Asset.fromModule(
                require("../assets/db/busSystem.db") 
            ).downloadAsync();

            const downloadedAsset = await asset;

            await FileSystem.copyAsync({
                from: downloadedAsset.localUri || downloadedAsset.uri,
                to: localDbUri,
            });
            console.log("Database copied successfully to:", localDbUri);
        } else {
            console.log("DB already exists → using existing database.");
        }

        // 3. Open the database using the robust Async Driver
        db = await openDatabaseAsync(DB_NAME);
        console.log("Database connection successfully opened with openDatabaseAsync.");
        return db;

    } catch (error) {
        console.error("Database initialization failed:", error);
        throw new Error(`Database setup error: ${error.message}`);
    }
}

// Function to check the connection status and list tables
export const getDbStatus = async () => {
    try {
        // Must now call the renamed function
        const connection = await initDatabase();
        
        // This query uses the modern db.getAllAsync method.
        const tables = await connection.getAllAsync(
            "SELECT name FROM sqlite_master WHERE type='table';"
        );

        return (
            "Connected! Tables:\n" + JSON.stringify(tables, null, 2)
        );
    } catch (err) {
        return `DB FAIL: ${err.message}`;
    }
};

// Export the primary connection function by its required name
export default initDatabase;

export function getDb() {
    return db;
  }