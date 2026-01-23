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
        # Escape backticks in csv_content just in case
        safe_csv_content = csv_content.replace('`', '\\`')
        await page.evaluate(f"window.__CSV_DATA__ = `{safe_csv_content}`;")
        await page.evaluate(f"window.__PARAMS__ = {json.dumps(params)};")
        
        updated_params = await page.evaluate("""
            async () => {
                if (typeof d3 === 'undefined') {
                    throw new Error("d3 is not loaded");
                }
                
                // Retrieve injected params
                const params = window.__PARAMS__ || {};
                
                // --- Pre-process Data (Handle Block column) ---
                const rawData = d3.csvParse(window.__CSV_DATA__);
                let processedData = [];
                let groups = [];
                
                const hasBlock = rawData.length > 0 && "block" in rawData[0];
                const hasGroupName = rawData.length > 0 && "group_name" in rawData[0];
                
                if (hasBlock) {
                     // Multi-series mode based on blocks
                     rawData.forEach(d => {
                        const gName = d.block;
                        processedData.push({ ...d, group_name: gName });
                     });
                     groups = [...new Set(processedData.map(d => d.group_name))];
                } else if (hasGroupName) {
                     // Standard mode
                     processedData = rawData;
                     groups = [...new Set(processedData.map(d => d.group_name))];
                } else {
                     // Single series mode (use filename or default)
                     const defaultName = "Imported Data";
                     processedData = rawData.map(d => ({ ...d, group_name: defaultName }));
                     groups = [defaultName];
                }

                // --- Intelligent Merge with Params ---
                // We want to preserve styles from params.series if the group names match.
                
                const oldSeriesMap = new Map();
                if (params.series) {
                    params.series.forEach(s => {
                        // Key by the first group name in the series
                         if (s.groupNames && s.groupNames.length > 0) {
                             oldSeriesMap.set(s.groupNames[0], s);
                         }
                         // Also try description as fallback key
                         if (s.options && s.options.description) {
                             oldSeriesMap.set(s.options.description, s);
                         }
                    });
                }
                
                const newSeriesList = [];
                
                // If we detected multiple groups/blocks, we treat each as a separate series
                if (hasBlock || groups.length > 1) {
                    groups.forEach(gName => {
                        const groupData = processedData.filter(d => d.group_name === gName);
                        
                        // Try to find existing style
                        let seriesObj = oldSeriesMap.get(gName);
                        
                        if (seriesObj) {
                            // Update existing
                            seriesObj.data = groupData;
                            seriesObj.groupNames = [gName];
                        } else {
                            // Create new from template
                            seriesObj = {
                                data: groupData,
                                groupNames: [gName],
                                options: { 
                                    description: gName,
                                    lineColor: "#ff0000",
                                    lineThickness: 1,
                                    showShadow: true,
                                    shadowOpacity: 0.3
                                },
                                groupOptions: {} 
                            };
                        }
                        newSeriesList.push(seriesObj);
                    });
                } else {
                    // Single group case
                    const gName = groups[0];
                    let seriesObj = null;
                    // First try to match by name
                    if (oldSeriesMap.has(gName)) {
                        seriesObj = oldSeriesMap.get(gName);
                        seriesObj.data = processedData;
                        seriesObj.groupNames = [gName];
                    } 
                    // Then try just taking the first series if available (common for single-series update)
                    else if (params.series && params.series.length > 0) {
                        seriesObj = params.series[0];
                        seriesObj.data = processedData;
                        seriesObj.groupNames = [gName];
                        if (!seriesObj.options) seriesObj.options = {};
                        seriesObj.options.description = gName; 
                    } else {
                         seriesObj = {
                                data: processedData,
                                groupNames: [gName],
                                options: { description: gName },
                                groupOptions: {}
                         };
                    }
                    newSeriesList.push(seriesObj);
                }
                
                params.series = newSeriesList;

                // --- Auto-Scaling ---
                if (!params.controls) params.controls = {};
                
                // Recalculate min/max from processedData to handle ticks
                const allValues = processedData.map(d => +d.group_value).filter(v => !isNaN(v));
                
                if (allValues.length > 0) {
                        const min = Math.min(...allValues);
                        const max = Math.max(...allValues);
                        const padding = (max - min) * 0.1 || 1.0; 

                        let yMin = params.controls['y-domain-min'];
                        let yMax = params.controls['y-domain-max'];
                        
                        if (yMin === undefined || yMin === null) {
                            yMin = Math.floor(min - padding);
                            params.controls['y-domain-min'] = yMin;
                        }
                        if (yMax === undefined || yMax === null) {
                            yMax = Math.ceil(max + padding);
                            params.controls['y-domain-max'] = yMax;
                        }

                        // Auto-generate Y ticks if not provided or empty
                        if (!params.controls['y-tick-positions']) {
                            const scale = d3.scaleLinear().domain([yMin, yMax]);
                            const ticks = scale.ticks(5);
                            params.controls['y-tick-positions'] = ticks.join(',');
                            params.controls['y-tick-labels'] = ticks.join(',');
                        }
                }

                if (typeof loadFromState !== 'function') {
                    throw new Error("loadFromState function not found in window scope");
                }
                
                console.log("Loading state with series count:", params.series.length);
                loadFromState(params);
                
                // Allow some time for D3 transitions/rendering
                await new Promise(r => setTimeout(r, 500)); 

                return params;
            }
        """)

        # Serialize SVG
        svg_content = await page.evaluate("""
            () => {
               const svg = document.querySelector("#my_dataviz svg");
               if (!svg) return null;
               
               // Ensure correct xmlns
               if (!svg.getAttribute("xmlns")) {
                   svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
               }
               
               return svg.outerHTML;
            }
        """)
        
        if svg_content:
            with open(args.out_svg, 'w', encoding='utf-8') as f:
                f.write(svg_content)
        else:
            print("Error: Could not find SVG element.")
            
        # Save updated params
        with open(args.out_params, 'w', encoding='utf-8') as f:
            json.dump(updated_params, f, indent=4)
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
