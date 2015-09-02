
# cc-deville API

a Cache Clearing service named after the lead guitarist of [Poison](https://en.wikipedia.org/wiki/Poison_%28American_band%29).

I never want my cache to [Talk Dirty To Me](https://www.quora.com/What-does-dirty-mean-in-the-context-of-caching), [I Want Action](), immediate action from my caches and backends, and my caches should say "[I Won't Forget You]()" except when they should.

cc-deville is a REST API which allows for cache management, mostly cache clearing and cache status.

Give it a URL and it will figure out which cache service to clear.

Currently supports:

 * cloudflare
 * varnish3
 * varnish4 

## all requests

all requests should include the following authorization header:

	X-cc-deville-token: GAt3MosxrfoYSAR2sOuG0NoC4VUqUsIT


## DELETE /purge?url=$url

### responses:

success...

	HTTP 201 Created

failure...

	HTTP 404 Not Found

## DELETE /purgeall?domain=$domain

### responses:

success...

	HTTP 201 Created

failure...

	HTTP 404 Not Found

## GET /status?url=$url

all requests
	HTTP 200 OK
	
	{
	    "apiVersion": "0.0.1",
	    "data": {
	        "caches": [
	            {
	                "age": "0",
	                "cache_control": "max-age=3600",
	                "cache_status": "MISS",
	                "etag": "\"127-15535-Tue Sep 01 2015 09:14:29 GMT+0000 (UTC)\"",
	                "http_code": 200,
	                "last_modified": "Tue, 01 Sep 2015 09:14:29 GMT",
	                "name": "varnish-live",
	                "orbit": 5
	            },
	            {
	                "cache_control": "public, max-age=14400",
	                "cache_status": "MISS",
	                "etag": "\"127-15535-Tue Sep 01 2015 09:14:29 GMT+0000 (UTC)\"",
	                "expires": "Wed, 02 Sep 2015 17:46:10 GMT",
	                "http_code": 200,
	                "last_modified": "Tue, 01 Sep 2015 09:14:29 GMT",
	                "name": "cloudflare",
	                "orbit": 10
	            }
	        ],
	        "url": "https://meedan.com/css/screen.css"
	    },
	    "time": 1441201570201,
	    "type": "cache_status"
	}


![cc-deville](./cc-deville.jpg)