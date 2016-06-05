var config = require('config');

var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

var token = {
	/**
	 * Set application configuration
	 * @param {object} config
	 */
	setConfig: function onSetConfig(config) {
		this.config = config;
	},

	/**
	 * Generate token
	 * @param {object} object. Data to sign to token
	 */
	create: function onTokenCreate(object, expires) {
		if (!expires) return new Error('Missing an expiry time.');

		return jwt.sign(object, process.env.SECRET, expires);
	},

	/**
	 * Fetch token
	 * @param {object} req. Request data from express
	 */
	fetch: function onTokenFetch(req) {
		if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
			return req.headers.authorization.split(' ')[1];
		} else if (req.query && req.query.token) {
			return req.query.token;
		} else if (req.cookies.user) {
			return req.cookies.user;
		}
		return null;
	},

	/**
	 * Verify token
	 * @param {object} req. Request data from express
	 */
	verify: function onTokenVerify(req, res, next) {
		var tokenData = this.fetch(req);

		jwt.verify(tokenData, process.env.SECRET, function onTokenDecode(err, decode) {
			if (err) return next(err);
			req.decoded = decode;
			return next();
		});
	},

	/**
	 * Express middleware to check for token on route handlers
	 */
	require: function onTokenRequire() {
		var self = this;

		return expressJwt({
			secret: process.env.SECRET,
			getToken: self.fetch
		}).unless({ path: self.config.get('unless') });
	}
};

module.exports = token;
