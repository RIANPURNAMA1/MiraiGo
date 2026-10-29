import { Link } from "react-router-dom";
import { packages } from "../data";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Pricing() {
  return (
    <section id="paket" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- Header Section --- */}
        <div className="text-center">
          <div className="inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-800">
            Paket dan Harga
          </div>
          <h2 className="mt-6 text-4xl font-normal tracking-tight text-gray-900 sm:text-5xl">
            Pilih paket ujian yang sesuai tujuan Anda
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600 sm:gap-10">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Garansi uang kembali 30-hari
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Batalkan kapan saja
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Layanan Bantuan 24/7
            </div>
          </div>
        </div>

        {/* --- Pricing Cards --- */}
        <div className="mt-16 grid gap-8 md:grid-cols-3 md:items-start">
          {packages.map((p) => {
            const priceNum = Number(p.price.replace(/[^0-9]/g, ''));
            const oldPriceNum = Number(p.oldPrice.replace(/[^0-9]/g, ''));
            const isPopular = p.popular === true;

            const cardClass = isPopular
              ? 'relative rounded-lg p-8 sm:p-10 transition-all bg-[#1c1836] text-white shadow-xl'
              : 'relative rounded-lg p-8 sm:p-10 transition-all bg-white text-gray-900 border border-gray-200 shadow-sm';

            const btnClass = isPopular
              ? 'mt-8 block w-full rounded-full py-3.5 text-center text-sm font-bold transition-all bg-brand-600 text-white hover:bg-brand-700'
              : 'mt-8 block w-full rounded-full py-3.5 text-center text-sm font-bold transition-all border-2 border-brand-600 text-brand-600 hover:bg-brand-50';

            const descClass = isPopular ? 'mt-4 text-sm leading-relaxed text-gray-300' : 'mt-4 text-sm leading-relaxed text-gray-500';
            const renewalClass = isPopular ? 'mt-4 text-xs text-gray-400' : 'mt-4 text-xs text-gray-500';
            const hrClass = isPopular ? 'my-8 border-white/10' : 'my-8 border-gray-200';
            const iconClass = isPopular ? 'mt-0.5 h-5 w-5 shrink-0 text-brand-400' : 'mt-0.5 h-5 w-5 shrink-0 text-green-500';
            const textClass = isPopular ? 'text-gray-200' : 'text-gray-600';

            return (
              <div key={p.title} className={cardClass}>
                {isPopular && (
                  <div className="absolute right-6 top-8 rounded-full bg-white/10 text-brand-300 px-3 py-1 text-xs font-bold">
                    Paling Populer
                  </div>
                )}

                <h3 className="text-2xl font-bold flex items-center gap-2">
                  {p.popular && (
                    <svg className="h-5 w-5 text-brand-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                  {p.title}
                </h3>
                <p className={descClass}>{p.desc}</p>

                <div className="mt-6">
                  <p className="text-sm font-medium line-through text-gray-400">{p.oldPrice}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-4xl font-bold tracking-tight">{formatCurrency(priceNum)}</span>
                    <span className="text-sm font-medium mb-1 text-gray-500">/bln</span>
                  </div>
                </div>

                <Link to="/latihan-soal" className={btnClass}>Pilih paket</Link>

                <p className={renewalClass}>{p.renewalText}</p>

                <hr className={hrClass} />

                <ul className="space-y-4">
                  {p.features.map((f, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <svg className={iconClass} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={textClass}>
                        <span className={index === 1 ? "border-b border-dashed border-current pb-0.5" : ""}>
                          {f}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
