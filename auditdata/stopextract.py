import sqlite3
import pandas as pd

def export_stops_table(db_path="busSystem.db"):
    # 1. Connect to your SQLite database
    conn = sqlite3.connect(db_path)
    
    # 2. Define the query to get everything from stops
    query = "SELECT * FROM stops"
    
    print("Reading 'stops' table...")
    df = pd.read_sql(query, conn)
    
    # 3. Define the output file name
    output_file = "YBS_Stops_Master_List.xlsx"
    
    # 4. Export to Excel
    print(f"Exporting {len(df)} stops to Excel...")
    df.to_excel(output_file, index=False, sheet_name="All_Stops")
    
    conn.close()
    print(f"✅ SUCCESS: {output_file} created.")

if __name__ == "__main__":
    export_stops_table()