import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  ArrowRight,
  BookOpen,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  FileText,
  Sparkles,
  Volume2,
  Square,
  Video,
  type LucideIcon,
} from 'lucide-react';

const levels = [
  { id: 1, title: 'Hiragana dan Katakana', subtitle: 'Dasar tulisan Jepang' },
  { id: 2, title: 'Kosakata dasar dan angka', subtitle: 'Kata-kata harian' },
  { id: 3, title: 'Tata bahasa dan pola kalimat', subtitle: 'Struktur kalimat' },
  { id: 4, title: 'Percakapan sehari-hari', subtitle: 'Berbicara dengan lancar' },
  { id: 5, title: 'Membaca dan menyimak', subtitle: 'Literasi dan listening' },
  { id: 6, title: 'Persiapan JFT-Basic A2', subtitle: 'Siap ujian' },
];

type MaterialType = 'baca' | 'dengar' | 'latihan' | 'kuis';

type Material = {
  id: string;
  title: string;
  type: MaterialType;
  description: string;
  duration: string;
  content: string;
  /**
   * Video pembelajaran (opsional). `src` bisa berupa:
   * - link/ID YouTube, mis. 'https://youtu.be/XXXXXXXXXXX' atau 'XXXXXXXXXXX'
   * - file video sendiri, mis. '/videos/hiragana.mp4' atau URL .mp4/.webm
   */
  video?: { src: string; title?: string; poster?: string };
};

const typeInfo: Record<
  MaterialType,
  { label: string; variant: 'brand' | 'success' | 'info' | 'default'; icon: LucideIcon }
> = {
  baca: { label: 'Membaca', variant: 'brand', icon: FileText },
  dengar: { label: 'Listening', variant: 'info', icon: Headphones },
  latihan: { label: 'Latihan', variant: 'success', icon: Play },
  kuis: { label: 'Kuis', variant: 'default', icon: Sparkles },
};

// Styling isi materi (Tailwind preflight menghapus gaya list/heading bawaan).
const contentClass = [
  'text-sm leading-relaxed text-gray-600',
  '[&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-gray-900',
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5',
  '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5',
  '[&_a]:font-medium [&_a]:text-brand-600 [&_a:hover]:underline',
  // Teks Jepang yang bisa diputar suaranya
  '[&_.jp-say]:-mx-0.5 [&_.jp-say]:inline-flex [&_.jp-say]:max-w-full [&_.jp-say]:cursor-pointer [&_.jp-say]:items-center [&_.jp-say]:gap-1 [&_.jp-say]:rounded-md [&_.jp-say]:px-1 [&_.jp-say]:text-left [&_.jp-say]:text-gray-900 [&_.jp-say]:transition-colors',
  '[&_.jp-say:hover]:bg-brand-50 [&_.jp-say:hover]:text-brand-700 [&_.jp-say:focus-visible]:outline-none [&_.jp-say:focus-visible]:ring-2 [&_.jp-say:focus-visible]:ring-brand-500',
].join(' ');

const materialsByLevel: Record<number, Material[]> = {
  1: [
    {
      id: 'm1-1',
      title: 'Pengenalan Hiragana (あ-ん)',
      type: 'baca',
      description: 'Pelajari 46 karakter dasar Hiragana dengan pengucapan dan urutan corak tulis.',
      duration: '25 menit',
      video: { src: 'https://youtu.be/jhdSP8h9diU?si=cctNayeSaYl4o82E', title: 'Video pengenalan Hiragana' },
      content: `<p>Hiragana adalah salah satu dari tiga sistem tulisan dalam bahasa Jepang. Digunakan untuk kata-kata asli Jepang, partikel, dan akhiran kata.</p><ul><li><strong>あ (a)</strong> - ucapan seperti "a" dalam "apa"</li><li><strong>い (i)</strong> - ucapan seperti "i" dalam "ini"</li><li><strong>う (u)</strong> - ucapan seperti "u" dalam "umur"</li><li><strong>え (e)</strong> - ucapan seperti "e" dalam "ekor"</li><li><strong>お (o)</strong> - ucapan seperti "o" dalam "oma"</li></ul><p>Latihan: Tuliskan setiap karakter 5 kali sambil mengucapkannya dengan keras.</p>`,
    },
    {
      id: 'm1-2',
      title: 'Pengenalan Katakana (ア-ン)',
      type: 'baca',
      description: 'Pelajari karakter Katakana yang digunakan untuk kata asing dan onomatopoeia.',
      duration: '25 menit',
      content: `<p>Katakana digunakan untuk kata asing (gairaigo), nama orang asing, dan onomatopoeia. Bentuknya lebih tegak dan runcing dibanding Hiragana.</p><ul><li><strong>ア (a)</strong></li><li><strong>イ (i)</strong></li><li><strong>ウ (u)</strong></li><li><strong>エ (e)</strong></li><li><strong>オ (o)</strong></li></ul><p>Contoh: コンピュータ (konpyūta = komputer), テレビ (terebi = televisi).</p>`,
    },
    {
      id: 'm1-3',
      title: 'Latihan Membaca Karakter',
      type: 'latihan',
      description: 'Latihan membaca campuran Hiragana dan Katakana dalam kata sederhana.',
      duration: '15 menit',
      content: `<p>Coba baca kata berikut ini:</p><ul><li>あお (ao) - biru</li><li>いぬ (inu) - anjing</li><li>うえ (ue) - atas</li><li>おかし (okashi) - kue/cemilan</li></ul><p>Tuliskan jawaban di buku catatan Anda dan bandingkan dengan kunci jawaban.</p>`,
    },
  ],
  2: [
    {
      id: 'm2-1',
      title: 'Kosakata Sapaan dan Perkenalan',
      type: 'baca',
      description: 'Kata-kata untuk salam, perkenalan diri, dan ungkapan sopan.',
      duration: '20 menit',
      content: `<p>Pelajari kosakata dasar untuk berinteraksi dengan orang Jepang.</p><table class="w-full text-left text-sm border-collapse border border-gray-200"><thead><tr class="bg-gray-50"><th class="px-3 py-2 border border-gray-200">Jepang</th><th class="px-3 py-2 border border-gray-200">Romaji</th><th class="px-3 py-2 border border-gray-200">Arti</th></tr></thead><tbody><tr><td class="px-3 py-2 border border-gray-200">こんにちは</td><td class="px-3 py-2 border border-gray-200">konnichiwa</td><td class="px-3 py-2 border border-gray-200">Selamat siang / Halo</td></tr><tr><td class="px-3 py-2 border border-gray-200">おはようございます</td><td class="px-3 py-2 border border-gray-200">ohayou gozaimasu</td><td class="px-3 py-2 border border-gray-200">Selamat pagi</td></tr><tr><td class="px-3 py-2 border border-gray-200">こんばんは</td><td class="px-3 py-2 border border-gray-200">konbanwa</td><td class="px-3 py-2 border border-gray-200">Selamat malam</td></tr><tr><td class="px-3 py-2 border border-gray-200">はじめまして</td><td class="px-3 py-2 border border-gray-200">hajimemashite</td><td class="px-3 py-2 border border-gray-200">Senang bertemu dengan Anda</td></tr></tbody></table>`,
    },
    {
      id: 'm2-2',
      title: 'Angka 1-100',
      type: 'baca',
      description: 'Cara membaca dan menulis angka dalam bahasa Jepang.',
      duration: '20 menit',
      content: `<p>Angka dalam bahasa Jepang:</p><ul><li>1 = いち (ichi)</li><li>2 = に (ni)</li><li>3 = さん (san)</li><li>4 = よん/し (yon/shi)</li><li>5 = ご (go)</li><li>6 = ろく (roku)</li><li>7 = なな/しち (nana/shichi)</li><li>8 = はち (hachi)</li><li>9 = きゅう/く (kyuu/ku)</li><li>10 = じゅう (juu)</li></ul><p>Contoh: 25 = にじゅうご (nijūgo), 100 = ひゃく (hyaku).</p>`,
    },
    {
      id: 'm2-3',
      title: 'Kuis Kosakata Dasar',
      type: 'kuis',
      description: 'Uji pemahaman kosakata yang telah dipelajari.',
      duration: '10 menit',
      content: `<p>Pilih arti yang benar untuk kata berikut:</p><ol><li>こんにちは = ?</li><li>いぬ = ?</li><li>ご = ?</li></ol><p>Jawaban: 1. Halo/Selamat siang, 2. Anjing, 3. Lima.</p>`,
    },
  ],
  3: [
    {
      id: 'm3-1',
      title: 'Partikel Dasar (は, が, を, に, へ, で)',
      type: 'baca',
      description: 'Penggunaan partikel dalam kalimat Jepang.',
      duration: '30 menit',
      content: `<p>Partikel menunjukkan fungsi kata dalam kalimat.</p><ul><li><strong>は (wa)</strong> - penanda topik. Contoh: わたしは せんせい です。(Watashi wa sensei desu = Saya adalah guru.)</li><li><strong>が (ga)</strong> - penanda subjek. Contoh: ねこが すき です。(Neko ga suki desu = Saya suka kucing.)</li><li><strong>を (o)</strong> - penanda objek. Contoh: みずを のみます。(Mizu o nomimasu = Saya minum air.)</li><li><strong>に (ni)</strong> - waktu/tempat tujuan. Contoh: にちようびに いきます。(Nichiyoubi ni ikimasu = Saya pergi pada hari Minggu.)</li></ul>`,
    },
    {
      id: 'm3-2',
      title: 'Pola Kalimat A wa B desu',
      type: 'baca',
      description: 'Kalimat sederhana "A adalah B".',
      duration: '20 menit',
      content: `<p>Pola dasar: <strong>A は B です</strong> (A wa B desu) = A adalah B.</p><ul><li>わたしは りゅうがくせい です。(Saya adalah pelajar pertukaran.)</li><li>これは ほん です。(Ini adalah buku.)</li><li>きょうは きんようび です。(Hari ini adalah Jumat.)</li></ul><p>Untuk membuat kalimat negatif, gunakan <strong>じゃ ありません</strong> (ja arimasen).</p>`,
    },
    {
      id: 'm3-3',
      title: 'Latihan Susun Kalimat',
      type: 'latihan',
      description: 'Susun kata-kata menjadi kalimat yang benar.',
      duration: '15 menit',
      content: `<p>Susunlah kata berikut menjadi kalimat benar:</p><ol><li>わたし / は / せんせい / です</li><li>ねこ / が / すき / です</li><li>きょう / は / あめ / です</li></ol><p>Jawaban: 1. わたしは せんせい です。 2. ねこが すき です。 3. きょうは あめ です。</p>`,
    },
  ],
  4: [
    {
      id: 'm4-1',
      title: 'Percakapan di Toko dan Restoran',
      type: 'baca',
      description: 'Frasa-frasa untuk berbelanja dan memesan makanan.',
      duration: '25 menit',
      content: `<p>Frasa berguna saat belanja dan makan di Jepang:</p><ul><li><strong>いらっしゃいませ</strong> (Irasshaimase) - Selamat datang (ucapan toko)</li><li><strong>これは いくら ですか。</strong> (Kore wa ikura desu ka.) - Berapa harga ini?</li><li><strong>これを おねがいします。</strong> (Kore o onegaishimasu.) - Saya mau ini, tolong.</li><li><strong>めしあがってください。</strong> (Meshiagatte kudasai.) - Silakan makan.</li></ul><p>Latihan roleplay: Anda sebagai pelanggan, teman Anda sebagai petugas toko.</p>`,
    },
    {
      id: 'm4-2',
      title: 'Percakapan Bertanya Arah',
      type: 'dengar',
      description: 'Cara bertanya dan memberi arah lokasi.',
      duration: '20 menit',
      content: `<p>Frasa bertanya arah:</p><ul><li><strong>～は どこ ですか。</strong> (~ wa doko desu ka.) - Di mana ~?</li><li><strong>まっすぐ いってください。</strong> (Massugu itte kudasai.) - Lurus saja, tolong.</li><li><strong>みぎ / ひだり</strong> (migi / hidari) - Kanan / kiri.</li><li><strong>ちかい / とおい</strong> (chikai / tooi) - Dekat / jauh.</li></ul><p>Contoh: トイレは どこ ですか。(Toire wa doko desu ka. = Di mana toilet?)</p>`,
    },
    {
      id: 'm4-3',
      title: 'Latihan Percakapan Roleplay',
      type: 'latihan',
      description: 'Latihan berbicara dalam situasi sehari-hari.',
      duration: '20 menit',
      content: `<p>Latihan situasi: Anda ingin memesan kopi di kafe.</p><ol><li>Sapa petugas kafe.</li><li>Pesan satu kopi.</li><li>Tanya harga.</li><li>Ucapkan terima kasih.</li></ol><p>Rekam suara Anda dan dengarkan kembali untuk mengevaluasi pengucapan.</p>`,
    },
  ],
  5: [
    {
      id: 'm5-1',
      title: 'Membaca Teks Pendek',
      type: 'baca',
      description: 'Latihan membaca paragraf pendek dalam bahasa Jepang.',
      duration: '20 menit',
      content: `<p>Baca teks berikut dengan teliti:</p><blockquote class="border-l-4 border-brand-500 pl-4 italic text-gray-700 my-4">わたしは たなか です。にほんご を べんきょう しています。まいにち にほんご を べんきょう します。たのしい です。</blockquote><p>Terjemahan: Saya Tanaka. Saya sedang belajar bahasa Jepang. Saya belajar bahasa Jepang setiap hari. Ini menyenangkan.</p><p>Pertanyaan pemahaman: Siapa nama penulis? Apa yang dilakukan setiap hari?</p>`,
    },
    {
      id: 'm5-2',
      title: 'Listening Percakapan',
      type: 'dengar',
      description: 'Dengarkan percakapan dan jawab pertanyaan.',
      duration: '15 menit',
      content: `<p>Dengarkan percakapan antara dua orang. Klik tiap kalimat, atau tekan "Dengarkan semua" di bawah.</p><div class="bg-gray-50 p-4 rounded-md my-3"><p class="text-sm font-medium text-gray-900">Percakapan di stasiun</p><p class="text-sm text-gray-600">A: すみません、えき は どこ ですか。</p><p class="text-sm text-gray-600">B: まっすぐ いって、みぎ です。</p></div><p>Pertanyaan: Di mana stasiun tersebut? Jawaban: Lurus lalu belok kanan.</p>`,
    },
    {
      id: 'm5-3',
      title: 'Latihan Membaca dan Simak',
      type: 'latihan',
      description: 'Gabungkan membaca dan mendengarkan untuk pemahaman.',
      duration: '20 menit',
      content: `<p>Baca sambil mendengarkan (jika tersedia audio), lalu ringkas dalam 1 kalimat.</p><p>Teks: きょう は てんき が いい です。わたしは こうえん へ さんぽ に いきます。</p><p>Terjemahan: Hari ini cuaca bagus. Saya pergi ke taman untuk berjalan-jalan.</p><p>Tugas: Buatlah 3 kalimat tentang kegiatan Anda hari ini.</p>`,
    },
  ],
  6: [
    {
      id: 'm6-1',
      title: 'Simulasi Ujian JFT-Basic A2',
      type: 'latihan',
      description: 'Latihan soal sesuai format ujian JFT-Basic A2.',
      duration: '40 menit',
      content: `<p>Format ujian JFT-Basic A2 meliputi:</p><ul><li>Kosakata dan tata bahasa</li><li>Membaca pemahaman</li><li>Menyimak (listening)</li></ul><p>Lakukan latihan soal di halaman <a href="/latihan-soal">Simulasi JFT</a>.</p><p>Target skor: minimal 60% untuk lulus.</p>`,
    },
    {
      id: 'm6-2',
      title: 'Tips Menghadapi Ujian',
      type: 'baca',
      description: 'Strategi dan tips untuk lulus JFT-Basic A2.',
      duration: '15 menit',
      content: `<ul><li>Kelola waktu dengan baik di setiap bagian ujian.</li><li>Baca instruksi soal dengan teliti sebelum menjawab.</li><li>Jika ragu, pilih jawaban terbaik dan lanjutkan, jangan terlalu lama pada satu soal.</li><li>Latihan listening dengan berbagai aksen Jepang.</li></ul>`,
    },
    {
      id: 'm6-3',
      title: 'Uji Kesiapan Akhir',
      type: 'kuis',
      description: 'Kuis terakhir untuk memastikan kesiapan ujian.',
      duration: '20 menit',
      content: `<p>Kuis 10 soal mencakup seluruh materi level 1-6. Selesaikan semua untuk mendapatkan sertifikat keahlian.</p><p>Mulai kuis di halaman <a href="/latihan-soal">Simulasi JFT</a>.</p>`,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Video pembelajaran                                                  */
/* ------------------------------------------------------------------ */

function getYouTubeId(src: string): string | null {
  if (/^[\w-]{11}$/.test(src)) return src;
  const m = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function VideoPlayer({ src, title, poster }: { src: string; title: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  const youtubeId = getYouTubeId(src);

  const frame = 'relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900';

  // File video sendiri (mp4/webm)
  if (!youtubeId) {
    return (
      <div className={frame}>
        <video
          className="h-full w-full"
          src={src}
          poster={poster}
          controls
          preload="metadata"
          playsInline
          aria-label={title}
        />
      </div>
    );
  }

  // YouTube: muat iframe hanya saat diklik supaya halaman tetap ringan
  return (
    <div className={frame}>
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Putar video: ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          <img
            src={poster ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform group-hover:scale-105">
              <Play size={26} className="ml-1" fill="currentColor" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Suara Jepang (Web Speech API, tanpa backend)                        */
/* ------------------------------------------------------------------ */

// Satu "frasa" = rangkaian karakter Jepang yang berurutan (spasi di antaranya ikut).
const JP_RUN = /[\u3040-\u30ff\u3400-\u9fff々][\u3040-\u30ff\u3400-\u9fff々、。！？\u3000 ]*/g;

// Partikel yang berdiri sendiri dibaca "wa" dan "e", bukan "ha" dan "he".
const SAY_OVERRIDE: Record<string, string> = { は: 'わ', へ: 'え' };

const SPEAKER_ICON =
  '<svg class="shrink-0 text-brand-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

// Bungkus setiap frasa Jepang di HTML materi menjadi tombol, dan kumpulkan daftar frasanya.
function prepareContent(html: string) {
  const phrases: string[] = [];
  const out = html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith('<')) return part;
      return part.replace(JP_RUN, (run) => {
        const text = run.trimEnd();
        const tail = run.slice(text.length);
        const say = SAY_OVERRIDE[text] ?? text;
        phrases.push(say);
        return `<button type="button" class="jp-say" data-say="${say}" aria-label="Putar suara: ${say}">${text}${SPEAKER_ICON}</button>${tail}`;
      });
    })
    .join('');
  return { html: out, phrases };
}

const preparedById = Object.fromEntries(
  Object.values(materialsByLevel)
    .flat()
    .map((m) => [m.id, prepareContent(m.content)]),
) as Record<string, ReturnType<typeof prepareContent>>;

const SPEEDS = [
  { label: 'Normal', value: 0.9 },
  { label: 'Lambat', value: 0.6 },
];

function useJapaneseSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [rate, setRate] = useState(SPEEDS[0].value);
  const [hasJaVoice, setHasJaVoice] = useState(true);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const voices = synth.getVoices();
      if (!voices.length) return; // daftar suara belum siap
      const ja = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('ja'));
      voiceRef.current = ja[0] ?? null;
      setHasJaVoice(ja.length > 0);
    };
    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);
    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
      synth.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeakingKey(null);
  }, [supported]);

  const speak = useCallback(
    (phrases: string[], key: string) => {
      if (!supported || phrases.length === 0) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      setSpeakingKey(key);
      phrases.forEach((text, i) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';
        u.rate = rate;
        if (voiceRef.current) u.voice = voiceRef.current;
        if (i === phrases.length - 1) {
          const done = () => setSpeakingKey((k) => (k === key ? null : k));
          u.onend = done;
          u.onerror = done;
        }
        synth.speak(u);
      });
    },
    [supported, rate],
  );

  // Klik lagi pada yang sedang diputar = berhenti.
  const toggle = useCallback(
    (phrases: string[], key: string) => (speakingKey === key ? stop() : speak(phrases, key)),
    [speakingKey, speak, stop],
  );

  return { supported, hasJaVoice, rate, setRate, speakingKey, toggle, stop };
}

export default function LearningDetail() {
  const { levelId } = useParams<{ levelId: string }>();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const speech = useJapaneseSpeech();
  const { stop: stopSpeech } = speech;

  // Hentikan suara saat pindah level.
  useEffect(() => {
    stopSpeech();
  }, [levelId, stopSpeech]);

  const levelIndex = levels.findIndex((l) => l.id === Number(levelId));
  const level = levels[levelIndex];

  if (!level) return <Navigate to="/learning" replace />;

  const materials = materialsByLevel[level.id] ?? [];
  const prevLevel = levelIndex > 0 ? levels[levelIndex - 1] : null;
  const nextLevel = levelIndex < levels.length - 1 ? levels[levelIndex + 1] : null;

  const doneCount = materials.filter((m) => completed.has(m.id)).length;
  const progress = materials.length ? Math.round((doneCount / materials.length) * 100) : 0;
  const allDone = materials.length > 0 && doneCount === materials.length;

  const toggleComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Navigasi balik */}
      <Link
        to="/learning"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        <ChevronLeft size={16} /> Kembali ke jalur belajar
      </Link>

      {/* Header level */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <BookOpen size={26} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400">
              Level {level.id} dari {levels.length}
            </p>
            <h1 className="text-xl font-semibold leading-snug text-gray-900">{level.title}</h1>
            <p className="text-sm text-gray-500">{level.subtitle}</p>
          </div>
        </div>
        <Badge variant="brand" className="self-start sm:self-auto">
          {doneCount}/{materials.length} materi
        </Badge>
      </div>

      <ProgressBar value={progress} label="Progres materi level ini" />

      {/* Petunjuk suara + kecepatan */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <Volume2 size={16} className="shrink-0 text-brand-600" />
          Klik teks Jepang yang bertanda speaker untuk mendengar pengucapannya.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500" role="group" aria-label="Kecepatan suara">
          <span>Kecepatan</span>
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => speech.setRate(s.value)}
              aria-pressed={speech.rate === s.value}
              className={`rounded-full border px-3 py-1 font-medium transition-colors ${
                speech.rate === s.value
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {!speech.supported && (
        <div role="status" className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Browser ini belum mendukung suara. Coba Chrome, Edge, atau Safari versi terbaru.
        </div>
      )}
      {speech.supported && !speech.hasJaVoice && (
        <div role="status" className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Suara bahasa Jepang belum terpasang di perangkat ini. Pasang paket suara Jepang di pengaturan
          Text-to-speech perangkat Anda agar pengucapan terdengar benar.
        </div>
      )}

      {/* Daftar materi */}
      <div className="space-y-5">
        {materials.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
            Materi untuk level ini belum tersedia.
          </p>
        )}

        {materials.map((m) => {
          const done = completed.has(m.id);
          const info = typeInfo[m.type];
          const TypeIcon = info.icon;
          const { html, phrases } = preparedById[m.id];
          const playingAll = speech.speakingKey === `${m.id}:all`;

          return (
            <Card
              key={m.id}
              className={`border p-5 transition-colors ${
                done ? 'border-emerald-200 bg-emerald-50/60' : 'border-gray-100 hover:border-brand-200'
              }`}
            >
              {/* Judul + tipe */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    done ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {done ? <CheckCircle2 size={20} /> : <TypeIcon size={20} />}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug text-gray-900">{m.title}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">{m.description}</p>
                </div>

                <Badge variant={info.variant} className="shrink-0">
                  {info.label}
                </Badge>
              </div>

              {/* Video pembelajaran (hanya jika materi punya video) */}
              {m.video && (
                <div className="mt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Video size={14} className="text-gray-400" />
                    Video pembelajaran
                  </p>
                  <VideoPlayer
                    src={m.video.src}
                    title={m.video.title ?? m.title}
                    poster={m.video.poster}
                  />
                </div>
              )}

              {/* Isi materi (konten statis lokal; jika nanti dari API, sanitasi dulu dengan DOMPurify) */}
              <div className="mt-4 overflow-x-auto border-t border-gray-100 pt-4">
                <div
                  className={contentClass}
                  onClick={(e) => {
                    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-say]');
                    const say = el?.dataset.say;
                    if (say) speech.toggle([say], `${m.id}:${say}`);
                  }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>

              {/* Footer */}
              <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={14} className="text-gray-400" />
                    Estimasi {m.duration}
                  </span>

                  {speech.supported && phrases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => speech.toggle(phrases, `${m.id}:all`)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-brand-200 bg-white px-2.5 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
                    >
                      {playingAll ? <Square size={12} /> : <Volume2 size={14} />}
                      {playingAll ? 'Hentikan' : 'Dengarkan semua'}
                    </button>
                  )}
                </div>

                <Button
                  onClick={() => toggleComplete(m.id)}
                  size="sm"
                  className={`w-full justify-center gap-2 sm:w-auto ${
                    done ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                  }`}
                >
                  <CheckCircle2 size={14} />
                  {done ? 'Tandai belum selesai' : 'Tandai selesai'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Level selesai */}
      {allDone && (
        <Card className="rounded-xl bg-gradient-to-br from-[#025dd2] to-[#15a0f5] p-8 text-center text-white shadow-soft">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 size={28} strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-semibold">Level selesai!</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-white/90">
            Anda telah menyelesaikan semua materi di level ini.
          </p>
          <Link
            to={nextLevel ? `/learning/${nextLevel.id}` : '/latihan-soal'}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            {nextLevel ? `Lanjut ke level ${nextLevel.id}` : 'Mulai simulasi JFT'}
            <ArrowRight size={14} />
          </Link>
        </Card>
      )}

      {/* Navigasi antar level */}
      <div className="flex items-stretch justify-between gap-4 border-t border-gray-100 pt-6">
        {prevLevel ? (
          <Link
            to={`/learning/${prevLevel.id}`}
            className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
          >
            <ChevronLeft size={16} className="shrink-0 text-gray-400" />
            <span className="min-w-0">
              <span className="block text-xs text-gray-400">Sebelumnya</span>
              <span className="block truncate text-sm font-medium text-gray-900">
                {prevLevel.title}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {nextLevel && (
          <Link
            to={`/learning/${nextLevel.id}`}
            className="ml-auto flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-right hover:bg-gray-50"
          >
            <span className="min-w-0">
              <span className="block text-xs text-gray-400">Berikutnya</span>
              <span className="block truncate text-sm font-medium text-gray-900">
                {nextLevel.title}
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-gray-400" />
          </Link>
        )}
      </div>
    </div>
  );
}