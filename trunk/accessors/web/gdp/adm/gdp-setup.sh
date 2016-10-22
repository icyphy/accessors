#!/bin/sh

# This is a copy of gdp/adm/gdp-setup.sh which was written by Eric
# Allman and others.  To use the GDP, it is necessary to install
# certain packages.  This script has been modified to not install
# pandoc because pandoc has many dependencies.

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

#
#  Set up GDP environment for compilation
#
#	This is overkill if you're not compiling.
#

cd `dirname $0`/..
root=`pwd`
. $root/adm/common-support.sh

info "Setting up packages that are required by the GDP shared library."

info "Installing packages needed by GDP for $OS"

info "Updating the package database"
case "$PKGMGR" in
    "brew")
	brewUser=`ls -l $brew | awk '{print $3}'`
	# Only use sudo to update brew if the brew binary is owned by root.
	# This avoids "Cowardly refusing to 'sudo brew update'"
	if [ "$brewUser" = "root" ]; then
	    sudo brew update
	else
	    brew update
	fi
	;;

    "macports")
	sudo port selfupdate
	;;
esac


case "$OS" in
    "ubuntu" | "debian" | "raspbian")
	sudo apt-get update
	sudo apt-get clean
	package libdb-dev
	package libevent-dev
	package libevent-pthreads
	package libssl-dev
	package lighttpd
	package libjansson-dev
	package libavahi-common-dev
	package libavahi-client-dev
	package avahi-daemon
        echo "$0: No need to install pandoc unless you are updating the docs"
	# package pandoc
        echo "$0: Mosquitto is not usually needed at run time."
	#if ! ls /etc/apt/sources.list.d/mosquitto* > /dev/null 2>&1
	#then
	#	package software-properties-common
	#	info "Setting up mosquitto repository"
	# sudo apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
	#fi
	#package libmosquitto-dev
	#package mosquitto-clients
	;;

    "darwin")
	package libevent
	package openssl
	package lighttpd
	package jansson
        echo "$0: No need to install pandoc unless you are updating the docs"
	# package pandoc
	if [ "$PKGMGR" = "brew" ]
	then
                echo "$0: Mosquitto is not usually needed at run time."
		#package mosquitto
		warn "Homebrew doesn't support Avahi."
		info "Avahi is used for Zeroconf (automatic client"
		info "configuration.  Under Darwin, Avahi is difficult"
		info "to build without editing files.  To build gdp without"
		info "Zeroconf use 'make all_noavahi'"
	else
		package avahi
                echo "$0: Mosquitto is not usually needed at run time."
		#warn "Macports doesn't support Mosquitto: install by hand."
		#info "See https://mosquitto.org/ for instructions."
	fi
	;;

    "freebsd")
	package libevent2
	package openssl
	package lighttpd
	package jansson
	package avahi
        echo "$0: Mosquitto is not usually needed at run time."
	#package mosquitto
        echo "$0: No need to install pandoc unless you are updating the docs"
	# package hs-pandoc
	;;

    "gentoo" | "redhat")
	package libevent-devel
	package openssl-devel
	package lighttpd
	package jansson-devel
	package avahi-devel
        echo "$0: Mosquitto is not usually needed at run time."
	#package mosquitto
	warn "Yum doesn't support Pandoc: install by hand"
	;;

    "centos")
	package epel-release
	package libevent-devel
	package openssl-devel
	package lighttpd
	package jansson-devel
	package avahi-devel
        echo "$0: Mosquitto is not usually needed at run time."
	#package mosquitto
        echo "$0: No need to install pandoc unless you are updating the docs"
	# package pandoc
	;;

    *)
	fatal "$0: unknown OS $OS"
	;;
esac

# vim: set ai sw=8 sts=8 ts=8 :
