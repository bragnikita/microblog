/// <reference path="./.sst/platform/config.d.ts" />

import { CONTENT_ORIGINAL_PREFIX, CONTENT_URL_PREFIX } from "./shared/constants";

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
      nodejs: {
        install: ['sharp']
      }
    })
    content.notify({
      notifications: [{
        name: 'Resizer',
        function: resourceProcessor.arn,
        filterPrefix: CONTENT_ORIGINAL_PREFIX,
        events: ['s3:ObjectCreated:*']
      }]
    })
    const prefix = `/${CONTENT_URL_PREFIX}*`
    const cdn = new sst.aws.Router("main", {
      routes: {
        [prefix]: {
          bucket: content,
        }
      }
    })
    const site = new sst.aws.Nuxt("web", {
      link: [database, content, cdn],
    });

    return {
      processor: resourceProcessor.name,
      content: content.name,
      cdn: cdn.url,
      web: site.url,
    }
  },
});
