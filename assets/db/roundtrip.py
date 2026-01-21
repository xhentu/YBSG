import sqlite3

conn = sqlite3.connect('busSystem.db')
c = conn.cursor()

# Get all unique routes
c.execute("SELECT DISTINCT route_id FROM route_stops")
routes = [r[0] for r in c.fetchall()]

print(f"{'Route':<15} | {'Total':<5} | {'Pivot':<5} | {'Pivot Stop Name'}")
print("-" * 70)

for r_id in routes:
    # Join with stops to get the names
    c.execute("""
        SELECT rs.order_index, s.name_en 
        FROM route_stops rs 
        JOIN stops s ON rs.stop_id = s.id 
        WHERE rs.route_id = ? 
        ORDER BY rs.order_index ASC
    """, (r_id,))
    
    rows = c.fetchall()
    seen_names = {}
    pivot_index = "N/A"
    pivot_stop_name = "STRICT ONE-WAY"
    
    for order, name in rows:
        if name in seen_names:
            pivot_index = order
            pivot_stop_name = name
            break 
        seen_names[name] = order
    
    print(f"{r_id:<15} | {len(rows):<5} | {pivot_index:<5} | {pivot_stop_name}")

conn.close()