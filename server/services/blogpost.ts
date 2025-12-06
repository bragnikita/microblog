
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Entity } from 'electrodb';
import { DateTime } from "luxon";
import { Resource } from 'sst';

export const db = DynamoDBDocumentClient.from(new DynamoDBClient({}))
export const TableName = Resource.database.name

export const BlogPost = new Entity({
    model: {
        entity: 'blogpost',
        version: '1',
        service: 'blog'
    },
    attributes: {
        id: {
            type: "string",
            required: true,
        },
        publishedAt: {
            type: 'string',
            required: false,
        },
        createdAt: {
            type: 'string',
            required: true,
            default: () => DateTime.utc().toISO(),
            set: (value) => value ?? DateTime.utc().toISO(),
        },
        title: {
            type: 'string',
            required: true,
        },
        content: {
            type: 'any',
        },
        coverImageId: {
            type: 'string',
            required: false,
        },
        categoryId: {
            type: 'string',
            default: 'root',
            required: false,
        },
    },
    indexes: {
        primary: {
            pk: {
                field: 'pk',
                composite: [],
                template: 'blog:post',
            },
            sk: {
                field: 'sk',
                composite: ['id'],
                template: '${id}',
                casing: 'none',
            },
        },
    },
}, { client: db, table: TableName })