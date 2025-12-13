# LoL Item Catalog

League of Legends のアイテム情報を管理・閲覧するための SPA アプリケーション。

## 🎯 プロジェクト概要

Riot Games の Data Dragon API から League of Legends のアイテムデータを取得し、日本語化・カテゴリ分類などの加工を行い、Supabase に保存。管理画面でデータの同期・メンテナンスを行い、公開画面でユーザーに快適なアイテム検索・閲覧体験を提供します。

### 主な機能

- **Riot API 連携**: Data Dragon API からアイテムデータを自動取得
- **データ変換・加工**: アビリティ抽出、タグ翻訳、ロール分類
- **画像処理**: アイテム画像をSupabaseストレージにアップロード（キャッシュ制御付き）
- **定数データ管理**: 除外アイテム、追加タグ、ロール分類をデータベースで管理
- **管理画面**: データ同期、確認、メンテナンスのためのUI
- **公開画面**: エンドユーザー向けのアイテム検索・閲覧UI

## 🛠 技術スタック

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS（カスタムプロパティベース）
- **Routing**: React Router v7
- **UI Icons**: lucide-react
- **Backend/DB**: Supabase (PostgreSQL, Storage)
- **ORM**: Drizzle ORM
- **Image Processing**: Canvas API

## 📁 ディレクトリ構造

```
src/
├── assets/          # 静的リソース
├── components/      # 共通コンポーネント
│   ├── ui/          # 基本UIコンポーネント（Button, Input, Badge等）
│   ├── layout/      # レイアウトコンポーネント（Header, PageWrapper等）
│   └── logic/       # ビジネスロジックを含むコンポーネント
├── features/        # 機能単位のモジュール
│   ├── admin/       # 管理画面機能
│   ├── catalog/     # アイテムカタログ機能
│   └── design/      # デザインシステム・カタログ
├── pages/           # ページコンポーネント
│   ├── AdminPage.tsx          # 管理画面ページ
│   ├── PublicPage.tsx         # 公開画面ページ
│   └── ComponentCatalog.tsx   # コンポーネントカタログ（開発用）
├── db/              # データベース関連
│   ├── schema.ts              # Drizzle スキーマ定義
│   ├── seedConstants.ts       # 定数データシード
│   └── migrations/            # マイグレーションファイル
├── utils/           # ユーティリティ関数
│   ├── riotApi.ts             # Riot API データフェッチ
│   ├── riotDataTransform.ts   # データ変換ロジック
│   ├── supabaseData.ts        # Supabaseデータ操作
│   ├── supabaseStorage.ts     # Supabaseストレージ操作
│   ├── itemSync.ts            # アイテム同期ロジック
│   ├── constantsData.ts       # 定数データ管理
│   ├── imageProcessing.ts     # 画像処理
│   └── caseConverter.ts       # ケース変換
├── lib/             # 外部ライブラリ設定
│   └── supabase.ts            # Supabaseクライアント
├── types/           # 型定義
├── constants/       # 定数定義
└── main.tsx         # アプリケーションエントリーポイント
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、以下の値を設定：

```env
# Supabase設定
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase Database URL (Drizzle ORM用)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Riot API設定 (オプション - Data Dragon APIはキー不要)
VITE_RIOT_API_KEY=your-riot-api-key
```

### 3. Supabase プロジェクトのセットアップ

#### 3.1. プロジェクト作成

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. プロジェクトURLとAnon Keyを `.env` に設定

#### 3.2. データベースマイグレーション

```bash
# マイグレーション実行
npm run db:migrate
```

または、SQL Editor で `src/db/migrations/` にあるマイグレーションファイルを手動実行

#### 3.3. 定数データのシード（オプション）

初期の定数データ（除外アイテム、追加タグ、ロール分類）をインポートする場合は、`src/db/seedConstants.ts` を参照してSupabaseテーブルにデータを挿入します。

#### 3.4. ストレージバケット作成

Supabase Storage で `item-images` バケットを作成し、公開アクセスを有効化します。

### 4. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションが `http://localhost:5173` で起動します。

## 📜 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番用ビルドを生成
- `npm run preview` - ビルドされたアプリをプレビュー
- `npm run lint` - ESLint でコードをチェック
- `npm run format` - Prettier でコードをフォーマット
- `npm run db:generate` - Drizzle のマイグレーションファイルを生成
- `npm run db:migrate` - データベースマイグレーションを実行
- `npm run db:studio` - Drizzle Studio を起動してデータベースを確認

## 🗄️ データベーススキーマ

### `items` テーブル

アイテムのメインデータを格納

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | UUID | 主キー |
| `riot_id` | TEXT | Riot APIのアイテムID（ユニーク） |
| `name_ja` | TEXT | アイテム名（日本語） |
| `is_available` | BOOLEAN | 利用可能フラグ |
| `abilities` | JSONB | アビリティ情報（passive/active） |
| `plaintext_ja` | TEXT | 説明文（日本語） |
| `price_total` | INTEGER | 合計価格 |
| `price_sell` | INTEGER | 売却価格 |
| `image_path` | TEXT | 画像パス |
| `patch_status` | TEXT | パッチステータス情報 |
| `search_tags` | TEXT[] | 検索用タグ配列 |
| `role_categories` | TEXT[] | ロール分類配列 |
| `popular_champions` | TEXT[] | 人気チャンピオン配列 |
| `stats` | JSONB | ステータス情報 |
| `build_from` | TEXT[] | ビルド元アイテムID配列 |
| `build_into` | TEXT[] | ビルド先アイテムID配列 |
| `created_at` | TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | 更新日時 |

### `unavailable_items` テーブル

除外アイテムの管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | UUID | 主キー |
| `riot_id` | TEXT | 除外するアイテムID（ユニーク） |
| `reason` | TEXT | 除外理由 |
| `created_at` | TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | 更新日時 |

### `additional_tags` テーブル

アイテムへの追加タグ管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | UUID | 主キー |
| `riot_id` | TEXT | 対象アイテムID |
| `tag` | TEXT | 追加するタグ |
| `created_at` | TIMESTAMP | 作成日時 |

### `role_items` テーブル

ロール別アイテム分類管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | UUID | 主キー |
| `role` | TEXT | ロール名 |
| `riot_id` | TEXT | 対象アイテムID |
| `created_at` | TIMESTAMP | 作成日時 |

## ⚙️ アプリケーション構成

### ルーティング

- `/` - 公開画面（アイテム検索・閲覧）
- `/admin` - 管理画面（データ同期・メンテナンス）
- `/catalog` - コンポーネントカタログ（開発用）

### 管理画面の機能

1. **Riot APIからデータ取得**: 最新パッチのアイテムデータをフェッチ
2. **データ変換**: 日本語化、タグ付け、ロール分類
3. **画像アップロード**: アイテム画像をSupabaseストレージに保存
4. **データベース保存**: 変換したデータをSupabaseに保存
5. **データ確認**: 保存されたデータの確認とフィルタテスト

## 🎨 デザインシステム

### Hextech Theme カラーパレット

- **Primary**: Hextech Blue (#CDFAFA - #0AC8B9)
- **Secondary**: Gold/Bronze (#C89B3C - #785A28)
- **Background**: Deep Navy (#010A13 - #091428)
- **Text**: Off-White (#F0E6D2), Muted Blue-Grey (#A09B8C)
- **Accent**: Danger Red (#E84057), Success Green (#41A990)

### UI コンポーネント

`/catalog` ページで利用可能なUIコンポーネントのカタログを確認できます：
- Button（Primary, Secondary, Outline, Ghost）
- Input, Select, Combobox
- Badge（各種バリアント）
- Card
- Icon（lucide-reactの全アイコン）

## 📋 開発フロー

1. **Phase 1**: プロジェクト基盤構築 ✅
2. **Phase 2**: デザインシステム構築 ✅
3. **Phase 3**: 管理画面機能 ✅
   - Riot API連携 ✅
   - データ変換ロジック ✅
   - Supabase統合 ✅
4. **Phase 4**: 公開画面機能 🚧
5. **Phase 5**: 最終調整・リリース準備 ⏳

## 📄 ライセンス

このプロジェクトは個人的な学習・実験用途で作成されています。  
League of Legends およびその関連コンテンツは Riot Games, Inc. の商標です。
