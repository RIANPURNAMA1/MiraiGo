import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Utensils,
  Wheat,
  Fish,
  Building2,
  Sparkles,
} from 'lucide-react';

interface LatihanKategori {
  id: number;
  nama: string;
  deskripsi: string;
  jumlah_kotoba: number;
  jumlah_paket: number;
  tipe: 'JFT' | 'SSW';
  icon: typeof BookOpen;
  warna: string;
}

// Data dummy sementara — nantinya diambil dari API.
const dummyKategori: LatihanKategori[] = [
  {
    id: 1,
    nama: 'JFT Basic',
    deskripsi:
      'Latihan kosakata dasar untuk ujian JFT-Basic (bahasa Jepang untuk kehidupan kerja).',
    jumlah_kotoba: 300,
    jumlah_paket: 8,
    tipe: 'JFT',
    icon: BookOpen,
    warna: 'text-blue-700 ',
  },
  {
    id: 2,
    nama: 'SSW Kaigo',
    deskripsi:
      'Kosakata perawatan lanjut usia (kaigo) untuk pekerja di Jepang: perawatan, kesehatan, dll.',
    jumlah_kotoba: 250,
    jumlah_paket: 6,
    tipe: 'SSW',
    icon: Sparkles,
    warna: 'text-rose-700 ',
  },
  {
    id: 3,
    nama: 'SSW Restoran',
    deskripsi:
      'Kosakata industri restoran: menu, pelayanan, memesan, dan percakapan dengan pelanggan.',
    jumlah_kotoba: 220,
    jumlah_paket: 5,
    tipe: 'SSW',
    icon: Utensils,
    warna: 'text-amber-700 ',
  },
  {
    id: 4,
    nama: 'SSW Pertanian',
    deskripsi:
      'Kosakata pertanian: tanaman, musim, alat pertanian, dan pekerjaan di ladang.',
    jumlah_kotoba: 200,
    jumlah_paket: 5,
    tipe: 'SSW',
    icon: Wheat,
    warna: 'text-emerald-700 ',
  },
  {
    id: 5,
    nama: 'SSW Peternakan',
    deskripsi:
      'Kosakata peternakan: hewan ternak, kandang, pakan, dan kesehatan hewan.',
    jumlah_kotoba: 180,
    jumlah_paket: 4,
    tipe: 'SSW',
    icon: Fish,
    warna: 'text-teal-700 ',
  },
  {
    id: 6,
    nama: 'SSW Building Cleaning',
    deskripsi:
      'Kosakata kebersihan gedung: peralatan, bahan pembersih, dan prosedur kerja.',
    jumlah_kotoba: 210,
    jumlah_paket: 5,
    tipe: 'SSW',
    icon: Building2,
    warna: 'text-indigo-700 ',
  },
];

export default function LatihanKotoba() {
  const jft = dummyKategori.filter((k) => k.tipe === 'JFT');
  const ssw = dummyKategori.filter((k) => k.tipe === 'SSW');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Latihan Kotoba
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Pilih kategori latihan kosakata (kotoba) untuk JFT & SSW Anda.
        </p>
      </div>

      {/* JFT */}
      <KategoriTable
        title="JFT Basic"
        badge="JFT"
        badgeVariant="info"
        data={jft}
      />

      {/* SSW */}
      <KategoriTable
        title="SSW (Specified Skilled Worker)"
        badge="SSW"
        badgeVariant="brand"
        data={ssw}
      />
    </div>
  );
}

interface KategoriTableProps {
  title: string;
  badge: string;
  badgeVariant: 'info' | 'brand';
  data: LatihanKategori[];
}

function KategoriTable({
  title,
  badge,
  badgeVariant,
  data,
}: KategoriTableProps) {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>

        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Kategori
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Deskripsi
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tipe
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Paket
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Kotoba
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {data.map((kategori) => {
                const IconKomp = kategori.icon;

                return (
                  <tr
                    key={kategori.id}
                    className="group transition-colors hover:bg-gray-50"
                  >
                    {/* Kategori */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kategori.warna}`}
                        >
                          <IconKomp size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {kategori.nama}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            Latihan kosakata
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Deskripsi */}
                    <td className="max-w-md px-5 py-4">
                      <p className="line-clamp-2 text-sm leading-5 text-gray-500">
                        {kategori.deskripsi}
                      </p>
                    </td>

                    {/* Tipe */}
                    <td className="px-5 py-4 text-center">
                      <Badge
                        variant={
                          kategori.tipe === 'JFT' ? 'info' : 'brand'
                        }
                      >
                        {kategori.tipe}
                      </Badge>
                    </td>

                    {/* Paket */}
                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold text-gray-900">
                        {kategori.jumlah_paket}
                      </span>

                      <span className="ml-1 text-xs text-gray-400">
                        paket
                      </span>
                    </td>

                    {/* Kotoba */}
                    <td className="px-5 py-4 text-center">
                      <span className="font-semibold text-gray-900">
                        {kategori.jumlah_kotoba}
                      </span>

                      <span className="ml-1 text-xs text-gray-400">
                        kata
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-4 text-right">
                      <Link to="/practice">
                        <Button size="sm">
                          <PlayIcon />
                          Latihan
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <BookOpen className="mb-3 text-gray-300" size={32} />

            <p className="font-medium text-gray-700">
              Belum ada kategori
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Data kategori latihan belum tersedia.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M8 6l9 6-9 6V6z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}