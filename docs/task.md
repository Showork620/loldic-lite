# 実装タスクリスト

このドキュメントはプロジェクトの進捗と残タスクを管理します。
アーキテクチャの全体像は [architecture.md](./architecture.md) を参照。

## 完了済み

### 基盤（旧Phase 1〜3.1）
- [x] プロジェクト初期セットアップ (Vite + React + TypeScript)
- [x] デザインシステム構築（Hextechテーマ、UIコンポーネント、カタログページ）
- [x] Supabase / Drizzle セットアップ
- [x] 画像処理・Storageアップロード
- [x] 除外アイテム管理（ExclusionManager）

### アーキテクチャ刷新（2026-07）
- [x] 3層データモデル（生データ / 正規状態 / 変更イベント）のスキーマ＋RLS
- [x] src/core 純粋ロジック層（説明文パーサー、パッチノート解析、マージ、diff、分類）
- [x] vitest ＋ 実データfixtureによるgolden test（49件）
- [x] データパイプライン scripts/（ingest / fetch-note / extract / propose / publish / backfill）
- [x] GitHub Actions（手動dispatch＋新パッチ自動検知cron）
- [x] 管理UI: パッチ管理 `/admin/patches`
- [x] 管理UI: 変更レビューキュー `/admin/review`（承認・修正・却下、オーバーライド作成、抽出の手動紐付け）
- [x] 管理UI: タグ・ロール管理 `/admin/tag-and-role-management`
- [x] Supabase Auth（管理者ログイン `/admin/login`＋RequireAuth）
- [x] 公開UI: アイテム一覧 `/`（名前・ロール・タグ・マップフィルタ）
- [x] 公開UI: アイテム詳細 `/item/:riotId`（アビリティ・ビルドパス・変遷タイムライン）
- [x] dead code削除（baseline/diff旧サブシステム、saveItemLists等）
- [x] ドキュメント刷新（README, architecture.md）

## 運用開始前の残タスク（要ユーザー環境）

- [ ] Supabase本番プロジェクトへのマイグレーション適用（`npm run db:migrate`）
- [ ] Supabase Authで管理者ユーザー作成
- [ ] GitHub Secrets設定（DATABASE_URL / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）
- [ ] バックフィル実行（26.1〜最新、`pipeline:backfill`）
- [ ] 初回レビュー＆publish
- [ ] 既存テーブル（items等）のRLS方針確認（現状はanon書き込み可の可能性）

## Backlog / Future Improvements

- [ ] アビリティパラメータのキュレーションUI（レビュー画面からの{param}テンプレート編集支援）
- [ ] hotfixパッチの実データでの検証（追記型/独立記事型の両方）
- [ ] snapshotの容量監視（無料枠500MB。将来的に古いパッチのraw圧縮/間引き）
- [ ] パッチノートの英語版フォールバック（ja-jp記事が遅れる場合）
- [ ] 任意の2パッチ間diff表示・「パッチX時点のアイテム」タイムトラベル表示
- [ ] カテゴリアイコンの正式版SVG作成・差し替え
- [ ] 将来的にはルーンとチャンピオンの図鑑も作成予定（champion_states等、同じ3層モデルで拡張可能）
