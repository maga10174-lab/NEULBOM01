
import React from 'react';
import type { PublicView, AdminView } from '../types';
import { InfoIcon, BuildingIcon, SparkleIcon, CheckCircleIcon, HomeIcon, ChartIcon, HomeModernIcon, PhotoIcon } from './icons';

interface NavItemProps {
  label: string;
  icon: React.FC<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full text-center transition-colors duration-200 focus:outline-none pt-2 pb-1 ${
      isActive
        ? 'text-primary-600 bg-primary-50'
        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-6 h-6" />
    <span className="text-[10px] sm:text-xs font-medium mt-1 whitespace-pre-line leading-tight">{label}</span>
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
    { id: 'home', label: '홈\n(Inicio)', icon: HomeIcon },
    { id: 'dashboard', label: '대시보드\n(Panel)', icon: ChartIcon },
    { id: 'management', label: '주택 관리\n(Gestión)', icon: HomeModernIcon },
    { id: 'gallery', label: '사진 관리\n(Galería)', icon: PhotoIcon },
  ];

  if (isAuthenticated) {
    // Correctly identify which sub-views should activate the 'management' tab.
    const managementSubViews: AdminView[] = ['vacantList', 'occupiedList', 'allHousesStatus'];

    return (
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 flex">
        {adminNavItems.map(item => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={adminView === item.id || (item.id === 'management' && managementSubViews.includes(adminView))}
            onClick={() => setAdminView(item.id as AdminView)}
          />
        ))}
      </nav>
    );
  }
  
  // On the booking screen, do not show any bottom navigation.
  if (publicView === 'booking') {
    return null;
  }
  
  if (publicView === 'intro') {
      return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 z-40 border-t border-gray-200">
            <div className="max-w-lg mx-auto">
                <div className="flex justify-around items-center mb-3">
                    <button onClick={() => setActiveModal('info')} className="flex flex-col items-center text-gray-700 hover:text-primary-600 space-y-1 p-1 transition-colors">
                        <InfoIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium text-center leading-tight">기본 정보<br/>(Info)</span>
                    </button>
                     <button onClick={() => setActiveModal('services')} className="flex flex-col items-center text-gray-700 hover:text-primary-600 space-y-1 p-1 transition-colors">
                        <CheckCircleIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium text-center leading-tight">서비스<br/>(Servicios)</span>
                    </button>
                    <button onClick={() => setActiveModal('directions')} className="flex flex-col items-center text-gray-700 hover:text-primary-600 space-y-1 p-1 transition-colors">
                        <BuildingIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium text-center leading-tight">위치<br/>(Ubicación)</span>
                    </button>
                    <button onClick={() => setActiveModal('recommendations')} className="flex flex-col items-center text-gray-700 hover:text-primary-600 space-y-1 p-1 transition-colors">
                        <SparkleIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium text-center leading-tight">추천<br/>(Recomend.)</span>
                    </button>
                </div>
                <button
                    onClick={() => setPublicView('booking')}
                    className="w-full h-14 rounded-xl bg-primary-500 text-white font-bold text-lg shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                    예약하기 (Reservar)
                </button>
            </div>
        </nav>
      );
  }

  return null; // Fallback, should not be reached
};
