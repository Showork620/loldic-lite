import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { signIn } from '../../../lib/supabase/auth';
import styles from './login.module.css';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <Card variant="outlined" padding="lg">
          <h1 className={styles.title}>管理者ログイン</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'ログイン中…' : 'ログイン'}
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminLoginPage;
