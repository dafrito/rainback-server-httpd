#!/bin/bash

if test z$1 == z || test z$2 == z; then
    echo 'parsegraph_List_updateItem <itemId> <type> <value>'
    exit 1
fi

USERNAME=fritalynax
SERVER=localhost:8080
#SERVER=rainback.com
curl -H 'Accept: application/json' -b ~/.$USERNAME.jar -d item_id=$1 -d type=$2 -d value=$3 $SERVER/list?command=parsegraph_List_updateItem
