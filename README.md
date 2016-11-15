# Postman - RedLine13 Integration

You can run any Postman collection on RedLine13 as a performance test with this custom test type.  This can be tested locally using the test harness (https://github.com/redline13/harness-custom-test-nodejs) or directly on RedLine13 at scale.

### Step 1 Modify test for your collection and data.
- Modify CustomTest.js in the constuctor to override the defaults. These options are the API options defined in newman (https://github.com/postmanlabs/newman#api-reference)
	- this.newmanCollection = './Echo.postman_collection';
		- Specify the collection file that you will be attaching to the test. The file will be in the same directory which test is run from, use ./COLLECTION
	- this.newmanEnvironment = null;
		- Specify environment file (or url to environment file)
	- this.newmanGlobals = null;
		- Postman Global Variables can be optionally passed on to a collection run in form of path to a file or URL.
	- this.newmanIterations = 1;
		- Specify the number of iterations to run on the collection. 

### Step 2 Package your test
- We require the package.json which is provided and includes newman.  For this reason we need to package our test run. 

	```tar cvf postman.tar CustomTest.js Echo.postman_collection package.json```
- Include your test(CustomTest.js), collection(Postman collection), package.json

### Step 3 Run your test.
- Login to https://www.redline13.com/Service 
	- RedLine13 enables load tests on your cloud, you need to first setup AWS Keys.
	- This test requires the NVM plugin, add to your account @ https://www.redline13.com/Account/plugins
- Start test
- Select Custom test
- Click Upload Custom and select the tar we packaged earlier
- Select # of users to simulate 
- Required: Advanced Custom Test Options
	- Select plugin "Node Version Manager"
		- Select 6.* as the node version
		- Note: the Load Agent Language should have changed to Node.js
- Optional: Modify Advanced Cloud Options to control # and location of servers.
- Optional: Name your test.
- Start test

Questions, Feedback, Requests - info@redline13.com
