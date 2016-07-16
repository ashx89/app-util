var tap = require('tap');
var httpMock = require('node-mocks-http');

var paymentError = require('../index').paymentError;

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

var next = function onNext(data) {
	return (data) ? data : null;
};

tap.test('Check the mulitple error messages', function onError(t) {
	t.plan(7);

	var result;

	/**
	 * Stripe Card Error
	 */
	var stripeCardError = new Error('This is a card error');
	stripeCardError.type = 'StripeCardError';
	result = paymentError(stripeCardError, req, res, next());

	t.equal(result.getJson.title, 'Card Error', 'error message correct');

	/**
	 * Rate Limit Error
	 */
	var rateLimitError = new Error('This is a rate limit error');
	rateLimitError.type = 'RateLimitError';
	result = paymentError(rateLimitError, req, res, next());

	t.equal(result.getJson.title, 'Too Many Requests', 'error message correct');

	/**
	 * Stripe Invalid Request Error
	 */
	var stripeInvalidRequestError = new Error('This is an invalid request error');
	stripeInvalidRequestError.type = 'StripeInvalidRequestError';
	result = paymentError(stripeInvalidRequestError, req, res, next());

	t.equal(result.getJson.title, 'Request Error', 'error message correct');

	/**
	 * Stripe API Error
	 */
	var stripeApiError = new Error('This is an expired token error');
	stripeApiError.type = 'StripeAPIError';
	result = paymentError(stripeApiError, req, res, next());

	t.equal(result.getJson.title, 'API Error', 'error message correct');

	/**
	 * Stripe Connection Error
	 */
	var stripeConnectionError = new Error('This is aconnection error');
	stripeConnectionError.type = 'StripeConnectionError';
	result = paymentError(stripeConnectionError, req, res, next());

	t.equal(result.getJson.title, 'Connection Error', 'error message correct');

	/**
	 * Stripe Authentication Error
	 */
	var stripeAuthenticationError = new Error('This is aconnection error');
	stripeAuthenticationError.type = 'StripeAuthenticationError';
	result = paymentError(stripeAuthenticationError, req, res, next());

	t.equal(result.getJson.title, 'Authentication Error', 'error message correct');

	/**
	 * No Error set
	 */
	var uncapturedError = {};
	uncapturedError.code = 100;
	uncapturedError.type = 'no type set for error';
	uncapturedError.title = 'ApplicationError';
	result = paymentError(uncapturedError, req, res, next);

	t.equal(result.title, 'ApplicationError', 'unhandled error is given defaults. (In production, error is passed to the next error handler)');
	t.end();
});
