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
    const database = new sst.aws.Dynamo('database', {
      fields: {
        pk: 'string',
        sk: 'string'
      },
      primaryIndex: {
        hashKey: 'pk',
        rangeKey: 'sk'
      },
      ttl: 'expireAt',
    })
    const content = new sst.aws.Bucket('content', {
      access: "cloudfront",
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
