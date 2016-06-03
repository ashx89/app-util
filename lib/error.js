function ApplicationError(err, req, res, next) {
	var error = {
		code: err.code,
		path: req.path,
		name: err.name || err.inner.name || err.message,
	};

	switch (err.name) {
	case 'UnauthorizedError':
		error.status = 401;
		error.title = 'Unauthorized';
		error.message = 'You need to be authenticated to use this resource';
		break;
	case 'JsonWebTokenError':
		error.status = 401;
		error.title = 'JsonWebTokenError';
		error.message = 'You need to be authenticated to use this resource';
		break;
	case 'EBADCSRFTOKEN':
		error.status = 403;
		error.title = 'Forbidden';
		error.message = err.message;
		break;
	default:
		return next(err);
	}

	return res.status(error.status).json(error);
}

ApplicationError.prototype = new Error();

module.exports = ApplicationError;
