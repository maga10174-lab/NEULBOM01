import React, { useState, useEffect } from 'react';
import { useGuestHouseData } from './hooks/useGuestHouseData';
import { SplashScreen } from './components/SplashScreen';
import { BottomNav } from './components/BottomNav';
import { Introduction } from './components/Dashboard';
import { Booking } from './components/BookingList';
import { Management } from './components/RoomList';
import { Admin } from './components/TaskList';
import { GalleryManagement } from './components/GalleryManagement';
import { LoginIcon, LogoutIcon } from './components/icons';
import { Modal } from './components/Modal';
import type { AdminView, PublicView } from './types';

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const data = useGuestHouseData();
  
  const [publicView, setPublicView] = useState<PublicView>('intro');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setIsAppLoading(false), 6000); // Animation duration
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.login(password)) {
      setIsLoginModalOpen(false);
      setAdminView('dashboard');
      setPassword('');
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
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
      case 'dashboard': return <Admin bookings={data.bookings} houses={data.houses} confirmBooking={data.confirmBooking} deleteBooking={data.deleteBooking} setAdminView={setAdminView} />;
      case 'management': return <Management houses={data.houses} updateHouse={data.updateHouse} title="전체 주택 관리" />;
      case 'gallery': return <GalleryManagement galleryMedia={data.galleryMedia} updateGalleryMedia={data.updateGalleryMedia} />;
      case 'vacantList':
        const vacantHouses = data.houses.filter(h => h.guests.length === 0);
        return <Management houses={vacantHouses} updateHouse={data.updateHouse} title="공실 목록" onBack={() => setAdminView('dashboard')} compact />;
      default: return <Admin bookings={data.bookings} houses={data.houses} confirmBooking={data.confirmBooking} deleteBooking={data.deleteBooking} setAdminView={setAdminView} />;
    }
  };

  if (isAppLoading || data.isLoading) {
    return <SplashScreen />;
  }
  
  const mainContentClass = `flex-1 ${
    data.isAuthenticated
      ? 'p-4 sm:p-6 lg:p-8 pb-20' // Admin views: h-16 nav -> pb-20 for 1rem clearance
      : publicView === 'intro'
      ? '' // No padding for full-screen background
      : 'p-4 sm:p-6 lg:p-8 pb-24' // Booking view: h-20 nav -> pb-24 for 1rem clearance
  }`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="password-input" className="block mb-2 text-sm font-medium text-gray-900">비밀번호</label>
            <input 
              type="password" 
              id="password-input"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" 
              required 
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
            로그인
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default App;
