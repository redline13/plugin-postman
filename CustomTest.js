var fs = require('fs');
var newman = require('newman');

/**
 * Required to accept parameters from test harness.
 * @param redlineApi handle to API object
 * @param testNum # number of test user
 * @param rand identifier for test
 * @param config config object loaded from loadtest.ini
 */
function PostmanTest(redlineApi, testNum, rand, config)
{
	// We need Redline API to report results, errors, requests.
	this.redlineApi = redlineApi;

	// Keep track of test information.
	this.testNum = testNum;
	this.rand = rand;

	// This is the test configuration file (loadtest.ini)
	this.config = config;

	// Specify postman/newman options.
	this.newmanCollection = './Echo.postman_collection';
	this.newmanEnvironment = null;
	this.newmanGlobals = null;
	this.newmanIterations = 10;
}

/** 
 * Run test and invoke callback on success/failure
 */
PostmanTest.prototype.runTest = function( redlineCallback )
{
	var that = this;
	var items = {};

	// Make request after timeout
	setTimeout(function() {

		newman.run({
			collection: that.newmanCollection,
			environment: that.newmanEnvironment,
			globals: that.newmanGlobals,
			iterationCount: that.newmanIterations,
			reporters: ['cli','html'],
			reporter: {html:{export:'output/report.html'}},
			noColor: true
		},function(error, summary){
			console.log( error );
			redlineCallback(false);
		})
		.on( 'beforeItem', function( err, args ){
			items[args.cursor.ref] = {};
		})
		.on( 'beforeRequest', function( err, args ){
			items[args.cursor.ref].start = Date.now();
		})
		.on( 'request', function( err, args ){
			items[args.cursor.ref].response = args.response;
			items[args.cursor.ref].end = Date.now();
		})
		.on( 'assertion', function( err, args ){
			if ( err ) {
				if ( !items[args.cursor.ref].errors ){
					items[args.cursor.ref].errors = [];
				} 
				items[args.cursor.ref].errors.push( err );
			}
		})
		.on( 'item', function( err, args ){
			var name = '';
			var url = '';
			name = args.item.name;
			if (args.item.request && args.item.request.url){
				url = args.item.request.url;
			}
			
			var isError = false;
			var time = items[args.cursor.ref].end - items[args.cursor.ref].start;
			var resTime =  items[args.cursor.ref].response.responseTime;
			
			var resCode = items[args.cursor.ref].response.code;
			var resStatus = items[args.cursor.ref].response.status;
			if ( items[args.cursor.ref].errors ){
				isError = true;
				var resError = '';
				items[args.cursor.ref].errors.forEach(function(err,index){
					that.redlineApi.recordError(err.message, items[args.cursor.ref].end / 1000);
				})
			}
			var kb = items[args.cursor.ref].response.responseSize || 0;
			
			that.redlineApi.recordURLPageLoad(name, items[args.cursor.ref].end / 1000, resTime/1000, isError, kb);
			delete items[args.cursor.ref];
		})
		.on( 'exception', function( err, args ){
			that.redlineApi.recordError("Exception in Newman " + args.cursor, Date.now() / 1000 );
			redlineCallback(true);
		})
	}, 1 );
};

// Required Export for Test to be loaded and executed.
module.exports = PostmanTest;
