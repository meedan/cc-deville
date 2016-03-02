#!/bin/bash

# the objectives here

# source dip and other commands
. ~/.docker_bash_aliases;

# assumes a docker instance called `ccdeville`
IP=$(dip ccdeville):8080;

SLEEP=1;

echo -e "\n testing $IP \n";

#
# GET
#
function getTests () {

	GETS="/healthcheck
	/ping"
	
	for G in $GETS
	do
	    echo -e "\t$G\n";
	
	    curl --header "x-cc-deville-token: testing123" -i http://$IP/$G
	    echo -e "\n";
	done


}

function _status () {
	local URL=$1
    echo "status $URL";
    curl -s --header "x-cc-deville-token: testing123" "http://$IP//status?url=${URL}" | python -mjson.tool | grep -i -e cache_status -e age -e name
    # curl -s --header "x-cc-deville-token: testing123" "http://$IP//status?url=${URL}" | python -mjson.tool 
}

function purge () {

    #    URL="https://meedan.com/css/screen.css"
    URL="https://ooew-bridge.meedan.com/stylesheets/bridge.css"
    DOMAIN=ooew-bridge.meedan.com

    _status $URL;
    
	echo -e "\n";
    sleep $SLEEP;
    
    echo "purge $URL";
    curl -X "DELETE" -i -s --header "x-cc-deville-token: testing123" "http://$IP//purge?url=${URL}" 
	echo -e "\n";
    sleep $SLEEP;

    _status $URL;


}

function purge_all () {

    URL="https://meedan.com/css/screen.css"
    DOMAIN=meedan.com
    
    _status $URL;
    
    sleep $SLEEP;
    
	echo -e "\n";
    echo "purge all $DOMAIN";
    curl -X "DELETE" -i -s --header "x-cc-deville-token: testing123" "http://$IP//purgeall?domain=${DOMAIN}" 
    
	echo -e "\n";
    sleep $SLEEP;

    _status $URL;

	echo -e "\n";
}

#getTests
purge
purge_all



