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
- [ ] レイアウトコンポーネント作成 (Header, Footer, MainLayout) <!-- id: 9 -->

## Phase 3: 管理画面機能 (Admin)
- [ ] ルーティング設定 (React Router) <!-- id: 10 -->
- [ ] Riot API 取得用ユーティリティ実装 <!-- id: 11 -->
- [ ] 画像処理ユーティリティ実装 (Canvas使用: Resize, WebP変換) <!-- id: 12 -->
- [ ] Supabase Storage アップロード処理実装 <!-- id: 13 -->
- [ ] アイテムデータ保存・更新処理実装 <!-- id: 14 -->
- [ ] 管理画面UI実装 (APIデータ取得 -> 編集 -> 保存のフロー) <!-- id: 15 -->

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
