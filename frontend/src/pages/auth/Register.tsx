import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/components/ui/Toast';
import { register as registerApi } from '@/services/auth';
import { getErrorMessage } from '@/services/api';

interface Requirement {
  label: string;
  valid: boolean;
}

type FieldErrors = { name?: string; email?: string; password?: string; confirm?: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z\u00C0-\u017F\s'-]+$/;

function usePasswordRequirements(password: string): Requirement[] {
  return [
    { label: 'Minimal 8 karakter', valid: password.length >= 8 },
    { label: 'Terdapat minimal satu huruf kecil', valid: /[a-z]/.test(password) },
    { label: 'Terdapat minimal satu huruf besar', valid: /[A-Z]/.test(password) },
    { label: 'Terdapat minimal satu angka', valid: /\d/.test(password) },
    { label: 'Terdapat salah satu simbol: ! @ # $ % ^ & *', valid: /[!@#$%^&*]/.test(password) },
  ];
}

function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const requirements = usePasswordRequirements(password);
  const passwordValid = requirements.every((r) => r.valid);

  function validateFields(): FieldErrors {
    const errors: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errors.name = 'Nama lengkap wajib diisi.';
    } else if (trimmedName.length < 3) {
      errors.name = 'Nama lengkap minimal 3 karakter.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Nama lengkap terlalu panjang (maksimal 100 karakter).';
    } else if (!NAME_REGEX.test(trimmedName)) {
      errors.name = 'Nama hanya boleh mengandung huruf dan spasi.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email wajib diisi.';
    } else if (trimmedEmail.length > 254) {
      errors.email = 'Email terlalu panjang (maksimal 254 karakter).';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Format email tidak valid. Gunakan format seperti nama@email.com.';
    } else if (/\s/.test(trimmedEmail)) {
      errors.email = 'Email tidak boleh mengandung spasi.';
    }

    if (!password) {
      errors.password = 'Password wajib diisi.';
    } else if (password.length < 8) {
      errors.password = 'Password minimal 8 karakter.';
    } else if (password.length > 72) {
      errors.password = 'Password terlalu panjang (maksimal 72 karakter).';
    } else if (!passwordValid) {
      errors.password = 'Password belum memenuhi semua persyaratan.';
    }

    if (!confirm) {
      errors.confirm = 'Konfirmasi password wajib diisi.';
    } else if (confirm !== password) {
      errors.confirm = 'Konfirmasi password tidak cocok dengan password.';
    }

    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors = validateFields();
    if (hasErrors(errors)) {
      setFieldErrors(errors);
      setError(
        'Pendaftaran gagal: terdapat kesalahan pada isian Anda. Periksa kembali data yang dimasukkan.',
      );
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
      showToast('Akun berhasil dibuat. Silakan masuk.', 'success');
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mendaftar.'));
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

  const clearField = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Register</h1>
              <p className="mt-1.5 text-sm text-gray-500">Buat akun baru untuk memulai</p>
            </div>

            {error && (
              <Alert variant="error">
                <span className="font-medium">Terjadi kesalahan.</span> {error}
              </Alert>
            )}

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearField('name');
                }}
                placeholder="Nama Anda"
                className={inputClass(fieldErrors.name)}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="mt-1.5 flex items-start gap-1 text-xs text-red-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearField('email');
                }}
                placeholder="nama@email.com"
                className={inputClass(fieldErrors.email)}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email ? (
                <p className="mt-1.5 flex items-start gap-1 text-xs text-red-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  {fieldErrors.email}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-gray-500">Pastikan email yang digunakan aktif.</p>
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
                    clearField('password');
                  }}
                  placeholder="Minimal 8 karakter"
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

              {/* Password requirements checklist */}
              {password && (
                <ul className="mt-2.5 space-y-1.5 rounded-lg border border-gray-100 bg-gray-50/60 p-3">
                  {requirements.map((req) => (
                    <li key={req.label} className="flex items-center gap-2 text-xs">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          req.valid ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className={req.valid ? 'font-medium text-emerald-700' : 'text-gray-500'}>{req.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <input
                id="confirm"
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  clearField('confirm');
                }}
                placeholder="Ulangi password"
                className={inputClass(fieldErrors.confirm)}
                aria-invalid={!!fieldErrors.confirm}
              />
              {fieldErrors.confirm ? (
                <p className="mt-1.5 flex items-start gap-1 text-xs text-red-600">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  {fieldErrors.confirm}
                </p>
              ) : (
                confirm &&
                confirm === password && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Password cocok.
                  </p>
                )
              )}
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