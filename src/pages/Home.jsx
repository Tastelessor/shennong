import React from 'react';
import { useI18n } from '../features/i18n/I18nProvider';
import { RollingNumber } from '../components/RollingNumber';
import { TcmTips } from '../components/Tips';
import { MapSection } from '../components/Map';
import { DoctorGallerySection } from '../components/DoctorGallery';
import { FAQSection } from '../components/FAQ';

const HeroSection = ({ t }) => (
    <section className="h-[400px] bg-neutral-800 flex items-center justify-center text-white">
        <div className="text-center">
            <h2 className="text-5xl font-bold mb-4">{t("hero.title")}</h2>
            <p className="text-xl opacity-80 italic">{t("hero.subtitle")}</p>
        </div>
    </section>
);

const StatsSection = ({ t }) => (
  <section className="bg-[#4a6741] py-20 text-white relative overflow-hidden">
    {/* 增加装饰背景防止视觉单调 */}
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
       <div className="absolute -top-20 -left-20 w-60 h-60 bg-white rounded-full blur-3xl"></div>
       <div className="absolute bottom-20 right-20 w-80 h-80 bg-green-300 rounded-full blur-3xl"></div>
    </div>

    <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-green-400/30">
        
        {/* 单项统计 */}
        <div className="space-y-4 pt-8 md:pt-0 min-h-[120px] flex flex-col justify-center">
          <div className="text-5xl md:text-6xl font-bold font-mono tracking-tight flex justify-center items-baseline gap-1">
            <RollingNumber target={150000} />
            <span className="text-2xl text-green-200">+</span>
          </div>
          <div className="text-green-100 opacity-90 uppercase tracking-[0.2em] text-sm font-medium">
            {t("stats.visits") || "Annual Visits"} {/* 添加兜底文本 */}
          </div>
        </div>

        <div className="space-y-4 pt-8 md:pt-0 min-h-[120px] flex flex-col justify-center">
          <div className="text-5xl md:text-6xl font-bold font-mono tracking-tight">
            <RollingNumber target={128} />
          </div>
          <div className="text-green-100 opacity-90 uppercase tracking-[0.2em] text-sm font-medium">
            {t("stats.doctors") || "Expert Doctors"}
          </div>
        </div>

        <div className="space-y-4 pt-8 md:pt-0 min-h-[120px] flex flex-col justify-center">
          <div className="text-5xl md:text-6xl font-bold font-mono tracking-tight">
            <RollingNumber target={42} />
          </div>
          <div className="text-green-100 opacity-90 uppercase tracking-[0.2em] text-sm font-medium">
            {t("stats.clinics") || "Locations"}
          </div>
        </div>

      </div>
    </div>
  </section>
);

export const Home = () => {
    const { t } = useI18n();

    return (
        <>
            <HeroSection t={t} />
            <StatsSection t={t} />
            <TcmTips />
            <MapSection />
            <DoctorGallerySection />
            <FAQSection />
        </>
    );
};