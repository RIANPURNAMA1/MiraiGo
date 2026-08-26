import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src="/logo.png" alt="SSW Goukaku" className="h-12 w-auto" />
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Platform pembelajaran terpercaya untuk persiapan ujian JFT-Basic
              dan SSW. Wujudkan impian bekerja di Jepang bersama kami.
            </p>
          </div>

          {/* Menu Utama */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Menu Utama
            </h4>
            <ul className="mt-3 space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Beranda
                </a>
              </li>
              <li>
                <a
                  href="#paket"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Paket Ujian
                </a>
              </li>
              <li>
                <a
                  href="#fitur"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Fitur Platform
                </a>
              </li>
              <li>
                <a
                  href="#kontak"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Akun */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Daftar Akun
            </h4>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Register
                </Link>
              </li>
            </ul>
            <h4 className="mt-6 text-sm font-semibold text-gray-900">
              Dukungan
            </h4>
            <ul className="mt-3 space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Syarat & Ketentuan
                </a>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Hubungi Kami
            </h4>
            <ul className="mt-3 space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <svg
                  className="h-4 w-4 shrink-0 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                +62 897-3242-070
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <svg
                  className="h-4 w-4 shrink-0 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                admin@sswgoukaku.com
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-500">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Senin – Sabtu, 08.00–17.00 WIB
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} SSW Goukaku. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">
              Kebijakan Privasi
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}