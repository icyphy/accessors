#!/bin/sh
# $Id$

# gdpBuildDevelEnvironement - a script that downloads and builds the Global Data Plane
# (GDP).

# To use the GDP, it is not necessary to run this script.

# Instead, run gdp-setup.sh, which will install the packages needed by
# the libgdp* shared library.

# Run this script if you want to develop the GDP on your local machine.

# Scripts are set up that will allow a local copy of the gdp to run
# without root access.

# This script requires read access to the GDP repository.  To get
# access, contact Eric Allman (eric@cs.berkeley.edu)

# This script is platform independent.

echo "-------"
echo "$0: This script downloads the GDP and GDP Router sources."

echo "    It is only necessary to run this script if you want to develop the GDP."

echo "    If you only want to use the GDP, the run accessors/web/gdp/adm/gdp-setup.sh"

echo "-------"

if [ ! -z "$PTII" ]; then
   sourceDirectory=$PTII/vendors/gdp
else
   sourceDirectory=~/src
fi   

######
# Check out the gdp and gdp router repos.

gdpSource="$sourceDirectory/gdp"
gdpRouterSource="$sourceDirectory/gdp_router"

if [ ! -d "$gdpSource" ]; then
    echo "#### $0: Checking out the gdp repo by creating $gdpSource"
    mkdir -p `dirname $gdpSource`
    (cd `dirname $gdpSource`; git clone https://repo.eecs.berkeley.edu/git/projects/swarmlab/gdp.git)
else 
    echo "#### $0: Running git pull in $gdpSource"
    (cd "$gdpSource"; git pull)
fi

if [ ! -d "$gdpSource" ]; then
   echo "$0: Could not create $gdpSource"
   echo "To get access, email Eric Allman (eric@cs.berkeley.edu)"
fi

echo "#### $0: Building in $gdpSource"
(cd "$gdpSource"; make clean all_noavahi)

echo "#### $0: Building in $gdpSource/lang/java"
(cd "$gdpSource"/lang/java; make clean install)


gdpJar=`ls -1 $gdpSource/lang/java/gdp-*.jar | tail -1`
gdpPtIIJar=`ls -1 $PTII/lib/gdp-*.jar | tail -1`

if [ -f "$gdpJar" -a -f "$gdpPtIIJar" ]; then
    echo "#### $0: Updating $gdpPtIIJar"
    ls -l "$gdpJar" "$gdpPtIIJar"
    cp "$gdpJar" "$gdpPtIIJar"
fi    

case "`uname -s`" in
    Darwin)
        gdpLib=`ls -1t $gdpSource/libs/libgdp*.dylib | tail -1`
        gdpjsLib=`ls -1t $gdpSource/lang/js/libs/libgdpjs*.dylib  | tail -1`
        gdpPtIILib=`ls -1t $PTII/lib/libgdp*.dylib | grep -v libgdpjs | tail -1`
        gdpjsPtIILib=`ls -1t $PTII/lib/libgdpjs*.dylib | tail -1`
        ;;
    Linux)
        gdpLib=`ls -1t $gdpSource/libs/libgdp*.so | tail -1`
        gdpjsLib=`ls -1t $gdpSource/lang/js/libs/libgdpjs*.so  | tail -1`
        gdpjsPtIILib=`ls -1t $PTII/lib/libgdpjs*.so | tail -1`
        if [ -f /etc/redhat-release ]; then
	    echo "$0: saw /etc/redhat_release"
            gdpPtIILib=`ls -1t $PTII/lib/linux-x86-64-rhel/libgdp*.so | grep -v libgdpjs | tail -1`
        else
	    echo "$0: did not find /etc/redhat_release"
            gdpPtIILib=`ls -1t $PTII/lib/libgdp*.so | grep -v libgdpjs | tail -1`
        fi
        ;;
    *)
        echo "$0: Don't support `uname -s`."
        exit 2
        ;;
esac

if [ -f "$gdpLib" -a -f "$gdpPtIILib" ]; then
    echo "#### $0: Updating $gdpPtIILib"
    ls -l "$gdpLib" "$gdpPtIILib"
    cp "$gdpLib" "$gdpPtIILib"
else 
    echo "### $0: Could not update gdp lib: $gdpPtIILib:"
    ls -l "$gdpLib" "$gdpPtIILib"
    exit 3
fi    

if [ -f "$gdpjsLib" -a -f "$gdpjsPtIILib" ]; then
    echo "#### $0: Updating $gdpjsPtIILib"
    ls -l "$gdpjsLib" "$gdpjsPtIILib"
    cp "$gdpjsLib" "$gdpjsPtIILib"
else 
    echo "### $0: Could not update gdpjs lib: $gdpjsPtIILib:"
    ls -l "$gdpjsLib" "$gdpjsPtIILib"
    exit 3
fi    

if [ ! -d "$gdpRouterSource" ]; then
   echo "#### $0: Checking out the gdp_router repo and create $gdpRouterSource."
   mkdir -p `dirname $gdpRouterSource`
   (cd `dirname $gdpRouterSource`; git clone https://repo.eecs.berkeley.edu/git/projects/swarmlab/gdp_router.git)
else
    echo "#### $0: Running git pull in $gdpRouterSource"
    (cd "$gdpRouterSource"; git pull)
fi

echo "#### $0: svn status $PTII/lib:"
svn status $PTII/lib

######
# Create the ep_adm_params directory.
# When running, we set the EP_PARAM_PATH variable.

EP_ADM_PARAMS=$sourceDirectory/ep_adm_params

if [ ! -d "$EP_ADM_PARAMS" ]; then
   mkdir -p "$EP_ADM_PARAMS"
fi

echo "swarm.gdp.routers=localhost" > "$EP_ADM_PARAMS/gdp"
echo "swarm.gdp.catch.sigint=true" >> "$EP_ADM_PARAMS/gdp"
echo "swarm.gdp.catch.sigterm=true" >> "$EP_ADM_PARAMS/gdp"

# Use a separate directory to hold the logs.

######
# The default directory is /var/swarm/gdp/gcls, which must be created
# by root, but owned by the user that runs the gdplogd process.
# Instead, we use a separate log directory

GCLS=$sourceDirectory/gcls

if [ ! -d "$GCLS" ]; then
    mkdir -p "$GCLS"
fi
echo "swarm.gdplogd.gcl.dir=$GCLS" > "$EP_ADM_PARAMS/gdplogd"

######
# Create the script that will start up a local copy of the necessary daemons

gdpStartup="$gdpSource/gdpStartup"

echo "#### $0: creating $gdpStartup"

cat > "$gdpStartup" <<EOF
#!/bin/sh
# gdpStartup script, created by $0
# Usage: $gdpStartup &
#   When the script ends, the subprocesses should be killed

# This determines where we look for the gdp and gdplogd configuration files
export EP_PARAM_PATH=$EP_ADM_PARAMS

# Start the router
pkill -u $USER python ./src/gdp_router.py
cd "$gdpRouterSource"
python ./src/gdp_router.py -l "$gdpRouterSource/routerLog.txt" &
routerPid=\$!

# Sleep so that the router can start up completely
sleep 5

# Start gdplogd
pkill -u \$USER gdplogd
cd "$gdpSource"; ./gdplogd/gdplogd -F -N `hostname` &
logdPid=\$!

# When this script is interrupted, kill the subprocesses.
trap "kill \$routerPid \$logdPid; pkill -9 -u \$USER gdplogd" INT


echo "IMPORTANT! To run using the local settings set the EP_PARAM_PATH variable with this command:"
echo "   export EP_PARAM_PATH=$EP_ADM_PARAMS"

echo "To create a log use this command: "
echo "   $gdpSource/apps/gcl-create  -s `hostname` -k none log1"

echo "Sleeping.  Typically this script is run in the background.  'kill %1' will terminate subprocs"
sleep 9999999

EOF

chmod a+x $gdpStartup

