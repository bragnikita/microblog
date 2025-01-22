import { DateTime } from "luxon";

export function formatToUTC(date: Date): string {
    return DateTime.fromJSDate(date).toUTC().toISO({ suppressMilliseconds: true }) ?? '';
}