/// <reference path="./.sst/platform/config.d.ts" />

import * as command from "@pulumi/command"

const APP_DOMAIN = process.env.APP_DOMAIN

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
      link: [database, content],
      nodejs: {
        install: ['sharp']
      }
    })
    content.notify({
      notifications: [{
        name: 'Resizer',
        function: resourceProcessor.arn,
        filterPrefix: constants.CONTENT_ORIGINAL_PREFIX,
        events: ['s3:ObjectCreated:*']
      }]
    })
    const prefix = `/${constants.CONTENT_URL_PREFIX}*`
    const cdn = new sst.aws.Router("main", {
      domain: APP_DOMAIN ? 'cdn.' + APP_DOMAIN : undefined,
      routes: {
        [prefix]: {
          bucket: content,
        }
      }
    })
    const site = new sst.aws.Nuxt("web", {
      link: [database,  content, cdn ],
      domain: APP_DOMAIN,
      environment: {
        FAST_ACCESS_KEY: process.env.FAST_ACCESS_KEY || '',
        NUXT_SESSION_PASSWORD: process.env.NUXT_SESSION_PASSWORD || '',
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

    new command.local.Command('migrate', {
      create: "pnpm app:migrate",
      update: "pnpm app:migrate",
    }, { dependsOn: [database]})

    return {
      processor: resourceProcessor.name,
      content: content.name,
      cdn: cdn.url,
      web: site.url,
    }
  },
});
