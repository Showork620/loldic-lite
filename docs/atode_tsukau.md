まずプログラミングする前に設計をはっきりさせます。

# スキーマの更新
## additional_tags、additional_tagsにupdated_atを追加
## items、unavailable_itemsにupdated_patchを追加（更新した最後のバージョンを記録）
## itemsにmaps: Map[]（Map: 'ハウリングアビス'|'サモナーズリフト'）を追加

# 管理画面で行うこと。
## 画像の更新機能ボタン
　- 画像が差し代わることもあるので、保存済みなど見ずに全て保存する
　- 最新のバージョンからRiotApiから全てのアイテム画像を取得して、supabaseに圧縮保存

## RiotApiからアイテムデータをフェッチ、除外アイテムを確認する機能
　- RiotApiからアイテムデータをフェッチ、取得したRawRiotItemData内のアイテムを順番に見て、除外理由*に該当したらreasonとともにunavailableItemsに格納。該当しなければitemsに格納。（RawRiotItemDataを取得。まだDBには保存しない）
　- 画像は圧縮保存したものにアクセス、dbになければapiのURL＋riotIdから直接画像取得
　- unavailableItemsとitemsをそれぞれ一覧表示。
　- 一覧を表示後、一覧のアイテムをdbと比較して、newかどうかをラベル表示（ラベルが表示できるまでスピナーを表示する｜new、-、loadingの3つを持つコンポーネント）
　- unavailableItems一覧では除外理由を編集、または除外解除できる（除外解除: riotIdを使って再度フェッチし、itemsにpushする）
　- items一覧では除外理由を入力、除外追加できる（除外追加: riotIdとreasonがあればいいので、新たなフェッチは不要）
　- つまりitems一覧は画像、riotId、アイテム名、除外理由入力欄、除外ボタン、newかどうかを表示する
　- unavailableItems一覧は画像、riotId、アイテム名、除外理由入力欄（デフォルトで理由表示）、除外解除ボタン、newかどうかを表示する
　- 全てのnew判定完了後、newだけ表示ボタンが活性化する
　- items一覧、unavailableItems一覧はアコーディオン
　- 除外アイテムの編集完了ボタンでDBに編集したitemsとunavailableItemsを反映させる
　- 追加タグとロールカテゴリはこの時まだ使用しない。

*除外理由
```
    // 除外条件1: descriptionが空で、かつinStoreがtrueのもの
    if (item.description === "" && item.inStore) {
      reason = 'description empty';
      results.push({ riotId: itemId, reason });
      continue;
    }

    // 除外条件2: maps.11とmaps.12がともにfalse（ノーマル・ARAMどちらにも出ない）
    if (item.maps && !item.maps['11'] && !item.maps['12']) {
      reason = 'not available on maps';
      results.push({ riotId: itemId, reason });
      continue;
    }

    // 除外条件3: requiredChampionが設定されているもの（チャンピオン専用アイテム）
    if (item.requiredChampion) {
      reason = 'requiredChampion set';
      results.push({ riotId: itemId, reason });
      continue;
    }

    // 除外条件4: inStoreがfalseで、specialRecipeがfalsyのもの
    if (item.inStore === false && !item.specialRecipe) {
      reason = 'not in store（and no specialRecipe）';
      results.push({ riotId: itemId, reason });
      continue;
    }
```

## タグ編集（セレクトボックス）、ロール編集（セレクトボックス）、ability編集（、plaintext編集、patch_stats編集（セレクトボックス）
　- items一覧を表示して各値を編集できる。
　- ここではアイテムごとに保存ボタンがあり、保存ボタンで即時dbに反映する。