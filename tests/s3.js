var tap = require('tap');
var mockAws = require('mock-aws');

var s3 = require('../index').s3({
	bucket: 'test-bucket',
	config: mockAws
});

tap.beforeEach(function onBeforeEach(callback) {
	console.log(this._name);
	callback();
});

tap.test('s3 should have a bucket', function onGetBucketTest(t) {
	t.plan(1);
	t.true(s3.getBucket());
	t.end();
});

tap.test('s3 should list objects', function onListTest(t) {
	t.plan(3);

	mockAws.mock('S3', 'listObjects', function onListObject(params, callback) {
		callback(null, {
			IsTruncated: true,
			Marker: '',
			NextMarker: 'path/to/nextmarker.json',
			Contents: [{ Key: 'file.json' }],
			Delimiter: '/',
			MaxKeys: 10
		});
	});

	var options = {
		prefix: 'path/to/folder/',
		marker: '',
		maxKeys: 10
	};

	s3.listObjects(options, function onList(err, result) {
		t.false(err);
		t.true(result);
		t.true(result.Contents.length);
		t.end();
	});
});

tap.test('s3 should fetch an object', function onFetchTest(t) {
	t.plan(2);

	mockAws.mock('S3', 'getObject', function onGetObject(params, callback) {
		callback(null, {
			Body: JSON.stringify({ hello: 'world' }),
			ETag: 'e19ab63dc'
		});
	});

	s3.fetch('path/to/file.json', { toString: true, toJson: true }, function onFetch(err, result) {
		t.false(err);
		t.true(result);
		t.end();
	});
});

tap.test('s3 fetchJson facade should fetch an object', function onFetchJsonTest(t) {
	t.plan(3);

	mockAws.mock('S3', 'getObject', function onJsonGetObject(params, callback) {
		callback(null, {
			Body: JSON.stringify({ hello: 'world' }),
			ETag: 'e19ab63dc'
		});
	});

	s3.fetchJson('path/to/file.json', function onJsonFetch(err, result) {
		t.false(err);
		t.true(result);
		t.true(result.hello);
		t.end();
	});
});

tap.test('s3 should delete an object', function onDeleteTest(t) {
	t.plan(4);

	mockAws.mock('S3', 'deleteObjects', function onDeleteObject(params, callback) {
		callback(null, {
			Errors: [],
			Deleted: [
				{ Key: 'path/to/file1.json' },
				{ Key: 'path/to/file2.json' }
			]
		});
	});

	var data = [{ Key: 'path/to/file1.json' }, { Key: 'path/to/file2.json' }];

	s3.delete(data, function onDelete(err, result) {
		t.false(err);
		t.true(result);
		t.false(result.Errors.length);
		t.true(result.Deleted.length);
		t.end();
	});
});

tap.test('s3 should save an object', function onSaveTest(t) {
	t.plan(2);

	mockAws.mock('S3', 'putObject', function onPutObject(params, callback) {
		callback(null, { ETag: 'e19ab63dc' });
	});

	var data = { hello: 'world' };

	s3.save('path/to/folder', data, function onSave(err, result) {
		t.false(err);
		t.true(result);
		t.end();
	});
});

tap.test('s3 should upload an object', function onUploadTest(t) {
	t.plan(2);

	mockAws.mock('S3', 'upload', function onUploadObject(params, callback) {
		callback(null, { Location: 'link-to-resource.jpg' });
	});

	var data = {
		ACL: 'public-read',
		Key: 'resource/to/upload.jpg',
		ContentType: 'image/jpeg'
	};

	s3.upload(data, 'file-to-upload', function onUpload(err, result) {
		t.false(err);
		t.true(result.Location);
		t.end();
	});
});

tap.test('s3 should decrypt an object', function onDecryptTest(t) {
	t.plan(2);

	mockAws.mock('KMS', 'decrypt', function onDecryptObject(params, callback) {
		callback(null, { Plaintext: 'decrypted-string' });
	});

	s3.decrypt('file/to/decrypt.txt', 'file-to-upload', function onDecrypt(err, result) {
		t.equal(result, 'decrypted-string', 'file decrypted');
		t.equal(typeof result, 'string', 'file decrypted is a string');
		t.end();
	});
});
