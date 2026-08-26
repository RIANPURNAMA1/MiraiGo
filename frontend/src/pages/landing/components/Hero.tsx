import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gray-900">
      <div className="relative flex min-h-[600px] sm:min-h-[700px] items-center">
        <img
          src="/hero-ssw.jpg"
          alt="Hero Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 p-8 sm:px-6 sm:p-12 lg:p-16 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-4xl font-medium leading-tight text-white sm:text-5xl lg:text-6xl tracking-tight">
              Mulai sukses ujian
              <br />
              Anda di sini
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-gray-200 sm:text-lg">
              Buat jadwal belajar atau kembangkan kemampuan Anda? SSW Goukaku punya semua solusinya.
            </p>

            <div className="mt-10">
              <Link
                to="/register"
                className="inline-block rounded-md bg-white px-8 py-3.5 text-sm font-bold text-gray-900 transition-all hover:bg-gray-100"
              >
                Mulai sekarang
              </Link>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm text-gray-300">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Jaminan 30 hari uang kembali
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}