import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { LoadingState } from '@/components/ui/LoadingState';

interface Settings {
  premium_price: number;
  premium_description: string;
}

export default function AdminModulePremium() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Settings>({ premium_price: 0, premium_description: '' });

  useEffect(() => {
    api.get('/admin/module-premium-settings')
      .then(res => setForm(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api.put('/admin/module-premium-settings', form);
      showToast('Pengaturan berhasil disimpan.', 'success');
    } catch {
      showToast('Gagal menyimpan pengaturan.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Memuat pengaturan..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Akses Modul Premium</h1>
        <p className="mt-1 text-sm text-gray-500">
          Atur harga & deskripsi untuk akses semua modul premium sekaligus.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Harga Premium (Rp)</label>
            <input
              type="number"
              min={0}
              value={form.premium_price}
              onChange={(e) => setForm({ ...form, premium_price: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              rows={3}
              value={form.premium_description}
              onChange={(e) => setForm({ ...form, premium_description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-800">Pratinjau</p>
            <p className="mt-1">
              Saat siswa klik "Upgrade", mereka akan membayar{' '}
              <strong>Rp{new Intl.NumberFormat('id-ID').format(form.premium_price)}</strong> untuk membuka
              semua modul premium sekaligus.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}
