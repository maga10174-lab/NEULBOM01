
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useGuestHouseData } from './hooks/useGuestHouseData';
import { BottomNav } from './components/BottomNav';
import { Introduction } from './components/Dashboard';
import { Booking } from './components/BookingList';
import { Management } from './components/RoomList';
import { Admin, IntegratedManagement } from './components/TaskList';
import { GalleryManagement } from './components/GalleryManagement';
import { ConfirmedBookingList } from './components/ConfirmedBookingList';
import { PendingBookingList } from './components/PendingBookingList';
import { CarManagement } from './components/CarManagement';
import { UtilityList } from './components/UtilityList';
import { RecommendationManagement } from './components/RecommendationManagement';
import { LoginIcon, LogoutIcon, BellIcon, UserIcon, CalendarIcon, PaperAirplaneIcon } from './components/icons';
import { Modal } from './components/Modal';
import { NotificationContainer } from './components/Notification';
import { generateBookingNotificationAudio } from './services/geminiService';
import type { AdminView, PublicView, Notification as NotificationType, Booking as BookingType, House, StreetName } from './types';

// From @google/genai guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const streetKor: Record<StreetName, string> = {
  Arteal: "아르테알 (Arteal)",
  Retamar: "레타마르 (Retamar)",
  Tahal: "타알 (Tahal)",
  Ubedas: "우베다스 (Ubedas)",
  Ragol: "라골 (Ragol)",
  Vera: "베라 (Vera)",
  PRIVADA3: "프리바다3 (Privada 3)",
  PRIVADA6: "프리바다6 (Privada 6)",
};

const AssignModal: React.FC<{
    booking: BookingType;
    houses: House[];
    onClose: () => void;
    onAssign: (houseId: string) => void;
}> = ({ booking, houses, onClose, onAssign }) => {
    const assignableHouses = useMemo(() => {
        return houses.filter(h => {
            const totalGuestsInHouse = h.guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
            return totalGuestsInHouse <= 2;
        }).sort((a,b) => {
            const guestsA = a.guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
            const guestsB = b.guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
            return guestsA - guestsB;
        });
    }, [houses]);
    
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title={`주택 배정 (Asignar Casa): ${booking.guestName}`}
        size="md"
      >
        <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">배정 가능한 주택 (Disponibles)</h4>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-2 -mr-2">
                {assignableHouses.length > 0 ? (
                    assignableHouses.map(house => {
                        const totalGuestsInHouse = house.guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
                        return (
                            <button
                                key={house.id}
                                onClick={() => onAssign(house.id)}
                                className="w-full text-left p-3 bg-gray-50 hover:bg-primary-100 rounded-lg transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <span className="font-bold text-gray-800">{streetKor[house.street]} {house.number}</span>
                                </div>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${totalGuestsInHouse === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {totalGuestsInHouse > 0 ? `${totalGuestsInHouse}명 입실 중` : '공실 (Vacío)'}
                                </span>
                            </button>
                        )
                    })
                ) : (
                    <p className="text-gray-500 text-center py-4">배정 가능한 주택이 없습니다. (No hay casas disponibles)</p>
                )}
            </div>
        </div>
      </Modal>
    );
};

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [newBookingForPopup, setNewBookingForPopup] = useState<BookingType | null>(null);
  
  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, title, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // FIX: Break circular dependency where the callback for useGuestHouseData depended on its own return value.
  // We now use a ref to hold the callback logic, allowing it to be updated with the latest state
  // while passing a stable function to the hook.
  const onNewBookingCallbackRef = useRef<(booking: BookingType) => Promise<void>>();
  
  const data = useGuestHouseData(
    useCallback((booking: BookingType) => {
      // Forward the call to the logic stored in the ref.
      onNewBookingCallbackRef.current?.(booking);
    }, [])
  );

  // This effect updates the callback logic whenever its dependencies (like data.isAuthenticated) change.
  useEffect(() => {
    onNewBookingCallbackRef.current = async (booking: BookingType) => {
      // Show toast notification for everyone
      addNotification(
          '신규 예약 요청 (Nueva Reserva)',
          `${booking.guestName}님으로부터 새로운 예약 요청이 도착했습니다.`,
          'info'
      );

      // For logged-in admins, show modal and play sound
      if (data.isAuthenticated) {
          setNewBookingForPopup(booking);

          try {
              const audioData = await generateBookingNotificationAudio(booking.guestName);
              if (audioData) {
                  if (!audioContextRef.current) {
                      // FIX: Cast window to 'any' to access legacy 'webkitAudioContext' without a TypeScript error.
                      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                  }
                  
                  const audioCtx = audioContextRef.current;
                  if (audioCtx.state === 'suspended') {
                      await audioCtx.resume();
                  }
                  
                  const decodedBytes = decode(audioData);
                  const audioBuffer = await decodeAudioData(decodedBytes, audioCtx, 24000, 1);
                  
                  const source = audioCtx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(audioCtx.destination);
                  source.start();
              }
          } catch (error) {
              console.warn("Failed to play new booking notification sound:", error);
          }
      }
    };
  }, [addNotification, data.isAuthenticated]);
  
  const [publicView, setPublicView] = useState<PublicView>('intro');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [bookingToAssign, setBookingToAssign] = useState<BookingType | null>(null);

  const handleOpenAssignModal = (booking: BookingType) => {
    setBookingToAssign(booking);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setBookingToAssign(null);
  };

  const handleAssignHouse = async (houseId: string) => {
      if (bookingToAssign) {
          try {
              await data.confirmBooking(bookingToAssign.id, houseId);
          } catch (error) {
              console.error("Failed to confirm booking and assign house:", error);
              alert("주택 배정 중 오류가 발생했습니다.");
          } finally {
              handleCloseAssignModal();
          }
      }
  };

  // --- Share Handler ---
  const handleShare = async () => {
      const shareUrl = 'https://service-954114529049.us-west1.run.app/';
      
      const shareData = {
          title: '늘봄 게스트하우스',
          url: shareUrl,
      };

      try {
          if (navigator.share) {
              await navigator.share(shareData);
          } else {
              throw new Error("Web Share API not supported");
          }
      } catch (error) {
          console.warn("Share failed or not supported, falling back to clipboard:", error);
          
          const copyViaFallback = (text: string) => {
              const textArea = document.createElement("textarea");
              textArea.value = text;
              textArea.style.position = "fixed"; // Avoid scrolling to bottom
              textArea.style.left = "-9999px";
              textArea.style.top = "0";
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              try {
                  const successful = document.execCommand('copy');
                  document.body.removeChild(textArea);
                  return successful;
              } catch (err) {
                  document.body.removeChild(textArea);
                  return false;
              }
          };

          try {
            await navigator.clipboard.writeText(shareUrl);
            alert('주소가 복사되었습니다. (URL Copiada)');
          } catch (clipError) {
             console.warn("Clipboard API failed, trying fallback:", clipError);
             if (copyViaFallback(shareUrl)) {
                 alert('주소가 복사되었습니다. (URL Copiada)');
             } else {
                 prompt("주소를 복사해주세요 (Copiar URL):", shareUrl);
             }
          }
      }
  };

  // --- Back Button Handling Logic ---
  const backHandlerRef = useRef<(() => boolean) | null>(null);
  
  const stateRef = useRef({
      publicView,
      adminView,
      isLoginModalOpen,
      isAssignModalOpen,
      activeModal,
      isAuthenticated: data.isAuthenticated,
      newBookingForPopup,
  });

  useEffect(() => {
      stateRef.current = {
          publicView,
          adminView,
          isLoginModalOpen,
          isAssignModalOpen,
          activeModal,
          isAuthenticated: data.isAuthenticated,
          newBookingForPopup,
      };
  }, [publicView, adminView, isLoginModalOpen, isAssignModalOpen, activeModal, data.isAuthenticated, newBookingForPopup]);

  const registerBackHandler = useCallback((handler: () => boolean) => {
      backHandlerRef.current = handler;
  }, []);

  const unregisterBackHandler = useCallback(() => {
      backHandlerRef.current = null;
  }, []);

  useEffect(() => {
      // Initial Push State to create a history entry to intercept
      window.history.pushState(null, '', window.location.href);

      const handlePopState = (event: PopStateEvent) => {
          const { publicView, adminView, isLoginModalOpen, isAssignModalOpen, activeModal, isAuthenticated, newBookingForPopup } = stateRef.current;
          let handled = false;

          // Priority 1: Component-level Handlers (e.g. Gallery Lightbox, Recommendation Internal Navigation)
          // This handles "Recommendation Details" -> "Recommendation Menu" via Dashboard.tsx's handler
          if (backHandlerRef.current) {
              handled = backHandlerRef.current();
          }

          if (!handled) {
            // Priority 2: Global Modals
            if (newBookingForPopup) {
                setNewBookingForPopup(null);
                handled = true;
            } else if (isAssignModalOpen) {
                handleCloseAssignModal();
                handled = true;
            } else if (isLoginModalOpen) {
                setIsLoginModalOpen(false);
                handled = true;
            } else if (activeModal) {
                // This closes the Recommendation Modal if we are at the root menu level
                setActiveModal(null);
                handled = true;
            } else {
                // Priority 3: Public Navigation
                if (!isAuthenticated) {
                    if (publicView !== 'intro') {
                        setPublicView('intro');
                        handled = true;
                    }
                } else {
                    // Priority 4: Admin Navigation Hierarchy
                    // Level 3: Sub-features -> Integrated Management
                    const integratedSubViews: AdminView[] = [
                        'vacantList', 'occupiedList', 'reservedList', 
                        'allHousesStatus', 'confirmedList', 'pendingList',
                        'carManagement', 'airbnbList', 'utilities', 'recommendationManagement'
                    ];
                    
                    if (integratedSubViews.includes(adminView)) {
                        setAdminView('integratedManagement');
                        handled = true;
                    }

                    // Level 2: Integrated Management -> Dashboard
                    else if (adminView === 'integratedManagement') {
                        setAdminView('dashboard');
                        handled = true;
                    }

                    // Level 1: Main Tabs -> Home
                    else if (['dashboard', 'management', 'gallery'].includes(adminView)) {
                        setAdminView('home');
                        handled = true;
                    }
                    
                    // Fallback: If not at home, go home
                    else if (adminView !== 'home') {
                        setAdminView('home');
                        handled = true;
                    }
                }
            }
          }

          if (handled) {
              // If we intercepted the back button, push state again so we can intercept it next time
              window.history.pushState(null, '', window.location.href);
          } else {
              // Priority 5: Exit Confirmation (Only at Root)
              const shouldExit = window.confirm("앱을 종료하시겠습니까? (¿Salir de la aplicación?)");
              if (!shouldExit) {
                  window.history.pushState(null, '', window.location.href);
              }
              // If yes, do nothing (let default popstate occur which effectively exits if history is empty or closes tab logic)
          }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
          window.removeEventListener('popstate', handlePopState);
      };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await data.login(email, password);
      setIsLoginModalOpen(false);
      setAdminView('dashboard');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    data.logout();
    setPublicView('intro');
  };

  const renderPublicView = () => {
    switch (publicView) {
      case 'intro': return <Introduction 
        galleryMedia={data.galleryMedia} 
        recommendations={data.recommendations}
        categoryConfigs={data.categoryConfigs}
        activeModal={activeModal} 
        setActiveModal={setActiveModal} 
        visitorCount={data.visitorCount} 
        registerBackHandler={registerBackHandler}
        unregisterBackHandler={unregisterBackHandler}
      />;
      case 'booking': return <Booking addBooking={data.addBooking} onBack={() => setPublicView('intro')} />;
      default: return <Introduction 
        galleryMedia={data.galleryMedia} 
        recommendations={data.recommendations}
        categoryConfigs={data.categoryConfigs}
        activeModal={activeModal} 
        setActiveModal={setActiveModal} 
        visitorCount={data.visitorCount}
        registerBackHandler={registerBackHandler}
        unregisterBackHandler={unregisterBackHandler}
      />;
    }
  };

  const renderAdminView = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    const isOccupied = (house: House) => {
        return house.guests.some(g => g.isCheckedIn && g.checkInDate <= todayStr && g.checkOutDate >= todayStr);
    };

    const hasFutureReservation = (house: House) => {
        return house.guests.some(g => g.checkInDate > todayStr);
    };
    
    // Stats for Integrated Management Badge
    const pendingCount = data.bookings.filter(b => b.status === 'pending').length;
    const confirmedCount = data.bookings.filter(b => b.status === 'confirmed').length;
    const occupiedCount = data.houses.filter(h => isOccupied(h) && h.houseType !== 'airbnb').length;
    const vacantCount = data.houses.filter(h => !isOccupied(h) && h.houseType !== 'airbnb').length;
    const airbnbCount = data.houses.filter(h => h.houseType === 'airbnb').length;
    const reservedHouseCount = data.houses.filter(h => 
        h.guests.some(g => !g.isCheckedIn && g.checkOutDate >= todayStr)
    ).length;

    switch (adminView) {
      case 'home': return <Introduction 
        galleryMedia={data.galleryMedia} 
        recommendations={data.recommendations}
        categoryConfigs={data.categoryConfigs}
        activeModal={activeModal} 
        setActiveModal={setActiveModal} 
        visitorCount={data.visitorCount}
        registerBackHandler={registerBackHandler}
        unregisterBackHandler={unregisterBackHandler}
      />;
      case 'dashboard': return <Admin 
        user={data.user} 
        bookings={data.bookings} 
        houses={data.houses} 
        cars={data.cars} 
        deleteBooking={data.deleteBooking} 
        setAdminView={setAdminView} 
        updateHouse={data.updateHouse}
        onAssign={handleOpenAssignModal}
        registerBackHandler={registerBackHandler}
        unregisterBackHandler={unregisterBackHandler}
      />;
      case 'integratedManagement': return <IntegratedManagement
          setAdminView={setAdminView}
          onBack={() => setAdminView('dashboard')}
          pendingCount={pendingCount}
          houseCount={data.houses.length}
          occupiedCount={occupiedCount}
          vacantCount={vacantCount}
          confirmedCount={confirmedCount}
          airbnbCount={airbnbCount}
          carCount={data.cars.length}
          reservedHouseCount={reservedHouseCount}
      />;
      case 'management': return <Management 
        houses={data.houses} 
        updateHouse={data.updateHouse} 
        checkInGuest={data.checkInGuest} 
        title="전체 주택 관리 (Gestión Total)" 
        registerBackHandler={registerBackHandler}
        unregisterBackHandler={unregisterBackHandler}
      />;
      case 'gallery': return <GalleryManagement 
          galleryMedia={data.galleryMedia} 
          addGalleryMediaItems={data.addGalleryMediaItems}
          addGalleryVideoItem={data.addGalleryVideoItem}
          updateGalleryMediaItem={data.updateGalleryMediaItem}
          deleteGalleryMediaItems={data.deleteGalleryMediaItems}
          reorderGalleryMedia={data.reorderGalleryMedia}
          registerBackHandler={registerBackHandler}
          unregisterBackHandler={unregisterBackHandler}
      />;
      case 'vacantList': {
        const vacantHouses = data.houses.filter(h => !isOccupied(h) && h.houseType !== 'airbnb');
        return <Management 
            houses={vacantHouses} 
            updateHouse={data.updateHouse} 
            checkInGuest={data.checkInGuest} 
            title="공실 목록 (게스트하우스)" 
            onBack={() => setAdminView('integratedManagement')} 
            compact 
            registerBackHandler={registerBackHandler}
            unregisterBackHandler={unregisterBackHandler}
        />;
      }
      case 'occupiedList': {
        const occupiedHouses = data.houses.filter(h => isOccupied(h) && h.houseType !== 'airbnb');
        return <Management 
            houses={occupiedHouses} 
            updateHouse={data.updateHouse} 
            checkInGuest={data.checkInGuest} 
            title="점유 중인 주택 (게스트하우스)" 
            onBack={() => setAdminView('integratedManagement')} 
            compact 
            registerBackHandler={registerBackHandler}
            unregisterBackHandler={unregisterBackHandler}
        />;
      }
      case 'reservedList': {
        const reservedHouses = data.houses.filter(h => hasFutureReservation(h));
        return <Management 
            houses={reservedHouses} 
            updateHouse={data.updateHouse} 
            checkInGuest={data.checkInGuest} 
            title="예약 대기 주택 (Reservado)" 
            onBack={() => setAdminView('integratedManagement')} 
            compact 
            registerBackHandler={registerBackHandler}
            unregisterBackHandler={unregisterBackHandler}
        />;
      }
      case 'allHousesStatus':
        return <Management 
            houses={data.houses} 
            updateHouse={data.updateHouse} 
            checkInGuest={data.checkInGuest} 
            title="전체 주택 현황 (Estado Total)" 
            onBack={() => setAdminView('integratedManagement')} 
            compact 
            registerBackHandler={registerBackHandler}
            unregisterBackHandler={unregisterBackHandler}
        />;
      case 'pendingList':
        return <PendingBookingList
          bookings={data.bookings.filter(b => b.status === 'pending')}
          onAssign={handleOpenAssignModal}
          onDelete={data.deleteBooking}
          onBack={() => setAdminView('integratedManagement')}
        />;
      case 'confirmedList':
        return <ConfirmedBookingList bookings={data.bookings} deleteBooking={data.deleteBooking} onBack={() => setAdminView('integratedManagement')} />;
      case 'airbnbList': {
        const airbnbHouses = data.houses.filter(h => h.houseType === 'airbnb');
        return <Management 
            houses={airbnbHouses} 
            updateHouse={data.updateHouse} 
            checkInGuest={data.checkInGuest} 
            title="에어비앤비 관리 (Airbnb)" 
            onBack={() => setAdminView('integratedManagement')} 
            compact 
            registerBackHandler={registerBackHandler}
            unregisterBackHandler={unregisterBackHandler}
        />;
      }
      case 'carManagement':
        return <CarManagement 
          cars={data.cars}
          addCar={data.addCar}
          updateCar={data.updateCar}
          deleteCar={data.deleteCar}
          onBack={() => setAdminView('integratedManagement')}
          registerBackHandler={registerBackHandler}
          unregisterBackHandler={unregisterBackHandler}
        />;
      case 'utilities':
        return <UtilityList houses={data.houses} onBack={() => setAdminView('integratedManagement')} />;
      case 'recommendationManagement':
        return <RecommendationManagement
            recommendations={data.recommendations}
            addRecommendation={data.addRecommendation}
            updateRecommendation={data.updateRecommendation}
            deleteRecommendation={data.deleteRecommendation}
            removeDuplicates={data.removeDuplicates}
            cleanupDefaultData={data.cleanupDefaultData}
            updateCategoryConfig={data.updateCategoryConfig}
            categoryConfigs={data.categoryConfigs}
            onBack={() => setAdminView('integratedManagement')}
            registerBackHandler={registerBackHandler}
            unregisterBackHandler={unregisterBackHandler}
        />;
      default: return <Admin 
        user={data.user} 
        bookings={data.bookings} 
        houses={data.houses} 
        cars={data.cars} 
        deleteBooking={data.deleteBooking} 
        setAdminView={setAdminView} 
        updateHouse={data.updateHouse}
        onAssign={handleOpenAssignModal}
        registerBackHandler={registerBackHandler}
        unregisterBackHandler={unregisterBackHandler}
      />;
    }
  };
  
  const isIntro = !data.isAuthenticated && publicView === 'intro';
  const rootClass = `flex flex-col ${isIntro ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-gray-50`;

  const mainContentClass = `flex-1 ${
    data.isAuthenticated
      ? (adminView === 'home' || adminView === 'allHousesStatus' || adminView === 'vacantList' || adminView === 'occupiedList' || adminView === 'confirmedList' || adminView === 'carManagement' || adminView === 'airbnbList' || adminView === 'reservedList' || adminView === 'utilities' || adminView === 'recommendationManagement' || adminView === 'pendingList' || adminView === 'integratedManagement')
        ? 'pb-32' 
        : 'p-4 sm:p-6 lg:p-8 pb-32' 
      : publicView === 'intro'
      ? 'h-full' 
      : 'p-4 sm:p-6 lg:p-8 pb-8' 
  }`;

  return (
    <div className={rootClass}>
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
      
      <header className="sticky top-0 bg-white/90 backdrop-blur-md shadow-sm z-30 p-4 flex justify-between items-center shrink-0 transition-all duration-200 print:hidden">
        <h1 
            className="text-3xl font-pen font-bold text-primary-700 cursor-pointer hover:text-primary-800 transition-colors"
            onClick={handleShare}
            title="클릭하여 주소 공유 (Compartir)"
        >
            늘봄
        </h1>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-primary-700 rounded-full hover:bg-gray-100"
                title="공유하기 (Compartir)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
            </button>
            {data.isAuthenticated ? (
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                <LogoutIcon className="w-5 h-5" />
                <span className="hidden sm:inline">로그아웃 (Salir)</span>
            </button>
            ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors">
                <LoginIcon className="w-5 h-5" />
                <span className="hidden sm:inline">관리자 로그인 (Admin)</span>
            </button>
            )}
        </div>
      </header>
      
      <main className={mainContentClass}>
        {data.isAuthenticated ? renderAdminView() : renderPublicView()}
      </main>

      <div className="print:hidden">
          <BottomNav 
            isAuthenticated={data.isAuthenticated}
            publicView={publicView}
            setPublicView={setPublicView}
            adminView={adminView}
            setAdminView={setAdminView}
            setActiveModal={setActiveModal}
          />
      </div>

      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="관리자 로그인 (Acceso Admin)">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email-input" className="block mb-2 text-base font-medium text-gray-900">이메일 (Email)</label>
            <input 
              type="email" 
              id="email-input"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3" 
              required 
            />
          </div>
          <div>
            <label htmlFor="password-input" className="block mb-2 text-base font-medium text-gray-900">비밀번호 (Contraseña)</label>
            <input 
              type="password" 
              id="password-input"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3" 
              required 
            />
          </div>
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg" role="alert">
              <span className="font-medium">오류!</span> {error}
            </div>
          )}
          <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-base px-5 py-3 text-center">
            로그인 (Entrar)
          </button>
        </form>
      </Modal>

        <Modal 
            isOpen={!!newBookingForPopup} 
            onClose={() => setNewBookingForPopup(null)} 
            title="신규 예약 알림 (Nueva Reserva)"
            size="md"
        >
            {newBookingForPopup && (
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 animate-pulse">
                        <BellIcon className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-gray-900">{newBookingForPopup.guestName}님의 예약</h3>
                    <p className="mt-1 text-base text-gray-500">새로운 예약 신청이 접수되었습니다.</p>
                    <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg space-y-2 text-base text-gray-700">
                        <p className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-gray-400" /> <strong>인원:</strong> {newBookingForPopup.numberOfGuests}명</p>
                        <p className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-gray-400" /> <strong>기간:</strong> {newBookingForPopup.arrivalDate} ~ {newBookingForPopup.departureDate}</p>
                        <p className="flex items-center gap-2"><PaperAirplaneIcon className="w-5 h-5 text-gray-400" /> <strong>항공편:</strong> {newBookingForPopup.flightNumber}</p>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setNewBookingForPopup(null)} className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50">
                            나중에 확인
                        </button>
                        <button type="button" onClick={() => {
                            handleOpenAssignModal(newBookingForPopup);
                            setNewBookingForPopup(null);
                        }} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-primary-600 text-base font-medium text-white hover:bg-primary-700">
                            확인 및 배정
                        </button>
                    </div>
                </div>
            )}
        </Modal>

      {bookingToAssign && (
          <AssignModal
              booking={bookingToAssign}
              houses={data.houses}
              onClose={handleCloseAssignModal}
              onAssign={handleAssignHouse}
          />
      )}
    </div>
  );
};

export default App;