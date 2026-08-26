import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="bg-gray-900 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Mulai Sekarang — Gratis
        </h2>
        <p className="mt-4 text-lg text-gray-300">
          Daftarkan Diri Anda & Raih Kelulusan Ujian SSW
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Akses paket latihan pertama Anda tanpa biaya. Upgrade kapan saja
          untuk akses penuh.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700"
          >
            Buka Dashboard
          </Link>
          <a
            href="#kontak"
            className="rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </section>
  );
}