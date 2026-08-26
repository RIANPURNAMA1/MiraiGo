import { useState, type FormEvent } from "react";

export default function Contact() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTopic, setFormTopic] = useState("");
  const [formMessage, setFormMessage] = useState("");

  function handleContact(e: FormEvent) {
    e.preventDefault();
    const text = `Halo, saya ${formName} (${formEmail}). Topik: ${formTopic}. Pesan: ${formMessage}`;
    window.open(
      `https://wa.me/628973242070?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  }

  return (
    <section id="kontak" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Kontak
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Hubungi Kami
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Ada pertanyaan tentang platform, paket, atau ujian? Tim kami siap
            membantu.
          </p>
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-5">
          {/* Contact info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">WhatsApp</p>
                  <p className="text-sm text-gray-500">+62 897-3242-070</p>
                  <p className="text-xs text-gray-400">
                    Respon cepat melalui chat
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">
                    admin@sswgoukaku.com
                  </p>
                  <p className="text-xs text-gray-400">
                    Respons dalam 1×24 jam kerja
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Jam Operasional
                  </p>
                  <p className="text-sm text-gray-500">Senin – Sabtu</p>
                  <p className="text-sm text-gray-500">08.00 – 17.00 WIB</p>
                </div>
              </div>
            </div>
          </div>
          {/* Contact form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleContact}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-900">Kirim Pesan</h3>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Topik
                </label>
                <select
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">-- Pilih topik --</option>
                  <option value="Paket & Harga">Paket & Harga</option>
                  <option value="Teknis Platform">Teknis Platform</option>
                  <option value="Ujian SSW/JFT">Ujian SSW/JFT</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Pesan
                </label>
                <textarea
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Tulis pesan Anda…"
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Kirim via WhatsApp
              </button>
            </form>
          </div> 
        </div>
      </div>
    </section>
  );
}