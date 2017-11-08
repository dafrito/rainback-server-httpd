Name: parsegraph_server_config

Version:	2.1
Release:	8%{?dist}
Summary:	Server configuration for parsegraph

Group:		Applications/Internet
License:	Proprietary
URL:		parsegraph.com
Source0:	parsegraph_server_config-2.1.tar.gz
BuildRoot:	%(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
BuildArch:	noarch
Requires:   parsegraph_user parsegraph_list inotify-tools parsegraph_server_config-base

%description
Server configuration for parsegraph

%package base
Summary:	Directory structure for parsegraph.com's data.

%description base
Directory structure for other projects.

%package all
Summary:	Package that includes everything for parsegraph.com.
Requires:	parsegraph_user_html parsegraph_user_json parsegraph_environment_html parsegraph_environment_ws parsegraph_doc anthonylispjs htmlgraph parsegraph_server_config environment_ws apr-util-sqlite parsegraph_index_html

%description all
Package that includes everything for parsegraph.com.

%prep
%setup -q

%build

%check

%install
mkdir -p %{buildroot}/%{_datarootdir}/parsegraph/httpd/conf
mkdir -p %{buildroot}/%{_sysconfdir}/httpd
mkdir -p %{buildroot}/%{_datarootdir}/parsegraph/static
mkdir -p %{buildroot}/%{_localstatedir}/log/parsegraph
install -m 0644 -t %{buildroot}/%{_datarootdir}/parsegraph/httpd/conf httpd.conf
pushd %{buildroot}/%{_datarootdir}/parsegraph/httpd
ln -s %{_sysconfdir}/httpd/modules %{buildroot}/%{_datarootdir}/parsegraph/httpd/modules
ln -s %{_sysconfdir}/httpd/logs %{buildroot}/%{_datarootdir}/parsegraph/httpd/logs
ln -s %{_sysconfdir}/httpd/run %{buildroot}/%{_datarootdir}/parsegraph/httpd/run
popd

mkdir -p %{buildroot}/%{_datarootdir}/parsegraph/lwsws
mkdir -p %{buildroot}/%{_datarootdir}/parsegraph/lwsws/conf.d
install -m 0644 -t %{buildroot}/%{_datarootdir}/parsegraph/lwsws lwsws/conf
install -m 0644 -t %{buildroot}/%{_datarootdir}/parsegraph/lwsws/conf.d lwsws/conf.d/localhost
pushd %{buildroot}/%{_datarootdir}/parsegraph/lwsws
ln -s %{_sysconfdir}/lwsws/plugins %{buildroot}/%{_datarootdir}/parsegraph/lwsws/plugins
popd

%files
%{_datarootdir}/parsegraph/*

%files base
%{_datarootdir}/parsegraph/
%{_datarootdir}/parsegraph/static
%{_localstatedir}/log/parsegraph

%files all
