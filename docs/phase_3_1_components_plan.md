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

## 実装順序

1. **ProgressBar** - 最もシンプル、CSSアニメーション練習
2. **StatusBadge** - 既存Badgeの拡張、カラーマッピング
3. **ConfirmDialog** - モーダル実装、フォーカストラップ
4. **NotificationToast** - Context API、複数管理、タイマー

---

## コンポーネントカタログへの追加

各コンポーネント実装後、`ComponentCatalog.tsx` に以下を追加:

### ProgressBar デモ
- Determinate（0%, 50%, 100%）
- Indeterminate
- サイズバリエーション

### StatusBadge デモ
- 全ステータス一覧（Sync + Patch）
- サイズバリエーション
- アイコン有無

### ConfirmDialog デモ
- Info/Warning/Danger バリアント
- ボタンでモーダルを開く

### NotificationToast デモ
- 各typeのトースト表示ボタン
- 複数同時表示のテスト

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
