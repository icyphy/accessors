#!/bin/bash -e
# Update the PTII libraries.
# This script is probably not that useful to most people.
# $Id$

if [ "`uname -s`" != "Darwin" ]; then
    echo "$0: Must be run under Mac OS X because we need to build there and then ssh to RHEL and Linux."
fi

gdpVersion=`cat $PTII/vendors/gdp/gdp/git-version.txt`
# Build locally
$PTII/org/terraswarm/accessor/accessors/web/gdp/adm/gdpBuildDevelEnvironment.sh
(cd $PTII/lib; svn commit -m "Updated gdp libraries on Darwin to $gdpVersion" libgdp*)

ssh terra "(cd /home/cxh/src/ptII/org/terraswarm/accessors/web; svn update)"
ssh terra "(/home/cxh/src/ptII/org/terraswarm/accessor/accessors/web/gdp/adm/gdpBuildDevelEnvironment.sh"


