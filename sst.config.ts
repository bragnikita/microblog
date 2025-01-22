/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "microblog",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          profile: 'private'
        }
      }
    };
  },
  async run() {
    $transform(sst.aws.Function, (args, opts, name) => {
      args.nodejs = {
        install: ['sharp', '@aws-sdk/signature-v4-crt', '@aws-sdk/crc64-nvme-crt'],
      }
    })
    const database = new sst.aws.Dynamo('database', {
      fields: {
        pk: 'string',
        sk: 'string',
        gsi1pk: 'string',
        gsi1sk: 'string',
      },
      primaryIndex: {
        hashKey: 'pk',
        rangeKey: 'sk'
      },
      globalIndexes: {
        gsi1: {
          hashKey: 'gsi1pk',
          rangeKey: 'gsi1sk',
        }
      },
      ttl: 'expireAt',
    })
    const content = new sst.aws.Bucket('content', {
      access: "cloudfront",
    })
    const resourceProcessor = new sst.aws.Function("resource-processor", {
      handler: "server/functions/image-processor.handler",
      link: [database, content],
    })
    content.notify({
      notifications: [{
        name: 'Resizer',
        function: resourceProcessor.arn,
        filterPrefix: 'content/original/',
        events: ['s3:ObjectCreated:*']
      }]
    })
    const cdn = new sst.aws.Router("main", {
      routes: {
        "/content/*": {
          bucket: content,
        }
      }
    })
    new sst.aws.Nuxt("web", {
      link: [database, content, cdn],
    });
  },
});
