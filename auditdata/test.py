import sqlite3
import pandas as pd

def create_audit_excel(db_path="busSystem.db"):
    conn = sqlite3.connect(db_path)
    # Get all unique routes
    routes = pd.read_sql("SELECT DISTINCT route_id FROM route_stops", conn)['route_id'].tolist()
    
    output_file = "YBS_Route_Audit.xlsx"
    
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        for r_id in routes:
            query = f"""
                SELECT rs.order_index, s.name_en, s.id as stop_id
                FROM route_stops rs
                JOIN stops s ON rs.stop_id = s.id
                WHERE rs.route_id = '{r_id}'
                ORDER BY rs.order_index ASC
            """
            df = pd.read_sql(query, conn)
            
            # Smart Guess: Mark first half as Outbound, second as Inbound
            mid_point = len(df) // 2
            df['Direction_Tag'] = ['OUTBOUND' if i < mid_point else 'INBOUND' for i in range(len(df))]
            
            # Add a blank column for your manual notes
            df['Human_Correction'] = ""
            
            # Write to a sheet (Excel limits sheet names to 31 chars)
            sheet_name = str(r_id)[:30].replace("/", "-")
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            
    print(f"✅ Successfully created {output_file}")
    print("Next Step: Open the Excel and check if the 'INBOUND' starts at the correct terminal stop.")
    conn.close()

if __name__ == "__main__":
    create_audit_excel()