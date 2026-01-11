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


## 現状ステータス
- **Phase 0 (計画・設計)**: 完了
- **Phase 1 (基盤構築)**: 完了
- **Phase 2 (デザインシステム構築)**: 完了
- **Phase 3 (管理画面機能構築)**: 完了
- **Phase 3.1 (管理画面用コンポーネント追加)**: 完了
- **Phase 3.2 (パッチ管理機能)**: 進行中
- **ディレクトリ構造リファクタリング**: 完了 ✅

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
1. Phase 3.2のパッチ管理機能の完成
2. タグ・ロール管理画面の完成
3. Phase 4（公開画面機能）へ移行

## 参照ファイル
- `README.md`: プロジェクト概要とセットアップガイド
- `docs/task.md`: 全体の工程表  
- `docs/implementation_plan.md`: 詳細仕様書
- `.gemini/antigravity/brain/.../walkthrough.md`: リファクタリング完了報告
