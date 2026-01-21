import sqlite3
import sys
from difflib import SequenceMatcher

def fuzzy_match(a, b):
    if not a or not b: return 0
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def inspect_route_flexible(r_id):
    conn = sqlite3.connect('busSystem.db')
    c = conn.cursor()

    c.execute("""
        SELECT rs.order_index, s.name_en 
        FROM route_stops rs 
        JOIN stops s ON rs.stop_id = s.id 
        WHERE rs.route_id = ? 
        ORDER BY rs.order_index ASC
    """, (r_id,))
    
    rows = c.fetchall()
    if not rows:
        print(f"\n[!] Route '{r_id}' not found.")
        conn.close()
        return
    
    names = [r[1] for r in rows]
    indices = [r[0] for r in rows]
    total = len(rows)
    
    print(f"\n{'='*20} OFFSET-AWARE AUDIT: {r_id} {'='*20}")
    print(f"{'OUTBOUND Leg':<35} | {'INBOUND Leg (Mirrored)':<35} | Status")
    print("-" * 90)

    matches = 0
    half = total // 2

    for i in range(half):
        out_name = names[i]
        # We look at the target mirrored index, but also one before and one after
        mirror_idx = (total - 1) - i
        
        best_ratio = 0
        best_match_name = ""
        offset_found = 0

        # Look-ahead/behind window of 2 stops to catch the "Route 10" shift
        for offset in [-1, 0, 1]:
            check_idx = mirror_idx + offset
            if 0 <= check_idx < total:
                ratio = fuzzy_match(out_name, names[check_idx])
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_match_name = names[check_idx]
                    offset_found = offset

        # Display Logic
        if best_ratio > 0.85:
            status = "MATCH"
            if offset_found != 0: status = f"MATCH (Shift {offset_found})"
            matches += 1
        elif best_ratio > 0.6:
            status = f"NEAR ({int(best_ratio*100)}%)"
            matches += 0.5
        else:
            status = "DIFF"

        print(f"{f'[{indices[i]}] {out_name}':<35} | {f'[{best_match_name}]':<35} | {status}")

    score = (matches / half) * 100
    print("-" * 90)
    print(f"Intelligence Score: {score:.1f}%")
    
    if score > 50:
        print(f"RESULT: [ROUND TRIP] Successfully detected with Offset-Alignment.")
    else:
        print(f"RESULT: [LOOP] Still low mirroring after offset check.")

    conn.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        inspect_route_flexible(sys.argv[1])