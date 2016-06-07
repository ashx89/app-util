var AWS = require('aws-sdk');

var AWS_REGION = 'eu-west-1';

var HTTP_TIMEOUT = 120000;

/**
 * Check if string has been JSON.stringified
 * @private
 * @param {string} string
 */
function isJson(string) {
	try {
		JSON.parse(string);
	} catch (e) {
		return false;
	}
	return true;
}

/**
 * @private
 * @constructor
 * @param {object} options
 */
function S3Interface(options) {
	var awsOptions = {
		region: AWS_REGION,
		sslEnabled: true,
		httpOptions: {
			timeout: HTTP_TIMEOUT
		}
	};

	var sdk = (options.aws) ? options.aws : AWS;

	sdk.config.update(awsOptions);

	this.s3Options = {
		Bucket: options.bucket || process.env.S3_BUCKET || ''
	};

	this.s3 = new sdk.S3(this.s3Options);
	this.kms = new sdk.KMS();
}

/**
 * Return S3 Bucket
 */
S3Interface.prototype.getBucket = function onGetBucket() {
	return this.s3Options.Bucket;
};

/**
 * List objects from S3
 * @param {object} options - { prefix:String, marker:String, maxKeys:Number }
 * @param {function} callback
 */
S3Interface.prototype.listObjects = function onList(options, callback) {
	var params = {
		Bucket: this.s3Options.Bucket,
		Delimiter: '/',
		Prefix: (options.prefix.substr(-1) !== '/') ? options.prefix += '/' : options.prefix,
		Marker: options.marker,
		MaxKeys: options.maxKeys
	};

	this.s3.listObjects(params, function onListObject(err, result) {
		return callback(err, result);
	});
};

/**
 * Load object from S3
 * @param {string} resource
 * @param {object} options - { toString:Boolean, toJson:Boolean }
 * @param {function} callback
 */
S3Interface.prototype.fetch = function onFetch(resource, options, callback) {
	var params = {
		Bucket: this.s3Options.Bucket,
		Key: resource
	};

	this.s3.getObject(params, function onGetObject(err, result) {
		if (err) return callback(err, null);

		var data = (options.toString) ? result.Body.toString() : result.Body;

		if (options.toJson) {
			data = (isJson(data)) ? JSON.parse(data) : data;
		}

		return callback(err, data);
	});
};

/**
 * Load data as JSON Facade
 * @param {string} resource
 * @param {function} callback
 */
S3Interface.prototype.fetchJson = function onFetchJson(resource, callback) {
	this.fetch.call(this, resource, { toString: true, toJson: true }, callback);
};

/**
 * Fetch Alias
 */
S3Interface.prototype.loadFromS3 = S3Interface.prototype.fetch;

/**
 * Delete object from S3
 * @param {string} resource
 * @param {object} objects
 * @param {function} callback
 */
S3Interface.prototype.delete = function onDelete(objects, callback) {
	var params = {
		Bucket: this.s3Options.Bucket,
		Delete: {
			Objects: objects,
			Quiet: false
		}
	};

	this.s3.deleteObjects(params, function onDeleteObjects(err, result) {
		return callback(err, result);
	});
};

S3Interface.prototype.deleteFromS3 = S3Interface.prototype.delete;

/**
 * Save object to S3
 * @param {string} resource
 * @param {object} data
 * @param {function} callback
 */
S3Interface.prototype.save = function onSave(resource, data, callback) {
	var params = {
		Bucket: this.s3Options.Bucket,
		Key: resource,
		Body: isJson(data) ? data : JSON.stringify(data)
	};

	this.s3.putObject(params, function onSaveObjects(err, result) {
		return callback(err, result);
	});
};

S3Interface.prototype.saveToS3 = S3Interface.prototype.save;

/**
 * Decrypt object to S3
 * @param {string} key
 * @param {object} options - { toString:Boolean, toJson:Boolean }
 * @param {function} callback
 */
S3Interface.prototype.decrypt = function onDecrypt(resource, options, callback) {
	var self = this;

	this.fetch(resource, options, function onFetch(fetchErr, data) {
		if (fetchErr) return callback(fetchErr, null);

		var params = {
			CiphertextBlob: new Buffer(data, 'base64')
		};

		self.kms.decrypt(params, function onDecryptSecret(decryptErr, result) {
			return callback(decryptErr, result.Plaintext.toString());
		});
	});
};

S3Interface.prototype.decryptFromS3 = S3Interface.prototype.decrypt;

/**
 * Constructs a configured s3Instance
 * @param {object} options
 */
module.exports = function onExports(options) {
	var config = options || {};

	var s3Instance = new S3Interface(config);

	return s3Instance;
};
