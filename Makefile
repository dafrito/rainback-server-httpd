USER=$(shell whoami)
UID=$(shell id -u `whoami`)
GID=$(shell id -g `whoami`)
PREFIX=/home/dafrito/src/parsegraph/server
PACKAGE_NAME=parsegraph_server_config
PACKAGE_VERSION=1
PACKAGE_RELEASE=1
PACKAGE_SUMMARY=Server configuration for parsegraph
PACKAGE_DESCRIPTION=Server configuration for parsegraph
PACKAGE_URL=parsegraph.com
build_cpu=noarch

SSL_ROOT_DIR=/etc/letsencrypt/live/parsegraph.com
SSL_CertificateFile=$(SSL_ROOT_DIR)/fullchain.pem
SSL_CertificateKeyFile=$(SSL_ROOT_DIR)/privkey.pem
SSL_CertificateChainFile=$(SSL_ROOT_DIR)/fullchain.pem

build: $(PACKAGE_NAME).spec httpd.conf lwsws/conf lwsws/conf.d/localhost rpm.sh
.PHONY: build

HTTPD='httpd -DDevelopment -f `pwd`/httpd.conf'

httpd.conf: src/httpd.conf.in
	rm -f $@
	cp $< $@
	sed -i -ri -e "s|[@]IP[@]|72.249.137.166|g" $@
	sed -i -ri -e "s|[@]PREFIX[@]|$(PREFIX)|g" $@
	sed -i -ri -e "s|[@]USER[@]|$(USER)|g" $@
	dir=`pwd`; dir=`dirname $$dir`; sed -i -ri -e "s|[@]PARSEGRAPHDIR[@]|$$dir|g" $@
	chmod 0400 $@

check: httpd.conf
	./test_parsegraph.sh
.PHONY: check

install:
	$(MAKE) kill
	$(MAKE) run

test: httpd.conf
	test ! -e httpd.pid || exit 1
	httpd -DDevelopment -X -f `pwd`/httpd.conf
.PHONY: test

VALGRIND = valgrind -v --num-callers=40 --leak-check=full --trace-children=yes

checkvalgrind: httpd.conf
	$(VALGRIND) /usr/sbin/httpd -DDevelopment -X -f `pwd`/httpd.conf
.PHONY: checkvalgrind

lwsws/conf.d/localhost: src/localhost.lwsws.in
lwsws/conf: src/lwsws.conf.in
	cp -f $< $@-wip
	sed -ri -e "s|[@]USER[@]|$(USER)|g" $@-wip
	sed -ri -e "s|[@]UID[@]|$(UID)|g" $@-wip
	sed -ri -e "s|[@]GID[@]|$(GID)|g" $@-wip
	sed -ri -e "s|[@]PREFIX[@]|$(PREFIX)|g" $@-wip
	chmod 0400 $@-wip
	mv -f $@-wip $@

lwsws/conf.d/localhost: src/localhost.lwsws.in
	cp -f $< $@-wip
	sed -ri -e "s|[@]UID[@]|$(UID)|g" $@-wip
	sed -ri -e "s|[@]GID[@]|$(GID)|g" $@-wip
	sed -ri -e "s|[@]PREFIX[@]|$(PREFIX)|g" $@-wip
	sed -ri -e "s|[@]SSL_CertificateFile[@]|$(SSL_CertificateFile)|g" $@-wip
	sed -ri -e "s|[@]SSL_CertificateKeyFile[@]|$(SSL_CertificateKeyFile)|g" $@-wip
	sed -ri -e "s|[@]SSL_CertificateChainFile[@]|$(SSL_CertificateChainFile)|g" $@-wip
	chmod 0400 $@-wip
	mv -f $@-wip $@

run: httpd.conf lwsws/conf lwsws/conf.d/localhost
	test ! -e httpd.pid || (! pgrep httpd) || exit 1
	test ! -e lwsws.pid || (! pgrep lwsws) || exit 1
	test -e mod_parsegraph_user_html.so || exit 1
	test -e mod_parsegraph_user_json.so || exit 1
	test -e mod_parsegraph_List_json.so || exit 1
	test -e mod_parsegraph_index_html.so || exit 1
	httpd -DDevelopment -f `pwd`/httpd.conf
	tmux -S $(PREFIX)/lwsws.tmux new-s -d lwsws --configdir $(PREFIX)/lwsws -d 6
.PHONY: run

tmux:
	tmux -S $(PREFIX)/lwsws.tmux attach
.PHONY: tmux

debug: httpd.conf lwsws/conf lwsws/conf.d/localhost
	test ! -e httpd.pid || (! pgrep httpd) || exit 1
	test ! -e lwsws.pid || (! pgrep lwsws) || exit 1
	test -e mod_parsegraph_user_html.so || exit 1
	test -e mod_parsegraph_user_json.so || exit 1
	test -e mod_parsegraph_List_json.so || exit 1
	test -e mod_parsegraph_index_html.so || exit 1
	httpd -DDevelopment -f `pwd`/httpd.conf
	gdb lwsws -ex "r --configdir $(PREFIX)/lwsws -d 6"
.PHONY: debug

valgrind: httpd.conf lwsws/conf lwsws/conf.d/localhost
	test ! -e httpd.pid || (! pgrep httpd) || exit 1
	test ! -e lwsws.pid || (! pgrep lwsws) || exit 1
	test -e mod_parsegraph_user_html.so || exit 1
	test -e mod_parsegraph_user_json.so || exit 1
	test -e mod_parsegraph_List_json.so || exit 1
	test -e mod_parsegraph_index_html.so || exit 1
	httpd -DDevelopment -f `pwd`/httpd.conf
	$(VALGRIND) lwsws --configdir $(PREFIX)/lwsws -d 6
.PHONY: valgrind

strace: httpd.conf lwsws/conf lwsws/conf.d/localhost
	test ! -e httpd.pid || (! pgrep httpd) || exit 1
	test ! -e lwsws.pid || (! pgrep lwsws) || exit 1
	test -e mod_parsegraph_user_html.so || exit 1
	test -e mod_parsegraph_user_json.so || exit 1
	test -e mod_parsegraph_List_json.so || exit 1
	test -e mod_parsegraph_index_html.so || exit 1
	httpd -DDevelopment -f `pwd`/httpd.conf
	strace -f lwsws --configdir $(PREFIX)/lwsws -d 6
.PHONY: debug

pgrep:
	tmux -S $(PREFIX)/lwsws.tmux list-s; true
	pgrep -l httpd; pgrep -l lwsws; true
.PHONY: pgrep

massacre:
	tmux -S $(PREFIX)/lwsws.tmux kill-session || true
	pkill -9 lwsws; pkill -9 httpd; true
.PHONY: massacre

stop kill: httpd.pid lwsws.pid
	kill -28 `cat httpd.pid`
	TOKILL=$$(ps -q `cat lwsws.pid` --no-headers -o '%P'); test -n "$$TOKILL" && kill -9 $$TOKILL
	kill -9 `cat lwsws.pid`
.PHONY: stop kill

clean:
	test ! -e httpd.pid
	rm -f httpd.pid httpd.conf lwsws/conf lwsws/conf.d/localhost $(PACKAGE_NAME)-$(PACKAGE_VERSION)-$(PACKAGE_RELEASE).src.rpm rpm.sh $(PACKAGE_NAME).spec $(PACKAGE_NAME)-$(PACKAGE_VERSION).tar.gz $(PACKAGE_NAME)-*.rpm
.PHONY: clean

rpm.sh: rpm.sh.in
	cp -f $< $@-wip
	sed -i -re 's/@PACKAGE_NAME@/$(PACKAGE_NAME)/g' $@-wip
	sed -i -re 's/@PACKAGE_VERSION@/$(PACKAGE_VERSION)/g' $@-wip
	sed -i -re 's/@PACKAGE_RELEASE@/$(PACKAGE_RELEASE)/g' $@-wip
	mv $@-wip $@
	chmod +x rpm.sh

$(PACKAGE_NAME).spec: rpm.spec.in
	cp -f $< $@-wip
	sed -i -re 's/@PACKAGE_NAME@/$(PACKAGE_NAME)/g' $@-wip
	sed -i -re 's/@PACKAGE_VERSION@/$(PACKAGE_VERSION)/g' $@-wip
	sed -i -re 's/@PACKAGE_RELEASE@/$(PACKAGE_RELEASE)/g' $@-wip
	sed -i -re 's/@PACKAGE_SUMMARY@/$(PACKAGE_SUMMARY)/g' $@-wip
	sed -i -re 's/@PACKAGE_DESCRIPTION@/$(PACKAGE_DESCRIPTION)/g' $@-wip
	sed -i -re 's/@PACKAGE_URL@/$(PACKAGE_URL)/g' $@-wip
	sed -i -re 's/@build_cpu@/$(build_cpu)/g' $@-wip
	mv $@-wip $@
	chmod +x $@

$(PACKAGE_NAME)-$(PACKAGE_VERSION).tar.gz: httpd.conf lwsws/conf.d/localhost lwsws/conf
	tar --transform="s'^'$(PACKAGE_NAME)-$(PACKAGE_VERSION)/'g" -cz -f $@ $^

dist-gzip: $(PACKAGE_NAME)-$(PACKAGE_VERSION).tar.gz $(PACKAGE_NAME).spec
.PHONY: dist-gzip

rpm: rpm.sh dist-gzip
	bash $<
.PHONY: rpm

Makefile: Makefile.in
	./configure $(PREFIX)

distclean: clean
	rm -f Makefile
.PHONY: distclean