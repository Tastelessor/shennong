import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../features/i18n/I18nProvider';
import { api } from '../api';
// Leaflet CSS 需要在 index.html 或全局 CSS 引入，或这里 import 'leaflet/dist/leaflet.css'

export const MapSection = () => {
    const { t } = useI18n();
    const [locations, setLocations] = useState([]);
    const mapRef = useRef(null);
    const markersRef = useRef({});

    useEffect(() => {
        api.clinic.getLocations().then(data => {
            setLocations(data);
            if (data.length === 0 || !window.L) return;

            const container = document.getElementById('map-container');
            if (!container || container._leaflet_id) {
                return;
            }

            const map = window.L.map('map-container').setView([data[0].lat, data[0].lng], 12);
            window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '©OpenStreetMap, ©CartoDB',
                maxZoom: 19
            }).addTo(map);
            mapRef.current = map;

            data.forEach(loc => {
                const marker = window.L.marker([loc.lat, loc.lng]).addTo(map);
                marker.bindPopup(`<b>${loc.name}</b><br>${loc.address}`);
                markersRef.current[loc.id] = marker;
            });
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const handleLocationClick = (loc) => {
        if (!mapRef.current) return;
        mapRef.current.flyTo([loc.lat, loc.lng], 15, { animate: true, duration: 1.5 });
        const targetMarker = markersRef.current[loc.id];
        if (targetMarker) targetMarker.openPopup();
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#4a6741] font-serif">{t("map.title")}</h2>
                    <p className="text-gray-500 mt-2">{t("map.subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {locations.map(loc => (
                            <div key={loc.id} onClick={() => handleLocationClick(loc)} className="p-4 border border-gray-100 rounded-xl hover:border-[#4a6741] cursor-pointer bg-gray-50 group">
                                <h3 className="font-bold text-gray-700 group-hover:text-[#4a6741]">{loc.name}</h3>
                                <p className="text-[11px] text-gray-500 mt-2">{loc.address}</p>
                            </div>
                        ))}
                    </div>
                    {/* Map Section */}
                    <div className="lg:col-span-3">
                        <div id="map-container" className="h-[450px] w-full rounded-2xl shadow-lg border-4 border-white z-10">
                            {/* placeholder for map if not mounted */}
                            {!locations.length && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Loading Map...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};