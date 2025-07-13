import numpy as np
import pandas as pd

def generate_scatter_data(num_points_per_cluster=50, num_clusters=3, output_filename='scatter_data.csv'):
    """
    Generates sample 3D scatter plot data with distinct clusters.

    Args:
        num_points_per_cluster (int): Number of points in each cluster.
        num_clusters (int): Number of clusters to generate.
        output_filename (str): The name of the output CSV file.
    """
    all_points = []
    
    for i in range(num_clusters):
        # Generate a random center for the cluster within the [-100, 100] domain
        center = np.random.rand(3) * 200 - 100
        
        # Generate points around the center with some noise
        points = center + np.random.randn(num_points_per_cluster, 3) * 15 # Adjust spread
        
        # Create a DataFrame for the cluster
        df_cluster = pd.DataFrame(points, columns=['x', 'y', 'z'])
        # The legend will use this category name
        df_cluster['category'] = f'Condition {i + 1}'
        
        all_points.append(df_cluster)
        
    # Concatenate all clusters into a single DataFrame
    final_df = pd.concat(all_points, ignore_index=True)
    
    # Save to CSV
    final_df.to_csv(output_filename, index=False)
    print(f"Generated {num_points_per_cluster * num_clusters} scatter points in {num_clusters} categories.")
    print(f"Data saved to '{output_filename}'")

if __name__ == '__main__':
    generate_scatter_data()