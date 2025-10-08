
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Entity } from 'electrodb';
import { DateTime } from "luxon";
import { Resource } from 'sst';

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
        content: {
            type: 'map',
            required: true,
            properties: {
                text: {
                    type: 'string'
                },
                title: {
                    type: 'string'
                },
                images: {
                    type: 'list',
                    items: {
                        type: 'map',
                        properties: {
                            id: {
                                type: 'string',
                                required: true,
                            },
                            location: {
                                type: 'string',
                                required: false,
                            },
                            compressedSides: {
                                type: 'string',
                            },
                            originalFileSize: {
                                type: 'number',
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
                location: {
                    type: 'map',
                    properties: {
                        lat: {
                            type: 'number',
                        },
                        lon: {
                            type: 'number',
                        },
                        label: {
                            type: 'string',
                        }
                    }
                },
                links: {
                    type: 'list',
                    items: {
                        type: 'map',
                        properties: {
                            url: {
                                type: 'string',
                                required: true,
                            },
                            title: {
                                type: 'string',
                                required: false,
                            }
                        }
                    }
                }
            },

        },
        visibility: {
            type: ['public', 'private', 'draft'] as const,
            default: 'draft',
            required: true,
        },
        tags: {
            type: 'set',
            items: 'string',
            required: true,
            set: (value) => value?.length ? value : undefined,
            get: (value) => value || [],
        },
    },
    indexes: {
        primary: {
            pk: {
                field: 'pk',
                composite: [],
                template: 'mp:microblog'
            },
            sk: {
                field: 'sk',
                composite: ['id'],
                template: "${id}",
                casing: 'none'
            }
        },
        gsi1: {
            index: 'gsi1',
            pk: {
                field: 'gsi1pk',
                composite: ['visibility'],
                template: 'mp:microblog:${visibility}'
            },
            sk: {
                field: 'gsi1sk',
                composite: ['publishedAt'],
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
