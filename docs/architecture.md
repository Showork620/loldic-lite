# アーキテクチャ

このrepoの中核資産は「最新のアイテムデータ」ではなく、**パッチごとのアイテム状態の系列と、その変更イベント**である。データソースは3つ（DDragon API・公式パッチノート・人間のキュレーション）で、信頼度も構造も異なるため、次の5原則で設計されている。

1. **生データは不変**（Layer 0 は append-only。パーサーを直したらいつでも再導出できる）
2. **正規データは純粋マージで再導出可能**（`mergeItemState`: manual > patchnote > ddragon）
3. **手動修正はフィールド単位・パッチ範囲付きオーバーライド**（再同期で消えない）
4. **変更イベントが第一級**（`item_changes` が公開タイムラインの実体）
5. **自動化は提案まで。人間が承認**（pending → approved を経て初めて公開）

## データモデル（3層）

```
Layer 0: 生データ（append-only）
  ddragon_snapshots    パッチ×アイテムのitem.json生エントリ
  patchnote_documents  パッチノート生HTML
  patchnote_extracts   パッチノート解析結果（confidence付き、riot_id未解決はnull）

Layer 1: 正規状態
  patches              パッチマスタ（version="26.13", hotfix="26.13b", sort_keyで全順序）
  item_states          パッチごとの確定した姿（ItemStateData jsonb + provenance）
  manual_overrides     フィールド単位・パッチ範囲付きの手動修正

Layer 2: 変更イベント
  item_changes         パッチごとの変更（buff/nerf/... + ChangeEntry[] + review_status）

公開用（既存UI互換）
  items                「公開中の現在状態」。publish時にitem_statesからmaterialize
  item_manual_settings 有効/除外の手動設定（is_available決定の最優先）
  additional_tags / role_categories  キュレーションデータ（publish時にitemsへ反映）
```

### パッチ命名の対応

ゲームパッチ名とDDragonバージョンは命名体系が異なる: **26.N ↔ 16.N.x**（例: 26.13 ↔ 16.13.1）。`patches.version` はゲームパッチ名、`ddragon_version` は別カラム。hotfix（Bパッチ）はDDragonに存在しないため `ddragon_version=null` で、パッチノート抽出のみを根拠に状態を更新する。

### ItemStateData（item_states.data）

`src/types/domain/itemState.ts` 参照。ポイント:
- DDragon rawのスプライト座標ノイズ（毎パッチ約9割のアイテムで変化）を捨てた正規形
- アビリティは独自スキーマが正: `key`（パッチ間で安定）、`sourceText`（自動抽出、diff対象）、`descriptionJa`（`{param}`プレースホルダー付きテンプレート、人間がキュレーション）、`params`（`AbilityNumericParam`）

## データパイプライン（scripts/）

純粋ロジックは `src/core/`（supabase/fetch非依存、vitestでgolden test）、DB書き込みは `scripts/`（tsx + Drizzle runtime、DATABASE_URL直結）。

```
1. ingest    DDragon取り込み: patches upsert → 全アイテムsnapshot → 新規アイテム画像
2. fetch-note パッチノート生HTML保存（URLは手動登録。スラッグが不統一なため）
3. extract   解析 → patchnote_extracts（--rerunで再抽出可能）
4. propose   mergeItemState → item_states / diff+抽出 → item_changes（pending）
5. publish   有効状態をitemsへmaterialize（承認済みのみpatch_statusに反映）
```

```bash
npm run pipeline:ingest     -- --patch 26.13
npm run pipeline:fetch-note -- --patch 26.13 --url https://...
npm run pipeline:extract    -- --patch 26.13 [--rerun]
npm run pipeline:propose    -- --patch 26.13 [--force]
npm run pipeline:publish    -- --patch 26.13
npm run pipeline:backfill   -- --from 26.1 --to 26.13 --notes-manifest scripts/notes.json
```

不変条件:
- approved/rejected の item_changes は `--force` なしでは上書きされない
- 最初のパッチ（前パッチなし）は基準データ扱いで changes を生成しない
- hotfixパッチの item_states は変更のあったアイテムのみ疎に持つ（状態解決は sort_key 順の最新）

GitHub Actions（`.github/workflows/data-pipeline.yml`）:
- `workflow_dispatch` で任意ステージを実行（**publishは必ず手動**）
- 毎日cronで新DDragonバージョンを検知し ingest のみ自動実行（`scripts/watch-new-patch.ts`）
- 必要Secrets: `DATABASE_URL` / `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`

## 管理フロー（新パッチが来たら）

1. cron（または手動 ingest）が新パッチを取り込む
2. `/admin/patches` でパッチノートURLを登録 → fetch-note / extract / propose を実行
3. `/admin/review?patch=26.x` で提案を承認・修正・却下
   - 修正は manual_overrides として記録 → `propose --force` で states に反映
   - 名前解決に失敗した抽出はレビュー画面上部で手動紐付け → propose 再実行
4. レビュー完了後 `pipeline:publish` で公開（items反映 + patches.status='published'）

## セキュリティ（RLS）

- 新テーブルは全てRLS有効。anonは patches(published) / item_changes(approved) / item_states(公開済みパッチ分) のSELECTのみ
- Layer 0 と manual_overrides に anon ポリシーなし
- 管理UIの書き込みは Supabase Auth（authenticated）が必要 → `/admin/login`
- scripts/ は DATABASE_URL 直結（RLS対象外）。サービス系秘密は .env / GitHub Secrets のみ

## テスト

`npm run test`（vitest）。`src/core/__fixtures__/` に実DDragonデータ（パッチ26.1/26.2/26.13の抜粋）と実パッチノートHTML（26.13）をコミットしており、パーサー・マージ・diffはgolden testで回帰検知する。パッチノートのDOM構造が変わったら: fixtureを更新 → パーサー修正 → テスト緑 → `pipeline:extract --rerun`。
