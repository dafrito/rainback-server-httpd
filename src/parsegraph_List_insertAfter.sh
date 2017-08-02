#!/bin/bash

if test $# -lt 3; then
    echo 'parsegraph_List_insertAfter <refId> <type> <value>'
    exit 1
fi

USERNAME=fritalynax
SERVER=localhost:8080
#SERVER=rainback.com
curl -H 'Accept: application/json' -b ~/.$USERNAME.jar -d ref_id=$1 -d type=$2 -d value=$3 $SERVER/list?command=parsegraph_List_insertAfter
