import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/stores/AuthContext';
import { ssoLogin } from '@/services/auth';
import { getErrorMessage } from '@/services/api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';

type Status = 'loading' | 'done' | 'error';

export default function SsoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, completeAuth } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');

  const token = searchParams.get('sso_token');

  useEffect(() => {
    if (isAuthenticated) return;

    if (!token) {
      setStatus('error');
      setError(
        'Tidak ada token SSO pada URL. Silakan buka melalui menu "Akses MiraiGo" di sistem kandidat.',
      );
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { user: ssoUser, token: ssoToken } = await ssoLogin(token);
        if (cancelled) return;
        completeAuth(ssoUser, ssoToken);
        setStatus('done');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setError(getErrorMessage(err, 'Login SSO gagal. Silakan coba kembali dari sistem kandidat.'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, isAuthenticated, completeAuth, navigate]);

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: 'url("https://i.pinimg.com/736x/d3/06/90/d3069074a097a03eefd743add101a7d1.jpg")' }}
      />
      <div className="w-full max-w-sm rounded-md border border-gray-100 bg-white p-6 text-center shadow-soft">
        {status === 'loading' && (
          <div className="py-4">
            <LoadingState label="Memproses login SSO..." />
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <Alert variant="error">
              <span className="font-medium">Login SSO gagal.</span> {error}
            </Alert>
            <Link to="/login" className="block">
              <Button variant="secondary" className="w-full">
                Ke halaman login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}