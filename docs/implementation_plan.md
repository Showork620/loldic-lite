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
```
src/
├── assets/          # 静的リソース
├── components/      # 共通コンポーネント
│   ├── ui/          # Atomic Designに基づく基本UIパーツ (Atoms/Molecules)
│   ├── layout/      # ヘッダー、ラッパー等のレイアウト
│   └── logic/       # ビジネスロジックを含むコンポーネント
├── features/        # 機能単位のモジュール
│   ├── admin/       # 管理画面機能
│   ├── catalog/     # アイテム図鑑公開機能
│   └── design/      # デザインシステム・カタログ
├── lib/             # 外部ライブラリ設定 (Supabase, Drizzle等)
├── db/              # Drizzle Schema & Migrations
├── utils/           # ユーティリティ関数 (画像圧縮、フォーマット等)
├── types/           # 型定義
└── pages/           # ページコンポーネント (ルーティング単位)
```

## 4. データベース設計 (Supabase + Drizzle)

### Table: `items`
アイテムの基本情報を格納するテーブル。
長い説明文も、取得パフォーマンスと管理の単純化のため同テーブルで管理する。

| Column Name | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| riot_id | text | Riot API上のID (例: "3031") |
| name_ja | text | アイテム名 (日本語) |
| description_ja | text | 説明文 (HTML/Markdown) |
| plaintext_ja | text | 短い説明文 |
| price_total | int | 総価格 |
| price_sell | int | 売却価格 |
| is_legendary | boolean | レジェンダリーかどうか |
| image_path | text | Supabase Storageへのパス |
| tags | text[] | タグ (Mage, Tank等) |
| stats | jsonb | ステータス詳細 { "attack_damage": 60, ... } |
| build_from | text[] | 素材元アイテムID一覧 |
| build_into | text[] | 派生先アイテムID一覧 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

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
