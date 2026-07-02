/**
 * 管理ページの認証ガード
 *
 * 未ログインなら /admin/login へリダイレクトする。
 * RLSのauthenticatedポリシーとセットで管理テーブルの書き込みを保護する。
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { getSession, onAuthStateChange } from '../../lib/supabase/auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    getSession().then((s) => {
      if (mounted) setSession(s);
    });
    const unsubscribe = onAuthStateChange((s) => {
      if (mounted) setSession(s);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>認証確認中…</div>;
  }
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
