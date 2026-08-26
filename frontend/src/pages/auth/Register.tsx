import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { register as registerApi } from '@/services/auth';
import { getErrorMessage } from '@/services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setIsLoading(true);
    try {
      const data = await registerApi({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirm,
      });
      localStorage.setItem('ssw_token', data.token);
      localStorage.setItem('ssw_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mendaftar.'));
    } finally {
      setIsLoading(false);
    }
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

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-soft">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Register</h1>
            <p className="mt-1.5 text-sm text-gray-500">Buat akun baru untuk memulai</p>
          </div>
            {error && <Alert variant="error">{error}</Alert>}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
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
                placeholder="Ulangi password"
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Daftar
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
