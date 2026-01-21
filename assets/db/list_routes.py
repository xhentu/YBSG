import sqlite3

def list_all_routes():
    conn = sqlite3.connect('busSystem.db')
    c = conn.cursor()
    
    # Get all routes and their stop counts
    c.execute("""
        SELECT route_id, COUNT(*) 
        FROM route_stops 
        GROUP BY route_id 
        ORDER BY route_id ASC
    """)
    routes = c.fetchall()
    
    print(f"{'Route ID':<25} | {'Stop Count':<10}")
    print("-" * 40)
    for r_id, count in routes:
        print(f"{r_id:<25} | {count:<10}")
    
    conn.close()

if __name__ == "__main__":
    list_all_routes()