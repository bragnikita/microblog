import {DynamoDBClient} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb'
import {Entity} from 'electrodb'
import {Resource} from 'sst'
import {DateTime} from "luxon";

export const db = DynamoDBDocumentClient.from(new DynamoDBClient({}))
export const TableName = Resource.database.name

export const MicroPost = new Entity({
    model: {
        entity: 'micropost',
        version: '1',
        service: 'microblog'
    },
    attributes: {
        id: {
            type: "number",
            required: true,
        },
        timestamp: {
            type: 'string',
            required: true,
        },
        text: {
            type: 'string'
        },
        images: {
            type: 'list',
            items: {
                type: 'map',
                properties: {
                    thumbnailUrl: {
                        type: 'string',
                        required: true,
                    }
                }
            },
        },
        video: {
            type: 'map',
            properties: {
                youtubeId: {
                    type: 'string'
                }
            }
        },
    },
    indexes: {
        primary: {
            pk: {
                field: 'pk',
                composite: [],

                template: 'micropost'
            },
            sk: {
                field: 'sk',
                composite: ['timestamp'],
                template: "${timestamp}",
                casing: 'none'
            }
        }
    }
}, {client: db, table: TableName})

export const Counters = new Entity({
    model: {
        entity: 'counters',
        version: '1',
        service: 'microblog',
    },
    attributes: {
        microposts: {
            type: 'number',
            required: true,
            default: 0,
        },
    },
    indexes: {
        primary: {
            pk: {
                field: 'pk',
                composite: [],
                template: `stats`
            },
            sk: {
                field: 'sk',
                composite: [],
                template: 'counters'
            }
        }
    }
}, { client: db, table: TableName })