#!/bin/bash
PATH=/usr/bin

RPMDIR=$HOME/rpmbuild
mkdir -p $RPMDIR
cd $RPMDIR && mkdir -p SOURCES SPECS BUILD RPMS SRPMS && cd -

RPMFLAGS=--ba
SRCRPM=parsegraph_server_config-2.1-8.src.rpm
SPECFILE=parsegraph_server_config.spec

make dist-gzip
cp -u parsegraph_server_config-2.1.tar.gz $RPMDIR/SOURCES
cp -u $SPECFILE $RPMDIR/SPECS/parsegraph_server_config.spec
rpmbuild $RPMFLAGS $RPMDIR/SPECS/parsegraph_server_config.spec

for package in `rpm -q --specfile $SPECFILE`; do
    arch=`echo $package | grep -E -o '[^.]+$$'`;
    filename="$RPMDIR/RPMS/$arch/$package.rpm";
    [ -L ../rpm/`basename $filename` ] || ln -v -s $filename ../rpm/`basename $filename`;
done
[ -L ../rpm/$SRCRPM ] || ln -v -s $RPMDIR/SRPMS/parsegraph_server_config-2.1-8`rpmbuild -E '%{?dist}' $SPECFILE`.src.rpm ../rpm/$SRCRPM
