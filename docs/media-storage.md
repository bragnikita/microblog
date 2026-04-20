

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

