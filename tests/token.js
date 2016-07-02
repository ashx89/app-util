var tap = require('tap');
var httpMock = require('node-mocks-http');

var token = require('../index').token;
var config = [
	'/path/token/free'
];

var req = httpMock.createRequest({
	method: 'GET',
	cookies: { token: 'this-is-a-token', user: 'this-is-a-user-token' }
});

tap.test('Check token object methods', function onToken(t) {
	/**
	 * Token creation
	 */
	var createToken = token.create({ token: 'new-token' }, { expiresIn: 1000 });
	tap.true(createToken);

	/**
	 * Decode created token
	 */
	token.decode(createToken, function onDecode(err, decode) {
		tap.false(err);
		tap.equal(decode.token, 'new-token', 'decoded token is same as create token');
	});

	/**
	 * Retrieve token from cookie
	 */
	var cookieToken = token.get(req, 'token');
	var notCookieToken = token.get(req, 'not-a-token');
	t.equal(cookieToken, 'this-is-a-token', 'the token exists in the cookie');
	t.equal(notCookieToken, null, 'the token does not exist in the cookie');

	/**
	 * Get the user token
	 */
	var userToken = token.fetch(req);
	t.equal(userToken, 'this-is-a-user-token', 'the user token is fetchable');

	/**
	 * Check for token middleware function
	 */
	token.setConfig(config);
	var middlewareToken = token.require(req);
	t.equal(typeof middlewareToken, 'function', 'can use token as middleware');

	t.end();
});
