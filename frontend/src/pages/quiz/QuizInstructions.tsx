import { AlertTriangle, ArrowUpRight, Check, ChevronLeft, ChevronRight, Cloud, CloudOff, Flag, Image as ImageIcon, Info, Loader2, Timer, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LockedState } from '@/components/ui/LockedState';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/services/api';
import { useAuth } from '@/stores/AuthContext';
import { hhmmss } from '@/lib/format';
import type { AttemptPayload, AttemptQuestion, AttemptQuestionOption, Simulation, User } from '@/types';

interface Instr {
  simulation: { id: number; title: string; description: string | null; duration_minutes: number; question_count: number };
  attempts_used: number; attempts_left: number | null; in_progress_attempt_id: number | null; expires_at: string;
}

export function ExamInstructions() {
  const { id } = useParams();
  const [q] = useSearchParams();
  const up = q.get('paket');
  const simId = id ? Number(id) : 0;
  const pkgId = up ? Number(up) : 0;
  const nav = useNavigate();
  const [data, setData] = useState<Instr | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!simId || !pkgId) { setLoading(false); return; }
    setLoading(true);
    api.get(`/packages/${simId}`).then((r) => {
      const p = r.data.data;
      setData({
        simulation: {
          id: p.id,
          title: p.name,
          description: p.description ?? null,
          duration_minutes: p.duration_minutes ?? 0,
          question_count: p.total_questions ?? 0,
        },
        attempts_used: 0,
        attempts_left: null,
        in_progress_attempt_id: null,
        expires_at: '',
      });
      setLoading(false);
    }).catch((e) => { setError(e); setLoading(false); });
  }, [simId, pkgId]);

  if (!pkgId) return <EmptyState title="Paket belum dipilih" description="Mulai simulasi dari halaman Paket saya." action={<Link className="btn-primary" to="/paket-saya">Ke Paket saya</Link>} />;
  if (loading) return <Spinner />;
  if (error) {
    if (error?.response?.status === 403) return <LockedState title="Simulasi tidak dapat dibuka" hint={error?.response?.data?.message || 'Akses ditolak'} action={<Link className="btn-primary" to="/paket">Lihat paket</Link>} />;
    return <ErrorState error={error} onRetry={() => location.reload()} />;
  }
  if (!data) return null;
  const noQuota = data.attempts_left === 0 && !data.in_progress_attempt_id;

  async function start() {
    setBusy(true); setErr(null);
    try {
      const r = await api.post('/attempts', { package_id: pkgId });
      nav(`/quiz/${r.data.data.attempt.id}`);
    } catch (e: any) { setErr(e?.response?.data?.message || e?.message || 'Gagal memulai ujian.'); setBusy(false); }
  }
  const s = data.simulation;
  return (
    <div className="mx-auto max-w-2xl font-jp">
      <div className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
        <div className="bg-jft-bar px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Persiapan sesi ujian</div>
        <div className="bg-jft-brand px-4 py-2.5 text-sm font-semibold text-white">Japan Foundation Test for Basic Japanese</div>
        <div className="px-5 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-jft-ink">{s.title}</h1>
          {s.description && <p className="mt-1 text-sm text-muted">{s.description}</p>}
          <div className="mt-5 divide-y divide-line rounded-md border border-slate-200">
            {[['Jumlah soal', `${s.question_count} soal pilihan ganda`], ['Durasi', `${s.duration_minutes} menit`],
              ['Percobaan', data.attempts_left === null ? `Percobaan ke-${data.attempts_used + 1} (tanpa batas)` : `Sisa ${data.attempts_left} percobaan`]].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3 text-sm"><span className="text-muted">{k}</span><span className="font-semibold">{v}</span></div>
            ))}
          </div>
          <ul className="mt-5 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
            <li>Waktu dihitung oleh server dan tetap berjalan walau Anda menutup halaman.</li>
            <li>Jawaban tersimpan otomatis. Perhatikan indikator penyimpanan di ruang ujian.</li>
            <li>Jika waktu habis, ujian dikumpulkan otomatis dengan jawaban yang sudah tersimpan.</li>
            <li>Hasil adalah persentase simulasi internal, bukan skor resmi JFT-Basic A2.</li>
          </ul>
          {err && <div className="mt-4"><Alert>{err}</Alert></div>}
          {noQuota ? <div className="mt-5"><LockedState title="Kuota percobaan habis" hint="Anda sudah memakai semua percobaan untuk simulasi ini pada paket ini." action={<Link className="btn-secondary" to="/riwayat">Lihat riwayat hasil</Link>} /></div> : (
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-jft" onClick={start} disabled={busy}>{busy ? 'Menyiapkan…' : data.in_progress_attempt_id ? 'Lanjutkan ujian' : 'Mulai ujian'}</button>
              <Link to="/paket-saya" className="btn-secondary">Kembali</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
interface Ans { option_id: number | null; flagged: boolean }

export function ExamRoom() {
  const { attemptId } = useParams();
  const id = attemptId ? Number(attemptId) : 0;
  const nav = useNavigate();
  const { user } = useAuth();
  const [att, setAtt] = useState<AttemptPayload | null>(null);
  const [loadErr, setLoadErr] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, Ans>>({});
  const [idx, setIdx] = useState(0);
  const [save, setSave] = useState<SaveState>('idle');
  const [online, setOnline] = useState(navigator.onLine);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [langHelp, setLangHelp] = useState<number | null>(null);
  const offset = useRef(0);
  const deadline = useRef(0);
  const pending = useRef(new Map<number, Ans>());
  const submitted = useRef(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/attempts/${id}`).then((r) => {
      const data = r.data.data;
      const payload = mapBackendToAttemptPayload(data.attempt, data.questions);
      if (payload.status !== 'in_progress') {
        nav(`/hasil/${payload.id}`, { replace: true });
        return;
      }
      offset.current = new Date(payload.server_time).getTime() - Date.now();
      deadline.current = new Date(payload.deadline_at).getTime();
      setAnswers(payload.answers);
      setAtt(payload);
    }).catch((e) => setLoadErr(e));
  }, [id, nav]);

  const syncClock = (serverTime: string) => { offset.current = new Date(serverTime).getTime() - Date.now(); };

  const finish = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true; setSubmitting(true); setSubmitErr(null);
    try {
      await flush();
      await api.post(`/attempts/${id}/submit`);
      nav(`/hasil/${id}`, { replace: true });
    } catch (e: any) {
      submitted.current = false; setSubmitting(false); setSubmitErr(e?.message || 'Gagal mengumpulkan.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, nav]);

  useEffect(() => {
    if (!att) return;
    const t = setInterval(() => {
      const left = (deadline.current - (Date.now() + offset.current)) / 1000;
      setRemaining(left);
      if (left <= 0) { clearInterval(t); finish(); }
    }, 500);
    return () => clearInterval(t);
  }, [att, finish]);

  async function flush() {
    for (const [qid, a] of Array.from(pending.current.entries())) {
      try {
        const r = await api.post(`/attempts/${id}/answers`, {
          question_id: qid,
          question_option_id: a.option_id,
        });
        syncClock(r.data.data.server_time);
        if (pending.current.get(qid) === a) pending.current.delete(qid);
      } catch (e: any) {
        if (e?.response?.status === 409 || e?.response?.status === 404) { pending.current.clear(); return; }
        throw e;
      }
    }
  }

  const trySave = useCallback(async () => {
    if (!pending.current.size) return;
    setSave('saving');
    try { await flush(); setSave(pending.current.size ? 'error' : 'saved'); } catch { setSave('error'); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => { if (pending.current.size) trySave(); }, 5000);
    const on = () => { setOnline(true); trySave(); }; const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { clearInterval(t); window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [trySave]);

  function change(qid: number, patch: Partial<Ans>) {
    const cur = answers[String(qid)];
    const next: Ans = { option_id: cur?.option_id ?? null, flagged: cur?.flagged ?? false, ...patch };
    setAnswers((a) => ({ ...a, [String(qid)]: next }));
    pending.current.set(qid, next);
    trySave();
  }

  const answered = useMemo(() => Object.values(answers).filter((a) => a.option_id !== null).length, [answers]);

  if (loadErr) {
    if (loadErr?.response?.status === 404) return <EmptyState title="Sesi ujian tidak ditemukan" description="Sesi ini bukan milik akun Anda atau sudah tidak tersedia." action={<Link className="btn-primary" to="/paket-saya">Ke Paket saya</Link>} />;
    return <div className="p-6"><ErrorState error={loadErr} onRetry={() => location.reload()} /></div>;
  }
  if (!att) return <Spinner label="Menyiapkan ujian…" />;
  const q = att.questions[idx];
  const cur = answers[String(q.id)];
  const low = remaining !== null && remaining <= 300;
  const critical = remaining !== null && remaining <= 60;
  const SaveIcon = save === 'saving' ? Loader2 : save === 'error' ? CloudOff : Cloud;
  const saveLabel = save === 'saving' ? 'Menyimpan…' : save === 'error' ? 'Gagal menyimpan' : save === 'saved' ? 'Tersimpan' : 'Siap';
  const instruction = /listen|menyimak/i.test(q.category ?? '')
    ? 'Listen to the conversation and choose the correct answer.'
    : 'Look at the illustration and choose the correct word.';
  const navTone = (i: number) => {
    const a = answers[String(att.questions[i].id)];
    if (i === idx) return 'bg-jft-tag text-white';
    if (a?.flagged) return 'bg-amber-100 text-jft-warnDeep ring-1 ring-inset ring-jft-warn';
    if (a?.option_id != null) return 'bg-slate-300 text-slate-700 ring-1 ring-inset ring-slate-400';
    return 'bg-white text-slate-500 ring-1 ring-inset ring-slate-300';
  };

  return (
    <div className="flex min-h-screen flex-col bg-jft-app font-jp text-jft-ink">
      <div className="sticky top-0 z-30 shadow-sm">
        <div className="bg-jft-bar text-white">
          <div className="flex h-11 items-center justify-between gap-3 px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden shrink-0 rounded-sm bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 sm:inline">Section</span>
              <span className="truncate text-xs font-semibold sm:text-sm">{q.category ?? att.simulation.title}</span>
              <span className="hidden truncate text-[11px] text-white/40 lg:inline">• {att.simulation.title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <span className={`flex items-center gap-1 text-[11px] ${save === 'error' ? 'font-semibold text-red-300' : 'text-white/60'}`} role="status" aria-live="polite">
                <SaveIcon className={`h-4 w-4 ${save === 'saving' ? 'animate-spin' : ''}`} aria-hidden />
                <span className="hidden sm:inline">{saveLabel}</span>
              </span>
              <span className={`flex items-center gap-1.5 rounded px-2 py-1 font-mono text-sm font-bold tabular-nums sm:text-base ${critical ? 'bg-jft-warnDeep text-white' : low ? 'bg-jft-warn/15 text-jft-warn' : 'text-white'}`} role="timer" aria-label="Sisa waktu">
                <Timer className="h-4 w-4" aria-hidden />{remaining === null ? '--:--:--' : hhmmss(remaining)}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-jft-brand text-white">
          <div className="flex h-10 items-center justify-between gap-3 px-3 sm:px-5">
            <p className="truncate text-[11px] font-semibold tracking-wide sm:text-xs">Japan Foundation Test for Basic Japanese</p>
            <p className="max-w-[55%] shrink-0 truncate text-[10px] font-medium sm:text-xs">
              <span className="text-white/60">Candidate:</span> {user?.name ?? 'Peserta'} <span className="text-white/50">[{user?.id ?? '—'}]</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <aside className="w-14 shrink-0 border-r border-slate-300 bg-white sm:w-16 md:w-20" aria-label="Navigasi soal">
          <div className="sticky top-[84px] max-h-[calc(100vh-84px)] overflow-y-auto p-1.5 sm:p-2">
            <p className="mb-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">Soal</p>
            <div className="space-y-1">
              {att.questions.map((x, i) => {
                const a = answers[String(x.id)];
                return (
                  <button key={x.id} type="button" onClick={() => setIdx(i)} aria-current={i === idx ? 'step' : undefined}
                    aria-label={`Soal ${x.position}${a?.option_id != null ? ', terjawab' : ', belum dijawab'}${a?.flagged ? ', ditandai ragu-ragu' : ''}`}
                    className={`jft-nav-badge relative flex h-9 w-full items-center justify-center pr-1.5 text-xs font-bold sm:text-sm ${navTone(i)}`}>
                    {x.position}
                    {a?.flagged && <span className={`absolute right-1.5 top-1 h-1.5 w-1.5 rounded-full ${i === idx ? 'bg-jft-warn' : 'bg-jft-warnDeep'}`} aria-hidden />}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 hidden space-y-1 border-t border-slate-200 pt-2 text-[9px] leading-tight text-slate-500 md:block">
              <span className="flex items-center gap-1"><i className="h-2 w-2 shrink-0 rounded-sm bg-jft-tag" aria-hidden />Aktif</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 shrink-0 rounded-sm bg-slate-300" aria-hidden />Terjawab</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 shrink-0 rounded-sm bg-jft-warnDeep" aria-hidden />Ragu</span>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto w-full max-w-4xl flex-1 px-3 py-3 sm:px-5 sm:py-4">
            {!online && <div className="mb-3"><Alert variant="warning"><span className="flex items-center gap-2"><WifiOff className="h-4 w-4" aria-hidden />Anda sedang offline. Jawaban disimpan di perangkat dan dikirim ulang saat koneksi kembali. Waktu tetap berjalan.</span></Alert></div>}
            {submitErr && <div className="mb-3"><Alert>{submitErr}</Alert></div>}

            <div className="rounded-md border border-jft-instrBorder bg-jft-instrBg px-4 py-3">
              <div className="flex items-start gap-2 text-sm font-medium leading-relaxed text-jft-ink">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-jft-sel" aria-hidden />
                <p>{instruction}</p>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-2">
              {[1, 2].map((n) => (
                <button key={n} type="button" onClick={() => setLangHelp(n)}
                  className="flex items-center gap-2 rounded-sm border-2 border-jft-toggle bg-white px-2.5 py-1.5 text-[11px] font-semibold text-jft-ink hover:bg-slate-50 sm:text-xs">
                  <ImageIcon className="h-4 w-4 text-slate-600" aria-hidden />
                  Your Language {n}
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                </button>
              ))}
            </div>

            <section className="mt-3 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm" aria-label={`Soal ${q.position}`}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-sm bg-jft-tag px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{q.category ?? 'JFT-Basic A2'}</span>
                  <span className="truncate text-xs font-medium text-slate-500">Question {q.position} / {att.questions.length}</span>
                </div>
                <span className={`hidden shrink-0 items-center gap-1 text-xs font-semibold sm:flex ${cur?.flagged ? 'text-jft-warnDeep' : 'text-slate-400'}`}>
                  <Flag className="h-3.5 w-3.5" aria-hidden />{cur?.flagged ? 'Ditandai ragu-ragu' : 'Belum ditandai'}
                </span>
              </div>

              <div className="px-4 py-5 sm:px-6 sm:py-6">
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 sm:px-6">
                  <p className="whitespace-pre-wrap font-jp text-lg font-medium leading-loose text-jft-ink sm:text-xl">{q.body}</p>
                </div>

                <fieldset className="mt-5">
                  <legend className="sr-only">Pilihan jawaban</legend>
                  <div className="space-y-2.5">
                    {q.options.map((o) => {
                      const sel = cur?.option_id === o.id;
                      return (
                        <label key={o.id} className={`flex cursor-pointer items-center gap-3 rounded-md border-2 px-3 py-3 focus-within:ring-2 focus-within:ring-jft-sel focus-within:ring-offset-2 sm:gap-4 sm:px-4 ${sel ? 'border-jft-sel bg-jft-selBg' : 'border-jft-optBorder bg-white hover:bg-slate-50'}`}>
                          <input type="radio" name={`q-${q.id}`} className="sr-only" checked={sel} onChange={() => change(q.id, { option_id: o.id })} />
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-sm border-2 text-sm font-bold ${sel ? 'border-jft-sel bg-jft-sel text-white' : 'border-jft-optBorder text-jft-ink'}`}>{o.label}</span>
                          <span className="flex-1 font-jp text-base leading-relaxed sm:text-lg">{o.body}</span>
                          {sel && <Check className="h-5 w-5 shrink-0 text-jft-sel" aria-hidden />}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {cur?.option_id != null && (
                  <button type="button" className="mt-3 text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-jft-ink" onClick={() => change(q.id, { option_id: null })}>Hapus jawaban</button>
                )}
              </div>
            </section>
          </div>

          <footer className="sticky bottom-0 z-20 border-t-2 border-slate-300 bg-white">
            <div className="mx-auto flex max-w-4xl flex-nowrap items-center justify-between gap-2 px-3 py-2.5 sm:px-5">
              <button type="button" className="btn-jft-outline shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />Sebelumnya
              </button>
              <div className="flex flex-nowrap items-center justify-end gap-2">
                <button type="button" aria-pressed={!!cur?.flagged} onClick={() => change(q.id, { flagged: !cur?.flagged })}
                  className={`px-4 py-2 rounded-md text-sm font-medium border ${cur?.flagged ? 'border-jft-warn bg-amber-50 text-jft-warnDeep' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}>
                  <Flag className="h-4 w-4 mr-1" aria-hidden />{cur?.flagged ? 'Ragu-ragu' : 'Tandai Ragu-ragu'}
                </button>
                {idx < att.questions.length - 1 && (
                  <button type="button" className="btn-jft px-4 py-2 text-sm font-medium" onClick={() => setIdx(idx + 1)}>Selanjutnya<ChevronRight className="h-4 w-4 ml-1" aria-hidden /></button>
                )}
                <button type="button" className="btn-jft px-4 py-2 text-sm font-medium" onClick={() => setConfirm(true)}>
                  {idx < att.questions.length - 1 ? 'Akhiri Bagian' : 'Selesai'}<ChevronRight className="h-4 w-4 ml-1" aria-hidden />
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {confirm && (
        <Modal isOpen={confirm} title="Akhiri bagian ini?" onClose={() => !submitting && setConfirm(false)}>
          <div className="space-y-3 text-sm">
            <p>{answered} dari {att.questions.length} soal terjawab.</p>
            {att.questions.length - answered > 0 && <Alert variant="warning"><span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" aria-hidden />{att.questions.length - answered} soal belum dijawab dan dihitung kosong.</span></Alert>}
            {save === 'error' && <Alert>Sebagian jawaban belum tersimpan. Kami akan mencoba menyimpannya sebelum mengakhiri bagian.</Alert>}
            <p className="text-muted">Setelah dikumpulkan, jawaban tidak dapat diubah.</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" disabled={submitting} onClick={() => setConfirm(false)}>Kembali mengerjakan</button>
              <button type="button" className="btn-jft" disabled={submitting} onClick={finish}>{submitting ? 'Mengumpulkan…' : (<><Check className="h-4 w-4" aria-hidden />Ya, akhiri bagian</>)}</button>
            </div>
          </div>
        </Modal>
      )}

      {langHelp !== null && (
        <Modal isOpen={langHelp !== null} title={`Your Language ${langHelp}`} onClose={() => setLangHelp(null)}>
          <div className="space-y-3 text-sm">
            <p className="font-semibold">Bantuan bahasa</p>
            <p className="text-muted">Panel terjemahan bahasa bantuan belum tersedia untuk simulasi ini. Pada ujian resmi, tombol ini membuka daftar kata bantu sesuai bahasa yang dipilih.</p>
            <div className="flex justify-end"><button type="button" className="btn-secondary" onClick={() => setLangHelp(null)}>Tutup</button></div>
          </div>
        </Modal>
      )}

      {submitting && !confirm && <div className="fixed inset-0 z-50 grid place-items-center bg-jft-app/90"><Spinner label="Waktu habis. Mengumpulkan jawaban…" /></div>}
    </div>
  );
}

function mapBackendToAttemptPayload(attempt: any, questions: any[]): AttemptPayload {
  const qList: AttemptQuestion[] = questions.map((q) => ({
    id: q.id,
    position: q.order ?? 0,
    category: q.section_name ?? null,
    body: q.question_text,
    options: (q.options || []).map((o: any) => ({
      id: o.id,
      label: o.option,
      body: o.option_text,
    })),
  }));

  const answers: Record<string, { option_id: number | null; flagged: boolean }> = {};
  qList.forEach((q) => {
    const saved = questions.find((qq) => qq.id === q.id);
    answers[String(q.id)] = {
      option_id: saved?.selected_option_id ?? null,
      flagged: false,
    };
  });

  return {
    id: attempt.id,
    status: attempt.status,
    server_time: new Date().toISOString(),
    deadline_at: attempt.expires_at,
    questions: qList,
    answers,
    simulation: {
      id: attempt.package_id,
      title: attempt.package_name ?? 'Ujian',
      description: null,
      duration_minutes: 0,
      question_count: attempt.total_questions,
    },
    package: undefined,
    isExpired() {
      return attempt.status !== 'in_progress' || new Date(attempt.expires_at) < new Date();
    },
  } as AttemptPayload;
}

export default ExamRoom;
