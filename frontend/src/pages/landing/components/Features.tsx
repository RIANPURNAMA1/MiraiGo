import { keunggulan } from "../data";

export default function Features() {
  return (
    <section id="fitur" className="bg-[#f9fafb] py-20 sm:py-28 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- Header Section --- */}
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 ring-1 ring-inset ring-brand-500/20">
            Platform Cerdas
          </span>
          <h2 className="mt-6 max-w-2xl text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
            Persiapkan ujian Anda dengan percaya diri
          </h2>
        </div>

        {/* --- Cards Grid (2 Columns) --- */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {keunggulan.map((f, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/60"
            >
              {/* Bagian Atas: Teks & Fitur */}
              <div className="p-8 pb-0 sm:p-12 sm:pb-0 z-10">
                {/* Badge Kategori */}
                <span className="inline-block rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {f.badge}
                </span>

                {/* Judul & Deskripsi */}
                <h3 className="mt-6 text-3xl font-medium leading-snug text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-gray-500">
                  {f.desc}
                </p>

                {/* Checklist */}
                <ul className="mt-8 space-y-3">
                  {f.listItems.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-gray-600"
                    >
                      <svg
                        className="h-5 w-5 shrink-0 text-brand-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Link Text */}
                <a
                  href={f.linkHref}
                  className="mt-8 mb-10 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                >
                  {f.linkText}
                </a>
              </div>

              {/* Bagian Bawah: Ilustrasi Mockup */}
              {/* Anda bisa mengganti div placeholder ini dengan tag <img /> untuk gambar asli Anda nantinya */}
              <div
                className={`mt-auto h-64 w-full ${f.mockupBg} mx-8 sm:mx-12 w-auto rounded-t-2xl border border-b-0 border-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative flex items-end justify-center overflow-hidden`}
              >
                {/* Bentuk Mockup UI Buatan Sederhana (Hapus jika menggunakan Image) */}
                <div className="w-[90%] h-[85%] bg-white rounded-t-xl shadow-lg border border-gray-100 p-5 flex flex-col gap-3">
                  <div className="w-1/3 h-4 bg-gray-100 rounded-md"></div>
                  <div className="w-full h-8 bg-gray-50 rounded-md"></div>
                  <div className="w-full h-full bg-gray-50 rounded-t-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}