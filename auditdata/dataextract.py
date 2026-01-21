import sqlite3
import pandas as pd

def export_raw_route_data(db_path="busSystem.db"):
    conn = sqlite3.connect(db_path)
    
    # This query gets the raw data exactly as stored, adding only the names
    query = """
        SELECT 
            rs.id, 
            rs.route_id, 
            rs.stop_id, 
            rs.order_index, 
            s.name_en, 
            s.name_mm
        FROM route_stops rs
        LEFT JOIN stops s ON rs.stop_id = s.id
        ORDER BY rs.route_id, rs.order_index ASC
    """
    
    print("Reading raw database tables...")
    df = pd.read_sql(query, conn)
    
    # We add the 'leg' column as a blank space for you to fill in manually
    df['leg'] = "" 
    
    output_file = "YBS_Raw_Data_for_Audit.xlsx"
    
    # Exporting everything into one giant sheet so you can scan the whole database
    print(f"Exporting {len(df)} rows to Excel...")
    df.to_excel(output_file, index=False, sheet_name="All_Routes")
    
    conn.close()
    print(f"✅ DONE! File created: {output_file}")
    print("This file contains the exact order from your database.")

if __name__ == "__main__":
    export_raw_route_data()