import React from 'react';
import type { PublicView, AdminView } from '../types';
import { InfoIcon, BuildingIcon, SparkleIcon, CheckCircleIcon, CameraIcon } from './icons';

interface NavItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center w-full h-full text-center transition-colors duration-200 focus:outline-none ${
      isActive
        ? 'text-primary-600 border-t-2 border-primary-500 bg-primary-50'
        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
    }`}
  >
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

interface BottomNavProps {
    isAuthenticated: boolean;
    publicView: PublicView;
    setPublicView: (view: PublicView) => void;
    adminView: AdminView;
    setAdminView: (view: AdminView) => void;
    setActiveModal: (modal: string | null) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ isAuthenticated, publicView, setPublicView, adminView, setAdminView, setActiveModal }) => {
  const adminNavItems = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'management', label: '주택 관리' },
    { id: 'gallery', label: '시설 사진 관리' },
  ];

  if (isAuthenticated) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 flex">
        {adminNavItems.map(item => (
          <NavItem
            key={item.id}
            label={item.label}
            isActive={adminView === item.id || (item.id === 'management' && adminView === 'vacantList')}
            onClick={() => setAdminView(item.id as AdminView)}
          />
        ))}
      </nav>
    );
  }
  
  if (publicView === 'intro') {
      return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 z-40 border-t border-gray-200">
            <div className="max-w-lg mx-auto">
                <div className="flex justify-around items-center mb-3">
                    <button onClick={() => setActiveModal('info')} className="flex flex-col items-center text-gray-700 hover:text-primary-600 space-y-1 p-1 transition-colors">
                        <InfoIcon className="w-6 h-6" />
                        <span className="text-xs font-medium">기본 정보</span>
                    </button>
                     <button onClick={() => setActiveModal('services')} className="flex flex-col items-center text-gray-700 hover:text-primary-600 space-y-1 p-1 transition-colors">
                        <CheckCircleIcon className="w-6 h-6" />
                        <span className="text-xs font-medium">서비스 안내</span>
                    </button>
                    <button onClick={() => setActiveModal('directions')} className="flex flex-col items-center text-gray-700 hover:text-primary-600 space-y-1 p-1 transition-colors">
                        <BuildingIcon className="w-6 h-6" />
                        <span className="text-xs font-medium">오시는 길</span>
                    </button>
                    <button onClick={() => setActiveModal('recommendations')} className="flex flex-col items-center text-gray-700 hover:text-primary-600 space-y-1 p-1 transition-colors">
                        <SparkleIcon className="w-6 h-6" />
                        <span className="text-xs font-medium">주변 추천</span>
                    </button>
                </div>
                <button
                    onClick={() => setPublicView('booking')}
                    className="w-full h-14 rounded-xl bg-primary-500 text-white font-bold text-lg shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                    예약하기
                </button>
            </div>
        </nav>
      );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-sm p-3 z-40 border-t border-gray-200">
      <button
        onClick={() => setPublicView('booking')}
        className="w-full h-full rounded-xl bg-primary-500 text-white font-bold text-lg shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1"
      >
        예약하기
      </button>
    </nav>
  );
};