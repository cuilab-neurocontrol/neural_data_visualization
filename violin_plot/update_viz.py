import argparse
import json
import os
import asyncio
from playwright.async_api import async_playwright

async def run():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', required=True, help='Path to CSV data file')
    parser.add_argument('--params', required=True, help='Path to JSON parameter file')
    parser.add_argument('--out_params', required=True, help='Path to save new parameters')
    parser.add_argument('--out_svg', required=True, help='Path to save SVG')
    args = parser.parse_args()

    # Read the data file
    with open(args.data, 'r', encoding='utf-8') as f:
        csv_content = f.read()
    
    # Read the params file
    params = {}
    if os.path.exists(args.params):
        try:
            with open(args.params, 'r', encoding='utf-8') as f:
                params = json.load(f)
        except Exception as e:
            print(f"Warning: Could not read param file: {e}")
            params = {}
    
    # Resolve absolute path for HTML
    current_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = f"file://{os.path.join(current_dir, 'violin_plot.html')}"

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Capture console messages
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        
        # Load the page and wait for network idle (to ensure d3 loads)
        await page.goto(html_path, wait_until='networkidle')

        # Pass data to browser context
        # Escape backticks in csv_content just in case, though usually not present in CSV values
        safe_csv_content = csv_content.replace('`', '\\`')
        await page.evaluate(f"window.__CSV_DATA__ = `{safe_csv_content}`;")
        await page.evaluate(f"window.__PARAMS__ = {json.dumps(params)};")
        
        updated_params = await page.evaluate("""
            async () => {
                if (typeof d3 === 'undefined') {
                    throw new Error("d3 is not loaded");
                }
                const data = d3.csvParse(window.__CSV_DATA__);
                const params = window.__PARAMS__;
                
                // If params is empty, initialize basic structure
                if (!params.series) params.series = [];

                // Logic: 
                // We overwrite the DATA of the first series, or create a new series if none exists.
                // Depending on requirements, we might want to replace ALL series.
                // Assuming single-file automation context -> Single Series or updating the primary one.
                
                if (params.series.length === 0) {
                    params.series.push({
                        data: data,
                        groupNames: [...new Set(data.map(d => d.group_name))],
                        options: { description: 'Imported Data' },
                        groupOptions: {}
                    });
                } else {
                    // Update first series
                    params.series[0].data = data;
                    
                    // Update groupNames if necessary
                    const groups = [...new Set(data.map(d => d.group_name))];
                    // Merge new groups with existing groupNames to preserve order/settings if possible, 
                    // or just overwrite if they are completely different.
                    // Let's union them.
                    const existingGroups = new Set(params.series[0].groupNames || []);
                    groups.forEach(g => existingGroups.add(g));
                    params.series[0].groupNames = Array.from(existingGroups);
                }
                
                // Auto-scale Y domain if not provided in params
                if (!params.controls) params.controls = {};
                if (!params.controls['y-domain-min'] || !params.controls['y-domain-max']) {
                    const allValues = data.map(d => +d.group_value).filter(v => !isNaN(v));
                    if (allValues.length > 0) {
                        const min = Math.min(...allValues);
                        const max = Math.max(...allValues);
                        // Add some padding (e.g., 10%)
                        const padding = (max - min) * 0.1;
                        // If domain inputs not in params, set them
                        if (!params.controls['y-domain-min']) {
                            params.controls['y-domain-min'] = Math.floor(min - padding);
                        }
                        if (!params.controls['y-domain-max']) {
                            params.controls['y-domain-max'] = Math.ceil(max + padding);
                        }
                    }
                }

                if (typeof loadFromState !== 'function') {
                    throw new Error("loadFromState function not found in window scope");
                }
                
                loadFromState(params);
                
                // Return the params state (which now includes the data)
                // We might want to capture the FULL state from the UI to include any defaults applied
                // But loadFromState modifies the UI from the state. 
                // Let's use the provided params enriched with data, as that's what we modified.
                return params;
            }
        """)
        
        # Wait for rendering (transitions etc)
        await page.wait_for_timeout(2000)
        
        # Extract SVG
        svg_content = await page.evaluate("""
            () => {
                const svg = document.querySelector("#my_dataviz svg");
                if (!svg) return null;
                // Add xmlns if missing for standalone viewing
                if (!svg.getAttribute('xmlns')) {
                    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                }
                return svg.outerHTML;
            }
        """)
        
        if svg_content:
            with open(args.out_svg, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            print(f"SVG saved to {args.out_svg}")
        else:
            print("Error: No SVG found on page.")

        # Save the updated parameters
        with open(args.out_params, 'w', encoding='utf-8') as f:
            json.dump(updated_params, f, indent=2)
        print(f"Parameters saved to {args.out_params}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
