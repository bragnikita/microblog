

### DB stored images keys
```
original_key = files/images/{photoId}/original
large_key = files/images/{photoId}/large.jpg
thumb_key = files/images/{photoId}/thumb.jpg
```
Where photo ID - UUID.

Upload destination - original key.

Image processing order
```
upload request
|
create upload job record in DynamoDB, store file ID, original filename, thumb/large keys, upload key, mime type etc
|
generate upload URL and return to the FE
|
upload file
|
catch PutObject event in transformator
|
find upload job record in DynamoDB
|
generate large version and thumb version and store them
|
create an image record in relational DB
|
mark job as finished
```

Use Job dynamodb record with type ProcessImage and payload

```yaml
mimeType: ...
originalFilename: ...
thumbKey: ...
largeKey: ...
originalKey: ...
```
and id === photo ID

We also need an API, that will accept an uploading file meta (mimeType, original filename), validate it, issue photo ID and S3 keys, create a Job record and return the job ID and a signed upload URL 

Also we need an API, that will fetch the multiple job's status by provided IDs. We will need it in UI later