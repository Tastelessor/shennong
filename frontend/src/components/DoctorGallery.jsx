import React from 'react';
import { useI18n } from '../features/i18n/I18nProvider'; // 确保路径正确
import { ArrowUp } from 'lucide-react';
import doc1 from '../assets/doc1.jpeg';
import doc2 from '../assets/doc2.jpeg';
import doc3 from '../assets/doc3.jpeg';
import doc4 from '../assets/doc4.jpg';

export const DoctorGallerySection = () => {
  const { t } = useI18n();

  // 动态构建数据，id 用于映射翻译键值
  const doctors = [
    { id: 1, img: doc1 },
    { id: 2, img: doc2 },
    { id: 3, img: doc3 },
    { id: 4, img: doc4 },
  ].map(doc => ({
    ...doc,
    name: t(`doc.${doc.id}.name`),
    title: t(`doc.${doc.id}.title`),
    bio: t(`doc.${doc.id}.bio`)
  }));

  return (
    <section className="py-20 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl font-bold text-[#4a6741] font-serif">{t("doc.title")}</h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{t("doc.subtitle")}</p>
      </div>

      <div className="flex overflow-x-auto pb-8 hide-scrollbar gap-6 px-4 md:px-0 max-w-6xl mx-auto snap-x snap-mandatory">
        {doctors.map((doc) => (
          <div key={doc.id} className="flex-shrink-0 w-[300px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:border-[#4a6741] transition-all snap-start">
            <div className="relative h-[350px] overflow-hidden">
              <img src={doc.img} alt={doc.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{doc.name}</h3>
                <span className="text-xs bg-[#4a6741] px-2 py-0.5 rounded mt-1 inline-block">{doc.title}</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{doc.bio}</p>
              <button className="mt-4 w-full py-2 border border-[#4a6741] text-[#4a6741] rounded-full hover:bg-[#4a6741] hover:text-white transition text-sm font-bold flex items-center justify-center gap-1">
                {t("doc.readmore")} <ArrowUp className="rotate-45" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};