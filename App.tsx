import React, { useState, useCallback, useEffect } from 'react';
import { useGuestHouseData } from './hooks/useGuestHouseData';
import { BottomNav } from './components/BottomNav';
import { Introduction } from './components/Dashboard';
import { Booking } from './components/BookingList';
import { Management } from './components/RoomList';
import { Admin } from './components/TaskList';
import { GalleryManagement } from './components/GalleryManagement';
import { ConfirmedBookingList } from './components/ConfirmedBookingList';
import { LoginIcon, LogoutIcon } from './components/icons';
import { Modal } from './components/Modal';
import { NotificationContainer } from './components/Notification';
import type { AdminView, PublicView, Notification as NotificationType, Booking as BookingType } from './types';

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  
  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, title, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleNewBooking = useCallback((booking: BookingType) => {
    addNotification(
      '신규 예약 요청',
      `${booking.guestName}님으로부터 새로운 예약 요청이 도착했습니다.`,
      'info'
    );
  }, [addNotification]);

  const data = useGuestHouseData(handleNewBooking);
  
  const [publicView, setPublicView] = useState<PublicView>('intro');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Add exit confirmation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ''; // Required for Chrome and Firefox
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
      case 'intro': return <Introduction galleryMedia={data.galleryMedia} activeModal={activeModal} setActiveModal={setActiveModal} />;
      case 'booking': return <Booking addBooking={data.addBooking} onBack={() => setPublicView('intro')} />;
      default: return <Introduction galleryMedia={data.galleryMedia} activeModal={activeModal} setActiveModal={setActiveModal} />;
    }
  };

  const renderAdminView = () => {
    switch (adminView) {
      case 'home': return <Introduction galleryMedia={data.galleryMedia} activeModal={activeModal} setActiveModal={setActiveModal} />;
      case 'dashboard': return <Admin user={data.user} bookings={data.bookings} houses={data.houses} confirmBooking={data.confirmBooking} deleteBooking={data.deleteBooking} setAdminView={setAdminView} updateHouse={data.updateHouse} />;
      case 'management': return <Management houses={data.houses} updateHouse={data.updateHouse} title="전체 주택 관리" />;
      case 'gallery': return <GalleryManagement 
          galleryMedia={data.galleryMedia} 
          addGalleryMediaItems={data.addGalleryMediaItems}
          addGalleryVideoItem={data.addGalleryVideoItem}
          updateGalleryMediaItem={data.updateGalleryMediaItem}
          deleteGalleryMediaItems={data.deleteGalleryMediaItems}
          reorderGalleryMedia={data.reorderGalleryMedia}
      />;
      case 'vacantList': {
        const vacantHouses = data.houses.filter(h => h.guests.length === 0);
        return <Management houses={vacantHouses} updateHouse={data.updateHouse} title="공실 목록" onBack={() => setAdminView('dashboard')} compact />;
      }
      case 'occupiedList': {
        const occupiedHouses = data.houses.filter(h => h.guests.length > 0);
        return <Management houses={occupiedHouses} updateHouse={data.updateHouse} title="점유 중인 주택" onBack={() => setAdminView('dashboard')} compact />;
      }
      case 'allHousesStatus':
        return <Management houses={data.houses} updateHouse={data.updateHouse} title="전체 주택 현황" onBack={() => setAdminView('dashboard')} compact />;
      case 'confirmedList':
        return <ConfirmedBookingList bookings={data.bookings} deleteBooking={data.deleteBooking} onBack={() => setAdminView('dashboard')} />;
      default: return <Admin user={data.user} bookings={data.bookings} houses={data.houses} confirmBooking={data.confirmBooking} deleteBooking={data.deleteBooking} setAdminView={setAdminView} updateHouse={data.updateHouse} />;
    }
  };
  
  const mainContentClass = `flex-1 ${
    data.isAuthenticated
      ? (adminView === 'home' || adminView === 'allHousesStatus' || adminView === 'vacantList' || adminView === 'occupiedList' || adminView === 'confirmedList')
        ? '' // No padding for full-screen admin views
        : 'p-4 sm:p-6 lg:p-8 pb-20' // Admin views: h-16 nav -> pb-20 for 1rem clearance
      : publicView === 'intro'
      ? 'pb-32' // Add padding for the tall BottomNav
      : 'p-4 sm:p-6 lg:p-8 pb-8' // Booking view: No nav -> standard padding
  }`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
      
      <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-30 p-4 flex justify-between items-center">
        <h1 
            className="text-3xl font-pen font-bold text-primary-700 cursor-pointer"
            onClick={() => data.isAuthenticated ? setAdminView('dashboard') : setPublicView('intro')}
        >
            늘봄
        </h1>
        {data.isAuthenticated ? (
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-semibold px-3 py-2 rounded-lg hover:bg-red-50">
            <LogoutIcon className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        ) : (
          <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-gray-600 hover:text-primary-700 font-semibold px-3 py-2 rounded-lg hover:bg-primary-50">
            <LoginIcon className="w-5 h-5" />
            <span>관리자 로그인</span>
          </button>
        )}
      </header>
      
      <main className={mainContentClass}>
        {data.isAuthenticated ? renderAdminView() : renderPublicView()}
      </main>

      <BottomNav 
        isAuthenticated={data.isAuthenticated}
        publicView={publicView}
        setPublicView={setPublicView}
        adminView={adminView}
        setAdminView={setAdminView}
        setActiveModal={setActiveModal}
      />

      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="관리자 로그인">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email-input" className="block mb-2 text-base font-medium text-gray-900">이메일</label>
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
            <label htmlFor="password-input" className="block mb-2 text-base font-medium text-gray-900">비밀번호</label>
            <input 
              type="password" 
              id="password-input"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3" 
              required 
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-base px-5 py-3 text-center">
            로그인
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default App;