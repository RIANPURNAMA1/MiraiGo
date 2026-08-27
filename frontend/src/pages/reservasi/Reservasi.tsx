import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CalendarDays } from 'lucide-react';

interface Reservasi {
  id: number;
  judul: string;
  tanggal: string;
  jam: string;
  paket: string;
  status: 'Menunggu' | 'Dikonfirmasi' | 'Selesai' | 'Dibatalkan';
}

const statusVariant: Record<Reservasi['status'], 'warning' | 'success' | 'info' | 'error'> = {
  Menunggu: 'warning',
  Dikonfirmasi: 'success',
  Selesai: 'info',
  Dibatalkan: 'error',
};

// Data dummy sementara.
const dummyReservasi: Reservasi[] = [
  { id: 1, judul: 'Pendampingan JFT Basic', tanggal: '2026-09-02', jam: '09:00', paket: 'JFT Basic', status: 'Dikonfirmasi' },
  { id: 2, judul: 'Konsultasi SSW Restoran', tanggal: '2026-09-05', jam: '14:00', paket: 'SSW Restoran', status: 'Menunggu' },
  { id: 3, judul: 'Simulasi Interview SSW', tanggal: '2026-08-28', jam: '10:30', paket: 'SSW Kaigo', status: 'Selesai' },
  { id: 4, judul: 'Latihan Percakapan', tanggal: '2026-08-20', jam: '09:00', paket: 'JFT Basic', status: 'Dibatalkan' },
];

export default function Reservasi() {
  const [items] = useState<Reservasi[]>(dummyReservasi);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Reservasi</h2>
          <p className="text-sm text-gray-500">Buat & kelola jadwal reservasi bimbingan atau sesi latihan Anda.</p>
        </div>
        <Button>+ Buat Reservasi</Button>
      </div>

      {/* Form reservasi dummy */}
      <Card>
        <h3 className="mb-4 font-semibold text-gray-900">Buat Reservasi Baru</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">Judul / Topik</label>
            <Input placeholder="cth: Konsultasi Kaigo" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">Tanggal</label>
            <Input type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">Waktu</label>
            <Input type="time" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">Paket</label>
            <Select>
              <option value="">Pilih paket</option>
              <option>JFT Basic</option>
              <option>SSW Kaigo</option>
              <option>SSW Restoran</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button>Simpan Reservasi</Button>
        </div>
      </Card>

      {/* Daftar reservasi dummy */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="font-semibold text-gray-900">Riwayat Reservasi</h3>
          <Badge variant="info">{items.length} reservasi</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Judul</th>
                <th className="px-5 py-3 font-medium">Tanggal</th>
                <th className="px-5 py-3 font-medium">Jam</th>
                <th className="px-5 py-3 font-medium">Paket</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {items.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{r.judul}</td>
                  <td className="px-5 py-3 text-gray-700">{r.tanggal}</td>
                  <td className="px-5 py-3 text-gray-700">{r.jam}</td>
                  <td className="px-5 py-3 text-gray-700">{r.paket}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Button size="sm" variant="outline">
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}