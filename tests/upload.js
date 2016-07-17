var tap = require('tap');
var mockAws = require('mock-aws');

tap.beforeEach(function onBeforeEach(callback) {
	console.log(this._name);
	callback();
});

tap.test('s3 should upload an object', function onUploadTest(t) {
	t.plan(2);

	mockAws.mock('S3', 'upload', function onUploadObject(params, callback) {
		callback(null, { Location: 'link-to-resource.jpg' });
	});

	require('../index').upload({
		req: {},
		folder: 'tests',
	}, function onUpload(err, image) {
		t.equal(err.message, 'Resource not found to be uploaded to', 'an error is returned if missing properties');
	});

	var req = {
		file: { buffer: 'image-file-buffer', mimetype: 'image/jpeg', originalname: 'original-name.jpg' },
		user: { _id: '123', resource: 'user-resource' }
	};

	require('../index').upload({
		req: req,
		folder: 'tests',
		model: { _id: '123' }
	}, function onUpload(err, image) {
		console.log(image);
		t.equal(image, 'link-to-resource.jpg', 'link to the image is returned after upload');
		t.end();
	});
});
