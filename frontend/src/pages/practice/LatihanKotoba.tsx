import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingState } from '@/components/ui/LoadingState';
import { fetchKotobaCategories } from '@/services/kotoba';
import type { KotobaCategory } from '@/types';
import {
  BookOpen,
  Utensils,
  Wheat,
  Fish,
  Building2,
  HeartPulse,
} from 'lucide-react';

const iconMap: Record<string, typeof BookOpen> = {
  'book-open': BookOpen,
  'heart-pulse': HeartPulse,
  'utensils': Utensils,
  'wheat': Wheat,
  'fish': Fish,
  'building-2': Building2,
};

const typeColors: Record<string, string> = {
  JFT: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300',
  SSW: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-300',
};

const fallbackColors = [
  'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300',
  'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300',
  'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-300',
  'bg-teal-50 text-teal-600 border-teal-200 hover:border-teal-300',
  'bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-300',
];

function getCatColor(cat: KotobaCategory, index: number) {
  if (typeColors[cat.type]) return typeColors[cat.type];
  return fallbackColors[index % fallbackColors.length];
}

export default function LatihanKotoba() {
  const [kategori, setKategori] = useState<KotobaCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKotobaCategories()
      .then(setKategori)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Memuat kategori kotoba..." />;

  const jft = kategori.filter((k) => k.type === 'JFT');
  const ssw = kategori.filter((k) => k.type === 'SSW');

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Latihan Kotoba</h2>
        <p className="mt-1 text-sm text-gray-500">
          Pilih kategori latihan kosakata (kotoba) untuk JFT & SSW Anda.
        </p>
      </div>

      {/* JFT */}
      <Section title="JFT Basic" badge="JFT" data={jft} />

      {/* SSW */}
      <Section title="SSW (Specified Skilled Worker)" badge="SSW" data={ssw} />
    </div>
  );
}

function Section({
  title,
  badge,
  data,
}: {
  title: string;
  badge: string;
  data: KotobaCategory[];
}) {
  if (data.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge === 'JFT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
          {badge}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.map((cat, i) => {
          const Icon = iconMap[cat.icon ?? 'book-open'] ?? BookOpen;
          const color = getCatColor(cat, i);

          return (
            <Link
              key={cat.id}
              to={`/latihan-kotoba/${cat.id}`}
              className="group flex items-center gap-4 rounded-md border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
            >
              {/* Icon */}
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors group-hover:text-white ${color} group-hover:bg-gray-900`}>
                <Icon size={20} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="truncate text-sm font-semibold text-gray-900">
                    {cat.name}
                  </h4>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-gray-700"
                  >
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                    {cat.description}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span>{cat.total_packages} paket</span>
                  <span className="h-3 w-px bg-gray-200" />
                  <span>{cat.total_words} kata</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
