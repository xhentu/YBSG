import sqlite3
import sys
import os

# --- Configuration ---
# Default database path if none is provided via command line
DB_PATH = "busSystem.db" 

# ANSI colors for nicer terminal output
RESET = "\033[0m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
MAGENTA = "\033[95m"

def inspect_schema_and_data(db_path: str):
    """Connects to the database and prints the schema and one sample row for every table."""
    conn = None
    try:
        # Check if the database file exists
        if not os.path.exists(db_path):
            print(f"Error: Database file not found at '{db_path}'")
            return
            
        conn = sqlite3.connect(db_path)
        c = conn.cursor()

        print(CYAN + f"\n📌 Inspecting Database: {db_path}\n" + RESET)

        # Get tables (excluding SQLite internal tables)
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [t[0] for t in c.fetchall()]

        if not tables:
            print("⚠ No user-defined tables found.")
            return

        for table in tables:
            print(MAGENTA + f"\n==================== {table} ====================" + RESET)

            # Print CREATE TABLE schema
            c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table,))
            schema = c.fetchone()[0]
            print(YELLOW + "\nSchema:" + RESET)
            print(schema)

            # Print one sample row
            c.execute(f"SELECT * FROM {table} LIMIT 1;")
            row = c.fetchone()

            print(GREEN + "\nSample row:" + RESET)
            if row:
                # Get column names using PRAGMA (more robust than cursor.description)
                c.execute(f"PRAGMA table_info({table});")
                cols = [col[1] for col in c.fetchall()]
                
                # Print column name and value side-by-side
                for col, value in zip(cols, row):
                    print(f"  {col}: {value}")
            else:
                print("  (empty table)")

    except sqlite3.Error as e:
        print(f"\nSQLite Error occurred: {e}")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
    finally:
        # Ensure the connection is always closed
        if conn:
            conn.close()

if __name__ == "__main__":
    # Use command line argument (sys.argv[1]) if provided, otherwise use the default DB_PATH
    db_file = sys.argv[1] if len(sys.argv) > 1 else DB_PATH
    inspect_schema_and_data(db_file)