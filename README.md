# Application: Util

[![Build Status](https://travis-ci.org/ashx89/app-util.svg?branch=master)](https://travis-ci.org/ashx89/app-util)

---

Contains shared utility functions that can be used in multiple express applications.

## Modules

### Token
Handles creating, fetching, verifying, decoding `json web tokens` used in an application. Also exposes a middleware function.

### Error
Handles errors passed into the `next()` function. The module will set the `response`, returning the `status` and a `json` representation of the error to the user.

### AWS
A wrapper around AWS services. Parameters for certain functions are already set in the wrapper, allowing important settings to be passed in by the application.
If some options are not passed, it will look for any `environment variables` to use.

#### Usage
```javascript
// passing no `bucket` option will default to looking for `process.env.S3_BUCKET`
var s3 = require('appy-util').s3({ bucket: 'my-bucket' });
```

#### s3.fetch(resource, settings, callback)

`resource`: path to the s3 object to be fetched.

`settings`: object literal specifying how to return the data.
   - `toString`: set to true or false, if you want the object returned from S3 to be parsed as a string.
    
   - `toJson`: set to true or false, if you want the object returned from S3 to be parsed as JSON.
    
`callback`: is a function container `err` and `result` data.

```javascript
s3.fetch('path/to/resource.json', { toString: true, toJson: true }, function onFetch(err, result) {
    // err: error object
    // result: contains the object returned from S3
});
```

#### s3.fetchJson(resource, callback)

A `s3.fetch` facade returning the object as JSON

```javascript
s3.fetchJson('path/to/resource.json', function onFetch(err, result) {
    // err: error object
    // result: contains the file JSON stringified
});
```

#### s3.save(resource, data, callback)

`resource`: path to the destination of the saved s3 object.

`data`: any data to be saved to S3. The data will be `JSON.stringified` on save.

`callback`: is a function container `err` and `result` data.

```javascript
s3.save('path/to/resource.json', { 'id': 'item1' }, function onSave(err, result) {
    // err: error object
    // result: contains the ETag of the save process
});
```

#### s3.upload(params, data, callback)

`params`: config containing: ACL, KEY and ContentType

`data`: file buffer to upload

`callback`: is a function container `err` and `result` data.

```javascript
s3.upload({
    ACL: 'public-read',
    KEY: 'path/to/resource.jpg',
    ContentType: 'image/jpeg'
}, req.file.buffer, function onUpload(err, result) {
    // err: error object
    // result: an object which contains the url of its destination
});
```

#### s3.delete(objects, callback)

`objects`: an array of objects to be removed from an S3 resource.

`callback`: is a function container `err` and `result` data.

```javascript
// Capital 'K' required for Key
var objects = [
    { Key: 'path/to/resource1.json' },
    { Key: 'path/to/resource2.json' }
];

s3.delete(objects, function onDelete(err, result) {
    // err: error object
    // result: contains meta data on total deleted and errors 
});
```

#### s3.listObjects(settings, callback)

`settings`: an object literal specifying parameters for listing.
   - `prefix`: string used as the location for listing.
   - `marker`: string referring to the last object in the list. An empty marker represents the beginning.
   - `maxKeys`: maximum number of objects to return in a listing.

`callback`: is a function container `err` and `result` data.

```javascript
// Capital 'K' required for Key
var settings = {
    prefix: 's3/folder/',
    marker: 'start/from/file1.json',
    maxKeys: 500
};

s3.listObjects(settings, function onList(err, result) {
    // err: error object
    // result: contains information about the listing. (NextMarker, IsTruncated, Contents, etc.)
});
```

#### s3.decrypt(resource, settings, callback)

`resource`: path to the s3 object to be decrypted.

`settings`: object literal specifying how to return the data.
   - `toString`: set to true or false, if you want the object returned from S3 to be parsed as a string.
    
   - `toJson`: set to true or false, if you want the object returned from S3 to be parsed as JSON.
    
`callback`: is a function container `err` and `result` data.

```javascript
// If a file, set `toString` to false
s3.decrypt('path/to/private.file', { toString: false }, function onDecrypt(err, result) {
    // err: error object
    // result: contains decrypted data
});
```

## Tests

~~~
npm test
~~~