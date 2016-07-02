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
	 * @param {object} expires. Contains `expiresIn` property
	 */
	create: function onTokenCreate(object, expires) {
		if (!expires) return new Error('Missing an expiry time.');

		return jwt.sign(object, process.env.SECRET, expires);
	},

	/**
	 * Get a token
	 * @param {object} req. Request data from express
	 * @param {string} key. Token to get from cookie
	 */
	get: function onGetToken(req, key) {
		return req.cookies[key] || null;
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
	 * Verify and decode token (non middleware)
	 * @param {object} token
	 * @param {function} callback
	 */
	decode: function onTokenDecode(token, callback) {
		jwt.verify(token, process.env.SECRET, function onTokenDecodeVerify(err, decode) {
			return callback(err, decode);
		});
	},

	/**
	 * Verify token
	 * @param {object} data from express
	 */
	verify: function onTokenVerify(req, res, next) {
		var tokenData = token.fetch(req);

		jwt.verify(tokenData, process.env.SECRET, function onTokenVerify(err, decode) {
			if (err) return next(err);
			req.decoded = decode;
			return next();
		});
	},

	/**
	 * Express middleware to check for token on route handlers
	 */
	require: function onTokenRequire() {
		return expressJwt({
			secret: process.env.SECRET,
			getToken: token.fetch
		}).unless({ path: token.config.unless });
	}
};

module.exports = token;
