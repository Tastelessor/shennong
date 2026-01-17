import React, { useState } from 'react';
import { useI18n } from '../features/i18n/I18nProvider';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FAQSection = () => {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState(0);

  // TODO: translate in i18n
  const faqs = [
    { q: "你们的药材来源可靠吗？", a: "我们所有药材均源自神农架及知名药产区，经过严格的农残和重金属检测。" },
    { q: "针灸治疗疼吗？", a: "针灸通常只会有微弱的酸麻胀感，是由我们拥有20年以上经验的专家团队操作。" },
    { q: "初次问诊需要准备什么？", a: "建议穿着宽松衣物，并携带过往体检报告或病历（如有）。" }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-2xl mx-auto px-4">
        <h3 className="text-2xl font-bold text-center mb-8 text-[#4a6741]">{t("qa.title")}</h3>
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 font-bold text-left text-gray-800 transition"
              >
                {item.q}
                {openIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openIndex === i && (
                <div className="p-4 bg-white text-gray-600 border-t border-gray-100 animate-in slide-in-from-top-2">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};