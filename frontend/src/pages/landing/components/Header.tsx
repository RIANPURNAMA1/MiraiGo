import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ══════ Navbar ══════ */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#0b0b10] shadow-md" : "bg-[#111115]"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-800">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="SSW Goukaku" className="h-10 w-auto brightness-0 invert" />
             
            </Link>

            <div className="hidden items-center gap-6 lg:flex">
              {["Harga", "Produk", "Ujian", "Informasi"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                >
                  {item}
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* <button className="hidden sm:flex items-center gap-2 rounded-full border border-[#443869] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/5">
              <svg className="h-4 w-4 text-[#a684ff]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
              </svg>
              Tanya AI
            </button> */}
            <div className="flex items-center gap-2 text-sm font-medium text-white cursor-pointer hover:text-gray-300">
              <img src="https://flagcdn.com/w20/id.png" alt="ID" className="h-3.5 w-auto rounded-sm" />
              ID
            </div>
            <Link to="/login" className="text-white hover:text-gray-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer untuk fixed navbar */}
      <div className="h-16 bg-[#111115]"></div>

      {/* ══════ Search Bar Section ══════ */}
      <div className="bg-[#111115] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 md:flex-row md:gap-8">
          <div className="flex w-full flex-1 items-center rounded-lg bg-white p-1.5 shadow-sm">
            <div className="pl-3 pr-2 text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Temukan paket ujian"
              className="w-full bg-transparent px-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
            />
            <button className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
              Cari
            </button>
          </div>

          <div className="hidden shrink-0 text-sm md:block text-white">
            <span className="font-bold">Akses gratis selama 1 minggu</span>
            <br />
            <span className="text-gray-400">tersedia di <a href="#paket" className="underline hover:text-white">paket tahunan</a></span>
          </div>
        </div>
      </div>
    </>
  );
}