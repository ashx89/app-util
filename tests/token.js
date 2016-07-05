var tap = require('tap');
var httpMock = require('node-mocks-http');

var token = require('../index').token;
var config = ['/path/token/free'];

var req = httpMock.createRequest({
	method: 'GET',
	headers: {},
	query: {},
	path: '/path/token/free',
	cookies: { token: 'this-is-a-token', user: 'this-is-a-user-token' }
});

var res = httpMock.createResponse();

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
	req.headers.authorization = 'Bearer this-is-a-user-token';
	t.equal(token.fetch(req), 'this-is-a-user-token', 'bearer token fetchable');
	req.headers.authorization = null;

	req.query.token = 'this-is-a-user-token';
	t.equal(token.fetch(req), 'this-is-a-user-token', 'query token fetchable');
	req.query.token = null;

	var userToken = token.fetch(req);
	t.equal(token.fetch(req), 'this-is-a-user-token', 'cookie token fetchable');
	req.cookies.user = null;
	t.equal(token.fetch(req), null, 'no token set');

	/**
	 * Check if config have been set
	 */
	token.setConfig(config);
	t.equal(token.config, config, 'token configuration has been set');

	/**
	 * Check if middleware is available
	 */
	var tokenMiddleware = token.require();
	t.equal(typeof tokenMiddleware, 'function', 'token middleware exists');

	/**
	 * Verify token
	 */
	req.cookies.user = createToken; // set cookie to a jwt string
	token.verify(req, res, function onNext(err) {
		t.equal(req.decoded.token, 'new-token', 'middleware verification correct');
		t.end();
	});
});
