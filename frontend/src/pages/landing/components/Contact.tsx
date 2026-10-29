import { useState, type FormEvent, type ReactNode } from "react";

const WA_NUMBER = "628973242070";
const EMAIL = "admin@sswgoukaku.com";

const inputClass =
  "w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

type InfoItem = {
  title: string;
  lines: { text: string; muted?: boolean }[];
  href?: string;
  icon: ReactNode;
};

const iconProps = {
  className: "h-5 w-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  "aria-hidden": true,
} as const;

const contactInfo: InfoItem[] = [
  {
    title: "WhatsApp",
    href: `https://wa.me/${WA_NUMBER}`,
    lines: [
      { text: "+62 897-3242-070" },
      { text: "Respon cepat melalui chat", muted: true },
    ],
    icon: (
      <svg {...iconProps}>
        <path
          d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Email",
    href: `mailto:${EMAIL}`,
    lines: [
      { text: EMAIL },
      { text: "Respons dalam 1×24 jam kerja", muted: true },
    ],
    icon: (
      <svg {...iconProps}>
        <path
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Jam Operasional",
    lines: [{ text: "Senin – Sabtu" }, { text: "08.00 – 17.00 WIB" }],
    icon: (
      <svg {...iconProps}>
        <path
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function InfoCard({ item }: { item: InfoItem }) {
  const body = (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
        {item.icon}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-gray-900">{item.title}</p>
        {item.lines.map((line) => (
          <p
            key={line.text}
            className={line.muted ? "text-xs text-gray-400" : "text-sm text-gray-500"}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );

  const base = "block rounded-xl border border-gray-200 bg-white p-6";

  return item.href ? (
    <a
      href={item.href}
      target={item.href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={`${base} transition-colors hover:border-brand-200`}
    >
      {body}
    </a>
  ) : (
    <div className={base}>{body}</div>
  );
}

export default function Contact() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTopic, setFormTopic] = useState("");
  const [formMessage, setFormMessage] = useState("");

  function handleContact(e: FormEvent) {
    e.preventDefault();
    const topic = formTopic ? ` Topik: ${formTopic}.` : "";
    const text = `Halo, saya ${formName} (${formEmail}).${topic} Pesan: ${formMessage}`;
    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
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
          {/* Info kontak */}
          <div className="space-y-4 lg:col-span-2">
            {contactInfo.map((item) => (
              <InfoCard key={item.title} item={item} />
            ))}
          </div>

          {/* Form kontak */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleContact}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h3 className="text-lg font-bold text-gray-900">Kirim Pesan</h3>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Nama Lengkap
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama Anda"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="contact-topic" className={labelClass}>
                  Topik
                </label>
                <select
                  id="contact-topic"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  className={inputClass}
                >
                  <option value="">-- Pilih topik --</option>
                  <option value="Paket & Harga">Paket & Harga</option>
                  <option value="Teknis Platform">Teknis Platform</option>
                  <option value="Ujian SSW/JFT">Ujian SSW/JFT</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="mt-5">
                <label htmlFor="contact-message" className={labelClass}>
                  Pesan
                </label>
                <textarea
                  id="contact-message"
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Tulis pesan Anda…"
                  rows={4}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-md bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
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