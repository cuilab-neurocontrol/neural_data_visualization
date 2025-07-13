import csv
import math
import random

n_traj = 120
n_step = 40
cx, cy = 100, 10

with open('trajectories.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['group', 'x', 'y'])
    for i in range(n_traj):
        angle = (i / n_traj) * 2 * math.pi
        r_max = 180 + 30 * math.sin(i/7)
        for t in range(n_step):
            r = (t/(n_step-1)) * r_max + (random.uniform(-3,3) if t < n_step-1 else random.uniform(-1,1))
            x = cx + r * math.cos(angle)
            y = cy + r * math.sin(angle)
            writer.writerow([i, x, y])