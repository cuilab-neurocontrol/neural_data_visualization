import csv
import math
import random

"""
Generate a demo CSV for the time_line_plot with multiple conditions.
Columns:
  condition  : categorical label (e.g., A / B / C)
  x          : x value (numeric)
  y          : mean value
  CI_left    : lower confidence bound
  CI_right   : upper confidence bound
You can adjust N_POINTS, CONDITIONS, and noise parameters below.
"""

N_POINTS = 120
CONDITIONS = ["A", "B", "C"]
# amplitude / phase per condition to differentiate
COND_PARAMS = {
    "A": {"amp": 8, "phase": 0.0,  "noise": 0.8},
    "B": {"amp": 6, "phase": 0.6,  "noise": 1.0},
    "C": {"amp": 4, "phase": 1.2,  "noise": 0.6},
}

random.seed(42)
rows = []
for cond in CONDITIONS:
    p = COND_PARAMS[cond]
    for i in range(N_POINTS):
        x = i  # simple evenly spaced x
        baseline = 2.0
        # underlying signal (e.g., sinusoidal)
        signal = baseline + p["amp"] * math.sin((x / 12.0) + p["phase"]) * math.exp(-x / 250.0)
        noise = random.gauss(0, p["noise"]) * 0.5
        y = signal + noise
        # create a symmetric CI width approximated by condition noise
        ci_width = p["noise"] * 1.96
        ci_left = y - ci_width
        ci_right = y + ci_width
        rows.append({
            "condition": cond,
            "x": f"{x}",
            "y": f"{y:.3f}",
            "CI_left": f"{ci_left:.3f}",
            "CI_right": f"{ci_right:.3f}",
        })

out_path = "condition_timeseries.csv"
with open(out_path, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["condition", "x", "y", "CI_left", "CI_right"])
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {out_path} with {len(rows)} rows and {len(CONDITIONS)} conditions.")
