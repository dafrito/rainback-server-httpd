build: httpd.conf
.PHONY: build

httpd.conf: httpd.conf.in
	rm -f $@
	cp $< $@
	sed -i -ri -e "s|@@PREFIX@@|`pwd`|g" $@
	chmod 0400 $@

check: httpd.conf
	./test_parsegraph.sh
.PHONY: check

install:
	$(MAKE) kill
	$(MAKE) clean
	$(MAKE) run

test: httpd.conf
	test ! -e httpd.pid || exit 1
	httpd -X -f `pwd`/httpd.conf
.PHONY: test

debug: httpd.conf
	gdb httpd -ex "r -X -f `pwd`/httpd.conf"
.PHONY: debug

VALGRIND = valgrind -v --num-callers=40 --leak-check=full --trace-children=yes

checkvalgrind: httpd.conf
	$(VALGRIND) /usr/sbin/httpd -X -f `pwd`/httpd.conf
.PHONY: checkvalgrind

run: httpd.conf
	test ! -e httpd.pid || exit 1
	httpd -f `pwd`/httpd.conf
.PHONY: run

stop kill: httpd.pid
	kill -TERM `cat httpd.pid`
.PHONY: stop kill

clean:
	rm -f httpd.pid httpd.conf
.PHONY: clean
