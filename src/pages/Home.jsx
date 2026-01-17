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
    <section className="bg-[#4a6741] py-16 text-white">
        <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {/* Annual Visits */}
                <div className="space-y-2">
                    <div className="text-5xl font-bold font-mono">
                        <RollingNumber target={150000} />+
                    </div>
                    <div className="text-green-100 opacity-80 uppercase tracking-widest text-sm">
                        {t["stats.visits"]}
                    </div>
                </div>

                {/* Doctor Count */}
                <div className="space-y-2">
                    <div className="text-5xl font-bold font-mono">
                        <RollingNumber target={128} />
                    </div>
                    <div className="text-green-100 opacity-80 uppercase tracking-widest text-sm">
                        {t["stats.doctors"]}
                    </div>
                </div>

                {/* Clinic Count */}
                <div className="space-y-2">
                    <div className="text-5xl font-bold font-mono">
                        <RollingNumber target={42} />
                    </div>
                    <div className="text-green-100 opacity-80 uppercase tracking-widest text-sm">
                        {t["stats.clinics"]}
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