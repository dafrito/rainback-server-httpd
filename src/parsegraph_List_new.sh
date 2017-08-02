#!/bin/bash

if test z$1 == z; then
    echo 'parsegraph_List_new <listname>'
    exit 1
fi

USERNAME=fritalynax
LISTNAME=$1
SERVER=localhost:8080
#SERVER=rainback.com
curl -H 'Accept: application/json' -b ~/.$USERNAME.jar -d name=$LISTNAME $SERVER/list?command=parsegraph_List_new
