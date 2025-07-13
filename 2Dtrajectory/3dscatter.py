import numpy as np
import pandas as pd

def generate_scatter_data(num_points=100, num_groups=3, output_filename="scatter_data.csv"):
    """
    Generates sample 2D scatter plot data with distinct groups.

    Args:
        num_points (int): Number of points per group.
        num_groups (int): Number of groups to generate.
        output_filename (str): Name of the output CSV file.
    """
    all_points = []

    for group_id in range(num_groups):
        # Generate a random center for the group
        center_x = np.random.uniform(-100, 100)
        center_y = np.random.uniform(-100, 100)

        # Generate points around the center with some noise
        points_x = center_x + np.random.randn(num_points) * 10
        points_y = center_y + np.random.randn(num_points) * 10

        # Create a DataFrame for the group
        df_group = pd.DataFrame({
            "x": points_x,
            "y": points_y,
            "group": f"Group {group_id + 1}"
        })

        all_points.append(df_group)

    # Concatenate all groups into a single DataFrame
    final_df = pd.concat(all_points, ignore_index=True)

    # Save to CSV
    final_df.to_csv(output_filename, index=False)
    print(f"Generated {num_points * num_groups} scatter points across {num_groups} groups.")
    print(f"Data saved to '{output_filename}'")

if __name__ == "__main__":
    generate_scatter_data()