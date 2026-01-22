#!/bin/bash

# Check arguments
if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <data_file> <param_file> <out_param_path> <out_svg_path>"
    exit 1
fi

DATA_FILE=$1
PARAM_FILE=$2
OUT_PARAM=$3
OUT_SVG=$4

# Resolve absolute paths for inputs (python script handles them, but good to be clear)
# However, python's open() handles relative paths from CWD. 
# The script runs from where user calls it, or we validte paths.

# Directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if venv exists
if [ -d "$DIR/venv" ]; then
    source "$DIR/venv/bin/activate"
else
    echo "Error: Virtual environment not found at $DIR/venv"
    echo "Please set up the environment first."
    exit 1
fi

echo "Processing..."
echo "Data: $DATA_FILE"
echo "Params: $PARAM_FILE"

# Run python script
python "$DIR/update_viz.py" --data "$DATA_FILE" --params "$PARAM_FILE" --out_params "$OUT_PARAM" --out_svg "$OUT_SVG"

if [ $? -eq 0 ]; then
    echo "Done."
else
    echo "Error executing python script."
    exit 1
fi
