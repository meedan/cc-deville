var gulp = require('gulp');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var server = require( 'gulp-develop-server' );


var pkg = require('./package.json');
var config = require('./config/config.js');

//run server 
gulp.task( 'server:start', function() {
 server.listen( { path: './server.js' } );
});

//restart server if *.js changed 
gulp.task( 'server:restart', function() {
 gulp.watch( [ './*.js' ], server.restart );
});

//
// nodemon
//
gulp.task('nodemon', function() {
	nodemon({
	    script: 'server.js'
	    , ext: 'js json'
	    , env: { 'NODE_ENV': 'development' }
	}
	       ).on('restart', 'lint')
});

// lint
gulp.task('lint', function() {
	return gulp.src('./**/*.js')
		.pipe(jshint())
		.on('error', ehandler)
});


var ehandler = function(err) { 
	console.log(err.message); 
}

