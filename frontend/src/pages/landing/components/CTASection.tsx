import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="bg-gradient-to-br from-brand-700 to-brand-600 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Mulai Sekarang — Gratis
        </h2>
        <p className="mt-4 text-lg text-white/90">
          Daftarkan Diri Anda & Raih Kelulusan Ujian SSW
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">
          Akses paket latihan pertama Anda tanpa biaya. Upgrade kapan saja
          untuk akses penuh.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            to="/register"
            className="rounded-md bg-white px-8 py-3.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
          >
            Daftar Gratis
          </Link>
          <a
            href="#kontak"
            className="rounded-md border border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </section>
  );
}