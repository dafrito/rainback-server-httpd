#!/bin/bash

if test z$1 == z; then
    echo 'createNewUser <username>'
    exit 1
fi

USERNAME=$1
SERVER=localhost:8080
#SERVER=rainback.com
curl -H 'Accept: text/html' -d username=$USERNAME -d password=donuts --cookie-jar ~/.$USERNAME.jar $SERVER/user?command=parsegraph_createNewUser
