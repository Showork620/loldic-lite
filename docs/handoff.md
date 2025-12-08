# プロジェクト引き継ぎ事項 (Phase 0 -> Phase 1)

## 現状ステータス
- **Phase 0 (計画・設計)**: 完了
- **Phase 1 (基盤構築)**: 未着手

## プロジェクト概要
Riot GamesのLoLアイテム情報を管理・閲覧するためのSPA開発プロジェクト。
既存のJSアプリをReactでリプレースし、デザインシステム導入とバックエンド(Supabase)連携を行う。

## 決定済みの技術スタック
- **Frontend**: React, TypeScript, Vite
- **Styling**: Vanilla CSS, Atomic Design
- **Backend**: Supabase (PostgreSQL, Storage)
- **ORM**: Drizzle ORM
- **画像処理**: 管理画面側でCanvasを使用し 32x32px WebP に変換してStorageへ保存

## データ構造の要点
- `items` テーブルに `build_from`, `build_into` (配列) を持たせる。
- 長い説明文も同テーブルで管理する。

## 次のアクション
1. プロジェクトの初期化 (`create-vite`)
2. `task.md` に従い、Phase 1 のタスクを順次実行する。

## 参照ファイル
- `/Users/uemura/projects/ag-experiments/task.md`: 全体の工程表
- `/Users/uemura/projects/ag-experiments/implementation_plan.md`: 詳細仕様書
