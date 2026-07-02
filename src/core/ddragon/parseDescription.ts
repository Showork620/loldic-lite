/**
 * DDragonアイテム説明文HTMLの構造化パーサー
 *
 * 説明文は <mainText><stats>…</stats><br><br><passive>名前</passive>本文…</mainText>
 * という疑似タグ構造を持つ。これを stats 行とアビリティブロックに分解する。
 * cheerio(デフォルトHTMLモード)はタグ名を小文字化するため、比較は全て小文字で行う。
 */

import * as cheerio from 'cheerio'
import type { AnyNode, Element } from 'domhandler'

export interface StatLine {
  /** 例 "攻撃力" */
  label: string
  /** attention の中身そのまま。例 "36" / "25%" */
  valueText: string
}

export interface DescriptionBlock {
  kind: 'passive' | 'active'
  nameJa: string
  /** タグ除去済みプレーンテキスト。<br> は改行に変換して空白を正規化 */
  bodyText: string
}

export interface ParsedDescription {
  statLines: StatLine[]
  blocks: DescriptionBlock[]
}

const BLOCK_TAGS = new Set(['passive', 'active'])
/** 本文に含めない装飾・注釈タグ */
const SKIP_TAGS = new Set(['stats', 'flavortext'])

function isElement(node: AnyNode): node is Element {
  return node.type === 'tag'
}

function normalizeBody(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export function parseItemDescription(html: string): ParsedDescription {
  const $ = cheerio.load(html)
  const root = $('maintext').length ? $('maintext') : $('body')

  // ---- stats 行の抽出 ----
  const statLines: StatLine[] = []
  const statsEl = root.find('stats').first()
  if (statsEl.length) {
    let labelBuffer = ''
    for (const node of statsEl.contents().toArray()) {
      if (isElement(node) && node.tagName === 'attention') {
        const label = labelBuffer.trim()
        const valueText = $(node).text().trim()
        if (label && valueText) statLines.push({ label, valueText })
        labelBuffer = ''
      } else if (isElement(node) && node.tagName === 'br') {
        labelBuffer = ''
      } else {
        labelBuffer += isElement(node) ? $(node).text() : ('data' in node ? node.data : '')
      }
    }
  }

  // ---- アビリティブロックの抽出 ----
  // mainText 直下を文書順に走査。<passive>/<active> がブロックの開始点で、
  // 次の開始点までのテキストが本文（インライン装飾タグはテキスト化する）。
  const blocks: DescriptionBlock[] = []
  let current: { kind: 'passive' | 'active'; nameJa: string; parts: string[] } | null = null

  const flush = () => {
    if (current) {
      blocks.push({
        kind: current.kind,
        nameJa: current.nameJa,
        bodyText: normalizeBody(current.parts.join('')),
      })
      current = null
    }
  }

  for (const node of root.contents().toArray()) {
    if (isElement(node) && BLOCK_TAGS.has(node.tagName)) {
      flush()
      const nameJa = $(node).text().trim()
      current = { kind: node.tagName as 'passive' | 'active', nameJa, parts: [] }
      continue
    }
    if (!current) continue
    if (isElement(node) && SKIP_TAGS.has(node.tagName)) continue
    if (isElement(node) && node.tagName === 'br') {
      current.parts.push('\n')
    } else {
      current.parts.push(isElement(node) ? $(node).text() : ('data' in node ? node.data : ''))
    }
  }
  flush()

  return { statLines, blocks }
}
