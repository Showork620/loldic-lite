-- Custom SQL migration file, put your code below! --

-- RLSポリシー: 新パイプラインテーブル
--
-- 方針:
-- - 全新テーブルで RLS を有効化
-- - anon(公開画面)の SELECT は「公開済み/承認済み」の条件付きのみ
-- - Layer 0（生データ）と manual_overrides には anon ポリシーを作らない
--   （＝anonからは読めない・書けない）
-- - authenticated(管理者)は読み書き可（Phase 3 の Supabase Auth 導入とセット）
-- - scripts/ は DATABASE_URL 直結（postgresロール）のため RLS の対象外

ALTER TABLE "patches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ddragon_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "patchnote_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "patchnote_extracts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "item_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "manual_overrides" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "item_changes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- anon: 公開済みパッチのみ閲覧可
CREATE POLICY "anon_select_published_patches" ON "patches"
  FOR SELECT TO anon
  USING (status = 'published');--> statement-breakpoint

-- anon: 承認済みの変更イベントのみ閲覧可（公開タイムライン）
CREATE POLICY "anon_select_approved_changes" ON "item_changes"
  FOR SELECT TO anon
  USING (review_status = 'approved');--> statement-breakpoint

-- anon: 正規状態は公開済みパッチ分のみ閲覧可
CREATE POLICY "anon_select_item_states" ON "item_states"
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM patches p
      WHERE p.version = item_states.patch_version AND p.status = 'published'
    )
  );--> statement-breakpoint

-- authenticated(管理者): 管理対象テーブルの全操作
CREATE POLICY "authenticated_all_patches" ON "patches"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "authenticated_all_extracts" ON "patchnote_extracts"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "authenticated_all_states" ON "item_states"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "authenticated_all_overrides" ON "manual_overrides"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "authenticated_all_changes" ON "item_changes"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "authenticated_select_documents" ON "patchnote_documents"
  FOR SELECT TO authenticated USING (true);--> statement-breakpoint
CREATE POLICY "authenticated_select_snapshots" ON "ddragon_snapshots"
  FOR SELECT TO authenticated USING (true);
