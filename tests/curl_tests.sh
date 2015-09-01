#!/bin/bash

# the objectives here

# source dip and other commands
. ~/.docker_bash_aliases;

# assumes a docker instance called `bcapi`
IP=$(dip ccdeville);

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

function commonTests () {

    URL="https://meedan.com/css/screen.css"
    
    echo "status $URL";
    curl -i -s --header "x-cc-deville-token: testing123" "http://$IP//status?url=${URL}" # | python -mjson.tool # | grep timestamp

    sleep 5;

    echo "status $URL";
    curl -i -s --header "x-cc-deville-token: testing123" "http://$IP//status?url=${URL}" # | python -mjson.tool # | grep timestamp
    
    sleep 5;
    
    echo "purge $URL";
    curl -X "DELETE" -i -s --header "x-cc-deville-token: testing123" "http://$IP//purge?url=${URL}" # | python -mjson.tool # | grep timestamp

    sleep 5;

    echo "status $URL";
    curl -i -s --header "x-cc-deville-token: testing123" "http://$IP//status?url=${URL}" # | python -mjson.tool # | grep timestamp

}

# getTests
commonTests
