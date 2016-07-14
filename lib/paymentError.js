function PaymentError(err, req, res, next) {
	var error = {
		code: err.code,
		path: req.path
	};

	switch (err.type) {
	case 'StripeCardError':
		// A declined card error
		error.status = err.status;
		error.title = 'Card Error';
		error.message = err.message; // => e.g. "Your card's expiration year is invalid."
		break;
	case 'RateLimitError':
		error.status = err.status;
		error.title = 'Too Many Requests';
		error.message = err.message;
		break;
	case 'StripeInvalidRequestError':
		error.status = err.status;
		error.title = 'Request Error';
		error.message = err.message;
		break;
	case 'StripeAPIError':
		error.status = err.status;
		error.title = 'API Error';
		error.message = err.message;
		break;
	case 'StripeConnectionError':
		error.status = err.status;
		error.title = 'Connection Error';
		error.message = err.message;
		break;
	case 'StripeAuthenticationError':
		error.status = err.status;
		error.title = 'Authentication Error';
		error.message = err.message;
		break;
	default:
		error.title = 'ApplicationError';
		break;
	}

	if (error.title === 'ApplicationError') return next(err);

	return res.status(error.status).json(error);
}

PaymentError.prototype = new Error();

module.exports = PaymentError;
