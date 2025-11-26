import React, { useState, useEffect, useRef } from 'react';
import { SparkleIcon, InfoIcon, BuildingIcon, CheckCircleIcon, CloseIcon, CameraIcon, ArrowLeftIcon, HomeModernIcon, BuildingStorefrontIcon, SpeakerWaveIcon, SpeakerXMarkIcon, UserIcon, FireIcon, CarIcon, ClockIcon, BoltIcon, WifiIcon, DropIcon, LinkIcon, MapPinIcon, NavigationIcon, PaperAirplaneIcon } from './icons';
import { Modal } from './Modal';
import { getWeatherInfo } from '../services/geminiService';
import type { GalleryMediaItem, GalleryImage, GalleryCategory, RecommendationItem, RecommendationCategory } from '../types';

// Rec Theme Definition
const recTheme = {
    korean: {
        bg: 'bg-rose-50',
        accent: 'text-rose-600',
        iconBg: 'bg-rose-100',
        border: 'border-rose-100',
        pattern: 'radial-gradient(circle, #e11d48 1px, transparent 1px)',
        icon: HomeModernIcon
    },
    food: {
        bg: 'bg-orange-50',
        accent: 'text-orange-600',
        iconBg: 'bg-orange-100',
        border: 'border-orange-100',
        pattern: 'radial-gradient(circle, #ea580c 1px, transparent 1px)',
        icon: FireIcon
    },
    shopping: {
        bg: 'bg-purple-50',
        accent: 'text-purple-600',
        iconBg: 'bg-purple-100',
        border: 'border-purple-100',
        pattern: 'radial-gradient(circle, #9333ea 1px, transparent 1px)',
        icon: BuildingStorefrontIcon
    },
    tour: {
        bg: 'bg-green-50',
        accent: 'text-green-600',
        iconBg: 'bg-green-100',
        border: 'border-green-100',
        pattern: 'radial-gradient(circle, #16a34a 1px, transparent 1px)',
        icon: CameraIcon
    }
};

const RecommendationCard: React.FC<{ item: RecommendationItem }> = ({ item }) => {
    const theme = recTheme[item.category];
    const Icon = theme.icon;

    // Use Image Card layout if an imageUrl exists
    if (item.imageUrl) {
        return (
             <a 
                href={item.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1 cursor-pointer block"
            >
                {/* Image Header */}
                <div className="h-40 relative overflow-hidden">
                    <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${item.imagePosition || 'object-center'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                         <h3 className="text-lg font-bold leading-tight drop-shadow-sm flex items-center justify-between">
                            {item.name}
                        </h3>
                    </div>
                </div>

                 <div className="p-4 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.tags.map((tag, i) => (
                            <span key={i} className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                                item.category === 'korean' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                item.category === 'food' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                item.category === 'shopping' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                'bg-green-50 text-green-600 border-green-100'
                            }`}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-1 line-clamp-3">
                        {item.description}
                    </p>
                </div>
             </a>
        );
    }

    // Default Graphic Card for other categories (fallback)
    return (
        <a 
            href={item.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border ${theme.border} flex flex-col h-full cursor-pointer block`}
        >
            {/* Graphic Header */}
            <div className={`h-24 ${theme.bg} relative overflow-hidden flex items-center justify-between px-6`}>
                {/* Pattern */}
                <div 
                    className="absolute inset-0 opacity-20" 
                    style={{ backgroundImage: theme.pattern, backgroundSize: '12px 12px' }}
                />
                
                {/* Watermark Icon */}
                <Icon className={`absolute -bottom-4 -right-4 w-32 h-32 ${theme.accent} opacity-10 transform rotate-12`} />
                
                <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center shadow-sm mb-2`}>
                        <Icon className={`w-6 h-6 ${theme.accent}`} />
                    </div>
                    <div className="h-1 w-8 bg-gray-800/10 rounded-full"></div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-700 transition-colors">
                        {item.name}
                    </h3>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-medium rounded-full border border-gray-100">
                            #{tag}
                        </span>
                    ))}
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                    {item.description}
                </p>
            </div>
        </a>
    );
};

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
            const data = await getWeatherInfo();
            if (data) {
                setWeather(data);
            }
            setIsLoadingWeather(false);
        };
        fetchWeather();

        // Update interval to 60 minutes to conserve quota
        const weatherInterval = setInterval(fetchWeather, 60 * 60 * 1000); 

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
                    <p className="text-sm font-semibold text-gray-200">🇰🇷 한국 (Corea)</p>
                    <div className="flex items-center justify-center gap-2 my-1 h-10">
                        {isLoadingWeather ? (
                            <div className="w-8 h-8 animate-pulse bg-white/20 rounded-full"></div>
                        ) : weather?.seoul ? (
                            <>
                                <span className="text-3xl">{getWeatherEmoji(weather.seoul.weather)}</span>
                                <span className="text-xl font-semibold">{Math.round(weather.seoul.temp)}°C</span>
                            </>
                        ) : (
                             <a 
                                href="https://www.google.com/search?q=서울+날씨" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs border border-white/40 rounded-full px-3 py-1.5 hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                날씨 확인 &rarr;
                            </a>
                        )}
                    </div>
                    <p className="font-sans text-xl tracking-wider">{koreaTime}</p>
                    <p className="text-xs text-gray-300 mt-1">{koreaDate}</p>
                </div>
                
                <div className="w-px h-20 bg-white/20 self-center"></div>

                <div className="text-center px-2 flex-1">
                    <p className="text-sm font-semibold text-gray-200">🇲🇽 멕시코 (México)</p>
                     <div className="flex items-center justify-center gap-2 my-1 h-10">
                        {isLoadingWeather ? (
                            <div className="w-8 h-8 animate-pulse bg-white/20 rounded-full"></div>
                        ) : weather?.monterrey ? (
                            <>
                                <span className="text-3xl">{getWeatherEmoji(weather.monterrey.weather)}</span>
                                <span className="text-xl font-semibold">{Math.round(weather.monterrey.temp)}°C</span>
                            </>
                        ) : (
                             <a 
                                href="https://www.google.com/search?q=clima+monterrey" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs border border-white/40 rounded-full px-3 py-1.5 hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap"
                            >
                                Ver Clima &rarr;
                            </a>
                        )}
                    </div>
                    <p className="font-sans text-xl tracking-wider">{mexicoTime}</p>
                    <p className="text-xs text-gray-300 mt-1">{mexicoDate}</p>
                </div>
            </div>
        </div>
    );
};

const MusicPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const playlist = [
        "https://cdn.pixabay.com/download/audio/2022/04/27/audio_67bcf729cf.mp3?filename=spring-flowers-11837.mp3", 
        "https://cdn.pixabay.com/download/audio/2022/05/05/audio_13941e23f9.mp3?filename=good-morning-12693.mp3", 
        "https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c91e332b.mp3?filename=acoustic-breeze-11457.mp3"       
    ];

    useEffect(() => {
        const attemptPlay = async () => {
            if (audioRef.current) {
                try {
                    audioRef.current.volume = 0.4;
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (e) {
                    console.warn("Autoplay blocked by browser policy:", e);
                    setIsPlaying(false);
                }
            }
        };
        attemptPlay();
    }, []);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            handleNextTrack();
        }, 60000); 

        return () => clearInterval(interval);
    }, [isPlaying, currentTrackIndex]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Playback prevented during track switch:", error);
                    });
                }
            }
        }
    }, [currentTrackIndex]);

    const handleNextTrack = () => {
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.log("Play prevented:", err));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <>
            <div className="fixed top-24 left-5 z-40 pointer-events-none">
                {isPlaying && (
                    <div className="flex flex-col items-center animate-fade-in-up-delay" style={{animationDelay: '0.5s'}}>
                        <div className="flex items-end justify-center gap-1 h-12 mb-2">
                             {[...Array(5)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-1.5 bg-white/70 rounded-t-md animate-music-bar"
                                    style={{
                                        height: '20%',
                                        animationDuration: `${0.5 + Math.random() * 0.5}s`,
                                        animationDelay: `${Math.random() * 0.5}s`
                                    }}
                                />
                             ))}
                        </div>
                        <span className="text-[10px] font-bold text-white/80 tracking-widest uppercase">Playing</span>
                    </div>
                )}
                <style>{`
                    @keyframes music-bar {
                        0%, 100% { height: 20%; }
                        50% { height: 100%; }
                    }
                    .animate-music-bar {
                        animation: music-bar 1s ease-in-out infinite;
                    }
                `}</style>
            </div>

            <div className="fixed top-24 right-5 z-40 animate-fade-in-up-delay" style={{animationDelay: '1s'}}>
                <audio 
                    ref={audioRef} 
                    src={playlist[currentTrackIndex]} 
                    onEnded={handleNextTrack} 
                />
                <button 
                    onClick={togglePlay}
                    className={`p-4 rounded-full shadow-xl backdrop-blur-md border border-white/30 transition-all duration-300 flex items-center justify-center transform hover:scale-110 ${
                        isPlaying 
                        ? 'bg-primary-500/90 text-white hover:bg-primary-600 ring-4 ring-primary-500/30' 
                        : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                    title={isPlaying ? "배경 음악 끄기" : "배경 음악 켜기"}
                >
                    {isPlaying ? (
                        <SpeakerWaveIcon className="w-8 h-8 animate-pulse" />
                    ) : (
                        <SpeakerXMarkIcon className="w-8 h-8" />
                    )}
                </button>
            </div>
        </>
    );
};

interface IntroductionProps {
    activeModal: string | null;
    setActiveModal: (modal: string | null) => void;
    galleryMedia: GalleryMediaItem[];
    recommendations: RecommendationItem[];
    visitorCount?: number;
    registerBackHandler?: (handler: () => boolean) => void;
    unregisterBackHandler?: () => void;
}

type ServiceTheme = 'emerald' | 'amber' | 'blue';

const themeStyles: Record<ServiceTheme, { bg: string, iconBg: string, iconColor: string, border: string, pattern: string }> = {
    emerald: {
        bg: 'bg-emerald-50',
        iconBg: 'bg-white',
        iconColor: 'text-emerald-600',
        border: 'border-emerald-100',
        pattern: 'radial-gradient(circle, #10b981 1px, transparent 1px)'
    },
    amber: {
        bg: 'bg-amber-50',
        iconBg: 'bg-white',
        iconColor: 'text-amber-600',
        border: 'border-amber-100',
        pattern: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)'
    },
    blue: {
        bg: 'bg-blue-50',
        iconBg: 'bg-white',
        iconColor: 'text-blue-600',
        border: 'border-blue-100',
        pattern: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)'
    }
};

// Illustration-style Card
const CompactServiceCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    items: string[];
    colorTheme: ServiceTheme;
    delay: string;
    className?: string;
}> = ({ icon, title, subtitle, items, colorTheme, delay, className = "" }) => {
    const theme = themeStyles[colorTheme];

    return (
        <div 
            className={`flex flex-col overflow-hidden rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 bg-white group ${className} animate-fade-in-up-delay hover:-translate-y-1`}
            style={{ animationDelay: delay, borderColor: 'transparent' }}
        >
            {/* Graphic Header */}
            <div className={`h-20 shrink-0 ${theme.bg} relative overflow-hidden flex items-center px-4`}>
                 {/* Abstract Pattern Background */}
                 <div 
                    className="absolute inset-0 opacity-20" 
                    style={{ backgroundImage: theme.pattern, backgroundSize: '12px 12px' }}
                 ></div>
                 
                 {/* Large Faded Icon for Illustration effect */}
                 <div className={`absolute -right-4 -bottom-4 ${theme.iconColor} opacity-10 transform rotate-12 scale-150`}>
                    {React.cloneElement(icon as React.ReactElement, { className: "w-24 h-24" })}
                 </div>

                 {/* Header Content */}
                 <div className="relative z-10 flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${theme.iconBg} shadow-sm ${theme.iconColor} ring-1 ring-black/5`}>
                        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 leading-none">{title}</h3>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-1">{subtitle}</p>
                    </div>
                 </div>
            </div>
            
            {/* Content Body */}
            <div className="flex-1 p-3 flex flex-col bg-white border-t border-gray-100">
                <ul className="space-y-2 overflow-y-auto flex-1 min-h-0 custom-scrollbar pt-1">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 leading-snug group-hover:text-gray-900 transition-colors">
                            <CheckCircleIcon className={`w-4 h-4 shrink-0 mt-0.5 ${theme.iconColor}`} />
                            <span className="font-medium">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export const Introduction: React.FC<IntroductionProps> = ({ activeModal, setActiveModal, galleryMedia, recommendations, visitorCount = 0, registerBackHandler, unregisterBackHandler }) => {
    const [kakaoIdCopied, setKakaoIdCopied] = useState(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | null>(null);
    
    // State for Recommendations Category Navigation
    const [selectedRecCategory, setSelectedRecCategory] = useState<RecommendationCategory | null>(null);

    // Reset Rec Category when modal closes
    useEffect(() => {
        if (activeModal !== 'recommendations') {
            setSelectedRecCategory(null);
        }
    }, [activeModal]);

    // Handle Back Button for Gallery Modal and Recommendations Internal Navigation
    useEffect(() => {
        const isRecSubPage = activeModal === 'recommendations' && selectedRecCategory !== null;
        
        if ((isGalleryOpen || isRecSubPage) && registerBackHandler) {
            registerBackHandler(() => {
                // 1. Gallery Lightbox (Deepest)
                if (selectedMediaIndex !== null) {
                    setSelectedMediaIndex(null);
                    return true;
                }
                // 2. Gallery Category
                if (selectedCategory !== null) {
                    setSelectedCategory(null);
                    return true;
                }
                // 3. Gallery Modal itself (Local state)
                if (isGalleryOpen) {
                    setIsGalleryOpen(false);
                    return true;
                }
                // 4. Recommendations Category (Deep inside modal)
                if (isRecSubPage) {
                    setSelectedRecCategory(null);
                    return true;
                }
                return false;
            });
        } else if (unregisterBackHandler) {
            unregisterBackHandler();
        }
    }, [isGalleryOpen, selectedCategory, selectedMediaIndex, activeModal, selectedRecCategory, registerBackHandler, unregisterBackHandler]);

    const visibleMedia = galleryMedia.filter(m => m.isVisible !== false);

    const handleCopyKakaoId = () => {
        if (kakaoIdCopied) return;
        const text = 'dongkeun1';
        
        const copyViaFallback = () => {
             const textArea = document.createElement("textarea");
             textArea.value = text;
             textArea.style.position = "fixed"; 
             textArea.style.left = "-9999px";
             textArea.style.top = "0";
             document.body.appendChild(textArea);
             textArea.focus();
             textArea.select();
             try {
                 document.execCommand('copy');
                 setKakaoIdCopied(true);
                 setTimeout(() => setKakaoIdCopied(false), 3000);
             } catch (err) {
                 console.error('Fallback copy failed', err);
             }
             document.body.removeChild(textArea);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
             navigator.clipboard.writeText(text).then(() => {
                setKakaoIdCopied(true);
                setTimeout(() => setKakaoIdCopied(false), 3000);
            }).catch(err => {
                console.warn('Clipboard API failed, trying fallback', err);
                copyViaFallback();
            });
        } else {
            copyViaFallback();
        }
    };
    
    const handleOpenGallery = () => {
        setSelectedCategory(null);
        setIsGalleryOpen(true);
    };

    const handleCloseGallery = () => {
        if (selectedCategory !== null) {
            setSelectedCategory(null);
        } else {
            setIsGalleryOpen(false);
            setSelectedCategory(null);
        }
    };
    
    const handleRecModalClose = () => {
        setActiveModal(null);
        setSelectedRecCategory(null);
    };
    
    const filteredMedia = visibleMedia.filter(m => selectedCategory === null || m.category === selectedCategory);

    const openLightbox = (index: number) => {
        const originalIndex = visibleMedia.findIndex(item => item.id === filteredMedia[index].id);
        if (originalIndex !== -1 && visibleMedia[originalIndex].type === 'image') {
            setSelectedMediaIndex(originalIndex);
        }
    };
    
    const closeLightbox = () => setSelectedMediaIndex(null);

    const nextMedia = () => {
        if (selectedMediaIndex === null) return;
        const currentCategoryImages = visibleMedia.filter(m => m.type === 'image' && m.category === selectedCategory);
        const currentIndexInCategory = currentCategoryImages.findIndex(m => m.id === visibleMedia[selectedMediaIndex].id);
        
        if (currentIndexInCategory !== -1) {
            const nextItemInCategory = currentCategoryImages[(currentIndexInCategory + 1) % currentCategoryImages.length];
            const nextOverallIndex = visibleMedia.findIndex(m => m.id === nextItemInCategory.id);
            setSelectedMediaIndex(nextOverallIndex);
        }
    };

    const prevMedia = () => {
        if (selectedMediaIndex === null) return;
        const currentCategoryImages = visibleMedia.filter(m => m.type === 'image' && m.category === selectedCategory);
        const currentIndexInCategory = currentCategoryImages.findIndex(m => m.id === visibleMedia[selectedMediaIndex].id);

        if (currentIndexInCategory !== -1) {
            const prevItemInCategory = currentCategoryImages[(currentIndexInCategory - 1 + currentCategoryImages.length) % currentCategoryImages.length];
            const prevOverallIndex = visibleMedia.findIndex(m => m.id === prevItemInCategory.id);
            setSelectedMediaIndex(prevOverallIndex);
        }
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
    }, [selectedMediaIndex, visibleMedia, selectedCategory]);
    
    // Category metadata for Recommendations
    const recCategories: { id: RecommendationCategory; title: string; sub: string; icon: React.FC<{ className?: string }>; color: string }[] = [
        { id: 'korean', title: '한인 편의시설 & 맛집', sub: 'Coreano', icon: HomeModernIcon, color: 'text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-300' },
        { id: 'food', title: '로컬 맛집 탐방', sub: 'Restaurantes Locales', icon: FireIcon, color: 'text-orange-600 bg-orange-50 border-orange-100 hover:border-orange-300' },
        { id: 'shopping', title: '쇼핑 및 여가', sub: 'Compras', icon: BuildingStorefrontIcon, color: 'text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300' },
        { id: 'tour', title: '관광 명소', sub: 'Turismo', icon: CameraIcon, color: 'text-green-600 bg-green-50 border-green-100 hover:border-green-300' }
    ];
    
    // Destinations for Navigation Dashboard
    const destinations = [
        { name: '몬테레이 국제공항', sub: 'Aeropuerto Internacional (MTY)', time: '15~20분', type: 'airport', query: 'Aeropuerto Internacional de Monterrey' },
        { name: '기아 자동차 멕시코', sub: 'Kia Motors Mexico', time: '25~35분', type: 'industry', query: 'Av. Kia 777, 66679 Kía Motors, N.L.', isRealTime: true },
        { name: '몬테레이 센트로', sub: 'Macroplaza (Centro)', time: '30~40분', type: 'downtown', query: 'Macroplaza Monterrey' },
        { name: '아포다카 산업단지', sub: 'Parque Industrial Apodaca', time: '15~20분', type: 'industry', query: 'Parque Industrial Apodaca' },
        { name: '현대 모비스', sub: 'Hyundai Mobis', time: '20~30분', type: 'industry', query: 'Hyundai Mobis Mexico', isRealTime: true },
        { name: '페스케리아 공단', sub: 'Pesquería Industrial', time: '25~35분', type: 'industry', query: 'Kia Motors Avenue, 66679 N.L.', isRealTime: true }
    ];

    const getIconForType = (type: string) => {
        switch(type) {
            case 'airport': return <PaperAirplaneIcon className="w-6 h-6 text-blue-500" />;
            case 'downtown': return <BuildingIcon className="w-6 h-6 text-purple-500" />;
            case 'industry': return <BuildingStorefrontIcon className="w-6 h-6 text-orange-500" />;
            default: return <MapPinIcon className="w-6 h-6 text-red-500" />;
        }
    };
    
    const handleNavigation = (query: string) => {
        // Use user's current location or guesthouse location as origin if possible, 
        // but broadly search for directions TO the destination.
        // Origin hardcoded to Guesthouse area for better context if they are there.
        const origin = "Av. Almería 302, Almería, 66626 Cdad. Apodaca, N.L.";
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(query)}&travelmode=driving`;
        window.open(url, '_blank');
    };

    return (
        <div 
            className="relative h-full w-full bg-black overflow-hidden"
        >
            <div 
                className="absolute inset-0 bg-cover bg-center animate-zoom-in-bg"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2070&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-black/40" />
            
            <MusicPlayer />

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
                    /* Custom Scrollbar for modal content */
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(0,0,0,0.05);
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(0,0,0,0.1);
                        border-radius: 2px;
                    }
                `}
            </style>
            
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-white p-4 pb-48">
                <header className="text-center mb-2 flex flex-col items-center">
                    <h2 
                        className="font-pen animate-tracking-in"
                        style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)' }}
                    >
                        <span className="block text-5xl md:text-7xl lg:text-8xl">봄처럼 따뜻한 쉼,</span>
                        <span className="block text-7xl md:text-8xl lg:text-9xl mt-2">늘봄</span>
                    </h2>
                     <p className="text-xl md:text-2xl font-sans text-gray-200 mt-4 animate-fade-in-up-delay" style={{animationDelay: '0.5s, 0.5s'}}>
                        in Monterrey
                    </p>
                    
                    <div className="mt-4 px-4 py-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-white/20 flex items-center gap-2 animate-fade-in-up-delay" style={{animationDelay: '0.6s'}}>
                         <UserIcon className="w-4 h-4 text-white/80" />
                         <span className="text-sm font-medium text-white/90">
                             누적 방문자: {visitorCount.toLocaleString()}명
                         </span>
                    </div>
                </header>

                <InfoWidget />
                
                <div className="mt-2 w-full max-w-md animate-fade-in-up-delay" style={{animationDelay: '0.8s'}}>
                     <button 
                        onClick={handleOpenGallery}
                        className="w-full h-16 rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-lg shadow-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <CameraIcon className="w-7 h-7" />
                        <span>게스트 하우스 소개 (Introducción)</span>
                    </button>
                </div>
            </div>

            <Modal isOpen={activeModal === 'info'} onClose={() => setActiveModal(null)} title="기본 정보 (Información Básica)">
                <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                        <strong className="w-32 font-semibold shrink-0">▷ 주소 (Dirección):</strong> 
                        <span>Av. Almería 302, Almería, 66626 Cdad. Apodaca, N.L., 멕시코</span>
                    </li>
                    <li className="flex items-start">
                        <strong className="w-32 font-semibold shrink-0">▷ TEL (Teléfono):</strong>
                        <span><a href="tel:+528132330975" className="text-primary-600 hover:underline">+52 813 233 0975</a></span>
                    </li>
                    <li className="flex items-start">
                        <strong className="w-32 font-semibold shrink-0">▷ E-Mail:</strong>
                        <span><a href="mailto:srdongkeun@gmail.com" className="text-primary-600 hover:underline">srdongkeun@gmail.com</a></span>
                    </li>
                    <li className="flex items-start">
                        <strong className="w-32 font-semibold shrink-0">▷ Kakao Talk:</strong>
                        <div 
                            onClick={handleCopyKakaoId} 
                            className="relative cursor-pointer group"
                            title="클릭하여 아이디 복사"
                        >
                            <span className="text-primary-600 group-hover:underline">dongkeun1</span>
                             {kakaoIdCopied && (
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-lg shadow-lg opacity-100 transition-opacity duration-300">
                                    ID 복사 완료 (Copiado)
                                    <div className="absolute bottom-full left-1/2 w-0 h-0 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                                </div>
                            )}
                        </div>
                    </li>
                </ul>
            </Modal>

            {/* Revised Fullscreen Directions Modal */}
            <Modal isOpen={activeModal === 'directions'} onClose={() => setActiveModal(null)} title="교통 및 위치 정보 (Ubicación)" size="fullscreen" hideHeader={true}>
                 <div className="flex flex-col h-full bg-gray-50">
                    {/* Header */}
                    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm shrink-0 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div>
                                 <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight leading-snug">
                                     교통 및 위치 정보
                                 </h2>
                                 <p className="text-gray-500 text-xs md:text-sm font-light">
                                     Centro de Información de Tráfico y Ubicación
                                 </p>
                             </div>
                         </div>
                         <button 
                            onClick={() => setActiveModal(null)}
                            className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 -mr-2"
                            aria-label="닫기"
                         >
                            <CloseIcon className="w-6 h-6" />
                         </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto w-full pb-24">
                        {/* Map Section */}
                        <div className="w-full h-64 md:h-80 relative shadow-md">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3593.491325603837!2d-100.1436329!3d25.754897999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662956b90757879%3A0x6b8f36894c9f132a!2sAv.%20Almer%C3%ADa%20302%2C%20Almer%C3%ADa%2C%2066626%20Cdad.%20Apodaca%2C%20N.L.%2C%20Mexico!5e0!3m2!1sko!2skr"
                                className="w-full h-full"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="늘봄 게스트하우스 위치"
                            ></iframe>
                            <a 
                                href="https://goo.gl/maps/XYZ123" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-sm font-bold text-gray-800 flex items-center gap-2 hover:bg-white hover:scale-105 transition-all"
                            >
                                <MapPinIcon className="w-5 h-5 text-red-500" />
                                구글맵에서 크게 보기
                            </a>
                        </div>
                        
                        {/* Destinations Grid */}
                        <div className="p-4 md:p-6 max-w-7xl mx-auto">
                            <div className="mb-6 text-center">
                                <h3 className="text-xl font-bold text-gray-800">어디로 가시나요? (¿A dónde vas?)</h3>
                                <p className="text-gray-500 text-sm mt-1">목적지를 선택하면 실시간 최적 경로를 안내합니다.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {destinations.map((dest, idx) => (
                                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-gray-50 rounded-lg">
                                                    {getIconForType(dest.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-lg leading-none">{dest.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 font-medium">{dest.sub}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs text-gray-400 font-medium">예상 소요</span>
                                                <div className="flex items-center justify-end gap-1">
                                                    {(dest as any).isRealTime && <span className="relative flex h-2 w-2">
                                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>}
                                                    <span className={`block font-bold text-sm ${(dest as any).isRealTime ? 'text-green-600' : 'text-gray-800'}`}>{dest.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleNavigation(dest.query)}
                                            className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <NavigationIcon className="w-5 h-5" />
                                            <span>실시간 길찾기 (Navegación)</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                <InfoIcon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-bold mb-1">교통 정보 팁 (Consejo de Tráfico)</p>
                                    <p>몬테레이는 출퇴근 시간(07:00~09:00, 17:00~19:00)에 교통 체증이 심할 수 있습니다. 공항 이동 시 최소 30분 정도 여유를 두고 출발하시는 것을 권장합니다.</p>
                                    <p className="mt-1 text-xs text-blue-600/80">
                                        * 녹색 점(●)이 표시된 곳은 실시간 교통 상황에 따라 소요 시간이 변동될 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </Modal>
            
            <Modal isOpen={activeModal === 'recommendations'} onClose={handleRecModalClose} title="주변 추천 (Recomendaciones)" size="fullscreen" hideHeader={true}>
                <div className="flex flex-col h-full bg-gray-50">
                    {/* Header - Compact & Sticky */}
                    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm shrink-0 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             {selectedRecCategory && (
                                <button 
                                    onClick={() => setSelectedRecCategory(null)}
                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                                >
                                    <ArrowLeftIcon className="w-6 h-6" />
                                </button>
                             )}
                             <div>
                                 <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight leading-snug">
                                     {selectedRecCategory 
                                        ? recCategories.find(c => c.id === selectedRecCategory)?.title 
                                        : 'Explore Monterrey'
                                     }
                                 </h2>
                                 <p className="text-gray-500 text-xs md:text-sm font-light">
                                     {selectedRecCategory
                                        ? recCategories.find(c => c.id === selectedRecCategory)?.sub
                                        : '몬테레이의 맛과 멋, 그리고 편리함을 담았습니다.'
                                     }
                                 </p>
                             </div>
                         </div>
                         <button 
                            onClick={handleRecModalClose}
                            className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 -mr-2"
                            aria-label="닫기"
                         >
                            <CloseIcon className="w-6 h-6" />
                         </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 md:p-6 max-w-7xl mx-auto w-full pb-24">
                        
                        {!selectedRecCategory ? (
                            // Category Selection Menu
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-start">
                                {recCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedRecCategory(cat.id)}
                                        className={`group relative overflow-hidden rounded-2xl border p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-all duration-300 text-left ${cat.color} bg-white hover:bg-opacity-100`}
                                    >
                                        <div className={`p-4 rounded-full bg-opacity-20 shrink-0 ${cat.color.split(' ')[1].replace('bg-', 'bg-')}`}>
                                            <cat.icon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900">{cat.title}</h3>
                                            <p className="text-sm text-gray-500 font-medium mt-1">{cat.sub}</p>
                                        </div>
                                        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                                            <ArrowLeftIcon className="w-6 h-6 rotate-180" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // Selected Category List
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up-fast">
                                {recommendations.filter(r => r.category === selectedRecCategory).map((item) => (
                                    <RecommendationCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                        
                        {/* Large Close Button at bottom */}
                        <div className="mt-8 flex justify-center pb-6">
                            <button
                                onClick={handleRecModalClose}
                                className="bg-white text-gray-800 shadow-md border border-gray-200 rounded-full px-8 py-3 flex items-center gap-2 hover:bg-gray-50 transition-transform active:scale-95"
                            >
                                <CloseIcon className="w-6 h-6 text-gray-500" />
                                <span className="font-bold text-lg">닫기 (Cerrar)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={activeModal === 'services'} onClose={() => setActiveModal(null)} title="서비스 안내 (Servicios)" size="fullscreen">
                 {/* ... (Service Modal Content - Unchanged) ... */}
                 <div className={`flex flex-col bg-gray-50 font-sans ${activeModal === 'services' ? 'md:h-full' : ''}`}>
                    {/* Hero / Header - Illustrated Graphics */}
                    <div className="relative h-28 md:h-36 shrink-0 shadow-sm z-10 bg-gradient-to-r from-green-100 via-emerald-50 to-teal-100 overflow-hidden">
                         <div 
                            className="absolute inset-0 opacity-10"
                            style={{ 
                                backgroundImage: 'radial-gradient(#22c55e 1.5px, transparent 1.5px)', 
                                backgroundSize: '20px 20px' 
                            }}
                         ></div>
                         
                         <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                             <h2 className="text-3xl md:text-4xl font-bold font-pen tracking-wide text-emerald-800 drop-shadow-sm animate-fade-in-up-delay" style={{animationDelay: '0s'}}>
                                 Premium Services
                             </h2>
                             <p className="text-sm text-emerald-700 mt-1 font-medium tracking-wider bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm animate-fade-in-up-delay" style={{animationDelay: '0.1s'}}>
                                 편안한 쉼과 최고의 맛, 합리적인 가격
                             </p>
                         </div>
                    </div>

                    {/* --- DESKTOP LAYOUT (Fixed Height, Grid) --- */}
                    <div className="hidden md:flex flex-1 flex-col overflow-hidden p-4 gap-4 max-w-7xl mx-auto w-full relative z-0">
                        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                             <CompactServiceCard 
                                className="h-full"
                                icon={<HomeModernIcon />}
                                title="편안한 공간"
                                subtitle="Relax Space"
                                items={[
                                    "안전하고 쾌적한 Almeria 5단지",
                                    "넓은 공용 공간과 휴식 시설",
                                    "바베큐 및 삼겹살 파티 지원"
                                ]}
                                colorTheme="emerald"
                                delay="0.1s"
                             />
                             <CompactServiceCard 
                                className="h-full"
                                icon={<SparkleIcon />}
                                title="무료 혜택"
                                subtitle="Complimentary"
                                items={[
                                    "공항 픽업 서비스 (도착 시)",
                                    "매일 객실 청소 및 세탁",
                                    "한식 뷔페 (조식/석식)",
                                    "주말 특별 바베큐 파티",
                                    "초고속 인터넷 (Wi-Fi)"
                                ]}
                                colorTheme="amber"
                                delay="0.2s"
                             />
                             <CompactServiceCard 
                                className="h-full"
                                icon={<BuildingIcon />}
                                title="비즈니스 지원"
                                subtitle="Business"
                                items={[
                                    "출장 관련 현지 업무 지원",
                                    "장비 렌트 및 업체 연결",
                                    "환전 및 귀국 선물 대행",
                                    "통역/가이드 주선 (요청 시)"
                                ]}
                                colorTheme="blue"
                                delay="0.3s"
                             />
                        </div>
                        
                        {/* Desktop Pricing & Restaurant Info */}
                        <div className="shrink-0 w-full grid grid-cols-2 gap-4 animate-fade-in-up-delay" style={{ animationDelay: '0.4s' }}>
                             {/* Accommodation Pricing - Illustrated Style */}
                             <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-32 group hover:shadow-md transition-all">
                                 <div className="bg-emerald-600 text-white px-3 py-2 flex items-center justify-between shadow-sm shrink-0 relative overflow-hidden">
                                     <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                                     <div className="flex items-center gap-2 relative z-10">
                                         <div className="p-1 bg-white/20 rounded">
                                            <FireIcon className="w-4 h-4 text-white" />
                                         </div>
                                         <span className="font-bold text-sm tracking-wide">숙박 및 서비스 (Alojamiento)</span>
                                     </div>
                                 </div>
                                 <div className="p-2 flex-1 grid grid-cols-3 gap-2 divide-x divide-gray-100 text-gray-800 items-center">
                                     <div className="text-center group-hover:scale-105 transition-transform">
                                         <h4 className="text-xs font-bold text-gray-500">숙박 (1인)</h4>
                                         <div className="text-xl font-extrabold text-emerald-700 my-0.5">$80</div>
                                         <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-bold whitespace-nowrap">조/석식 포함</span>
                                     </div>
                                     <div className="text-center">
                                         <h4 className="text-xs font-bold text-gray-500">출퇴근</h4>
                                         <div className="text-xl font-extrabold text-gray-800 my-0.5">$15~20</div>
                                         <span className="text-[9px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-100 whitespace-nowrap">거리 비례</span>
                                     </div>
                                     <div className="text-center">
                                         <h4 className="text-xs font-bold text-gray-500">렌트카</h4>
                                         <div className="text-sm font-bold text-gray-800 my-1.5">별도 문의</div>
                                         <span className="text-[9px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-100 whitespace-nowrap">차종별 상이</span>
                                     </div>
                                 </div>
                             </div>

                             {/* Restaurant Info - Illustrated Style */}
                             <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden flex flex-col h-32 group hover:shadow-md transition-all">
                                 <div className="bg-orange-500 text-white px-3 py-2 flex items-center justify-between shadow-sm shrink-0 relative overflow-hidden">
                                     <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                                     <div className="flex items-center gap-2 relative z-10">
                                         <div className="p-1 bg-white/20 rounded">
                                            <BuildingStorefrontIcon className="w-4 h-4 text-white" />
                                         </div>
                                         <span className="font-bold text-sm tracking-wide">식당 안내 (Restaurante)</span>
                                     </div>
                                 </div>
                                 <div className="p-2 flex-1 grid grid-cols-2 gap-2 text-gray-800 text-xs items-center">
                                     <div className="flex flex-col justify-center pl-2 border-r border-gray-100">
                                         <div className="font-bold text-orange-600 mb-1 flex items-center gap-1"><ClockIcon className="w-3 h-3"/> 영업시간 (Horario)</div>
                                         <p><span className="font-semibold text-gray-800">월~토:</span> 06:00-08:00 / 18:00-20:30</p>
                                         <p><span className="font-semibold text-gray-800">일요일:</span> 06:00-08:00 / 18:00-20:00</p>
                                     </div>
                                     <div className="flex flex-col justify-center pl-2 group-hover:scale-105 transition-transform origin-left">
                                         <div className="font-bold text-orange-600 mb-1 flex items-center gap-1"><FireIcon className="w-3 h-3"/> 뷔페 가격 (Precios)</div>
                                         <p>조식 $150 / 석식 $250</p>
                                         <p className="font-bold text-rose-600 mt-0.5">★ 토요일 특식 $350</p>
                                         <p className="text-[9px] text-gray-500 -mt-0.5">(삼겹살/소고기 - Carne Asada)</p>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>


                    {/* --- MOBILE LAYOUT (Vertical Scroll, Stacked) --- */}
                    <div className="md:hidden p-3 space-y-4 pb-12">
                         <div className="space-y-4">
                             <CompactServiceCard 
                                className="h-64"
                                icon={<HomeModernIcon />}
                                title="편안한 공간"
                                subtitle="Relax Space"
                                items={[
                                    "안전하고 쾌적한 Almeria 5단지",
                                    "넓은 공용 공간과 휴식 시설",
                                    "바베큐 및 삼겹살 파티 지원"
                                ]}
                                colorTheme="emerald"
                                delay="0.1s"
                             />
                             <CompactServiceCard 
                                className="h-64"
                                icon={<SparkleIcon />}
                                title="무료 혜택"
                                subtitle="Complimentary"
                                items={[
                                    "공항 픽업 서비스 (도착 시)",
                                    "매일 객실 청소 및 세탁",
                                    "한식 뷔페 (조식/석식)",
                                    "주말 특별 바베큐 파티",
                                    "초고속 인터넷 (Wi-Fi)"
                                ]}
                                colorTheme="amber"
                                delay="0.2s"
                             />
                             <CompactServiceCard 
                                className="h-64"
                                icon={<BuildingIcon />}
                                title="비즈니스 지원"
                                subtitle="Business"
                                items={[
                                    "출장 관련 현지 업무 지원",
                                    "장비 렌트 및 업체 연결",
                                    "환전 및 귀국 선물 대행",
                                    "통역/가이드 주선 (요청 시)"
                                ]}
                                colorTheme="blue"
                                delay="0.3s"
                             />

                             {/* Mobile Restaurant Info Card */}
                             <div 
                                className="bg-white rounded-2xl shadow-sm border border-orange-100 animate-fade-in-up-delay overflow-hidden"
                                style={{ animationDelay: '0.35s' }}
                            >
                                <div className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                                    <div className="p-1.5 bg-white/20 rounded-lg relative z-10">
                                        <BuildingStorefrontIcon className="w-6 h-6" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-lg leading-none">식당 운영 안내</h3>
                                        <p className="text-[10px] opacity-90 mt-0.5">Horario y Precios del Restaurante</p>
                                    </div>
                                </div>
                                <div className="p-4 text-gray-800 space-y-4 text-sm bg-white">
                                    <div>
                                        <div className="flex items-center gap-2 text-orange-700 font-bold mb-1 border-b border-orange-100 pb-1">
                                            <ClockIcon className="w-4 h-4" />
                                            영업 시간 (Horario)
                                        </div>
                                        <div className="pl-2 space-y-1">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-gray-600">월~토 (Lun-Sab):</span>
                                                <span>06:00~08:00 / 18:00~20:30</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-gray-600">일요일 (Domingo):</span>
                                                <span>06:00~08:00 / 18:00-20:00</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-orange-700 font-bold mb-1 border-b border-orange-100 pb-1">
                                            <FireIcon className="w-4 h-4" />
                                            뷔페 가격 (Precios Buffet)
                                        </div>
                                        <div className="pl-2 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-600">조식 (Desayuno):</span>
                                                <span className="font-bold text-lg text-orange-800">$150</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-600">석식 (Cena):</span>
                                                <span className="font-bold text-lg text-orange-800">$250</span>
                                            </div>
                                            <div className="mt-2 bg-rose-50 p-2 rounded border border-rose-100 shadow-sm">
                                                <div className="flex justify-between items-center text-rose-700">
                                                    <span className="font-bold">★ 토요일 특식 (Sábado)</span>
                                                    <span className="font-bold text-xl">$350</span>
                                                </div>
                                                <p className="text-xs text-rose-600 mt-0.5 text-right font-medium">삼겹살 또는 소고기 (Carne Asada)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Pricing: Vertical Stack */}
                        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden animate-fade-in-up-delay" style={{ animationDelay: '0.4s' }}>
                             <div className="bg-emerald-600 text-white px-3 py-2 flex items-center justify-between shadow-sm relative overflow-hidden">
                                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                                 <div className="flex items-center gap-2 relative z-10">
                                     <div className="p-1 bg-white/20 rounded-lg">
                                         <FireIcon className="w-5 h-5 text-white" />
                                     </div>
                                     <span className="font-bold text-lg tracking-wide">숙박 가격 안내</span>
                                 </div>
                                 <span className="text-xs text-emerald-800 bg-white px-2 py-1 rounded-full font-bold shadow-sm z-10">문의 환영</span>
                             </div>
                             <div className="p-3 space-y-3 text-gray-800">
                                 <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                     <div>
                                        <h4 className="text-sm font-bold text-gray-500">숙박 (1인/1박)</h4>
                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold">조/석식 포함</span>
                                     </div>
                                     <div className="text-2xl font-bold text-emerald-700">$80</div>
                                 </div>
                                 <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                     <div>
                                        <h4 className="text-sm font-bold text-gray-500">출퇴근 (1일)</h4>
                                        <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100">거리 비례</span>
                                     </div>
                                     <div className="text-2xl font-bold text-gray-800">$15~20</div>
                                 </div>
                                 <div className="flex items-center justify-between">
                                     <div>
                                        <h4 className="text-sm font-bold text-gray-500">렌트카</h4>
                                        <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100">차종별 상이</span>
                                     </div>
                                     <div className="text-xl font-bold text-gray-800">별도 문의</div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </Modal>
            
            {/* ... (Gallery Modal Content - Unchanged) ... */}
            {isGalleryOpen && (
                <div 
                    className="fixed inset-0 bg-white z-[60] p-4 sm:p-6 lg:p-8 animate-fade-in-up-fast"
                >
                    <div className="max-w-7xl mx-auto h-full flex flex-col relative">
                         {selectedCategory === null ? (
                            <>
                                <header className="flex justify-end items-center pb-4 mb-4">
                                     <button onClick={handleCloseGallery} className="text-gray-500 hover:text-gray-800 p-3 rounded-full hover:bg-gray-100">
                                        <CloseIcon className="w-8 h-8" />
                                    </button>
                                </header>
                                 <div className="flex-1 flex flex-col items-center justify-center text-center pb-28">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">어떤 공간이 궁금하신가요?</h2>
                                    <p className="text-gray-600 max-w-lg mx-auto mb-8">
                                        ¿Qué espacio le gustaría ver?
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 w-full max-w-2xl">
                                        <button onClick={() => setSelectedCategory('guesthouse')} className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 transform hover:-translate-y-2">
                                            <HomeModernIcon className="w-16 h-16 mx-auto text-gray-400 group-hover:text-primary-600 transition-colors" />
                                            <h3 className="text-2xl font-bold mt-4 text-gray-800">늘봄 게스트하우스</h3>
                                            <p className="text-gray-500 mt-1">Neulbom Guesthouse</p>
                                        </button>
                                        <button onClick={() => setSelectedCategory('restaurant')} className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-secondary-500 hover:bg-secondary-50 transition-all duration-300 transform hover:-translate-y-2">
                                            <BuildingStorefrontIcon className="w-16 h-16 mx-auto text-gray-400 group-hover:text-secondary-600 transition-colors" />
                                            <h3 className="text-2xl font-bold mt-4 text-gray-800">늘봄 식당</h3>
                                            <p className="text-gray-500 mt-1">Restaurante Neulbom</p>
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
                                        <h2 className="text-2xl font-bold text-gray-800">{selectedCategory === 'guesthouse' ? '게스트 하우스 (Guesthouse)' : '늘봄 식당 (Restaurante)'}</h2>
                                    </div>
                                </header>
                                <div className="flex-1 overflow-y-auto pb-28">
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
                                            <p>표시할 사진이나 동영상이 없습니다.<br/>No hay fotos ni videos.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        
                        {/* Large Fixed Close/Back Button at the Bottom */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
                            <button
                                onClick={handleCloseGallery}
                                className="pointer-events-auto bg-white/90 backdrop-blur-md text-gray-800 shadow-2xl border border-gray-200 rounded-full px-8 py-4 flex items-center gap-2 hover:bg-gray-50 transition-transform active:scale-95"
                            >
                                {selectedCategory !== null ? (
                                     <ArrowLeftIcon className="w-6 h-6" />
                                ) : (
                                     <CloseIcon className="w-6 h-6" />
                                )}
                                <span className="font-bold text-lg">
                                    {selectedCategory !== null ? '뒤로 가기 (Atrás)' : '닫기 (Cerrar)'}
                                </span>
                            </button>
                        </div>
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
            
            {selectedMediaIndex !== null && visibleMedia[selectedMediaIndex]?.type === 'image' && (
                <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-fade-in" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10">
                        <CloseIcon className="w-8 h-8" />
                    </button>
                    
                    <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                         <button onClick={prevMedia} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                         </button>
                        
                         <img 
                            src={(visibleMedia[selectedMediaIndex] as GalleryImage).url} 
                            alt={(visibleMedia[selectedMediaIndex] as GalleryImage).alt} 
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