import { useState } from "react";

export default function ValueProposition() {
  const audienceFeatures = [
    {
      icon: (
        <svg
          className="h-12 w-12 text-[#9a7dff]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
        </svg>
      ),
      title: "Belajar Bahasa Jepang",
      items: [
        {
          id: "feat-1",
          title: "Latihan Soal JFT-Basic Terstruktur",
          desc: "Soal kosakata, gramatika, dan pemahaman membaca sesuai format ujian resmi JFT-Basic. Dilengkapi pembahasan lengkap untuk setiap jawaban.",
          linkText: "Mulai Latihan",
          linkHref: "#paket",
          defaultOpen: true,
        },
        {
          id: "feat-2",
          title: "Materi SSW Lengkap & Terkini",
          desc: "Persiapan ujian SSW untuk berbagai bidang kerja: Restoran, Kaigo, Pertanian, Peternakan, dan lainnya. Soal praktis sesuai kondisi lapangan.",
          linkText: "Lihat Paket",
          linkHref: "#paket",
          defaultOpen: false,
        },
      ],
    },
    {
      icon: (
        <svg
          className="h-12 w-12 text-[#9a7dff]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      ),
      title: "Fitur Simulasi Ujian",
      items: [
        {
          id: "feat-3",
          title: "Simulasi Ujian Timed",
          desc: "Sistem timer otomatis persis seperti ujian asli. Navigasi soal yang mudah untuk melatih manajemen waktu saat ujian.",
          linkText: "Coba Sekarang",
          linkHref: "#fitur",
          defaultOpen: true,
        },
        {
          id: "feat-4",
          title: "Tracking Progres & Analitik",
          desc: "Pantau skor per bagian, lihat riwayat latihan, dan dapatkan analisis jawaban untuk meningkatkan performa ujian Anda.",
          linkText: "Pelajari Fitur",
          linkHref: "#fitur",
          defaultOpen: false,
        },
      ],
    },
  ];

  const statsData = [
    { number: "500+", label: "Soal Latihan" },
    { number: "10", label: "Kategori Ujian" },
    { number: "24/7", label: "Akses Platform" },
    { number: "100%", label: "Pembahasan Soal" },
  ];

  const [openItems, setOpenItems] = useState(
    audienceFeatures
      .flatMap((col) => col.items)
      .filter((item) => item.defaultOpen)
      .map((item) => item.id),
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  return (
    <section className="bg-[#0f0b24] py-20 sm:py-28 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- Bagian Atas: Akordion Dua Kolom --- */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
          {audienceFeatures.map((column, colIdx) => (
            <div
              key={colIdx}
              className={`flex flex-col ${
                colIdx === 0
                  ? "lg:border-r lg:border-white/10 lg:pr-16"
                  : "lg:pl-16"
              }`}
            >
              {/* Ikon & Judul Utama */}
              <div className="mb-12">
                <div className="mb-6">{column.icon}</div>
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {column.title}
                </h2>
              </div>

              {/* Daftar Akordion */}
              <div className="mt-auto space-y-0">
                {column.items.map((item) => {
                  const isOpen = openItems.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className="border-b border-white/20 py-5"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="flex w-full items-center justify-between text-left focus:outline-none group"
                      >
                        <h3 className="text-lg font-medium text-white group-hover:text-gray-200">
                          {item.title}
                        </h3>
                        <span className="ml-4 text-white font-light text-2xl leading-none">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="mt-4 pr-8">
                          <p className="text-sm leading-relaxed text-gray-400">
                            {item.desc}
                          </p>
                          <a
                            href={item.linkHref}
                            className="mt-5 inline-block text-sm font-semibold text-[#8e6ff7] hover:text-[#7b5cff] hover:underline"
                          >
                            {item.linkText}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* --- Bagian Bawah: Row Statistik --- */}
        <div className="mt-20 grid grid-cols-2 gap-4 sm:mt-24 md:grid-cols-4 md:gap-6">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-xl bg-[#7651ff] p-6 text-white sm:p-8 min-h-[140px] sm:min-h-[180px]"
            >
              <h4 className="text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl">
                {stat.number}
              </h4>
              <p className="mt-4 text-xs font-medium sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}