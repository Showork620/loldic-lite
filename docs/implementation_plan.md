# 実装計画書 (Implementation Plan)

## 1. プロジェクト概要
Riot GamesのLoLアイテム情報を管理・閲覧するためのSPA。
管理画面で公式サイト(Riot API)からデータを取得・加工し、軽量化してDB(Supabase)に保存。公開画面でユーザーに快適な検索・閲覧体験を提供する。

## 2. 技術スタック
- **Frontend**: React, TypeScript, Vite
- **Styling**: Vanilla CSS (CSS Modules or Scoped CSS), Design Tokens
- **State Management**: React Context or Custom Hooks
- **Routing**: React Router v6
- **Backend / DB**: Supabase (PostgreSQL, Storage, Auth)
- **ORM**: Drizzle ORM
- **Image Processing**: Canvas API (Client-side processing)

## 3. ディレクトリ構造

プロジェクトはハイブリッド型の階層構造を採用し、責務を明確に分離しています。

```
src/
├── pages/                   # ページ（ルーティング単位）
│   ├── public/              # 公開ページ
│   │   └── index.tsx        # / ルート
│   ├── admin/               # 管理ページ
│   │   ├── index.tsx        # /admin ルート
│   │   ├── data-sync/
│   │   │   ├── index.tsx    # /admin/data-sync ルート
│   │   │   └── features/    # data-syncページ専用コンポーネント
│   │   │       ├── ExclusionManager/
│   │   │       ├── ImageSyncSection/
│   │   │       ├── FilterButtonGroup/
│   │   │       └── RawDataModal/
│   │   └── tag-and-role-management/
│   │       ├── index.tsx
│   │       └── features/    # tag-and-role-managementページ専用コンポーネント
│   └── dev/                 # 開発者向けページ
│       └── catalog/
│           ├── index.tsx    # /dev/catalog ルート
│           └── features/    # catalogページ専用コンポーネント
│
├── components/              # 汎用コンポーネント（複数ページで再利用）
│   ├── ui/                  # 基本UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Dialog.tsx
│   │   └── ...              # 他の汎用UIコンポーネント
│   ├── layout/              # レイアウトコンポーネント
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   └── admin/               # 管理画面共通コンポーネント
│       ├── PatchVersionDisplay/
│       └── PatchUpdateModal/
│
├── lib/                     # ビジネスロジック・外部サービス連携
│   ├── riot/                # Riot API関連
│   │   ├── riotApi.ts       # Data Dragon API通信
│   │   ├── riotItemManager.ts # アイテムデータ処理
│   │   ├── patchManager.ts  # パッチバージョン管理
│   │   └── index.ts         # re-export
│   ├── supabase/            # Supabase関連
│   │   ├── supabaseData.ts  # データCRUD
│   │   ├── supabaseStorage.ts # ストレージ操作
│   │   ├── patchData.ts     # パッチデータ管理
│   │   ├── imageUpdater.ts  # 画像更新
│   │   └── index.ts         # re-export
│   └── supabase.ts          # Supabaseクライアント初期化
│
├── types/                   # 型定義
│   ├── domain/              # ドメインモデル（ビジネスの核心概念）
│   │   ├── item.ts          # アイテム関連型
│   │   ├── stats.ts         # ステータス型
│   │   ├── abilityStats.ts  # アビリティステータス型
│   │   ├── role.ts          # ロール関連型
│   │   └── maps.ts          # マップ関連型
│   └── shared.ts            # 共通型定義
│
├── utils/                   # 汎用ユーティリティ（純粋関数）
│   ├── caseConverter.ts     # camelCase ⇔ snake_case
│   └── imageProcessing.ts   # Canvas画像処理
│
├── db/                      # データベース関連
│   ├── schema.ts            # Drizzle スキーマ定義
│   └── migrations/          # マイグレーションファイル
│
├── constants/               # 定数定義
│   ├── riotApi.ts           # API関連定数
│   └── seedData.ts          # シードデータ
│
├── assets/                  # 静的リソース
├── App.tsx                  # アプリケーションルート
└── main.tsx                 # エントリーポイント
```

### 責務の分離原則

| ディレクトリ | 責務 | 例 |
|------------|------|-----|
| `pages/{page}/index.tsx` | ルーティング単位のページ | URLパスと一致 |
| `pages/{page}/features/` | ページ専用コンポーネント | そのページでのみ使用 |
| `components/ui/` | 汎用UIコンポーネント | Button, Dialog等 |
| `components/layout/` | レイアウトコンポーネント | Header, Footer等 |
| `components/{domain}/` | ドメイン共通コンポーネント | 管理画面全体で共有 |
| `lib/{service}/` | ビジネスロジック・外部連携 | Riot API, Supabase |
| `types/domain/` | ドメインモデル | Item, Stats等 |
| `utils/` | 純粋関数ユーティリティ | 外部依存なし |


## 4. データベース設計 (Supabase + Drizzle)

### Table: `items`
アイテムの基本情報を格納するテーブル。

| Column Name | Type | データソース | Description |
|---|---|---|---|
| id | uuid | Auto | Primary Key |
| riot_id | text | **API** | Riot API上のID (例: "3031") |
| name_ja | text | **API** | アイテム名 (日本語) |
| is_available | boolean | **API** | ゲーム内有効アイテムか（購入可能 or 購入可能アイテムから派生） |
| abilities | jsonb | **手動** | 能力リスト [{type, name, description}, ...] |
| plaintext_ja | text | **API (初回のみ)** | 短い説明文（パッチ更新時は保持） |
| price_total | int | **API** | 総価格 |
| price_sell | int | **API** | 売却価格 |
| image_path | text | **API** | Supabase Storageへのパス |
| patch_status | text | **手動** | 最新パッチでの更新種別 (buff/nerf/rework/removed/new/revived/adjusted/unchanged) |
| search_tags | text[] | **API (初回のみ)** | 検索用タグ ["attack-damage", "体力回復", "クリティカル"] |
| role_categories | text[] | **手動** | ロール分類 ["mage", "support", "fighter", "tank", "marksman", "assassin"] |
| popular_champions | text[] | **手動** | よく使うチャンピオンID一覧 |
| stats | jsonb | **API** | ステータス詳細 { "attack_damage": 60, ... } |
| build_from | text[] | **API** | 素材元アイテムID一覧 |
| build_into | text[] | **API** | 派生先アイテムID一覧 |
| created_at | timestamp | Auto | 作成日時 |
| updated_at | timestamp | 更新日時 |

#### データ管理フロー
- **初回登録時**: APIフィールドを自動登録、手動フィールドはnull
- **パッチ更新時**: APIフィールドのみ更新、手動フィールド・plaintext_ja・search_tagsは保持
- **手動入力**: abilities, popular_champions, role_categories, patch_statusは管理画面で入力・編集

### Table: `item_patch_history`
パッチごとのアイテム変更履歴を記録するテーブル。

| Column Name | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| item_id | uuid | 外部キー → items.id |
| patch_version | text | パッチバージョン (例: "14.23") |
| patch_date | date | パッチ適用日 |
| change_type | text | 変更種別 (buff/nerf/rework/removed/new/revived/adjusted) |
| change_summary | text | 変更内容の要約 (例: "攻撃力 +10, クールダウン -5秒") |
| stats_before | jsonb | 変更前のステータス (nullable) |
| stats_after | jsonb | 変更後のステータス (nullable) |
| price_before | int | 変更前の価格 (nullable) |
| price_after | int | 変更後の価格 (nullable) |
| notes | text | 補足情報 (nullable) |
| created_at | timestamp | 作成日時 |

### Storage: `item-images`
- `public` バケット
- JPEG/PNG -> WebP に変換して保存
- ファイル名規則: `{riot_id}.webp`

## 5. デザインシステム (LoL Hextech Theme)

### カラーパレット (CSS Variables)
- **Primary**: Hextech Blue (#CDFAFA - #0AC8B9) - 魔導テクノロジー感
- **Secondary**: Gold/Bronze (#C89B3C - #785A28) - プレステージ、装飾
- **Background**: Deep Navy (#010A13 - #091428) - 没入感のある暗背景
- **Text**: Off-White (#F0E6D2), Muted Blue-Grey (#A09B8C)
- **Accent**: Danger Red (#E84057), Success Green (#41A990)

### タイポグラフィ
- 見出し: Serif or Strong Sans (重厚感)
- 本文: Sans-serif (可読性重視, Inter/Roboto)

## 6. 機能詳細設計

### 管理画面 (Admin)
1. **Fetch & List**: Riot API (DDragon) から最新バージョンを取得し、アイテム一覧を表示。
2. **Process**: 選択したアイテムの画像をCanvasでロードし、リサイズ(32x32px)・WebP変換。
3. **Edit**: 必要なデータ（日本語テキスト等）をプレビュー・編集。
4. **Upload**: Supabaseへ画像とデータを送信 (Upsert)。

### 公開画面 (Public)
1. **Load**: Supabase `items` テーブルからデータを全件取得。
2. **Filter**: カテゴリ、ステータス、名前でのリアルタイムフィルタリング。
3. **Detail**: アイテムクリックで詳細モーダル表示。

## 7. 開発フロー
1. デザインシステムの基盤作成とカタログページの実装を最初に行い、Look & Feelを固める。
2. DB構築(Drizzle設定)と並行して、APIクライアント機能を作成。
3. 実際のデータを流し込みながらUIを調整。
