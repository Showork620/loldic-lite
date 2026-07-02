/**
 * CLI引数パースの薄いラッパー（node:util parseArgs）
 */

import { parseArgs, type ParseArgsOptionsConfig } from 'node:util'

export function getArgs<T extends ParseArgsOptionsConfig>(
  options: T
): ReturnType<typeof parseArgs<{ options: T }>>['values'] {
  const { values } = parseArgs({ options, allowPositionals: false })
  return values
}

export function requireArg(value: string | undefined, name: string): string {
  if (!value) throw new Error(`--${name} は必須です`)
  return value
}
