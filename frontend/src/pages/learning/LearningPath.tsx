import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
  Flame,
  Clock,
  Languages,
  Hash,
  PenLine,
  MessagesSquare,
  Headphones,
  Target,
  type LucideIcon,
} from 'lucide-react';

interface Level {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  estimated: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: 'Hiragana dan Katakana',
    subtitle: 'Dasar tulisan Jepang',
    description: 'Pelajari pengucapan dan bentuk karakter Hiragana serta Katakana dari nol.',
    icon: Languages,
    estimated: '2 jam',
  },
  {
    id: 2,
    title: 'Kosakata dasar dan angka',
    subtitle: 'Kata-kata harian',
    description: 'Kosakata dasar yang sering digunakan dan pengucapan angka dalam bahasa Jepang.',
    icon: Hash,
    estimated: '3 jam',
  },
  {
    id: 3,
    title: 'Tata bahasa dan pola kalimat',
    subtitle: 'Struktur kalimat',
    description: 'Pelajari tata bahasa dasar, partikel, dan pola kalimat umum dalam bahasa Jepang.',
    icon: PenLine,
    estimated: '4 jam',
  },
  {
    id: 4,
    title: 'Percakapan sehari-hari',
    subtitle: 'Berbicara dengan lancar',
    description: 'Latihan percakapan untuk situasi umum, mulai dari sapaan hingga bertanya.',
    icon: MessagesSquare,
    estimated: '4 jam',
  },
  {
    id: 5,
    title: 'Membaca dan menyimak',
    subtitle: 'Literasi dan listening',
    description: 'Latihan membaca teks Jepang dan menyimak percakapan untuk memahami inti informasi.',
    icon: Headphones,
    estimated: '5 jam',
  },
  {
    id: 6,
    title: 'Persiapan JFT-Basic A2',
    subtitle: 'Siap ujian',
    description: 'Simulasi dan latihan intensif untuk melengkapi persiapan ujian JFT-Basic A2.',
    icon: Target,
    estimated: '6 jam',
  },
];

type LevelStatus = 'locked' | 'active' | 'done';

const statusStyle: Record<
  LevelStatus,
  {
    label: string;
    badge: 'success' | 'brand' | 'default';
    card: string;
    icon: string;
  }
> = {
  done: {
    label: 'Selesai',
    badge: 'success',
    card: 'border-emerald-200 bg-emerald-50/60',
    icon: 'bg-emerald-100 text-emerald-600',
  },
  active: {
    label: 'Sedang berjalan',
    badge: 'brand',
    card: 'border-brand-200 bg-white shadow-soft ring-1 ring-brand-100',
    icon: 'bg-brand-50 text-brand-600',
  },
  locked: {
    label: 'Terkunci',
    badge: 'default',
    card: 'border-gray-100 bg-gray-50/70',
    icon: 'bg-gray-100 text-gray-400',
  },
};

export default function LearningPath() {
  // Sementara disimpan di state lokal; ganti dengan data progres dari API.
  const [doneLevels] = useState<number>(1);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const total = levels.length;
  const overall = Math.round((doneLevels / total) * 100);

  const getStatus = (id: number): LevelStatus =>
    id <= doneLevels ? 'done' : id === doneLevels + 1 ? 'active' : 'locked';

  const handleClick = (id: number) => {
    if (getStatus(id) === 'locked') {
      setLockedMessage('Selesaikan level sebelumnya terlebih dahulu.');
      setTimeout(() => setLockedMessage(null), 2500);
      return;
    }
    navigate(`/learning/${id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Learning Path</h2>
          <p className="mt-1 text-sm text-gray-500">
            Jalur belajar berurutan dari pemula hingga persiapan JFT-Basic A2.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="brand">
            {doneLevels}/{total} level
          </Badge>
          <span className="text-sm font-medium text-gray-700">{overall}% selesai</span>
        </div>
      </div>

      <ProgressBar value={overall} label="Progres jalur belajar" />

      {lockedMessage && (
        <div
          role="status"
          className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {lockedMessage}
        </div>
      )}

      {/* Daftar level */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {levels.map((level) => {
          const status = getStatus(level.id);
          const style = statusStyle[status];
          const isLast = level.id === total;
          const Icon = status === 'locked' ? Lock : level.icon;

          return (
            <Card
              key={level.id}
              className={`flex h-full flex-col border p-5 transition-shadow hover:shadow-md ${style.card}`}
            >
              {/* Judul + status */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                >
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400">Level {level.id}</p>
                  <h3 className="mt-0.5 font-semibold leading-snug text-gray-900">
                    {level.title}
                  </h3>
                  <p className="text-sm text-gray-500">{level.subtitle}</p>
                </div>

                <Badge variant={style.badge} className="shrink-0">
                  {style.label}
                </Badge>
              </div>

              {/* Deskripsi */}
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{level.description}</p>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  Estimasi {level.estimated}
                </span>
                {isLast && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-brand-600">
                    <Flame size={14} />
                    Wajib sebelum simulasi
                  </span>
                )}
              </div>

              {/* Aksi */}
              <div className="mt-auto pt-5">
                <Button
                  onClick={() => handleClick(level.id)}
                  aria-disabled={status === 'locked'}
                  size="sm"
                  className={`w-full justify-center gap-2 ${
                    status === 'done'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : status === 'locked'
                        ? 'cursor-not-allowed opacity-60'
                        : ''
                  }`}
                >
                  {status === 'done' && (
                    <>
                      <RotateCcw size={14} /> Ulangi materi
                    </>
                  )}
                  {status === 'active' && (
                    <>
                      <Play size={14} /> Mulai belajar
                    </>
                  )}
                  {status === 'locked' && (
                    <>
                      <Lock size={14} /> Terkunci
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selesai semua */}
      {doneLevels === total && (
        <Card className="rounded-xl bg-gradient-to-br from-[#025dd2] to-[#15a0f5] p-8 text-center text-white shadow-soft">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 size={28} strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-semibold">Selamat!</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-white/90">
            Anda telah menyelesaikan seluruh jalur belajar. Siap menghadapi ujian JFT-Basic A2.
          </p>
          <Link
            to="/latihan-soal"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            Mulai simulasi <ArrowRight size={14} />
          </Link>
        </Card>
      )}
    </div>
  );
}