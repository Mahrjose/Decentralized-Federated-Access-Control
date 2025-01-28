#!/bin/bash

node server.js &

# Check if FL server is already running; if not, start it
if lsof -iTCP:9080 -sTCP:LISTEN >/dev/null; then
    echo "FL server is already running on port 9080."
else
    echo "Starting FL server on port 9080..."
    python3 FL/scripts/fl_server.py
fi
