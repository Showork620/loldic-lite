/**
 * src/core — 純粋ドメインロジック層
 *
 * supabase / fetch / DOM に依存しない純粋関数のみを置く。
 * ブラウザ（管理UIプレビュー）と scripts/（インジェスト）の両方から使う。
 */

export { parseItemDescription } from './ddragon/parseDescription'
export type { ParsedDescription, DescriptionBlock, StatLine } from './ddragon/parseDescription'
export { extractStats } from './ddragon/extractStats'
export { extractTags } from './ddragon/extractTags'
export { extractAbilities, normalizeAbilityKey } from './ddragon/extractAbilities'
export { toItemState } from './ddragon/toItemState'

export { parsePatchnoteDocument } from './patchnote/parsePatchnoteHtml'
export { parseChangeLine, firstNumber } from './patchnote/parseChangeLine'
export { buildNameIndex, matchItemName, normalizeName } from './patchnote/matchItemName'
export type { NameIndex, NameIndexEntry } from './patchnote/matchItemName'
export { scoreExtract, CONFIDENCE_THRESHOLD } from './patchnote/confidence'

export { mergeItemState } from './merge/mergeItemState'
export type { MergeInput, MergeResult, MergeExtract, MergeOverride } from './merge/mergeItemState'
export { applyOverride } from './merge/applyOverride'

export { diffStates } from './diff/diffStates'
export { classifyChangeType } from './diff/classifyChange'
export { numericDirection, isInvertedTarget } from './diff/statPolarity'

export { proposeChanges } from './changes/proposeChanges'
export type { ProposeInput, ProposeExtract, ProposedChange } from './changes/proposeChanges'
export { mapLabelToTarget } from './changes/mapLabel'
