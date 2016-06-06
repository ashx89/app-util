function ApplicationError(err, req, res, next) {
	var errorName;

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
		error.title =  error.name = 'Access Token Error';
		error.message = 'You need to be authenticated to use this resource';
		break;
	case 'EBADCSRFTOKEN':
		error.status = 403;
		error.title = error.name = 'Forbidden';
		error.message = err.message;
		break;
	case 'TokenExpiredError':
		error.status = 401;
		error.title = error.name = 'Access Token Error';
		error.message = 'Access to this resource has expired. Please log in';
		break;
	case 'ValidationError':
		error.code = 'invalid_input';
		error.errors = [];
		error.status = 400;
		error.title = 'Validation Error';
		for (var i = 0; i < Object.keys(err.errors).length; i++) {
			errorName = Object.keys(err.errors)[i];
			error.errors.push({ message: err.errors[errorName].message, name: errorName });
		}
		break;
	case 'Error':
		error.status = 400;
		error.title = 'Bad Request';
		error.message = err.message;
		break;
	default:
		return next(err);
	}

	return res.status(error.status).json(error);
}

ApplicationError.prototype = new Error();

module.exports = ApplicationError;
