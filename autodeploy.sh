#!/bin/bash

deploy() {
    make kill
    make run
}

deploy
while inotifywait -e modify --format '%w' -r src autodeploy.sh configure config.status *.so; do
    deploy
done
