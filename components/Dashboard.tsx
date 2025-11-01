import React, { useState, useEffect } from 'react';
import { SparkleIcon, InfoIcon, BuildingIcon, CheckCircleIcon, CloseIcon, CameraIcon, ArrowLeftIcon, HomeModernIcon, BuildingStorefrontIcon } from './icons';
import { Modal } from './Modal';
import { getWeatherInfo } from '../services/geminiService';
import type { GalleryMediaItem, GalleryImage, GalleryCategory } from '../types';

const RecommendationItem: React.FC<{name: string; description: string; url: string}> = ({ name, description, url }) => (
    <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white hover:shadow-md hover:border-primary-300 transition-all duration-200"
    >
        <strong className="font-semibold text-primary-700">{name}</strong>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
    </a>
);

const getWeatherEmoji = (weather: string): string => {
    if (!weather) return '🌡️';
    if (weather.includes('맑음')) return '☀️';
    if (weather.includes('구름') || weather.includes('흐림')) return '☁️';
    if (weather.includes('비')) return '🌧️';
    if (weather.includes('눈')) return '❄️';
    if (weather.includes('천둥') || weather.includes('번개')) return '⛈️';
    if (weather.includes('안개')) return '🌫️';
    return '🌡️';
};

const InfoWidget: React.FC = () => {
    const [time, setTime] = useState(new Date());
    const [weather, setWeather] = useState<{ seoul: { temp: number; weather: string }; monterrey: { temp: number; weather: string } } | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(true);

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        
        const fetchWeather = async () => {
            // No need to set loading to true on interval refreshes
            const data = await getWeatherInfo();
            if (data) {
                setWeather(data);
            }
            setIsLoadingWeather(false);
        };
        fetchWeather();

        const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000); // Refresh every 30 mins

        return () => {
            clearInterval(timerId);
            clearInterval(weatherInterval);
        };
    }, []);

    const formatDate = (date: Date, timeZone: string) => {
        const dateOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit', minute: '2-digit', hour12: true
        };
        return {
            date: new Intl.DateTimeFormat('ko-KR', { ...dateOptions, timeZone }).format(date),
            time: new Intl.DateTimeFormat('ko-KR', { ...timeOptions, timeZone }).format(date)
        };
    };
    
    const { date: koreaDate, time: koreaTime } = formatDate(time, 'Asia/Seoul');
    const { date: mexicoDate, time: mexicoTime } = formatDate(time, 'America/Monterrey');

    return (
        <div className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-sm rounded-xl p-4 shadow-lg text-white">
            <div className="flex justify-around items-start">
                <div className="text-center px-2 flex-1">
                    <p className="text-sm font-semibold text-gray-200">🇰🇷 한국 (서울)</p>
                    <div className="flex items-center justify-center gap-2 my-1 h-10">
                        {isLoadingWeather ? (
                            <div className="w-8 h-8 animate-pulse bg-white/20 rounded-full"></div>
                        ) : weather?.seoul ? (
                            <>
                                <span className="text-3xl">{getWeatherEmoji(weather.seoul.weather)}</span>
                                <span className="text-xl font-semibold">{Math.round(weather.seoul.temp)}°C</span>
                            </>
                        ) : (
                             <span className="text-xl">--°C</span>
                        )}
                    </div>
                    <p className="font-sans text-xl tracking-wider">{koreaTime}</p>
                    <p className="text-xs text-gray-300 mt-1">{koreaDate}</p>
                </div>
                
                <div className="w-px h-20 bg-white/20 self-center"></div>

                <div className="text-center px-2 flex-1">
                    <p className="text-sm font-semibold text-gray-200">🇲🇽 멕시코 (몬테레이)</p>
                     <div className="flex items-center justify-center gap-2 my-1 h-10">
                        {isLoadingWeather ? (
                            <div className="w-8 h-8 animate-pulse bg-white/20 rounded-full"></div>
                        ) : weather?.monterrey ? (
                            <>
                                <span className="text-3xl">{getWeatherEmoji(weather.monterrey.weather)}</span>
                                <span className="text-xl font-semibold">{Math.round(weather.monterrey.temp)}°C</span>
                            </>
                        ) : (
                             <span className="text-xl">--°C</span>
                        )}
                    </div>
                    <p className="font-sans text-xl tracking-wider">{mexicoTime}</p>
                    <p className="text-xs text-gray-300 mt-1">{mexicoDate}</p>
                </div>
            </div>
        </div>
    );
};

interface IntroductionProps {
    activeModal: string | null;
    setActiveModal: (modal: string | null) => void;
    galleryMedia: GalleryMediaItem[];
}

export const Introduction: React.FC<IntroductionProps> = ({ activeModal, setActiveModal, galleryMedia }) => {
    const [kakaoIdCopied, setKakaoIdCopied] = useState(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | null>(null);

    const handleCopyKakaoId = () => {
        if (kakaoIdCopied) return;
        navigator.clipboard.writeText('dongkeun1').then(() => {
            setKakaoIdCopied(true);
            setTimeout(() => setKakaoIdCopied(false), 3000);
        }).catch(err => {
            console.error('Failed to copy Kakao ID: ', err);
        });
    };
    
    const handleOpenGallery = () => {
        setSelectedCategory(null);
        setIsGalleryOpen(true);
    };

    const handleCloseGallery = () => {
        setIsGalleryOpen(false);
        setSelectedCategory(null);
    };
    
    const filteredMedia = galleryMedia.filter(m => m.category === selectedCategory);

    const openLightbox = (index: number) => {
        const originalIndex = galleryMedia.findIndex(item => item.id === filteredMedia[index].id);
        if (galleryMedia[originalIndex].type === 'image') {
            setSelectedMediaIndex(originalIndex);
        }
    };
    
    const closeLightbox = () => setSelectedMediaIndex(null);

    const nextMedia = () => {
        if (selectedMediaIndex === null) return;
        let nextIndex = selectedMediaIndex + 1;
        while(nextIndex < galleryMedia.length && (galleryMedia[nextIndex].type !== 'image' || galleryMedia[nextIndex].category !== selectedCategory)) {
            nextIndex++;
        }
        if (nextIndex >= galleryMedia.length) {
            nextIndex = galleryMedia.findIndex(m => m.type === 'image' && m.category === selectedCategory);
        }
        if (nextIndex !== -1) setSelectedMediaIndex(nextIndex);
    };

    const prevMedia = () => {
        if (selectedMediaIndex === null) return;
        let prevIndex = selectedMediaIndex - 1;
        while(prevIndex >= 0 && (galleryMedia[prevIndex].type !== 'image' || galleryMedia[prevIndex].category !== selectedCategory)) {
            prevIndex--;
        }
        if (prevIndex < 0) {
            prevIndex = galleryMedia.findLastIndex(m => m.type === 'image' && m.category === selectedCategory);
        }
        if (prevIndex !== -1) setSelectedMediaIndex(prevIndex);
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedMediaIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextMedia();
            if (e.key === 'ArrowLeft') prevMedia();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedMediaIndex, galleryMedia, selectedCategory]);

    return (
        <div 
            className="relative h-full w-full bg-black overflow-hidden"
        >
            <div 
                className="absolute inset-0 bg-cover bg-center animate-zoom-in-bg"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2070&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-black/40" />
            
            <style>
                {`
                    @keyframes tracking-in-expand {
                        0% {
                            letter-spacing: -0.5em;
                            opacity: 0;
                        }
                        40% {
                            opacity: 0.6;
                        }
                        100% {
                            opacity: 1;
                        }
                    }
                     @keyframes fade-in-up {
                        0% { opacity: 0; transform: translateY(20px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                     @keyframes zoom-in-bg {
                        0% { transform: scale(1); }
                        100% { transform: scale(1.05); }
                    }
                    .animate-tracking-in {
                        animation: tracking-in-expand 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
                    }
                     .animate-fade-in-up-delay {
                        animation: fade-in-up 0.8s ease-out 0.5s both;
                        animation-fill-mode: forwards;
                     }
                    .animate-zoom-in-bg {
                        animation: zoom-in-bg 20s infinite alternate ease-in-out;
                    }
                `}
            </style>
            
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-white p-4 pb-40">
                <header className="text-center mb-8">
                    <h2 
                        className="font-pen animate-tracking-in"
                        style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)' }}
                    >
                        <span className="block text-5xl md:text-7xl lg:text-8xl">봄처럼 따뜻한 쉼,</span>
                        <span className="block text-7xl md:text-8xl lg:text-9xl mt-2">늘봄</span>
                    </h2>
                     <p className="text-xl md:text-2xl font-sans text-gray-200 mt-6 animate-fade-in-up-delay" style={{animationDelay: '0.5s, 0.5s'}}>
                        in Monterrey
                    </p>
                </header>

                <InfoWidget />
                
                <div className="mt-6 w-full max-w-md animate-fade-in-up-delay" style={{animationDelay: '0.8s'}}>
                     <button 
                        onClick={handleOpenGallery}
                        className="w-full h-16 rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-lg shadow-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <CameraIcon className="w-7 h-7" />
                        <span>게스트 하우스 소개</span>
                    </button>
                </div>
            </div>

            <Modal isOpen={activeModal === 'info'} onClose={() => setActiveModal(null)} title="기본 정보">
                <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                        <strong className="w-24 font-semibold shrink-0">▷ 주소:</strong> 
                        <span>Av. Almería 302, Almería, 66626 Cdad. Apodaca, N.L., 멕시코</span>
                    </li>
                    <li className="flex items-start">
                        <strong className="w-24 font-semibold shrink-0">▷ TEL:</strong>
                        <span><a href="tel:+528132330975" className="text-primary-600 hover:underline">+52 813 233 0975</a></span>
                    </li>
                    <li className="flex items-start">
                        <strong className="w-24 font-semibold shrink-0">▷ E-Mail:</strong>
                        <span><a href="mailto:srdongkeun@gmail.com" className="text-primary-600 hover:underline">srdongkeun@gmail.com</a></span>
                    </li>
                    <li className="flex items-start">
                        <strong className="w-24 font-semibold shrink-0">▷ 카카오:</strong>
                        <div 
                            onClick={handleCopyKakaoId} 
                            className="relative cursor-pointer group"
                            title="클릭하여 아이디 복사"
                        >
                            <span className="text-primary-600 group-hover:underline">dongkeun1</span>
                             {kakaoIdCopied && (
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-lg shadow-lg opacity-100 transition-opacity duration-300">
                                    ID가 클립보드에 복사되었습니다.
                                    <div className="absolute bottom-full left-1/2 w-0 h-0 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                                </div>
                            )}
                        </div>
                    </li>
                </ul>
            </Modal>

            <Modal isOpen={activeModal === 'directions'} onClose={() => setActiveModal(null)} title="오시는 길" size="lg">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3593.491325603837!2d-100.1436329!3d25.754897999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662956b90757879%3A0x6b8f36894c9f132a!2sAv.%20Almer%C3%ADa%20302%2C%20Almer%C3%ADa%2C%2066626%20Cdad.%20Apodaca%2C%20N.L.%2C%20Mexico!5e0!3m2!1sko!2skr"
                    className="w-full h-96 rounded-lg"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="늘봄 게스트하우스 위치"
                ></iframe>
                <p className="text-sm text-gray-600 mt-4 text-center">
                    지도 위에서 확대/축소 및 이동이 가능합니다.
                </p>
            </Modal>
            
            <Modal isOpen={activeModal === 'recommendations'} onClose={() => setActiveModal(null)} title="주변 추천 장소" size="lg">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    <div className="space-y-4">
                        <h4 className="font-bold text-lg text-secondary-700">맛집</h4>
                        <div className="space-y-3">
                            <RecommendationItem 
                                name="El Gran Pastor"
                                description="몬테레이 최고의 타코 맛집"
                                url="https://www.google.com/search?q=El+Gran+Pastor+Monterrey"
                            />
                            <RecommendationItem 
                                name="Mr. Brown"
                                description="신선한 해산물 요리 전문점"
                                url="https://www.google.com/search?q=Mr.+Brown+Monterrey"
                            />
                            <RecommendationItem 
                                name="Pangea"
                                description="특별한 날을 위한 고급 다이닝"
                                url="https://www.google.com/search?q=Pangea+Monterrey"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-lg text-secondary-700">쇼핑 및 여가</h4>
                        <div className="space-y-3">
                            <RecommendationItem 
                                name="Paseo La Fe"
                                description="다양한 브랜드가 입점한 대형 쇼핑몰"
                                url="https://www.google.com/search?q=Paseo+La+Fe+Monterrey"
                            />
                            <RecommendationItem 
                                name="Citadel"
                                description="영화관, 레스토랑을 갖춘 쇼핑 센터"
                                url="https://www.google.com/search?q=Citadel+Monterrey"
                            />
                            <RecommendationItem 
                                name="Parque Fundidora"
                                description="산책과 문화생활을 즐길 수 있는 복합 공원"
                                url="https://www.google.com/search?q=Parque+Fundidora"
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'services'} onClose={() => setActiveModal(null)} title="서비스 안내" size="lg">
                <div className="space-y-6 text-gray-700">
                    <div>
                        <h4 className="font-bold text-lg text-secondary-700 mb-3 border-b pb-2">주요 서비스</h4>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li><strong>게스트하우스:</strong> Almeria 5단지</li>
                            <li><strong>늘봄식당 :</strong> 한식뷔페 (운영중)</li>
                            <li><strong>단체 회식:</strong> 바베큐, 생삼겹</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg text-primary-700 mb-3 border-b pb-2">무료 제공 서비스</h4>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li>공항 픽업</li>
                            <li>객실 청소 및 세탁</li>
                            <li>조식 및 석식 제공</li>
                            <li>주말 바베큐 파티</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-lg text-blue-700 mb-3 border-b pb-2">출장자 지원</h4>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li>출장 업무 지원</li>
                            <li>장비 렌트 지원</li>
                            <li>몬테레이 현지 업체 정보 제공</li>
                            <li>환전 및 귀국 선물 준비 지원</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg text-gray-700 mb-3 border-b pb-2">가격 정보</h4>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li><strong>숙박:</strong> 1인 1실, 1박 $80</li>
                            <li><strong>출퇴근 차량:</strong> 1일 $15 ~ $20</li>
                            <li><strong>렌트카:</strong> 별도 문의</li>
                        </ul>
                    </div>

                    <div className="pt-4 mt-4 border-t text-center">
                        <p className="font-semibold text-primary-800">몬테레이 최고의 맛집!! 최고의 서비스를 가성비 최고의 늘봄에서 경험하세요.</p>
                        <p className="text-gray-600 mt-1">최선을 다해 모시겠습니다.</p>
                    </div>
                </div>
            </Modal>

            {isGalleryOpen && (
                <div 
                    className="fixed inset-0 bg-white z-[60] p-4 sm:p-6 lg:p-8 animate-fade-in-up-fast"
                >
                    <div className="max-w-7xl mx-auto h-full flex flex-col">
                         {selectedCategory === null ? (
                            <>
                                <header className="flex justify-end items-center pb-4 mb-4">
                                     <button onClick={handleCloseGallery} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
                                        <CloseIcon className="w-7 h-7" />
                                    </button>
                                </header>
                                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">어떤 공간이 궁금하신가요?</h2>
                                    <p className="text-gray-600 max-w-lg mx-auto">
                                        머무시는 동안 편안한 휴식을 제공할 게스트하우스와<br/>정성 가득한 한식을 맛볼 수 있는 늘봄 식당을 소개합니다.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full max-w-2xl">
                                        <button onClick={() => setSelectedCategory('guesthouse')} className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 transform hover:-translate-y-2">
                                            <HomeModernIcon className="w-16 h-16 mx-auto text-gray-400 group-hover:text-primary-600 transition-colors" />
                                            <h3 className="text-2xl font-bold mt-4 text-gray-800">늘봄 게스트하우스</h3>
                                            <p className="text-gray-500 mt-1">편안하고 아늑한 휴식 공간</p>
                                        </button>
                                        <button onClick={() => setSelectedCategory('restaurant')} className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-secondary-500 hover:bg-secondary-50 transition-all duration-300 transform hover:-translate-y-2">
                                            <BuildingStorefrontIcon className="w-16 h-16 mx-auto text-gray-400 group-hover:text-secondary-600 transition-colors" />
                                            <h3 className="text-2xl font-bold mt-4 text-gray-800">늘봄 식당</h3>
                                            <p className="text-gray-500 mt-1">매일 새로운 집밥 스타일 한식 뷔페</p>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <header className="flex justify-between items-center pb-4 border-b mb-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedCategory(null)} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
                                            <ArrowLeftIcon className="w-6 h-6" />
                                        </button>
                                        <h2 className="text-2xl font-bold text-gray-800">{selectedCategory === 'guesthouse' ? '게스트 하우스' : '늘봄 식당'}</h2>
                                    </div>
                                    <button onClick={handleCloseGallery} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
                                        <CloseIcon className="w-7 h-7" />
                                    </button>
                                </header>
                                <div className="flex-1 overflow-y-auto">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {filteredMedia.map((media, index) => (
                                            <div key={media.id} className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden group relative shadow-md">
                                                {media.type === 'video' ? (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${media.youtubeId}`}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="w-full h-full"
                                                        title={media.title}
                                                    ></iframe>
                                                ) : (
                                                    <>
                                                        <img src={media.url} alt={media.alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                        <button onClick={() => openLightbox(index)} className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {filteredMedia.length === 0 && (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            <p>표시할 사진이나 동영상이 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                     <style>{`
                        @keyframes fade-in-up-fast {
                            0% { opacity: 0; transform: translateY(20px); }
                            100% { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fade-in-up-fast { animation: fade-in-up-fast 0.3s ease-out both; }
                    `}</style>
                </div>
            )}
            
            {selectedMediaIndex !== null && galleryMedia[selectedMediaIndex]?.type === 'image' && (
                <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-fade-in" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10">
                        <CloseIcon className="w-8 h-8" />
                    </button>
                    
                    <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                         <button onClick={prevMedia} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                         </button>
                        
                         <img 
                            src={(galleryMedia[selectedMediaIndex] as GalleryImage).url} 
                            alt={(galleryMedia[selectedMediaIndex] as GalleryImage).alt} 
                            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                        />

                        <button onClick={nextMedia} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                    <style>{`
                        @keyframes fade-in {
                            0% { opacity: 0; }
                            100% { opacity: 1; }
                        }
                        .animate-fade-in { animation: fade-in 0.3s ease-out; }
                    `}</style>
                </div>
            )}
        </div>
    );
};