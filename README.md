# LoL Item Catalog (loldic)

League of Legends のアイテムの**最新の能力**と**パッチをまたぐ能力の変遷履歴**を閲覧できる SPA アプリケーション。

## 🎯 プロジェクト概要

Riot Games の Data Dragon API はアイテムの能力を完全には提供しない（アビリティは説明文HTMLに非構造で埋まっており、数値すら無いものもある）。このプロジェクトは **DDragon ＋ 公式パッチノート解析 ＋ 人間のキュレーション** の3ソースを組み合わせ、パッチごとのアイテム状態と変更イベントを蓄積・公開する。

設計の5原則（詳細は [docs/architecture.md](./docs/architecture.md)）:

1. **生データは不変**（append-only。パーサー修正後にいつでも再導出できる）
2. **正規データは純粋マージで再導出可能**（manual > patchnote > ddragon）
3. **手動修正はフィールド単位・パッチ範囲付きオーバーライド**（再同期で消えない）
4. **変更イベントが第一級**（公開タイムラインの実体）
5. **自動化は提案まで。人間が承認して初めて公開される**

### 主な機能

- **データパイプライン**: DDragon取り込み → パッチノート解析 → 変更提案の自動生成（ローカルCLI / GitHub Actions、全て無料枠内）
- **レビューキュー**: 自動生成された変更提案（buff/nerf/rework…）を管理画面で承認・修正・却下
- **公開画面**: アイテム一覧（ロール・タグ・マップフィルタ）＋ 詳細ページ（アビリティ・ビルドパス・**パッチ変遷タイムライン**）
- **画像処理**: アイテム画像を WebP 化して Supabase Storage に保存

## 🛠 技術スタック

- **Frontend**: React 19, TypeScript, Vite, React Router v7, Vanilla CSS（CSS Modules + カスタムプロパティ）
- **Backend/DB**: Supabase (PostgreSQL + RLS, Storage, Auth)
- **Pipeline**: Node (tsx) + Drizzle ORM + cheerio + sharp、GitHub Actions
- **Test**: Vitest（実データfixtureによるgolden test）

## 📁 ディレクトリ構造

```
src/
├── core/                    # 純粋ドメインロジック（supabase/fetch非依存・要テスト）
│   ├── ddragon/             # 説明文パーサー、stats/tags/アビリティ抽出
│   ├── patchnote/           # パッチノートHTML解析、名前解決、confidence
│   ├── merge/               # mergeItemState（3ソースの優先マージ）
│   ├── diff/                # 状態diff、buff/nerf分類
│   ├── changes/             # 変更提案の生成
│   ├── __fixtures__/        # 実DDragon/パッチノートデータ（コミット済み）
│   └── __tests__/           # golden/unit テスト
├── pages/
│   ├── public/              # / （アイテム一覧）
│   ├── item/                # /item/:riotId （詳細＋変遷タイムライン）
│   ├── admin/
│   │   ├── patches/         # /admin/patches （パッチ管理）
│   │   ├── review/          # /admin/review （変更レビューキュー）
│   │   ├── tag-and-role-management/
│   │   ├── data-sync/       # 画像同期・除外設定
│   │   └── login/           # 管理者ログイン
│   └── dev/catalog/         # コンポーネントカタログ
├── components/              # ui / layout / admin（RequireAuth等）
├── lib/                     # supabase連携・riot API（ブラウザ用）
├── types/domain/            # ItemStateData, ChangeEntry, AbilityNumericParam等
├── utils/                   # 純粋関数（renderAbilityTemplate等）
└── db/                      # Drizzleスキーマ・マイグレーション

scripts/                     # データパイプライン（tsx実行、DATABASE_URL直結）
├── ingest-ddragon.ts        # DDragon取り込み
├── fetch-patchnote.ts       # パッチノート生HTML保存
├── extract-patchnote.ts     # 解析 → patchnote_extracts
├── propose-changes.ts       # 状態構築 ＋ 変更提案（pending）
├── publish.ts               # itemsテーブルへ公開
├── backfill.ts              # 過去パッチ一括取り込み
├── watch-new-patch.ts       # 新パッチ検知（cron用）
└── notes.json               # パッチノートURLマニフェスト
```

## 🚀 セットアップ

### 1. 依存関係と環境変数

```bash
npm install
cp .env.example .env   # 値を設定
```

| 変数 | 用途 |
|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | ブラウザ（公開・管理UI） |
| `DATABASE_URL` | パイプライン＆マイグレーション（Postgres直結） |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | パイプラインの画像アップロード |

### 2. Supabase セットアップ

1. [Supabase](https://supabase.com/) でプロジェクト作成
2. `npm run db:migrate` でマイグレーション適用（RLSポリシー含む）
3. Storage で `item-images` バケットを作成し公開アクセスを有効化
4. Authentication で管理者ユーザー（email/password）を1人作成

### 3. 初回データ投入（バックフィル）

```bash
# 2026シーズン全パッチを取り込み（snapshot＋パッチノート＋変更提案の生成）
npm run pipeline:backfill -- --from 26.1 --to 26.13 --notes-manifest scripts/notes.json

# レビュー（/admin/review で承認）後に公開
npm run pipeline:publish -- --patch 26.13
```

### 4. 開発サーバー

```bash
npm run dev   # http://localhost:5173
```

## 🔁 新パッチが来たときの運用

1. **検知/取り込み**: GitHub Actions の cron が自動で ingest（または `npm run pipeline:ingest -- --patch 26.14`）
2. **パッチノート**: `/admin/patches` でURLを登録 → `pipeline:fetch-note` → `pipeline:extract` → `pipeline:propose`
3. **レビュー**: `/admin/review?patch=26.14` で提案を承認・修正・却下（修正はオーバーライドとして記録）
4. **公開**: `npm run pipeline:publish -- --patch 26.14`

hotfix（Bパッチ）は `pipeline:fetch-note -- --patch 26.14b --hotfix --url <URL>` から同じ流れ。

## 📜 スクリプト

| コマンド | 説明 |
|---|---|
| `npm run dev` / `build` / `preview` | Vite 開発・ビルド・プレビュー |
| `npm run lint` / `format` / `test` | ESLint / Prettier / Vitest |
| `npm run pipeline:*` | データパイプライン（上記参照） |
| `npm run db:generate` / `db:migrate` / `db:studio` | Drizzle マイグレーション |

## 🗄️ データベース

3層モデル（Layer 0 生データ / Layer 1 正規状態 / Layer 2 変更イベント）＋公開用 `items`。詳細は [docs/architecture.md](./docs/architecture.md)。

| テーブル | 役割 |
|---|---|
| `patches` | パッチマスタ（26.13 / hotfix 26.13b、sort_keyで全順序） |
| `ddragon_snapshots` | DDragon item.json 生エントリ（append-only） |
| `patchnote_documents` / `patchnote_extracts` | パッチノート生HTML／解析結果 |
| `item_states` | パッチごとの正規状態（provenance付き） |
| `manual_overrides` | フィールド単位・パッチ範囲付き手動修正 |
| `item_changes` | 変更イベント（review_status: pending/approved/rejected） |
| `items` | 公開中の現在状態（publish時にmaterialize） |
| `item_manual_settings` / `additional_tags` / `role_categories` | キュレーション |

## ⚙️ ルーティング

- `/` — アイテム一覧（フィルタ付き）
- `/item/:riotId` — アイテム詳細＋変遷タイムライン
- `/admin` — ダッシュボード（要ログイン）
- `/admin/patches` — パッチ管理
- `/admin/review` — 変更レビューキュー
- `/admin/data-sync` — 画像同期・除外設定
- `/admin/tag-and-role-management` — タグ・ロール管理
- `/admin/login` — 管理者ログイン
- `/dev/catalog` — コンポーネントカタログ

## 🎨 デザインシステム

Hextech Theme（CSS カスタムプロパティ + CSS Modules）。`/dev/catalog` でUIコンポーネントのカタログを確認できる。

## 📄 ライセンス

このプロジェクトは個人的な学習・実験用途で作成されています。
League of Legends およびその関連コンテンツは Riot Games, Inc. の商標です。
