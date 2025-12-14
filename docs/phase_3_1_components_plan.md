# Phase 3.1: UIコンポーネント実装計画

## 概要

Phase 3.1（データ同期基盤）で使用する4つの新規UIコンポーネントを実装します。既存のHextechテーマとデザインシステムに準拠し、コンポーネントカタログで動作確認できるようにします。

---

## 1. ProgressBar（進捗バー）

### 用途
- データ同期処理の進捗表示
- 画像アップロードの進行状況

### プロパティ

```typescript
interface ProgressBarProps {
  value: number;              // 進捗値 (0-100)
  label?: string;             // 表示ラベル (例: "同期中... 45/100")
  variant?: 'determinate' | 'indeterminate'; // 確定/不確定
  size?: 'sm' | 'md' | 'lg';  // サイズ
  showPercentage?: boolean;   // パーセンテージ表示
  className?: string;
}
```

### デザイン仕様

#### カラー
- **背景**: `var(--color-navy-700)` - 暗めの背景
- **進捗バー**: Hextech Blue グラデーション
  - 開始: `var(--color-hextech-blue-500)`
  - 終了: `var(--color-hextech-blue-300)`
- **テキスト**: `var(--color-text-primary)`
- **Glow効果**: `var(--glow-blue)` で発光

#### サイズ
- `sm`: height 4px
- `md`: height 8px（デフォルト）
- `lg`: height 12px

#### アニメーション
- **determinate**: スムーズなトランジション（`transition: width 0.3s ease`）
- **indeterminate**: 左右にスライドするアニメーション

---

## 2. StatusBadge（ステータスバッジ）

### 用途
- データ同期の差分表示（new/updated/deleted/unchanged）
- パッチステータス表示（buff/nerf/rework等）

### プロパティ

```typescript
type SyncStatus = 'new' | 'updated' | 'deleted' | 'unchanged';
type PatchStatus = 'buff' | 'nerf' | 'rework' | 'removed' | 'new' | 'revived' | 'adjusted' | 'unchanged';

interface StatusBadgeProps {
  status: SyncStatus | PatchStatus;
  label?: string;             // カスタムラベル（指定なしの場合はstatusを表示）
  size?: 'sm' | 'md';
  showIcon?: boolean;         // アイコン表示
  className?: string;
}
```

### デザイン仕様

#### カラーマッピング

**同期ステータス**:
- `new`: Blue (`var(--color-info)`) - 新規追加
- `updated`: Yellow/Warning (`var(--color-warning)`) - 更新
- `deleted`: Red (`var(--color-danger)`) - 削除
- `unchanged`: Gray (`var(--color-text-secondary)`) - 変更なし

**パッチステータス**:
- `buff`: Green (`var(--color-success)`) - 強化
- `nerf`: Red (`var(--color-danger)`) - 弱体化
- `rework`: Purple (`#9B59D0`) - リワーク
- `removed`: Dark Red - 削除
- `new`: Blue (`var(--color-info)`) - 新規
- `revived`: Cyan (`var(--color-hextech-blue-300)`) - 復活
- `adjusted`: Yellow (`var(--color-warning)`) - 調整
- `unchanged`: Gray - 変更なし

#### スタイル
- Badgeコンポーネントと同様のスタイル
- 丸みのある角（`border-radius: var(--border-radius-md)`）
- 半透明背景 + ボーダー
- 小さなアイコン付き（オプション）

#### 日本語ラベル
```typescript
const STATUS_LABELS: Record<string, string> = {
  // Sync
  'new': '新規',
  'updated': '更新',
  'deleted': '削除',
  'unchanged': '変更なし',
  // Patch
  'buff': '強化',
  'nerf': '弱体化',
  'rework': 'リワーク',
  'removed': '削除',
  'revived': '復活',
  'adjusted': '調整',
};
```

---

## 3. ConfirmDialog（確認ダイアログ）

### 用途
- データ同期実行前の確認
- アイテム削除の確認
- 破壊的変更の警告

### プロパティ

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;      // デフォルト: "確認"
  cancelLabel?: string;       // デフォルト: "キャンセル"
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'info' | 'warning' | 'danger'; // 重要度
  showIcon?: boolean;
}
```

### デザイン仕様

#### レイアウト
- **オーバーレイ**: 半透明の暗い背景（`rgba(0, 0, 0, 0.7)`）
- **モーダル**: 中央配置
  - 幅: 最大 `480px`
  - パディング: `var(--space-6)`
  - 背景: `var(--color-navy-800)`
  - ボーダー: Hextech Blue or Gold（variantによる）

#### バリアント別カラー
- `info`: Blue border (`var(--color-info)`)
- `warning`: Gold border (`var(--color-warning)`)
- `danger`: Red border (`var(--color-danger)`)

#### アニメーション
- フェードイン/スライドイン
- オーバーレイクリックで閉じる（onCancelを呼ぶ）
- ESCキーで閉じる

#### ボタン配置
- 右下にボタン2つ
- キャンセル（ghost） + 確認（variantに応じた色）

---

## 4. NotificationToast（通知トースト）

### 用途
- 保存成功/失敗の通知
- エラーメッセージ表示
- 処理完了の通知

### プロパティ

```typescript
interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;          // 表示時間（ミリ秒、デフォルト: 3000）
  onClose?: () => void;
}

interface NotificationToastContextValue {
  showToast: (message: string, type: ToastProps['type'], duration?: number) => void;
  hideToast: (id: string) => void;
}
```

### デザイン仕様

#### 配置
- 画面右上に固定（`position: fixed; top: 20px; right: 20px;`）
- 複数のトーストはスタック表示（最新が上）
- z-index: 9999

#### カラーマッピング
- `success`: Green background (`var(--color-success)`)
- `error`: Red background (`var(--color-danger)`)
- `warning`: Yellow background (`var(--color-warning)`)
- `info`: Blue background (`var(--color-info)`)

#### スタイル
- 幅: `320px`
- 背景: 半透明（`rgba(色, 0.95)`）
- ボーダー: 対応する色
- テキスト: White
- アイコン: 左側に配置（success=チェック、error=X、warning=!、info=i）
- 閉じるボタン: 右上

#### アニメーション
- **表示**: スライドイン（右からフェードイン）
- **非表示**: スライドアウト（右へフェードアウト）
- **プログレスバー**: 下部に薄いバー、時間経過とともに減少

#### Context API
React Contextで全体管理:
```typescript
<NotificationToastProvider>
  <App />
</NotificationToastProvider>
```

使用例:
```typescript
const { showToast } = useNotificationToast();
showToast('保存しました', 'success');
```

---

## 5. Card（基本カード）

### 用途
- 汎用的なカードコンテナ
- アイテムプレビュー等の基礎コンポーネント
- 統計情報表示

### プロパティ

```typescript
interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}
```

### デザイン仕様

#### カラー
- **背景**: `var(--color-navy-800)`
- **ボーダー**: Hextech Blue (`var(--color-hextech-blue-400)`)
- **ホバー**: Glow効果 (`var(--glow-blue)`)

#### バリアント
- `default`: 背景のみ、ボーダーなし
- `outlined`: 背景 + ボーダー
- `elevated`: 背景 + シャドウ + Glow

#### パディング
- `sm`: `var(--space-2)`
- `md`: `var(--space-4)` (デフォルト)
- `lg`: `var(--space-6)`

---

## 6. ItemImage（アイテム画像表示）

### 用途
- 全アイテムプレビューでの共通画像表示
- 画像取得・エラーハンドリング

### プロパティ

```typescript
interface ItemImageProps {
  imagePath: string;           // Supabase Storage パス
  alt: string;                 // 代替テキスト
  size?: number;               // CSS表示サイズ（デフォルト: 32）
  className?: string;
}
```

### デザイン仕様

> [!IMPORTANT]
> アイテム画像は全て **32x32px** が元サイズです。表示時の拡大は CSS で対応します。

#### 機能
- Supabase Storageからの画像取得
- フォールバック画像（画像がない場合）
- ローディング状態表示（Skeleton）
- 画像エラー処理

#### スタイル
- 正方形表示
- `border-radius: var(--border-radius-sm)`
- 薄いボーダー（Hextech Blue）

---

## 7. ItemPreviewSync（同期用アイテムプレビュー）

### 用途
- データ同期ページ (`/admin/sync`) での差分確認
- 同期実行前の確認ダイアログ

### プロパティ

```typescript
interface ItemPreviewSyncProps {
  item: Item;                  // アイテムデータ全体
  status: 'new' | 'updated' | 'deleted' | 'unchanged';
  unavailableReason?: string;  // 除外理由（オプション）
  onClick?: () => void;
}
```

### デザイン仕様

#### 表示項目
- ✅ アイテム画像（32x32px）
- ✅ アイテム名（日本語）
- ✅ Riot ID
- ✅ ステータスバッジ（new/updated/deleted/unchanged）
- ✅ 価格
- ⚠️ 除外理由（除外アイテムの場合のみ）

> [!NOTE]
> **ステータスバッジの値について**  
> `status` は `/admin/sync` ページの差分検出ロジックで自動計算され、このコンポーネントに渡されます。

#### レイアウト

横長のリストアイテム形式:

```
┌────────────────────────────────────────────────────────────┐
│ [32x32] アイテム名 (riot_id)  [new/updated] 3000G         │
│         除外理由: 廃止アイテム（除外アイテムの場合のみ）  │
└────────────────────────────────────────────────────────────┘
```

#### カラー
- Card を基礎として使用
- ステータスバッジで視覚的に区別
- 除外理由は薄いテキストで表示

---

## 実装順序

1. **ProgressBar** - 最もシンプル、CSSアニメーション練習 ✅
2. **StatusBadge** - 既存Badgeの拡張、カラーマッピング ✅
3. **ConfirmDialog** - モーダル実装、フォーカストラップ ✅
4. **NotificationToast** - Context API、複数管理、タイマー ✅
5. **Card** - 基本カード、他コンポーネントの基礎
6. **ItemImage** - 画像表示、エラーハンドリング
7. **ItemPreviewSync** - Card + ItemImage + StatusBadge を組み合わせ

---

## コンポーネントカタログへの追加

各コンポーネント実装後、`ComponentCatalog.tsx` に以下を追加:

### ProgressBar デモ ✅
- Determinate（0%, 50%, 100%）
- Indeterminate
- サイズバリエーション

### StatusBadge デモ ✅
- 全ステータス一覧（Sync + Patch）
- サイズバリエーション
- アイコン有無

### ConfirmDialog デモ ✅
- Info/Warning/Danger バリアント
- ボタンでモーダルを開く

### NotificationToast デモ ✅
- 各typeのトースト表示ボタン
- 複数同時表示のテスト

### Card デモ
- バリアント（default/outlined/elevated）
- パディングサイズ
- クリック可能なカード

### ItemImage デモ
- 正常な画像表示
- 存在しない画像（フォールバック）
- ローディング状態
- サイズバリエーション（CSS拡大）

### ItemPreviewSync デモ
- 各ステータス（new/updated/deleted/unchanged）
- 除外理由付きアイテム
- クリック動作

> [!NOTE]
> ItemPreviewSync のデモでは、モックの Item データを使用します。実際のSupabaseデータは不要です。

---

## 技術的考慮事項

### アクセシビリティ
- **ProgressBar**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **ConfirmDialog**: `role="dialog"`, `aria-labelledby`, フォーカストラップ
- **StatusBadge**: `aria-label`でステータスを読み上げ
- **NotificationToast**: `role="alert"`, 自動読み上げ

### パフォーマンス
- CSSトランジション/アニメーションを優先（JS少なめ）
- ToastのタイマーはuseEffectで管理、クリーンアップ必須

### ブラウザ互換性
- CSS GridとFlexboxで対応
- モダンブラウザ前提（IE11サポート不要）

---

## レビューポイント

各コンポーネント実装後、以下を確認:

1. **デザイン**: Hextechテーマに準拠しているか
2. **動作**: アニメーションがスムーズか
3. **レスポンシブ**: モバイル表示で問題ないか
4. **アクセシビリティ**: スクリーンリーダー対応
5. **再利用性**: 他の場所でも使えるか

---

## 次のステップ

コンポーネント実装完了後:
1. コンポーネントカタログで動作確認
2. **👤 ユーザーレビュー**
3. Phase 3.1 ステップ2（データ同期ページ実装）へ
