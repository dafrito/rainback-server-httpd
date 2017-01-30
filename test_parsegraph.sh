#!/bin/bash
PATH=/usr/bin:/usr/sbin

die() {
    echo $* >&2
    exit 1
}

test -e modules || die "The Apache modules directory must be symlinked for testing."

test -d www || mkdir www
test -d www || die "The www directory could not be created and does not exist."

login_install() {
    local install_path=$*
    mkdir -p `dirname $install_path`
    if test -e $install_path; then
        return;
    fi
    PARSEGRAPH_LOGIN_INSTALL=`pkg-config --variable=parsegraph_login_install parsegraph_common`
    test -z $PARSEGRAPH_LOGIN_INSTALL && die "No install script was found"
    ! test -e $install_path || die "Install database must not already exist"
    $PARSEGRAPH_LOGIN_INSTALL sqlite3 $install_path || die "Install script failed"
    test -e $install_path || die "Installed database was not created."
}

kill_server() {
    local port_number=$1
    if test -e httpd.$port_number; then
        kill `cat httpd.$port_number`
    fi
}

TEST_NUMBER=31000

start_server() {
    local port_number=$1
    shift
    local conf_file=$*

    if test -e httpd.$port_number; then
        return;
    fi

    #echo "Serving $conf_file on port $port_number"
    httpd -d `pwd` -c "Listen $port_number" -c "PidFile httpd.$port_number" -f $conf_file || die "The Apache server failed to start."
}

CURL='curl -s'

check_method_path() {
    local method=$1
    shift
    local path=$*

    truncate -s 0 error_log
    start_server $TEST_NUMBER httpd.conf
    $CURL -X $method "http://localhost:$TEST_NUMBER$path" -o actual.html || die "Server did not return a real response."
    diff -q actual.html expected/forbidden_result.html >/dev/null 2>&1 && die "Server appears to be forbidding our route."
    ! grep error error_log || die "Server reported errors during test requests."
    kill_server $TEST_NUMBER

    let TEST_NUMBER++
}

# Run all tests.
test_server() {
    check_method_path GET '/'
    check_method_path GET '/login'
}

login_install $HOME/var/parsegraph/users.sqlite
test_server
