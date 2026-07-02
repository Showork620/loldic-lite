# loldic-lite 刷新設計案

- 日付: 2026-06-13
- ステータス: 設計案（未実装）
- スコープ: アイテム一覧の MVP。将来のチャンピオンスキル対応を見据えた構造
- 調査手段: Haiku サブエージェント3体（repo 調査 2 + Web 調査 1）+ `src/db/schema.ts` の直接確認
- 改訂: 2026-06-13 `entities` 抽象 → ドメイン分離（Sho レビュー反映）

## TL;DR

現行スキーマの根本問題は、**「Riot 由来の事実」「人間の編集」「パッチ差分」という3つの性質の違うデータが `items` 一枚に同居している**こと。刷新案はこれを **事実（snapshot）/ 編集（curation）/ 導出（diff）の3層**に分離する。アイテムとチャンピオンは**ドメインごとにテーブルを分け**（中身の構造が全く違うため）、共通にするのは「パッチという時間軸」と「差分の機構」だけにとどめる。将来のスキル対応はアイテム側に一切触れずテーブルを足すだけで済む。フロントは SPA を捨て、「パッチ確定時に静的生成される読み物サイト」として作り直す。

## 1. 現状診断

調査で確定した構造:

- **7テーブル**: `items`（現在状態のみ）+ 手動系3つ（`item_manual_settings` / `additional_tags` / `role_categories`）+ パッチ系3つ（`patch_versions` / `patch_baseline_data` / `patch_items_diff`）
- **履歴方式**: v16.1.1 を基準（baseline）に、変更があったアイテムの**加工後データ全量**を `patch_items_diff` に積む方式。差分そのものは保存されず、検出は JSON.stringify の全体比較
- **フロント**: 管理画面はほぼ完成（UI コンポーネント28個、Hextech テーマの CSS トークン約2,600行）。公開画面は雛形のみ。差分を見せる UI は存在しない

問題は3つに集約される:

1. **手動編集がパッチ差分に混入する。** diff の対象が「加工後データ」なので、タグを手で付け替えただけでも「パッチで変わった」ように見える。ゲームの変更と運営の編集が原理的に区別できない
2. **「差分」が差分ではない。** 全量スナップショットの比較なので、「AD 60→65」というフィールド単位の変更が直接取れず、閲覧のたびに再計算が要る。キー順序の揺れや `updatedAt` 等の無関係フィールドでも誤検知しうる
3. **アイテム前提の単層設計。** チャンピオン等への拡張余地がなく、横断的なパッチ管理機構も後付けで歪んでいる

一方で良い知らせもある。**Data Dragon は全パッチ（500バージョン以上）を永続配信している**ので、DB は「いつでも捨てて再構築できるキャッシュ」と割り切れる。既存データの移行作業は不要で、過去パッチも遡って取り込み直せる。刷新のコストが構造的に安い。

## 2. 刷新の3原則

1. **事実 / 編集 / 導出の分離** — Riot 由来データはパッチごとの不変スナップショット。手動キュレーションはパッチ非依存の別レイヤー。差分はスナップショット間からの導出物で、取り込み時に構造化して確定保存する
2. **DB は再構築可能** — raw データを必ず保持し、加工ロジックを改良したら全履歴を再生成できるようにする
3. **ドメイン分離 + 機構の共通化** — アイテムとチャンピオンはテーブルを分ける（保持する構造が全く違うため）。一方、パッチ差分の機構（snapshot → diff → annotation のパイプラインと差分エンジン）は**アプリ層のコード**で共通化する。スキーマの正規化（DB で分ける）とコードの再利用（関数を共有する）は別問題で、混同して無理な共通テーブルを作らない

## 3. データモデル案

切り分けの原理はシンプル: **中身がドメイン固有の構造を持つテーブル（snapshot / diff）はドメインごとに分ける。ドメインの型を持たない横断テーブル（patches / ddragon_raw / annotations）は共通のまま。**

```text
-- ========== 共通（ドメイン固有の構造を持たない横断テーブル） ==========
patches                      -- パッチ＝時間軸そのもの（現状は単一カレントレコードのみ）
  version        text unique     -- '16.12.1'
  released_at    date            -- 手動入力可（DDragon 配信は 0〜2日遅れるため ingested_at と分離）
  ingested_at    timestamp
  notes_url      text            -- 公式パッチノートURL
  summary_ja     text            -- 手動のパッチ概況
  status         text            -- 'ingested' | 'published'

ddragon_raw                  -- 素データの保管庫（再処理の保険）。ドメインの型を持たない
  patch_id, kind ('item'|'champion'), locale, payload jsonb
  unique(patch_id, kind, locale)

annotations                  -- 手動パッチノート＝自動 diff への人間の文脈注記
  patch_id, target_kind ('item'|'champion'|null), target_id (nullable), body_ja, source ('riot_notes'|'editorial')
  -- target_id を null にすれば「パッチ全体への注記」も表せる。FK 制約は張らず polymorphic に

-- ========== アイテムドメイン ==========
items                        -- アイテムの同一性アンカー（不変的なもの）。diff の FK 先
  id uuid pk, riot_id text unique, created_at

item_snapshots               -- patch ごとのアイテム状態。diff の入力
  id, item_id → items.id, patch_id → patches.id
  data           jsonb           -- 後述の normalized 形
  content_hash   text            -- 変更なし判定の高速化
  pipeline_version int           -- ★抽出ロジックの版。後述
  unique(item_id, patch_id)

item_diffs                   -- 取り込み時に確定計算。閲覧時計算をやめる
  id, item_id → items.id, from_patch_id, to_patch_id
  change_type    text            -- 'added' | 'removed' | 'changed'
  changes        jsonb           -- [{path: 'stats.attackDamage', before: 60, after: 65, kind: 'number'}]
  unique(item_id, to_patch_id)

item_curation_*              -- 手動キュレーション（パッチ非依存・diff 対象外）
  -- overrides / tags / roles の3つ。既存 item_manual_settings / additional_tags / role_categories の後継
  -- item_id 紐付け。既存の蓄積データはそのまま移送できる

-- ========== チャンピオンドメイン（将来 / MVP では作らない） ==========
champions                    -- チャンピオンの同一性（riot_id = 'Ahri'）
champion_snapshots           -- patch ごとの「基礎ステータス + スキル群」を1行で
  -- スキルは data 内の path（spells.Q.* など）で持つ。別テーブルにしない（後述）
champion_diffs               -- item_diffs と同じ構造（target が champion になるだけ）
```

公開用の「現在のアイテム一覧」は、最新 published パッチの `item_snapshots` × `item_curation_*` を合成した **SQL ビュー**にする。現行 `items`（現在状態を全部抱える単層テーブル）の役割の後継だが、実体を持たないので二重管理が消える。

**normalized 形（item の場合）** — diff が意味を持つ粒度に整形する:

```jsonc
{
  "name": "...",
  "stats": { "attackDamage": 65, ... },        // 現行 basicStats 抽出の後継
  "abilityParams": [{ "label": "...", "value": 40, "unit": "%" }],  // 現行 abilityStats の後継
  "gold": { "total": 3400, "sell": 2380 },
  "build": { "from": ["1038"], "into": [] },
  "tags": [...], "maps": [11, 12],
  "passives": ["句点で文単位に分割した効果文", ...],  // description の正規化
  "actives": [...]
}
```

**差分エンジン**は normalized を path 単位で深掘りする小さな純関数。数値は before/after、`build.from` / `tags` は集合差分、`passives` は文単位の LCS + 変更文だけ語レベルでハイライト。**stats に現れず説明文にしか存在しない効果変更**が LoL アイテムの変更の主役なので、このテキスト diff が製品価値の肝になる。

**テーブルを分けても差分エンジンは1つで足りる。** `diffSnapshots(before, after)` は入力がどちらも normalized JSON なので、アイテムでもチャンピオンでも同じ関数で捌ける。「機構の共通化はアプリ層のコードで、ドメインの分離は DB スキーマで」という役割分担が、`entities` のような無理な共通テーブルを不要にする。

**`pipeline_version` が現行設計の隠れた弱点への答え。** 現行の abilityStats 自動抽出は、抽出ロジックを改良した瞬間に「ゲームの変更」と「ロジックの変更」が見分けられなくなる。raw を保持し、normalizer に版番号を付け、ロジック更新時は全パッチを再正規化して diff も再計算する。同一版同士でしか比較しない、という安全弁。

## 4. 取り込みパイプライン

```text
versions.json 監視 → 新パッチ検出
 → item.json (ja_JP) 取得 → ddragon_raw 保存
 → normalize → item_snapshots（hash で変更なしも記録。約300アイテム×25パッチ/年で数十MB、Supabase 無料枠で数年余裕）
 → 直前パッチと比較 → item_diffs 確定保存
 → 新規アイテムの画像を Storage 同期（既存資産を流用）
 → status='ingested'。管理画面で summary_ja / annotations を書いて 'published' に
```

現状はこの処理がブラウザ（SPA）の中で走っている。刷新では **Supabase Edge Function に移し、管理画面はトリガーボタンだけ**にする。冪等性が確保でき、書き込み権限を service role に閉じられる（現状 anon key で items に書ける構成なら、セキュリティ的にもここが直し時）。

## 5. フロントエンド刷新案

本質はフレームワーク選定ではなく**レンダリング戦略**: データはパッチ確定時にしか変わらない読み物コンテンツで、「アイテム名 + パッチ」の検索流入が価値の源泉。つまり**静的生成 + パッチ取り込み時の再生成**が正解で、SPA である必要がそもそもない。

- 推奨は **Next.js (App Router) + ISR**。代替として、既に使っている React Router v7 の framework mode（プリレンダ対応）でも要件は満たせる。迷うならエコシステムと実例の厚みで Next.js
- ページ構成（公開）:
  - `/` — **最新パッチの差分ダイジェスト**。図鑑のトップではなく「今パッチで何が変わったか」をプロダクトの顔にする。自動 diff（数値は機械）と annotations（文脈は人間）を並べて見せるのが独自価値
  - `/patches` / `/patches/[version]` — added / removed / changed の一覧と詳細
  - `/items` — 図鑑（検索・タグ・ロールフィルタ。管理画面で作った検索 UI パターンを流用）
  - `/items/[riotId]` — アイテム詳細 + **全パッチの変更履歴タイムライン**（`item_diffs` を縦に並べるだけで成立する）
  - `/admin` — 同期トリガー、キュレーション編集、annotations 入力
- Hextech テーマの CSS カスタムプロパティ群はデザイントークンとしてそのまま移植する価値がある

## 6. チャンピオンスキル対応（将来）

アイテム側に一切触れず、`champions` / `champion_snapshots` / `champion_diffs` の3テーブルとスキル用 normalizer を足すだけ。取り込みパイプラインと差分エンジンは既存コードをそのまま再利用する。

- **スキルは別テーブルにしない。** チャンピオン単位で1スナップショットにして、スキルは `data` 内の path（`spells.Q.*` など）で持つ。理由は、(a) 基礎ステータスと成長値がスキルと同じ行に収まる、(b)「Ahri の Q のダメージ 60→65」は path diff で素直に出る、(c) スキルを別行に散らすと取り込みと表示で join 地獄になる。結果、アイテムと全く同じ「1エンティティ=1スナップショット、path で diff」のパターンを保てる
- `cooldownBurn: "9/8/7/6/5"` のような burn 文字列は `[9,8,7,6,5]` に展開して数値 diff 可能にする
- tooltip は `{{ e1 }}` プレースホルダを**残したまま**テンプレートとして text diff（プレースホルダ構造の変更自体が意味のある変更）
- Data Dragon の spell データは実数値が変数に隠れる既知の穴があるため、Community Dragon（より生のデータ、`inStore` 等の詳細フィールドも保持）での補完を Phase 3 の調査課題とする。normalizer に閉じ込めてあるので、ソース差し替えがスキーマに波及しない

## 7. フェーズの切り方

| Phase | 内容 |
|---|---|
| 0 | 新スキーマ + 取り込み Edge Function。16.1 以降（現行 baseline と同じ起点）を遡及取り込みして diff が正しく出ることを確認 |
| 1 = MVP | 公開3ページ（`/`・`/patches/[v]`・`/items/[riotId]`）+ 管理（同期・annotations） |
| 2 | curation 移行（既存テーブルから移送）、検索・フィルタ強化 |
| 3 | チャンピオンドメイン追加（`champions` / `champion_snapshots` / `champion_diffs` + スキル normalizer + CDragon 調査） |

## 8. 流用するもの / 捨てるもの

**流用**: Riot API クライアント（fetch 部）、画像処理 + Storage 連携、Hextech デザイントークン、`additional_tags` / `role_categories` の蓄積データ、abilityStats 抽出ロジック（normalizer の核として）、管理画面の検索 UI パターン

**捨てる**: 現行 `items` テーブル（現在状態を全部抱える単層構造。同名の同一性アンカーとして作り直す）、`patch_baseline_data` / `patch_items_diff`（baseline + 全量スナップショット方式そのもの）、SPA からの直接同期経路、公開画面の雛形

## 結語

一番効くのは「DDragon が全履歴を配信している以上、DB はただのキャッシュ」という割り切り。これがあるから移行作業ゼロでゼロから作り直せるし、normalizer を何度でも育て直せる。設計の確定はスキーマ（§3）と normalized 形の合意から始める。
