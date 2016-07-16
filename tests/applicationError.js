var tap = require('tap');
var httpMock = require('node-mocks-http');

var applicationError = require('../index').applicationError;

var req = httpMock.createRequest({
	method: 'GET'
});

/**
 * Allows for: res.status(200).json({})
 */
var Response = function onResponse() {};

Response.prototype.status = function onSetStatus(status) {
	this.getStatus = status;
	return this;
};

Response.prototype.json = function onSetJson(json) {
	this.getJson = json;
	return this;
};

var res = new Response();

var next = function onNext() {};

tap.test('Check the mulitple error messages', function onError(t) {
	t.plan(8);

	var result;

	/**
	 * Base Error
	 */
	var baseError = new Error('This is an error');
	result = applicationError(baseError, req, res, next());
	t.equal(baseError.name, 'Error', 'default error is an error object');
	t.equal(result.getJson.title, 'Bad Request', 'default error message correct');

	/**
	 * Unauthorized Error
	 */
	var unauthorizedError = new Error('This is an unauthorized error');
	unauthorizedError.name = 'UnauthorizedError';
	result = applicationError(unauthorizedError, req, res, next());

	t.equal(result.getJson.title, 'Unauthorized', 'error message correct');

	/**
	 * Json Web Token Error
	 */
	var jsonWebTokenError = new Error('This is a jsonwebtoken error');
	jsonWebTokenError.name = 'JsonWebTokenError';
	result = applicationError(jsonWebTokenError, req, res, next());

	t.equal(result.getJson.title, 'Access Token Error', 'error message correct');

	/**
	 * CSRF Token Error
	 */
	var badCsrfTokenError = new Error('This is a bad csrf token error');
	badCsrfTokenError.name = 'EBADCSRFTOKEN';
	result = applicationError(badCsrfTokenError, req, res, next());

	t.equal(result.getJson.title, 'Forbidden', 'error message correct');

	/**
	 * Token Expired Error
	 */
	var tokenExpiredError = new Error('This is an expired token error');
	tokenExpiredError.name = 'TokenExpiredError';
	result = applicationError(tokenExpiredError, req, res, next());

	t.equal(result.getJson.title, 'Access Token Error', 'error message correct');

	/**
	 * Validation Error
	 */
	var validationError = new Error('This is a validation error');
	validationError.name = 'ValidationError';
	validationError.errors = [{ message: 'This is a test error' }];
	result = applicationError(validationError, req, res, next());

	t.equal(result.getJson.title, 'Validation Error', 'error message correct');

	/**
	 * No Error set
	 */
	var uncapturedError = {};
	uncapturedError.code = 100;
	uncapturedError.title = 'no name set for error';
	result = applicationError(uncapturedError, req, res, next());

	t.equal(result.getJson.message, 'Invalid Request', 'unhandled error is given defaults');
	t.end();
});
