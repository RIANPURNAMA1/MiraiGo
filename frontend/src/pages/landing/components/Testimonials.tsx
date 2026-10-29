import { testimonials } from "../data";

type Testimonial = (typeof testimonials)[number];

// Minimal kartu per putaran agar kolom selalu penuh walau data sedikit.
const MIN_CARDS_PER_LOOP = 4;

const COLUMN_COUNT = 3;
const DIRECTIONS = ["up", "down", "up"] as const;

function fillColumn(items: Testimonial[]): Testimonial[] {
  if (items.length === 0) return [];
  const out: Testimonial[] = [];
  while (out.length < MIN_CARDS_PER_LOOP) out.push(...items);
  return out;
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <svg
        className="h-8 w-8 text-brand-200"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10H0z" />
      </svg>
      <blockquote className="mt-4 text-sm leading-relaxed text-gray-600">
        {t.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {t.initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{t.name}</p>
          <p className="text-xs text-gray-500">{t.detail}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  // Bagi testimoni ke 3 kolom secara bergantian.
  const columns = Array.from({ length: COLUMN_COUNT }, (_, c) =>
    fillColumn(testimonials.filter((_, i) => i % COLUMN_COUNT === c)),
  );

  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <style>{`
        @keyframes testi-scroll-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes testi-scroll-down {
          from { transform: translateY(-50%); }
          to   { transform: translateY(0); }
        }
        .testi-viewport {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
                  mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
        }
        .testi-track { animation: linear infinite; will-change: transform; }
        .testi-track.testi-up   { animation-name: testi-scroll-up; }
        .testi-track.testi-down { animation-name: testi-scroll-down; }
        .testi-viewport:hover .testi-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .testi-track { animation: none !important; }
          .testi-dup { display: none; }
          .testi-viewport { overflow-y: auto; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Testimoni
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Kata Mereka yang Sudah Lulus
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Ribuan peserta telah berhasil lulus ujian SSW & JFT dengan
            berlatih di platform kami.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {columns.map((items, colIdx) => {
            if (items.length === 0) return null;
            const direction = DIRECTIONS[colIdx];
            // Durasi sebanding jumlah kartu supaya kecepatan antar kolom terasa seragam.
            const duration = `${Math.max(30, items.length * 9)}s`;

            return (
              <div
                key={colIdx}
                // Di mobile hanya kolom pertama yang ditampilkan.
                className={`testi-viewport h-[520px] md:h-[640px] ${
                  colIdx > 0 ? "hidden md:block" : ""
                }`}
              >
                <div
                  className={`testi-track testi-${direction}`}
                  style={{ animationDuration: duration }}
                >
                  {/* Dua salinan identik: translasi -50% membuat putaran tanpa lompatan */}
                  <div className="flex flex-col gap-6 pb-6">
                    {items.map((t, i) => (
                      <TestimonialCard key={`${t.name}-${i}`} t={t} />
                    ))}
                  </div>
                  <div
                    className="testi-dup flex flex-col gap-6 pb-6"
                    aria-hidden="true"
                  >
                    {items.map((t, i) => (
                      <TestimonialCard key={`dup-${t.name}-${i}`} t={t} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}