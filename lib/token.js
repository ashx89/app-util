var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

function Token(config) {
	this.config = config;
}

/**
 * Generate token
 * @param {object} object. Data to sign to token
 */
Token.prototype.create = function onTokenCreate(object, expiry) {
	if (!expiry) return new Error('Missing an expiry time.');

	return jwt.sign(object, this.config.get('secret'), { expiresIn: expiry });
};

/**
 * Fetch token
 * @param {object} req. Request data from express
 */
Token.prototype.fetch = function onTokenFetch(req) {
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
		return req.headers.authorization.split(' ')[1];
	} else if (req.query && req.query.token) {
		return req.query.token;
	} else if (req.cookies.user) {
		return req.cookies.user;
	}
	return null;
};

/**
 * Verify token
 * @param {object} req. Request data from express
 */
Token.prototype.verify = function onTokenVerify(req, res, next) {
	var tokenData = this.fetch(req);

	jwt.verify(tokenData, this.config.get('secret'), function onTokenDecode(err, decode) {
		if (err) return next(err);
		req.decoded = decode;
		return next();
	});
};

/**
 * Express middleware to check for token on route handlers
 */
Token.prototype.require = function onTokenRequire() {
	var self = this;

	return expressJwt({
		secret: self.config.get('secret'),
		getToken: self.fetch
	}).unless({ path: self.config.get('unless') });
};

module.exports = function (options) {
	var config = options = {};
	var tokenInstance = new Token(config);
	return tokenInstance;
};
