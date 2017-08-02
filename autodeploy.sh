#!/bin/bash
while true; do
    ./deploy.sh
    sleep 1
    inotifywait -e modify -r src autodeploy.sh configure config.status *.so lwsws public_html --format '%w %e' | read file event;
done
