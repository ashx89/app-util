var path = require('path');
var s3 = require(global.__util_base + '/index.js').s3();

/**
 * Upload a file to a users account folder
 * @param {objects} options. { req:ExpressObject, folder:String, model:MongooseObject }
 * @param {function} callback
 */
var upload = function onImageUpload(options, callback) {
	if (!options.req ||
		!options.folder ||
		!options.model ||
		!options.model._id) return callback(new Error('Resource not found to be uploaded to'), null);

	var ext = path.extname(options.req.file.originalname);
	var req = options.req;
	var model = options.model;
	var folder = (options.folder.substr(-1) !== '/') ? options.folder += '/' : options.folder;
	var rootFolder = options.rootFolder || 'users/';

	var params = {
		ACL: 'public-read',
		Key: rootFolder + req.user._id + '/' + folder + model._id + ext,
		ContentType: options.req.file.mimetype,
	};

	model.image = req.user.resource + folder + model._id + ext;

	s3.upload(params, req.file.buffer, function onS3Upload(err, result) {
		if (err) return callback(err, null);

		model.image = result.Location;

		return callback(null, model.image);
	});
};

module.exports = upload;
