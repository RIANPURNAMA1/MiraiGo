import { useState, type FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { resetPassword } from '@/services/auth';
import { getErrorMessage } from '@/services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword({ token, email, password, password_confirmation: confirm });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal reset password.'));
    } finally {
      setIsLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-dvh bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
            <Link to="/login" className="flex items-center">
              <img src="/logo.png" alt="RSP Sensei" className="h-32 w-32 rounded-2xl object-contain" />
            </Link>
          </div>
        </header>
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-sm">
            <Alert variant="error">Link reset password tidak valid atau sudah kedaluwarsa.</Alert>
            <p className="mt-4 text-center text-sm text-gray-500">
              <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-700">
                Minta link baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Navbar */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
          <Link to="/login" className="flex items-center">
            <img src="/logo.png" alt="RSP Sensei" className="h-32 w-32 rounded-2xl object-contain" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Masukkan password baru Anda di bawah ini.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <Alert variant="success">Password berhasil direset!</Alert>
              <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                Kembali ke Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-soft">
              {error && <Alert variant="error">{error}</Alert>}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Reset Password
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-gray-400">
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              ← Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
