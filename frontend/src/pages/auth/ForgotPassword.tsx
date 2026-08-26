import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { forgotPassword } from '@/services/auth';
import { getErrorMessage } from '@/services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setSuccess(true);
      // For development: show token so user can copy it
      if (res.data && typeof res.data === 'object' && 'token' in res.data) {
        setResetToken(res.data.token as string);
        setResetEmail(res.data.email as string);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mengirim reset link.'));
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Masukkan email Anda untuk menerima link reset password.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <Alert variant="success">Link reset password telah dikirim ke email Anda.</Alert>

              {/* Dev only: show token */}
              {resetToken && (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="mb-2 text-xs font-medium text-yellow-700">⚠️ Development Mode — Token Reset:</p>
                  <div className="space-y-1 text-xs text-yellow-800">
                    <p><span className="font-medium">Email:</span> {resetEmail}</p>
                    <p><span className="font-medium">Token:</span></p>
                    <code className="block break-all rounded bg-yellow-100 p-2 text-[11px]">{resetToken}</code>
                  </div>
                  <Link
                    to={`/reset-password?token=${resetToken}&email=${encodeURIComponent(resetEmail || '')}`}
                    className="mt-3 block text-center text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Lanjut Reset Password →
                  </Link>
                </div>
              )}

              <Link
                to="/login"
                className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                ← Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-soft">
              {error && <Alert variant="error">{error}</Alert>}

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

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Kirim Link Reset
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-gray-400">
            Ingat password?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
