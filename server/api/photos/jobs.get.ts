import { z } from 'zod'
import { Job } from '~~/server/services/db'

const querySchema = z.object({
    ids: z.string().nonempty(),
})

export default defineWrappedResponseHandler(async (event) => {
    const { ids } = await getValidatedQuery(event, querySchema.parse)
    const jobIds = ids.split(',').map(id => id.trim()).filter(Boolean)

    const results = await Job.get(jobIds.map(id => ({ id }))).go()

    return results.data.map(job => ({
        id: job.id,
        status: job.status,
        statusMessage: job.statusMessage ?? null,
    }))
})
