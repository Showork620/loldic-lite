import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RawRiotItemData } from '../../types/domain/item'
import type { NameIndexEntry } from '../patchnote/matchItemName'

const fixturesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '__fixtures__'
)

export function loadDdragonFixture(name: string): Record<string, RawRiotItemData> {
  return JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'ddragon', name), 'utf8')
  ) as Record<string, RawRiotItemData>
}

export function loadPatchnoteFixture(name: string): string {
  return fs.readFileSync(path.join(fixturesDir, 'patchnotes', name), 'utf8')
}

export function toNameIndexEntries(
  fixture: Record<string, RawRiotItemData>
): NameIndexEntry[] {
  return Object.entries(fixture).map(([riotId, raw]) => ({
    riotId,
    nameJa: raw.name,
    maps: Object.entries(raw.maps ?? {})
      .filter(([, enabled]) => enabled)
      .map(([mapId]) => Number(mapId)),
  }))
}
