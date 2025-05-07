import { DateTime } from 'luxon'

function toDateTime(time: string | number) {
    if (typeof time === 'string') {
        return DateTime.fromISO(time)
    } else {
        return DateTime.fromSeconds(time)
    }
}

export const daytimes = {
    micropost(time: string | number) {
        const dt = toDateTime(time)
        const now = DateTime.now()
        if (now.diff(dt, 'days').days < 3) {
            return dt.toRelative()
        }
        return dt.toFormat('MM-dd HH:mm')
    }
}