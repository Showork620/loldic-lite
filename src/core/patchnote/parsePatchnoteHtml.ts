/**
 * 公式パッチノート（ja-jp）HTMLのアイテムセクション抽出
 *
 * 2026年時点の実構造:
 *   <header><h2 id="patch-items">アイテム</h2></header>
 *   <div class="content-border"><div class="patch-change-block">
 *     <h3 class="change-title">アイテム名</h3>
 *     <blockquote class="blockquote context"><p>開発コメント</p></blockquote>
 *     <ul><li><strong>ラベル</strong>：before ⇒ <strong>after</strong></li></ul>
 *   </div></div>
 *
 * DOM構造は年に数回変わるため、CSSクラス名には依存せず
 * 見出しテキスト（「アイテム」）と h3 / blockquote / li の関係だけで抽出する。
 * 見出し検出に失敗した場合は「⇒」を含む行の全文書走査にフォールバックする。
 */

import * as cheerio from 'cheerio'
import type { CheerioAPI, Cheerio } from 'cheerio'
import type { AnyNode } from 'domhandler'
import type { PatchnoteItemSection, ParsedChange } from '../../types/domain/patchnote'
import { parseChangeLine } from './parseChangeLine'

const ITEM_HEADING = 'アイテム'
const ARROW_PATTERN = /⇒|→|=>/

function parseBlock(
  $: CheerioAPI,
  h3: Cheerio<AnyNode>,
  viaFallback: boolean
): PatchnoteItemSection | null {
  const itemName = h3.text().trim()
  if (!itemName) return null

  const container = h3.parent()
  const summaryText = container.find('blockquote').first().text().trim() || null
  const lineTexts = container
    .find('li')
    .toArray()
    .map((li) => $(li).text().trim())
    .filter(Boolean)

  const changeLines = lineTexts
    .map((t) => parseChangeLine(t))
    .filter((l): l is ParsedChange => l !== null)

  if (changeLines.length === 0 && !summaryText) return null

  const quotedText = [itemName, summaryText, ...lineTexts].filter(Boolean).join('\n')
  return { itemName, summaryText, quotedText, changeLines, viaFallback }
}

/** アイテム見出しから次のh2見出しまでの兄弟要素を集める */
function collectSectionRoots($: CheerioAPI): Cheerio<AnyNode>[] {
  const heading = $('h2')
    .filter((_, el) => $(el).text().trim() === ITEM_HEADING)
    .first()
  if (!heading.length) return []

  // h2が<header>等でラップされている場合はそのラッパーから歩く
  const start = heading.parents().length > 1 ? heading.parent() : heading
  const roots: Cheerio<AnyNode>[] = []
  let cur = start.next()
  while (cur.length) {
    const isBoundary = cur.is('h2') || cur.find('h2').length > 0
    if (isBoundary) break
    roots.push(cur)
    cur = cur.next()
  }
  return roots
}

export function parsePatchnoteDocument(html: string): PatchnoteItemSection[] {
  const $ = cheerio.load(html)

  const roots = collectSectionRoots($)
  if (roots.length > 0) {
    const sections: PatchnoteItemSection[] = []
    for (const root of roots) {
      const h3s = root.is('h3') ? [root] : root.find('h3').toArray().map((el) => $(el))
      for (const h3 of h3s) {
        const section = parseBlock($, h3 as Cheerio<AnyNode>, false)
        if (section) sections.push(section)
      }
    }
    if (sections.length > 0) return sections
  }

  // フォールバック: ⇒を含む<li>を持つ見出しブロックを全文書から収集
  const sections: PatchnoteItemSection[] = []
  $('h3, h4').each((_, el) => {
    const heading = $(el)
    const container = heading.parent()
    const hasArrowLine = container
      .find('li')
      .toArray()
      .some((li) => ARROW_PATTERN.test($(li).text()))
    if (!hasArrowLine) return
    const section = parseBlock($, heading, true)
    if (section) sections.push(section)
  })
  return sections
}
