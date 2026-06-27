import React, { useState } from 'react';
import { useI18n } from '../features/i18n/I18nProvider'; // 确保路径正确
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FAQSection = () => {
  const { t } = useI18n();
  const [openIndexes, setOpenIndexes] = useState([0]); 

  // 使用 t() 动态构建数组
  const faqs = [
    { q: t("qa.q1"), a: t("qa.a1") },
    { q: t("qa.q2"), a: t("qa.a2") },
    { q: t("qa.q3"), a: t("qa.a3") },
    { q: t("qa.q4"), a: t("qa.a4") }
  ];

  const toggle = (index) => {
    setOpenIndexes(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
           <h3 className="text-3xl font-bold text-[#4a6741] font-serif mb-2">{t("qa.title")}</h3>
           <p className="text-gray-500">{t("qa.desc")}</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((item, i) => {
            const isOpen = openIndexes.includes(i);
            return (
              <div key={i} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#4a6741] shadow-md' : 'border-gray-200'}`}>
                <button 
                  onClick={() => toggle(i)}
                  className={`w-full flex justify-between items-center p-5 text-left font-bold transition-colors ${isOpen ? 'bg-[#4a6741] text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={20} className={isOpen ? "text-green-200" : "text-[#4a6741]"} />
                    {item.q}
                  </span>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-5 text-gray-600 bg-gray-50 leading-relaxed border-t border-gray-100">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};