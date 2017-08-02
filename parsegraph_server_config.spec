Name: parsegraph_server_config

# Change all release values back to 1 when bumping to a new version
Version:	1
Release:	1%{?dist}
Summary:	Server configuration for parsegraph

Group:		Applications/Internet
License:	Proprietary
URL:		parsegraph.com
Source0:	parsegraph_server_config-1.tar.gz
BuildRoot:	%(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
BuildArch:	noarch
Requires:   parsegraph_user parsegraph_list inotify-tools

%description
Server configuration for parsegraph

%prep
%setup -q

%build

%check

%install
mkdir -p %{buildroot}/%{_sysconfdir}/httpd/parsegraph
install -m 0644 -t %{buildroot}/%{_sysconfdir}/httpd/parsegraph httpd.conf
pushd %{buildroot}/%{_sysconfdir}/httpd/parsegraph
ln -s ../modules %{buildroot}/%{_sysconfdir}/httpd/parsegraph/modules
ln -s ../logs %{buildroot}/%{_sysconfdir}/httpd/parsegraph/logs
ln -s ../run %{buildroot}/%{_sysconfdir}/httpd/parsegraph/run
popd

mkdir -p %{buildroot}/%{_sysconfdir}/lwsws/parsegraph
mkdir -p %{buildroot}/%{_sysconfdir}/lwsws/parsegraph/lwsws.d
install -m 0644 -t %{buildroot}/%{_sysconfdir}/lwsws/parsegraph lwsws/conf
install -m 0644 -t %{buildroot}/%{_sysconfdir}/lwsws/parsegraph/lwsws.d lwsws/conf.d/localhost
pushd %{buildroot}/%{_sysconfdir}/lwsws/parsegraph
ln -s ../plugins %{buildroot}/%{_sysconfdir}/lwsws/parsegraph/plugins
popd

%files
%{_sysconfdir}/*
