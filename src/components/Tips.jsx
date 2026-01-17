import React, { useState } from 'react';
import { useI18n } from '../features/i18n/I18nProvider';

export const TcmTips = () => {
  const { t } = useI18n();
  const fullText = t("tips.content");
  const [open, setOpen] = useState(false);
  const preview = fullText.slice(0, 100);

  return (
    <section className="max-w-4xl mx-auto py-16 px-4">
      <div className="bg-[#fdfbf7] p-8 rounded-2xl border border-[#4a6741]/20 shadow-sm relative overflow-hidden">
        {/* 装饰背景字 */}
        <div className="absolute top-0 right-0 text-9xl text-[#4a6741] opacity-5 font-serif select-none pointer-events-none">氣</div>
        
        <h3 className="text-3xl font-bold text-[#4a6741] mb-6 font-serif border-b pb-2 border-[#4a6741]/20 inline-block">
          {t("tips.title")}
        </h3>

        <p className="text-gray-700 leading-relaxed text-lg mb-6 font-light">
          {open ? fullText : preview}
          {!open && '……'}
        </p>

        <button
          onClick={() => setOpen(v => !v)}
          className="text-[#8c4b37] font-bold border-b-2 border-[#8c4b37] hover:text-[#7a4130] hover:border-[#7a4130] transition"
        >
          {open ? t("tips.less") : t("tips.more")}
        </button>
      </div>
    </section>
  );
};