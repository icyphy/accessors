#!/bin/bash -e
# Update the PTII libraries.
# This script is probably not that useful to most people.
# $Id$

if [ "`uname -s`" != "Darwin" ]; then
    echo "$0: Must be run under Mac OS X because we need to build there and then ssh to RHEL and Linux."
fi

# echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
# echo "@@@@: $0: About to build locally"
# gdpVersion=`cat $PTII/vendors/gdp/gdp/git-version.txt`
# # Build locally
# export PKGMGR=brew
# $PTII/org/terraswarm/accessor/accessors/web/gdp/adm/gdpBuildDevelEnvironment.sh
# (cd $PTII/lib; svn commit -m "Updated gdp libraries on Darwin to $gdpVersion" libgdp*)

echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
echo "@@@@: $0: About to build on wessel"
ubuntuPTII=/home/cxh/src/ptII11.0.devel
ubuntuAccessors=$ubuntuPTII/org/terraswarm/accessor/accessors/web
# Update so that we get the Darwin libraries to be included in the GDP jar file and eventually the @ubuntuswarm/accessors module.
ssh wessel.eecs.berkeley.edu "(cd $ubuntuPTII; svn update --accept theirs-full)"
ssh wessel.eecs.berkeley.edu "(cd $ubuntuAccessors; svn update --accept theirs-full)"
ssh wessel.eecs.berkeley.edu "export PTII=$ubuntuPTII; $ubuntuAccessors/gdp/adm/gdpBuildDevelEnvironment.sh"
ssh wessel.eecs.berkeley.edu "(cd $ubuntuPTII/lib; svn commit -m \"Updated gdp libraries on Ubuntu to $gdpVersion\" libgdp*)"

# Build on terra last so that libgdp uses an older version of libgc
echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
echo "@@@@: $0: About to build on terra"
terraPTII=/home/cxh/src/ptII
terraAccessors=$terraPTII/org/terraswarm/accessor/accessors/web
# # Update so that we get the Darwin libraries to be included in the GDP jar file and eventually the @terraswarm/accessors module.
ssh terra.eecs.berkeley.edu "(cd $terraPTII; svn update --accept theirs-full)"
ssh terra.eecs.berkeley.edu "(cd $terraAccessors; svn update --accept theirs-full)"
ssh terra.eecs.berkeley.edu "$terraAccessors/gdp/adm/gdpBuildDevelEnvironment.sh"
ssh terra.eecs.berkeley.edu "(cd $terraPTII/lib; svn commit -m \"Updated gdp libraries on RHEL to $gdpVersion\" libgdp*rhel* gdp*.jar linux-x86-64-rhel)"

echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
echo "@@@@: $0: Rebuilding locally to get updated libraries"
(cd $PTII/lib; svn update --accept theirs-full)
$PTII/org/terraswarm/accessor/accessors/web/gdp/adm/gdpBuildDevelEnvironment.sh

echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
echo "@@@@: $0:  Get the most recent package.json and update the version number"
(cd $PTII/vendors/gdp/gdp; git checkout lang/js/package.json)
awk '{ if ($0 ~ /"version":/) {
           split($2, f, "."); 
           version = substr(f[3], 1, length(f[3]) -2);
           version++;
           print "    \"version\": " f[1] "." f[2] "." version "\",";
       } else {
           print $0;
       }    
}' $PTII/vendors/gdp/gdp/lang/js/package.json > $PTII/vendors/gdp/gdp/lang/js/package.json.tmp

# diff $PTII/vendors/gdp/gdp/lang/js/package.json  $PTII/vendors/gdp/gdp/lang/js/package.json.tmp

grep version $PTII/vendors/gdp/gdp/lang/js/package.json  $PTII/vendors/gdp/gdp/lang/js/package.json.tmp

mv $PTII/vendors/gdp/gdp/lang/js/package.json.tmp  $PTII/vendors/gdp/gdp/lang/js/package.json

cat <<EOF
Now run:
cd $PTII/vendors/gdp/gdp/lang/js
npm login
        Username: terraswarm
        Password: See ~terra/.npmpass on terra
        Email: terraswarm-software@terraswarm.org 
npm publish --access public

git commit -m "Updated @terraswarm/gdp node module to gdp version $gdpVersion" package.json
git push
EOF
