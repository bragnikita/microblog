/// <reference path="./.sst/platform/config.d.ts" />


const APP_DOMAIN = process.env.APP_DOMAIN as string

export default $config({
  app(input) {
    return {
      name: "blog",
      removal: input?.stage === "prod" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: process.env.AWS_REGION as any || 'ap-northeast-1',
          profile: process.env.CI ? undefined : 'private'
        }
      }
    };
  },
  async run() {
    const constants = await import('./shared/constants')
    const dsqlCluster = sst.aws.Dsql.get("dsql", {
      id: process.env.DSQL_ENDPOINT_NAME || '',
    },)

    const database = new sst.aws.Dynamo('database', {
      fields: {
        pk: 'string',
        sk: 'string',
        gsi1pk: 'string',
        gsi1sk: 'string',
      },
      primaryIndex: {
        hashKey: 'pk',
        rangeKey: 'sk',

      },
      globalIndexes: {
        gsi1: {
          hashKey: 'gsi1pk',
          rangeKey: 'gsi1sk',
        }
      }
    })
    const content = new sst.aws.Bucket('content', {
      access: "cloudfront",
    })
    const resourceProcessor = new sst.aws.Function("resource-processor", {
      handler: "server/functions/image-processor.handler",
      name: `${$app.name}-${$app.stage}-image-processor`,
      timeout: '30 seconds',
      link: [database, content, dsqlCluster],
      nodejs: {
        install: ['sharp', 'exifr']
      },
      environment: {
        DSQL_ENDPOINT_NAME: process.env.DSQL_ENDPOINT_NAME || '',
      }
    })
    content.notify({
      notifications: [
        {
          name: 'Resizer',
          function: resourceProcessor.arn,
          filterPrefix: constants.IMAGES_ORIGINALS_PREFIX,
          events: ['s3:ObjectCreated:*']
        },
        {
          name: 'DropFolder',
          function: resourceProcessor.arn,
          filterPrefix: constants.IMAGES_DROP_PREFIX,
          events: ['s3:ObjectCreated:*']
        }
      ]
    })
    const prefix = `/${constants.IMAGES_PREFIX}`
    const cdn = new sst.aws.Router("main", {
      domain: APP_DOMAIN ? { name: APP_DOMAIN } : undefined,
    })
    cdn.routeBucket(prefix, content);

    const site = new sst.aws.Nuxt("web", {
      link: [database, content, cdn, dsqlCluster],
      router: {
        instance: cdn,
        domain: APP_DOMAIN || undefined
      },
      environment: {
        FAST_ACCESS_KEY: process.env.FAST_ACCESS_KEY || '',
        NUXT_SESSION_PASSWORD: process.env.NUXT_SESSION_PASSWORD || '',
        SITE_URL: APP_DOMAIN ? `https://${APP_DOMAIN}` : cdn.url,
        DSQL_ENDPOINT_NAME: process.env.DSQL_ENDPOINT_NAME || '',
      },
      transform: {
        server: {
          name: `${$app.name}-${$app.stage}-nuxt-server`,
          concurrency: {
            reserved: 3
          }
        }
      }
    });
    return {
      processor: resourceProcessor.name,
      content: content.name,
      cdn: cdn.url,
      dsql: dsqlCluster.endpoint,
      web: site.url,
    }
  },
});
