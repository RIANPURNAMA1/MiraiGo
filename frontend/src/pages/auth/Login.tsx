import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/stores/AuthContext';
import { getErrorMessage } from '@/services/api';

type FieldErrors = { email?: string; password?: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const trimmed = email.trim();

  if (!trimmed) {
    errors.email = 'Email wajib diisi.';
  } else if (trimmed.length > 254) {
    errors.email = 'Email terlalu panjang (maksimal 254 karakter).';
  } else if (!EMAIL_REGEX.test(trimmed)) {
    errors.email = 'Format email tidak valid. Gunakan format seperti nama@email.com.';
  } else if (/\s/.test(trimmed)) {
    errors.email = 'Email tidak boleh mengandung spasi.';
  }

  if (!password) {
    errors.password = 'Password wajib diisi.';
  } else if (password.length < 8) {
    errors.password = 'Password minimal 8 karakter.';
  } else if (password.length > 72) {
    errors.password = 'Password terlalu panjang (maksimal 72 karakter).';
  } else if (/^\s*$/.test(password)) {
    errors.password = 'Password tidak boleh hanya berisi spasi.';
  } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Password harus mengandung kombinasi huruf dan angka.';
  }

  return errors;
}

function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors = validate(email, password);
    if (hasErrors(errors)) {
      setFieldErrors(errors);
      setError(
        'Login gagal: terdapat kesalahan pada isian Anda. Periksa kembali email dan password sebelum melanjutkan.',
      );
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      const stored = localStorage.getItem('ssw_user');
      const role = stored ? (JSON.parse(stored) as { role?: string })?.role : undefined;
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const raw = getErrorMessage(err, '');
      if (!raw || /invalid cred|credential|tidak valid|salah/i.test(raw)) {
        setError('Login gagal. Email atau password salah. Silakan periksa kembali dan coba lagi.');
      } else {
        setError(getErrorMessage(err, 'Login gagal. Silakan coba lagi.'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = (hasError?: string) =>
    `w-full rounded-lg border bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:bg-white focus:ring-2 ${
      hasError
        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 focus:border-brand-500 focus:ring-brand-100'
    }`;

  return (
    <div className="relative isolate min-h-dvh">
      {/* Background image */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage:
            'url("https://i.pinimg.com/736x/d3/06/90/d3069074a097a03eefd743add101a7d1.jpg")',
        }}
      />
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

          <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-md border border-gray-100 bg-white p-6 shadow-soft">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Login</h1>
              <p className="mt-1.5 text-sm text-gray-500">Silakan masuk ke akun Anda</p>
            </div>

            {error && (
              <Alert variant="error">
                <span className="font-medium">Terjadi kesalahan.</span> {error}
              </Alert>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="nama@email.com"
                className={inputClass(fieldErrors.email)}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 flex items-start gap-1 text-xs text-red-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Masukkan password"
                  className={`${inputClass(fieldErrors.password)} pr-11`}
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
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
              {fieldErrors.password && (
                <p className="mt-1.5 flex items-start gap-1 text-xs text-red-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Lupa password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Masuk
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Belum punya akun?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}