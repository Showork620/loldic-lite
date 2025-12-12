# プロジェクト引き継ぎ事項

## 共通事項
- 進行は日本語で行う
- docs/implementation_plan.md はプロジェクト全体にかかる計画書である
- conversation ごとに xxx_implementation_plan.md を作成して良い

## 現状ステータス
- **Phase 0 (計画・設計)**: 完了
- **Phase 1 (基盤構築)**: 完了
- **Phase 2 (デザインシステム構築)**: 完了
- **Phase 3 (管理画面機能構築)**: 着手中（task.md参照）

## プロジェクト概要
Riot GamesのLoLアイテム情報を管理・閲覧するためのSPA開発プロジェクト。
既存のJSアプリをReactでリプレースし、デザインシステム導入とバックエンド(Supabase)連携を行う。

## 決定済みの技術スタック
- **Frontend**: React, TypeScript, Vite
- **Styling**: Vanilla CSS, Atomic Design
- **Backend**: Supabase (PostgreSQL, Storage)
- **ORM**: Drizzle ORM
- **画像処理**: 管理画面側でCanvasを使用し 32x32px WebP に変換してStorageへ保存

## 次のアクション
1. プロジェクトの初期化 (`create-vite`)
2. `task.md` に従い、Phase 3 のタスクを順次実行する。

## 参照ファイル
- `/Users/uemura/projects/ag-experiments/task.md`: 全体の工程表
- `/Users/uemura/projects/ag-experiments/implementation_plan.md`: 詳細仕様書
