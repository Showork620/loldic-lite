# 実装タスクリスト

このドキュメントはプロジェクトの進捗と残タスクを管理します。

## Phase 1: プロジェクト基盤構築 
- [x] プロジェクト初期セットアップ (Vite + React + TypeScript) <!-- id: 0 -->
- [x] ESLint, Prettier 設定 <!-- id: 1 -->
- [x] ディレクトリ構造の整備 <!-- id: 2 -->
- [x] Supabase プロジェクト設定・ローカル環境構築 <!-- id: 3 -->
- [x] データベーススキーマ定義 (Itemsテーブル等) <!-- id: 4 -->

## Phase 2: デザインシステム構築 (Aesthetics First)
- [x] デザイン基礎定義 (Colors, Typography, Spacing in `index.css`) <!-- id: 5 -->
- [x] UIコンポーネント実装: Button(完了), Input, Select, Combobox <!-- id: 6 -->
- [ ] UIコンポーネント実装: Card (一旦スキップ) <!-- id: 7 -->
- [x] UIコンポーネント実装: Icons (Generic & Category) <!-- id: 24 -->
- [x] UIコンポーネント実装: Badge <!-- id: 25 -->
- [x] コンポーネントカタログページ (Storybook的な一覧ページ) 作成 <!-- id: 8 -->
- [x] レイアウトコンポーネント作成 (Header, Footer, MainLayout) <!-- id: 9 -->

## Phase 3: 管理画面機能 (Admin)

詳細な実装計画: [admin_implementation_plan.md](./admin_implementation_plan.md)

- [x] ルーティング設定 (React Router) <!-- id: 10 -->
- [x] Riot API 取得用ユーティリティ実装 <!-- id: 11 -->
- [x] 画像処理ユーティリティ実装 (Canvas使用: Resize, WebP変換) <!-- id: 12 -->
- [x] Supabase Storage アップロード処理実装 <!-- id: 13 -->
- [x] アイテムデータ保存・更新処理実装 <!-- id: 14 -->

### Phase 3.1: データ同期基盤
- [ ] データ同期ページ (`/admin/sync`) の実装 <!-- id: 30 -->
  - [ ] バージョン取得・表示機能 <!-- id: 31 -->
  - [ ] アイテムプレビュー機能 <!-- id: 32 -->
  - [ ] 差分検出ロジック <!-- id: 33 -->
  - [ ] 一括同期UI・プログレスバー <!-- id: 34 -->

### Phase 3.2: アイテム管理UI
- [ ] アイテム一覧ページ (`/admin/items`) <!-- id: 35 -->
  - [ ] DataTable コンポーネント実装 <!-- id: 36 -->
  - [ ] 検索・フィルタ機能 <!-- id: 37 -->
- [ ] アイテム詳細編集ページ (`/admin/items/:id`) <!-- id: 38 -->
  - [ ] 編集フォーム実装 <!-- id: 39 -->
  - [ ] アビリティエディタ (JSONまたはフォーム) <!-- id: 40 -->
  - [ ] プレビュー機能 <!-- id: 41 -->

### Phase 3.3: 定数管理UI
- [ ] 定数管理ページ (`/admin/constants`) <!-- id: 42 -->
  - [ ] 除外アイテム管理 <!-- id: 43 -->
  - [ ] 追加タグ管理 <!-- id: 44 -->
  - [ ] ロール分類管理 <!-- id: 45 -->

### Phase 3.4: 補助機能
- [ ] データ検証ページ (`/admin/validation`) <!-- id: 46 -->
- [ ] ダッシュボード拡充（統計情報、クイックアクション） <!-- id: 47 -->

## Phase 4: 公開画面機能 (Public)
- [ ] 公開用アイテム一覧ページ実装 <!-- id: 16 -->
- [ ] フィルタリング・検索ロジック実装 (Supabase query) <!-- id: 17 -->
- [ ] アイテム詳細モーダル/ページ実装 <!-- id: 18 -->
- [ ] レスポンシブ対応・アニメーション調整 <!-- id: 19 -->

## Phase 5: 最終調整・リリース準備
- [ ] SEO設定 (Meta tags, Title) <!-- id: 20 -->
- [ ] パフォーマンス最適化 (Lazy loading, Memoization) <!-- id: 21 -->
- [ ] エラーハンドリング・バグ修正 <!-- id: 22 -->
- [ ] README拡充・ドキュメント整理 <!-- id: 23 -->

## Backlog / Future Improvements
- [ ] カテゴリアイコンの正式版SVG作成・差し替え (現在はプロキシを使用)
- [ ] コンポーネントカタログで利用可能なアイコン一覧を明示する
- [ ] 将来的にはルーンとチャンピオンの図鑑も作成予定
