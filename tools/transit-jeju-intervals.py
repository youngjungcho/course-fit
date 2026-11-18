# 제주버스정보시스템 시간표 엑셀 → 노선 번호별 낮(9~20시) 배차 간격(분)
#   python transit-jeju-intervals.py <엑셀 폴더> <결과 json>
# tools/transit-fetch.js jeju 가 불러요. 낮에 한 번도 안 다니는 노선은 null(계산에서 빼요).
# 방향(시트)마다 낮 운행 횟수를 세고, 그 가운데 값으로 660분(11시간)을 나눠요.
import openpyxl, glob, re, json, statistics, collections, warnings, sys
warnings.filterwarnings("ignore")
src, dst = sys.argv[1], sys.argv[2]
TIME = re.compile(r"(\d{1,2}):(\d{2})")
counts = collections.defaultdict(list)
for f in sorted(glob.glob(f"{src}/*.xlsx")):
    try:
        wb = openpyxl.load_workbook(f, data_only=True)
    except Exception:
        continue
    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        hi = next((i for i, r in enumerate(rows) if "구분" in [str(c).strip() if c else "" for c in r]), None)
        if hi is None:
            continue
        hdr = [str(c).strip() if c else "" for c in rows[hi]]
        nocol = hdr.index("노선번호") if "노선번호" in hdr else None
        title_no = ws.title.split()[0]
        c = collections.Counter()
        for r in rows[hi + 1:]:
            t = None
            for k, x in enumerate(r):
                if x is None or k == nocol:
                    continue
                m = TIME.search(str(x))
                if m:
                    t = int(m[1]) * 60 + int(m[2])
                    break
            if t is None:
                continue
            no = str(r[nocol]).replace("번", "").strip() if nocol is not None and r[nocol] else title_no
            c[no] += 1 if 9 * 60 <= t < 20 * 60 else 0
        for no, v in c.items():
            counts[no].append(v)
out = {}
for no, vs in counts.items():
    m = statistics.median(vs)
    out[no] = round(660 / m) if m else None
json.dump(out, open(dst, "w"), ensure_ascii=False, indent=0)
print(f"  낮 배차 간격: 노선 번호 {len(out)}개 (낮에 안 다님 {sum(1 for v in out.values() if v is None)}개)")
