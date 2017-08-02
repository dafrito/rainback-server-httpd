#!/bin/bash

if test z$1 == z; then
    echo 'parsegraph_List_getID <list_name>'
    exit 1
fi

USERNAME=fritalynax
SERVER=localhost:8080
#SERVER=rainback.com
curl -H 'Accept: application/json' -b ~/.$USERNAME.jar -d list_name=$1 $SERVER/list?command=parsegraph_List_getID
