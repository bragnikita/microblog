import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { Entity } from 'electrodb'
import { Resource } from 'sst'
import { DateTime } from "luxon";
import { number } from 'zod';

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
        },
        gs1: {
            index: 'gs1',
            pk: {
                field: 'gs1pk',
                composite: ['id'],
                template: 'micropost#${id}'
            },
            sk: {
                field: 'gs1sk',
                composite: [],
                template: 'default'
            }
        }
    }
}, { client: db, table: TableName })

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

export enum ResourceJobStatus {
    Waiting = 'waiting',
    Processing = 'processing',
    Completed = 'completed',
    Failed = 'failed',
}

export enum ResourceJobType {
    MinifyImage = 'minify-image',
}

export const ResourceJob = new Entity({
    model: {
        entity: 'resource-job',
        version: '1',
        service: 'microblog',
    }, attributes: {
        id: {
            type: 'string',
            required: true,
        },
        status: {
            type: [ResourceJobStatus.Waiting, ResourceJobStatus.Processing, ResourceJobStatus.Completed, ResourceJobStatus.Failed] as const,
            required: true,
        },
        statusMessage: {
            type: 'string',
        },
        payload: {
            type: 'any',
        },
        type: {
            type: [ResourceJobType.MinifyImage] as const,
            required: true,
        },
        createdAt: {
            type: 'string',
            required: true,
            set: (value) => value ?? DateTime.utc().toISO(),
        },
        finishedAt: {
            type: 'string',
            watch: ['status'],
            set: (value, other) => {
                if (value) return value;
                if (other.status === ResourceJobStatus.Completed || other.status === ResourceJobStatus.Failed) {
                    return DateTime.utc().toISO()
                }
                return undefined
            }
        },

    }, indexes: {
        primary: {
            pk: {
                field: 'pk',
                composite: [],
                template: 'resource-job'
            },
            sk: {
                field: 'sk',
                composite: ['id'],
                template: '${id}'
            }
        }
    }
}, { client: db, table: TableName })


export const Image = new Entity({
    model: {
        entity: 'image',
        version: '1',
        service: 'microblog',
    }, attributes: {
        key: {
            type: 'string',
            required: true,
        },
        resourceStatus: {
            type: ['pending', 'uploaded', 'deleted'] as const,
            required: true,
        },
        preprocessingStatus: {
            type: [ResourceJobStatus.Waiting, ResourceJobStatus.Processing, ResourceJobStatus.Completed, ResourceJobStatus.Failed] as const,
        },
        createdAt: {
            type: 'string',
            required: true,
            default: () => DateTime.utc().toISO(),
            set: (value) => value ?? DateTime.utc().toISO(),
        },
        expireAt: {
            type: 'number',
            watch: ['resourceStatus'],
            set: (value, other) => {
                if (other.resourceStatus === 'pending') {
                    return DateTime.utc().plus({ hour: 1 }).toMillis()
                }
                return undefined
            }
        }
    }, indexes: {
        primary: {
            pk: {
                field: 'pk',
                composite: [],
                template: 'images'
            },
            sk: {
                field: 'sk',
                composite: ['key'],
                template: '${key}'
            }
        }
    }
}, { client: db, table: TableName })
