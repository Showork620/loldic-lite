# プロジェクト引き継ぎ事項

## 共通事項
- 進行は日本語で行う
- docs/implementation_plan.md はプロジェクト全体にかかる計画書である
- conversation ごとに xxx_implementation_plan.md を作成して良い

## ⚠️ ディレクトリ構造ルール（重要）

プロジェクトはハイブリッド型の階層構造を採用しています。**このルールを必ず遵守してください。**

### 配置基準

1. **pages/{page}/index.tsx**: ルーティング単位のページコンポーネント
   - URLパスと一致するディレクトリ構造
   - 例: `/admin/data-sync` → `pages/admin/data-sync/index.tsx`

2. **pages/{page}/features/**: ページ専用コンポーネント
   - そのページでのみ使用されるコンポーネント
   - 各機能ごとにサブディレクトリを作成
   - 例: `pages/admin/data-sync/features/ExclusionManager/`

3. **components/ui/**: 汎用UIコンポーネント
   - 複数のページで再利用可能なコンポーネント
   - Button, Input, Dialog等の基本UI部品

4. **components/layout/**: レイアウトコンポーネント
   - Header, Footer, Sidebar, MainLayout等

5. **components/{domain}/**: ドメイン共通コンポーネント
   - 特定ドメイン（admin等）で共有されるコンポーネント
   - 例: `components/admin/PatchVersionDisplay/`

6. **lib/{service}/**: ビジネスロジック・外部サービス連携
   - Riot API連携: `lib/riot/`
   - Supabase連携: `lib/supabase/`
   - re-exportのため各ディレクトリに`index.ts`を配置

7. **types/domain/**: ドメインモデル
   - Item, Stats等のビジネス概念
   - `types/shared.ts`: 共通型定義

8. **utils/**: 純粋関数の汎用ユーティリティ
   - 特定のサービスに依存しない関数のみ
   - 例: caseConverter, imageProcessing

### 禁止事項

❌ ページ専用コンポーネントを`components/`に配置しない  
❌ ビジネスロジックを`utils/`に配置しない  
❌ 外部サービス連携コードを`utils/`に配置しない  
❌ URLパスとディレクトリ構造を不一致にしない

### ファイル命名規則

- ページ: `index.tsx` （ディレクトリ名がページ名）
- コンポーネント: `ComponentName.tsx` + `ComponentName.module.css`
- 同一機能は1ディレクトリにまとめる


## 現状ステータス（2026-07 アーキテクチャ全面刷新済み）

3層データモデル（生データ / 正規状態 / 変更イベント）＋データパイプライン＋レビューキュー＋公開タイムラインまで実装完了。
詳細は `docs/architecture.md` と `docs/task.md` を参照。

- **コア原則**: 生データ不変・正規データは純粋マージで再導出・手動修正はオーバーライド・自動化は提案まで（人間が承認）
- **パッチ命名**: ゲームパッチ 26.N ↔ DDragon 16.N.x。hotfix（26.Nb）はDDragonに存在しない
- **パイプライン**: `npm run pipeline:*`（ingest → fetch-note → extract → propose → publish）。scripts/ はDATABASE_URL直結
- **テスト**: `npm run test`（vitest、実データfixtureのgolden test）。パーサー修正時はfixture更新→`pipeline:extract --rerun`

## プロジェクト概要
LoLアイテムの最新能力＋パッチをまたぐ能力の変遷履歴を提供するSPA。
DDragonだけでは能力データが不完全なため、公式パッチノート解析＋人手キュレーションを継続的に取り込む。

## 決定済みの技術スタック
- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS (CSS Modules)
- **Backend**: Supabase (PostgreSQL + RLS, Storage, Auth)
- **Pipeline**: Node (tsx) + Drizzle ORM + cheerio + sharp、GitHub Actions（無料枠）
- **画像処理**: パイプライン側でsharp（64x64 WebP）。ブラウザ側Canvas版もフォールバックとして残置

## 次のアクション（運用開始）
1. Supabase本番へマイグレーション適用＋Auth管理者作成＋GitHub Secrets設定
2. `pipeline:backfill -- --from 26.1 --to 26.13 --notes-manifest scripts/notes.json`
3. `/admin/review` でレビュー → `pipeline:publish`

## 参照ファイル
- `README.md`: プロジェクト概要とセットアップガイド
- `docs/architecture.md`: アーキテクチャ詳細（データモデル・パイプライン・運用フロー）
- `docs/task.md`: 進捗と残タスク
