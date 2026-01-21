import sqlite3
from difflib import SequenceMatcher

# Helper for fuzzy name matching
def fuzzy_ratio(a, b):
    if not a or not b: return 0
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

route_data = {
    "1": 158, "10": 121, "100": 59, "11": 98, "12": 86, "13": 70, "14": 99,
    "15-BoHmuBaHtoo": 127, "15-BoHmuBaHtooBayintNaung": 141, "15-ShwePaukKan": 131,
    "16A": 92, "16B": 95, "16C": 89, "17": 85, "18": 100, "19": 112, "2": 106,
    "20": 119, "21": 97, "22": 101, "23A": 72, "23B": 84, "24A": 76, "24B": 89,
    "25": 99, "26": 117, "27": 110, "28": 80, "29": 85, "30-Pyay": 105,
    "30-Thamine": 123, "31": 65, "32": 194, "33": 116, "34": 165, "35": 128,
    "36-AungMingalar": 63, "36-HtaukKyant": 123, "36-ShwePaukKan": 81, "37-Hlegu": 156,
    "37-Hmawbi": 189, "37-HtaukKyant": 113, "37-Okekan": 263, "37-Waryarlatt": 75,
    "38": 67, "39": 119, "3A": 95, "3B": 97, "4": 71, "40": 142, "41": 221,
    "42": 159, "43": 97, "44": 125, "45": 72, "46": 70, "5": 66, "53": 14,
    "54": 33, "55": 106, "56": 23, "57": 31, "58": 29, "59": 105, "60": 102,
    "60-Mini": 91, "61": 91, "62": 113, "63": 71, "64A": 91, "64B": 93,
    "65A": 171, "65B": 171, "66": 109, "68": 119, "69": 91, "6A": 124, "6B": 132,
    "70": 84, "71": 70, "72": 60, "73": 133, "74": 60, "75": 69, "76": 89,
    "77": 111, "78": 118, "79": 129, "7A": 100, "7B": 85, "8": 78,
    "80-KhineShweWar": 103, "80-Mini": 46, "80-MyinThawTar": 99, "81": 73,
    "83": 111, "84": 74, "85": 124, "86": 93, "87-MaWaTa": 95, "87-MaharMyaing": 97,
    "88": 130, "89-MinNanda": 70, "89-MyinTawThar": 80, "9": 55, "90": 281,
    "91": 205, "92-KhayMarThi": 137, "92-Thudhamma": 132, "93": 120, "94": 134,
    "95": 114, "96": 152, "97": 215, "98": 105, "99": 116, "APS-Kabaraye": 24,
    "APS-Pyay": 20
}

def auto_audit_routes():
    conn = sqlite3.connect('busSystem.db')
    c = conn.cursor()

    print(f"{'Route':<25} | {'Stops':<5} | {'Smart Score':<12} | {'Result'}")
    print("-" * 75)

    for r_id in route_data.keys():
        c.execute("""
            SELECT rs.order_index, s.name_en 
            FROM route_stops rs 
            JOIN stops s ON rs.stop_id = s.id 
            WHERE rs.route_id = ? 
            ORDER BY rs.order_index ASC
        """, (r_id,))
        
        rows = c.fetchall()
        if not rows: continue
        
        names = [r[1] for r in rows]
        total = len(rows)
        check_range = total // 2
        matches = 0
        
        # --- THE SLIDING WINDOW ALGORITHM ---
        # Instead of strict i vs (total-1-i), we check a small neighborhood
        window_size = 3 # Look up to 3 stops away to find a match
        
        for i in range(check_range):
            out_stop = names[i]
            mirror_target = (total - 1) - i
            
            # Check mirror_target, but also mirror_target-1, -2, +1, +2
            found_match_in_window = False
            for offset in range(-window_size, window_size + 1):
                look_at = mirror_target + offset
                if 0 <= look_at < total:
                    # Using 0.85 to catch "Sauk Lote Yae" vs "Sauk Lote Yae (Station)"
                    if fuzzy_ratio(out_stop, names[look_at]) > 0.85:
                        found_match_in_window = True
                        break
            
            if found_match_in_window:
                matches += 1

        smart_score = (matches / check_range) * 100 if check_range > 0 else 0
        
        # Classification
        if smart_score > 75:
            res = "✅ ROUND TRIP"
        elif smart_score > 35:
            res = "⚠️ PARTIAL/OFFSET"
        else:
            res = "🔄 LOOP/ONE-WAY"
            
        print(f"{r_id:<25} | {total:<5} | {smart_score:>10.1f}% | {res}")

    conn.close()

if __name__ == "__main__":
    auto_audit_routes()