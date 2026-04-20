#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
while true; do
  > /tmp/bubuanzeigen-backend.log
  uvicorn main:app --host 0.0.0.0 --port 8001 >> /tmp/bubuanzeigen-backend.log 2>&1
  echo "Backend crashed, restarting in 3s..." >> /tmp/bubuanzeigen-backend.log
  sleep 3
done
