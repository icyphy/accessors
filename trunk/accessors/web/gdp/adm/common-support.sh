#!/bin/sh

# This is a copy of gdp/adm/common-support.sh which was written by Eric
# Allman and others.  To use the GDP it is necesary to install 
# certain packages.  The gdp-setup.sh script can do these installs.
# gdp-setup.sh calls this script.


# From the Ubiquitous Swarm Lab, 490 Cory Hall, U.C. Berkeley.

# Copyright (c) 2015-2016, Regents of the University of California.
# All rights reserved.

# Permission is hereby granted, without written agreement and without
# license or royalty fees, to use, copy, modify, and distribute this
# software and its documentation for any purpose, provided that the above
# copyright notice and the following two paragraphs appear in all copies
# of this software.

# IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
# SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
# PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION,
# EVEN IF REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
# FOR A PARTICULAR PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION,
# IF ANY, PROVIDED HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO
# OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS,
# OR MODIFICATIONS.

{ test -r /usr/local/etc/gdp.conf.sh && . /usr/local/etc/gdp.conf.sh; } ||
	{ test -r /etc/gdp.conf.sh && . /etc/gdp.conf.sh; }

#
#  These macros are intended to be sourced into other shell files
#

Reset='[0m'    # Text Reset

# Regular           Bold                Underline           High Intensity      BoldHigh Intens     Background          High Intensity Backgrounds
Bla='[0;30m';     BBla='[1;30m';    UBla='[4;30m';    IBla='[0;90m';    BIBla='[1;90m';   On_Bla='[40m';    On_IBla='[0;100m';
Red='[0;31m';     BRed='[1;31m';    URed='[4;31m';    IRed='[0;91m';    BIRed='[1;91m';   On_Red='[41m';    On_IRed='[0;101m';
Gre='[0;32m';     BGre='[1;32m';    UGre='[4;32m';    IGre='[0;92m';    BIGre='[1;92m';   On_Gre='[42m';    On_IGre='[0;102m';
Yel='[0;33m';     BYel='[1;33m';    UYel='[4;33m';    IYel='[0;93m';    BIYel='[1;93m';   On_Yel='[43m';    On_IYel='[0;103m';
Blu='[0;34m';     BBlu='[1;34m';    UBlu='[4;34m';    IBlu='[0;94m';    BIBlu='[1;94m';   On_Blu='[44m';    On_IBlu='[0;104m';
Pur='[0;35m';     BPur='[1;35m';    UPur='[4;35m';    IPur='[0;95m';    BIPur='[1;95m';   On_Pur='[45m';    On_IPur='[0;105m';
Cya='[0;36m';     BCya='[1;36m';    UCya='[4;36m';    ICya='[0;96m';    BICya='[1;96m';   On_Cya='[46m';    On_ICya='[0;106m';
Whi='[0;37m';     BWhi='[1;37m';    UWhi='[4;37m';    IWhi='[0;97m';    BIWhi='[1;97m';   On_Whi='[47m';    On_IWhi='[0;107m';

#################### FUNCTIONS ####################


# Error/Information messages
info() {
	echo "${Gre}${On_Bla}[INFO] $1${Reset}"
}

warn() {
	echo "${Yel}${On_Bla}[WARN] $1${Reset}"
}

fatal() {
	echo "${Whi}${On_Red}[FATAL] $1${Reset}"
	exit 1
}

# Create a directory as the user gdp
mkdir_gdp() {
	test -d $1 && return
	info "Creating $1 as ${GDP_USER}:${GDP_GROUP}"
	sudo mkdir -p $1
	sudo chmod ${2:-0755} $1
	sudo chown ${GDP_USER}:${GDP_GROUP} $1
}

package() {
    info "Checking package $1..."
    case "$OS" in
	"ubuntu" | "debian")
	    if dpkg --get-selections | grep --quiet $1; then
		info "$1 is already installed. skipping."
	    else
		sudo apt-get install -y $@
	    fi
	    ;;
	"centos" | "redhat")
	    if rpm -qa | grep --quiet $1; then
		info "$1 is already installed. skipping."
	    else
		sudo yum install -y $@
	    fi
	    ;;
	"darwin")
	    if [ -z "$pkgmgr" ]; then
		if type brew > /dev/null 2>&1 && [ ! -z "`brew config`" ]; then
		    pkgmgr=brew
		    brew=`which brew`
		    if [ -f $brew ]; then
			brewUser=`ls -l $brew | awk '{print $3}'`
			# Only use sudo to update brew if the brew binary is owned by root.
			# This avoids "Cowardly refusing to 'sudo brew update'"
			if [ "$brewUser" = "root" ]; then
			    sudo brew update
			else
			    brew update
			fi
		    fi
		fi
		if type port > /dev/null 2>&1 && port installed | grep -q .; then
		    if [ "$pkgmgr" = "brew" ]; then
			warn "You seem to have both macports and homebrew installed."
			fatal "You will have to deactivate one (or modify this script)"
		    else
			pkgmgr=port
			sudo port selfupdate
		    fi
		fi
		if [ -z "$pkgmgr" ]; then
		    warn "You must install macports or homebrew."
		    fatal "See README-compiling.md (Operating System Quirks) for details."
		fi
	    fi
	    if [ "$pkgmgr" = "brew" ]; then
		if brew list | grep --quiet $1; then
		    info "$1 is already installed. skipping."
		else
		    brew install --build-bottle $@ || brew upgrade $@
		fi
	    else
		if port -q installed $1 | grep -q "."; then
		    info "$1 is already installed. skipping."
		else
		    sudo port install $1
		fi
	    fi
	    ;;
	"freebsd")
	    export PATH="/sbin:/usr/sbin:$PATH"
	    if sudo pkg info -q $1; then
		info "$1 is already installed. skipping."
	    else
		sudo pkg install $@
	    fi
	    ;;
	"gentoo")
	    if equery list $1 >& /dev/null; then
		info "$1 is already installed. skipping."
	    else
		sudo emerge $1
	    fi
	    ;;
	*)
	    fatal "unrecognized OS $OS"
	    ;;
    esac
}

#################### END OF FUNCTIONS ####################

# configure defaults
: ${GDP_ROOT:=/usr}
if [ "$GDP_ROOT" = "/usr" ]
then
	: ${GDP_ETC:=/etc/gdp}
	: ${EP_PARAMS:=/etc/ep_adm_params}
elif [ "$GDP_ROOT" = "/usr/local" -o "$GDP_ROOT" = "/opt/local" ]
then
	: ${GDP_ETC:=$GDP_ROOT/etc/gdp}
	: ${EP_PARAMS:=/usr/local/etc/ep_adm_params}
else
	: ${GDP_ETC:=$GDP_ROOT/etc}
	: ${EP_PARAMS:=/usr/local/etc/ep_adm_params}
fi
: ${GDP_USER:=gdp}
: ${GDP_GROUP:=$GDP_USER}
: ${GDP_LOG_DIR:=/var/log/gdp}
: ${GDP_VAR:=/var/swarm/gdp}
: ${GDP_KEYS_DIR:=$GDP_ETC/keys}
: ${GDPLOGD_DATADIR:=$GDP_VAR/gcls}

OS=""
OSVER=""
INITguess=""

dot_to_int() {
	full=$1
	major=`echo $full | sed 's/\..*//'`
	full=`echo $full | sed -e 's/[^.]*//' -e 's/^\.//'`
	minor=`echo $full | sed 's/\..*//'`
	full=`echo $full | sed -e 's/[^.]*//' -e 's/^\.//'`
	patch=`echo $full | sed 's/\..*//'`
	test -z "$minor" && minor=0
	test -z "$patch" && patch=0
	printf "%02d%02d%02d" "$major" "$minor" "$patch"
}

###
###  figure out operating system and version number
###
if [ -f "/etc/os-release" ]; then
    . /etc/os-release
    OS="${ID-}"
    OSVER="${VERSION_ID-}"
fi
if [ -z "$OS" -a -f "/etc/lsb-release" ]; then
    . /etc/lsb-release
    OS="${DISTRIB_ID-}"
    OSVER="${DISTRIB_VERSION-}"
fi
if [ "$OS" ]; then
    # it is set --- do nothing
    true
elif [ -f "/etc/centos-release" ]; then
    OS="centos"
    #OSVER=???
elif [ -f "/etc/redhat-release" ]; then
    OS="redhat"
    OSVER=`sed -e 's/.* release //' -e 's/ .*//' /etc/redhat-release`
else
    OS=`uname -s`
fi
OS=`echo $OS | tr '[A-Z]' '[a-z]'`
if [ "$OS" = "linux" ]; then
    OS=`head -1 /etc/issue | sed 's/ .*//' | tr '[A-Z]' '[a-z]'`
elif [ "$OS" = "darwin" ]; then
	OSVER=`sw_vers |
		sed -e '/ProductVersion:/!d' -e 's/^.*[ 	][ 	]*//'`
elif [ "$OS" = "freebsd" ]; then
	_major=`uname -r | sed -e 's/\..*//'`
	_minor=`uname -r | sed -e 's/[0-9]*\.//' -e 's/-.*//'`
	OSVER=`printf "%02d%02d00" "$_major" "$_minor"`
fi

if [ -z "$OSVER" ]; then
    OSVER="0"
else
    # clean up OSVER to make it a single integer
    OSVER=`dot_to_int $OSVER`
fi

# check to make sure we understand this OS release
case $OS in
  "debian")
	if expr $OSVER \< 80000 > /dev/null
	then
		fatal "Must be running Debian 8 (Jessie) or later (have $VERSION_ID)"
	fi
	;;

  "ubuntu")
	if expr $OSVER \< 140400 > /dev/null
	then
		fatal "Must be running Ubuntu 14.04 or later (have $VERSION_ID)"
	fi
	if expr $OSVER \>= 160400 > /dev/null
	then
		INITguess=systemd
	else
		INITguess=upstart
	fi
	;;

  "redhat")
	if expr $OSVER \< 070000 > /dev/null
	then
		INITguess=systemd
	else
		INITguess=upstart
	fi
esac

# determine what init system we are using (heuristic!)
if [ -z "$INITguess" ]
then
	case $OS in
	  "debian" | "ubuntu" | "centos" | "redhat" | "gentoo")
		# some linux variant; see if we can figure out systemd
		proc1exe=`sudo stat /proc/1/exe | grep 'File: '`
		if echo "$proc1exe" | grep -q "systemd"
		then
			INITguess="systemd"
		fi
		;;
	esac
fi
test -z "$INITguess" && INITguess="unknown"

# see if we should use our guess
test -z "$INITSYS" && INITSYS=$INITguess

info "System Info: OS=$OS, OSVER=$OSVER, INITSYS=$INITSYS"
