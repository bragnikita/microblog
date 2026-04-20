import { Resource } from 'sst'

/**
 * Returns true when running under `sst dev` (stage === 'dev').
 * Works in Lambda and other non-Nuxt runtimes where import.meta.dev is unavailable.
 */
export function isSstDev(): boolean {
  return Resource.App.stage === 'dev'
}
