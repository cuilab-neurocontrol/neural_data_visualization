import csv, random, math
import argparse

"""Generate sample CSV for violin or histogram plot.
Columns:
  group_name: categorical group
  group_value: numeric observation
  ci_low: lower confidence interval bound for the group (same on each row within a group)
  ci_high: upper confidence interval bound
Usage:
  python generate_sample_data.py --groups A B C --n 80 --out sample.csv
"""

def compute_ci(sample, alpha=0.05):
    # Simple normal-approximation CI around mean: mean ± 1.96*sd/sqrt(n)
    if not sample:
        return (0.0,0.0)
    n = len(sample)
    mean = sum(sample)/n
    if n < 2:
        return (mean, mean)
    var = sum((x-mean)**2 for x in sample)/(n-1)
    sd = math.sqrt(var)
    margin = 1.96*sd/math.sqrt(n)
    return (mean - margin, mean + margin)


def generate(groups, n_per_group, blocks):
    rows = []
    for b in blocks:
        for g in groups:
            # Different distribution per group for variety
            base = random.uniform(0, 5)
            # Different base per block to distinguish them
            block_offset = 0 if b == 'Block1' else 2 
            
            data = [base + block_offset + random.gauss(0, 1.0 + 0.2*idx/len(groups)) for idx in range(n_per_group)]
            ci_low, ci_high = compute_ci(data)
            for v in data:
                row = {
                    'group_name': g,
                    'group_value': f"{v:.4f}",
                    'ci_low': f"{ci_low:.4f}",
                    'ci_high': f"{ci_high:.4f}"
                }
                if b:
                    row['block'] = b
                rows.append(row)
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--groups', nargs='+', default=['G1','G2','G3'])
    parser.add_argument('--blocks', nargs='+', default=['Block1', 'Block2'])
    parser.add_argument('--n', type=int, default=80, help='Samples per group')
    parser.add_argument('--out', default='sample_violin_hist1.csv')
    args = parser.parse_args()

    # Generate data
    rows = generate(args.groups, args.n, args.blocks)
    
    # Write to CSV
    if rows:
        fieldnames = list(rows[0].keys())
        with open(args.out, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"Generated {len(rows)} rows to {args.out}")

if __name__ == '__main__':
    main()
