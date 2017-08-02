#!/bin/bash

if test $# -lt 3; then
    echo 'parsegraph_List_moveAfter <itemId> <refId>'
    exit 1
fi

USERNAME=fritalynax
SERVER=localhost:8080
#SERVER=rainback.com
curl -H 'Accept: application/json' -b ~/.$USERNAME.jar -d item_id=$1 -d ref_id=$2 $SERVER/list?command=parsegraph_List_moveAfter
