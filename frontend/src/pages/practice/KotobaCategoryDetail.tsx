import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchKotobaTopics } from '@/services/kotoba';
import { LoadingState } from '@/components/ui/LoadingState';
import type { KotobaCategory, KotobaTopic } from '@/types';
import { api } from '@/services/api';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function KotobaCategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<KotobaCategory | null>(null);
  const [topics, setTopics] = useState<KotobaTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const catRes = await api.get('/kotoba-categories');
        const cats: KotobaCategory[] = catRes.data.data;
        setCategory(cats.find(c => c.id === Number(categoryId)) ?? null);
        const t = await fetchKotobaTopics(Number(categoryId));
        setTopics(t.filter(t => t.is_active));
      } catch { /* empty */ } finally { setLoading(false); }
    }
    load();
  }, [categoryId]);

  if (loading) return <LoadingState label="Memuat topik..." />;

  if (!category) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 pb-12 pt-20 text-center">
        <p className="text-gray-500">Kategori tidak ditemukan.</p>
        <Link to="/latihan-kotoba" className="text-sm font-medium text-[#5e8b5d] hover:underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <Link
          to="/latihan-kotoba"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={14} />
          Latihan Kotoba
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900">{category.name}</h2>
        {category.description && (
          <p className="mt-1 text-sm text-gray-500">{category.description}</p>
        )}
      </div>

      {topics.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-3 text-gray-300" size={32} />
          <p className="font-medium text-gray-700">Belum ada topik</p>
          <p className="mt-1 text-sm text-gray-400">Topik latihan akan muncul di sini setelah admin menerbitkannya.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/latihan-kotoba/${categoryId}/quiz?topic=${topic.id}`}
              className="group flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center rounded-full bg-[#f2f8f2] px-2.5 py-0.5 text-xs font-medium text-[#5e8b5d]">
                  {topic.word_count} kata
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-400 transition-colors group-hover:bg-[#5e8b5d] group-hover:text-white">
                  <BookOpen size={16} />
                </div>
              </div>

              <h3 className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-[#5e8b5d]">
                {topic.name}
              </h3>
              {topic.description && (
                <p className="mt-1 line-clamp-2 flex-1 text-xs leading-5 text-gray-500">
                  {topic.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {topic.word_count} soal
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5e8b5d] transition-colors group-hover:text-[#4e7a4d]">
                  Mulai Latihan
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition group-hover:translate-x-0.5">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
