import csv, math, random

n_traj = 50
n_step = 60

with open('3d_trajectories.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['traj_id','step','x','y','z'])
    for i in range(n_traj):
        angle     = (i / n_traj) * 2 * math.pi
        elevation = random.uniform(-math.pi/8, math.pi/8)
        r_max     = 100 + 20 * math.sin(i/5)
        for t in range(n_step):
            r = (t/(n_step-1)) * r_max \
                + (random.uniform(-2,2) if t < n_step-1 else random.uniform(-1,1))
            x = r * math.cos(angle)
            z = r * math.sin(angle)
            y = r * math.sin(elevation)
            writer.writerow([i, t, x, y, z])