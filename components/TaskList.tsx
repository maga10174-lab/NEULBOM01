
import React, { useMemo, useState, useEffect } from 'react';
import type { Booking, House, AdminView, StreetName, Guest, Car, RecommendationItem, RecommendationCategoryConfig, RecommendationCategory } from '../types';
import { BellIcon, CheckCircleIcon, PaperAirplaneIcon, TrashIcon, UserIcon, CarIcon, BuildingIcon, CalendarIcon, HomeIcon, HomeModernIcon, BoltIcon, SparkleIcon, ArrowLeftIcon, AdjustmentsHorizontalIcon } from './icons';
import { Modal } from './Modal';
import type { User } from 'firebase/auth';

const StatCard: React.FC<{ title: string; value: React.ReactNode; color: string; onClick?: () => void }> = ({ title, value, color, onClick }) => (
  <div 
    className={`bg-white p-6 rounded-lg shadow-md ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : ''}`}
    onClick={onClick}
  >
    <h3 className="text-sm font-medium text-gray-500 whitespace-pre-line">{title}</h3>
    <div className={`font-bold ${color}`}>{value}</div>
  </div>
);

const ModuleCard: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    subLabel?: string;
    value?: React.ReactNode;
    badgeCount?: number;
    onClick?: () => void;
    colorClass: string;
    isHighlighted?: boolean;
}> = ({ icon, label, subLabel, value, badgeCount, onClick, colorClass, isHighlighted }) => {
    return (
        <button 
            onClick={onClick} 
            className={`w-full h-full p-4 rounded-xl shadow-sm border transition-all duration-200 flex flex-col items-start relative group ${
                isHighlighted 
                ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 shadow-md transform -translate-y-1' 
                : 'bg-white border-gray-100 hover:shadow-md hover:-translate-y-1'
            }`}
        >
            <div className={`p-3 rounded-lg mb-3 ${colorClass}`}>
                {icon}
            </div>
            {badgeCount !== undefined && badgeCount > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-sm">
                    {badgeCount}
                </div>
            )}
            <h3 className="text-lg font-bold text-gray-800 leading-tight text-left">{label}</h3>
            {subLabel && <p className="text-xs text-gray-400 mt-0.5 text-left">{subLabel}</p>}
            
            {value && (
                <div className="mt-auto pt-3 w-full text-right">
                    <span className={`text-xl font-bold ${isHighlighted ? 'text-indigo-700' : 'text-gray-700'}`}>{value}</span>
                </div>
            )}
        </button>
    );
};


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

type ChartData = { month: string; value: number };
type ChartType = 'guests' | 'days';

const MonthlyChart: React.FC<{ stats: Record<string, { guests: Map<string, number>; totalDays: number }> }> = ({ stats }) => {
  const [chartType, setChartType] = useState<ChartType>('guests');

  const chartData: ChartData[] = useMemo(() => {
    return Object.entries(stats)
      .map(([month, data]) => {
        const typedData = data as { guests: Map<string, number>; totalDays: number };
        const totalGuestsInMonth = Array.from(typedData.guests.values()).reduce((sum: number, count: number) => sum + count, 0);
        return {
          month: month.slice(5) + '월', // '2024-07' -> '07월'
          value: chartType === 'guests' ? totalGuestsInMonth : typedData.totalDays,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [stats, chartType]);

  const maxValue = useMemo(() => Math.max(...chartData.map(d => d.value), 1), [chartData]);
  const unit = chartType === 'guests' ? '명' : '일';

  return (
    <div className="mt-6">
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setChartType('guests')}
          className={`px-4 py-2 text-sm font-semibold rounded-full ${chartType === 'guests' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          방문 고객 수 (Visitantes)
        </button>
        <button
          onClick={() => setChartType('days')}
          className={`px-4 py-2 text-sm font-semibold rounded-full ${chartType === 'days' ? 'bg-secondary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          숙박일 (Noches)
        </button>
      </div>
      {chartData.length > 0 ? (
        <div className="w-full h-64 bg-gray-50 p-4 rounded-lg flex items-end justify-around gap-2">
          {chartData.map(({ month, value }) => (
            <div key={month} className="h-full flex-1 flex flex-col items-center justify-end group">
              <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
                <div 
                    className={`w-3/4 max-w-[50px] rounded-t-md transition-all duration-300 ${chartType === 'guests' ? 'bg-primary-400 group-hover:bg-primary-500' : 'bg-secondary-400 group-hover:bg-secondary-500'}`}
                    style={{ height: `${(value / maxValue) * 100}%` }}
                >
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none z-10 whitespace-nowrap">
                        {value} {unit}
                    </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 mt-2">{month}</span>
            </div>
          ))}
        </div>
      ) : (
         <div className="w-full h-64 bg-gray-50 p-4 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">데이터 없음 (Sin datos)</p>
        </div>
      )}
    </div>
  );
};

export const IntegratedManagement: React.FC<{
    setAdminView: (view: AdminView) => void;
    onBack: () => void;
    pendingCount: number;
    houseCount: number;
    occupiedCount: number;
    vacantCount: number;
    confirmedCount: number;
    airbnbCount: number;
    carCount: number;
    reservedHouseCount: number;
}> = ({ setAdminView, onBack, pendingCount, houseCount, occupiedCount, vacantCount, confirmedCount, airbnbCount, carCount, reservedHouseCount }) => {
    
    // Module Configuration
    const modules = [
        {
            category: '예약 관리 (Reservas)',
            items: [
                {
                    label: '신규 예약 요청',
                    subLabel: 'Solicitudes',
                    icon: <BellIcon className="w-6 h-6 text-orange-600" />,
                    colorClass: 'bg-orange-100',
                    view: 'pendingList',
                    badge: pendingCount,
                    value: `${pendingCount} 건`
                },
                {
                    label: '예약 확정 목록',
                    subLabel: 'Confirmado',
                    icon: <CheckCircleIcon className="w-6 h-6 text-purple-600" />,
                    colorClass: 'bg-purple-100',
                    view: 'confirmedList',
                    value: `${confirmedCount} 건`
                },
                {
                    label: '예약 대기 현황',
                    subLabel: 'Futuras',
                    icon: <CalendarIcon className="w-6 h-6 text-indigo-600" />,
                    colorClass: 'bg-indigo-100',
                    view: 'reservedList',
                    value: reservedHouseCount > 0 ? `${reservedHouseCount} 채 대기` : '대기 없음',
                    badge: reservedHouseCount,
                    isHighlighted: reservedHouseCount > 0
                }
            ]
        },
        {
            category: '객실 현황 (Habitaciones)',
            items: [
                {
                    label: '전체 주택 현황',
                    subLabel: 'Estado Total',
                    icon: <HomeModernIcon className="w-6 h-6 text-primary-600" />,
                    colorClass: 'bg-primary-100',
                    view: 'allHousesStatus',
                    value: `${houseCount} 채`
                },
                {
                    label: '점유 중 (게스트)',
                    subLabel: 'Ocupado',
                    icon: <BuildingIcon className="w-6 h-6 text-secondary-600" />,
                    colorClass: 'bg-secondary-100',
                    view: 'occupiedList',
                    value: `${occupiedCount} 채`
                },
                {
                    label: '공실 (게스트)',
                    subLabel: 'Vacío',
                    icon: <HomeIcon className="w-6 h-6 text-green-600" />,
                    colorClass: 'bg-green-100',
                    view: 'vacantList',
                    value: `${vacantCount} 채`
                },
                {
                    label: '에어비앤비',
                    subLabel: 'Airbnb',
                    icon: <HomeIcon className="w-6 h-6 text-rose-500" />,
                    colorClass: 'bg-rose-100',
                    view: 'airbnbList',
                    value: `${airbnbCount} 채`
                }
            ]
        },
        {
            category: '시설 및 운영 (Operaciones)',
            items: [
                {
                    label: '차량 관리',
                    subLabel: 'Coches',
                    icon: <CarIcon className="w-6 h-6 text-blue-600" />,
                    colorClass: 'bg-blue-100',
                    view: 'carManagement',
                    value: `${carCount} 대`
                },
                {
                    label: '공과금 관리',
                    subLabel: 'Servicios',
                    icon: <BoltIcon className="w-6 h-6 text-yellow-600" />,
                    colorClass: 'bg-yellow-100',
                    view: 'utilities',
                    value: '관리'
                },
                {
                    label: '추천 장소 관리',
                    subLabel: 'Recomendaciones',
                    icon: <SparkleIcon className="w-6 h-6 text-pink-500" />,
                    colorClass: 'bg-pink-100',
                    view: 'recommendationManagement',
                    value: '편집'
                }
            ]
        }
    ];

    return (
        <div className="h-full flex flex-col">
             <header className="flex items-center gap-4 mb-6 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 flex-shrink-0">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                    aria-label="뒤로가기"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">통합 관리 센터</h2>
                    <p className="text-sm text-gray-500">Integrated Management Center</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="space-y-8">
                    {modules.map((group, idx) => (
                        <section key={idx}>
                            <h3 className="text-lg font-bold text-gray-600 mb-3 border-l-4 border-primary-500 pl-3">{group.category}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {group.items.map((item, i) => (
                                    <ModuleCard
                                        key={i}
                                        icon={item.icon}
                                        label={item.label}
                                        subLabel={item.subLabel}
                                        value={item.value}
                                        badgeCount={item.badge}
                                        onClick={() => setAdminView(item.view as AdminView)}
                                        colorClass={item.colorClass}
                                        isHighlighted={(item as any).isHighlighted}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                    
                    <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-gray-400 text-sm">
                        * 추후 새로운 관리 기능이 추가되면 이곳에 자동으로 업데이트됩니다.
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Admin: React.FC<{ 
    bookings: Booking[]; 
    houses: House[];
    cars: Car[];
    deleteBooking: (id: string) => void;
    setAdminView: (view: AdminView) => void;
    user: User | null;
    updateHouse: (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => void;
    onAssign: (booking: Booking) => void;
    registerBackHandler?: (handler: () => boolean) => void;
    unregisterBackHandler?: () => void;
}> = ({ bookings, houses, cars, deleteBooking, setAdminView, user, updateHouse, onAssign, registerBackHandler, unregisterBackHandler }) => {
    const [isTotalGuestsModalOpen, setIsTotalGuestsModalOpen] = useState(false);
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [isMonthlyStatsModalOpen, setIsMonthlyStatsModalOpen] = useState(false);
    
    // Handle Back Button for Modals
    useEffect(() => {
        const hasOpenModal = isTotalGuestsModalOpen || isAddAdminModalOpen || isMonthlyStatsModalOpen;
        
        if (hasOpenModal && registerBackHandler) {
            registerBackHandler(() => {
                if (isMonthlyStatsModalOpen) setIsMonthlyStatsModalOpen(false);
                else if (isTotalGuestsModalOpen) setIsTotalGuestsModalOpen(false);
                else if (isAddAdminModalOpen) setIsAddAdminModalOpen(false);
                return true;
            });
        } else if (unregisterBackHandler) {
            unregisterBackHandler();
        }
    }, [isTotalGuestsModalOpen, isAddAdminModalOpen, isMonthlyStatsModalOpen, registerBackHandler, unregisterBackHandler]);

    const { 
        occupiedGuesthouseCount, 
        vacantGuesthouseCount, 
        guesthouseGuests, 
        occupiedGuesthouses,
        airbnbCount, 
        airbnbGuestCount,
        reservedGuestsCount
    } = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];

        // Filter houses by type
        const guesthouses = houses.filter(h => h.houseType !== 'airbnb');
        const airbnbs = houses.filter(h => h.houseType === 'airbnb');

        // Determine occupation status based on CURRENT presence
        // Strict check: if checked in, it is occupied.
        const isOccupied = (house: House) => {
             return house.guests.some(g => g.isCheckedIn);
        };

        // Calculate status for Guesthouses
        const occupiedGH = guesthouses.filter(isOccupied);
        const vacantGH = guesthouses.filter(h => !isOccupied(h));

        // Helper to sum ONLY current guests
        const calculateCurrentGuests = (list: House[]) => {
            return list.reduce((total: number, house: House) => {
                const houseCurrentGuests = house.guests.filter(g => 
                    g.isCheckedIn // Only check isCheckedIn
                ).reduce((sum: number, g: Guest) => sum + Number(g.numberOfGuests), 0);
                return total + houseCurrentGuests;
            }, 0);
        };

        const calculateReservedGuests = (list: House[]) => {
            return list.reduce((total: number, house: House) => {
                const houseFutureGuests = house.guests.filter(g => !g.isCheckedIn && g.checkOutDate >= todayStr).reduce((sum: number, g: Guest) => sum + Number(g.numberOfGuests), 0);
                return total + houseFutureGuests;
            }, 0);
        }

        const ghGuests = calculateCurrentGuests(guesthouses);
        const abGuests = calculateCurrentGuests(airbnbs);
        const resGuests = calculateReservedGuests(houses);

        return { 
            occupiedGuesthouseCount: occupiedGH.length, 
            vacantGuesthouseCount: vacantGH.length,
            guesthouseGuests: ghGuests, 
            occupiedGuesthouses: occupiedGH,
            airbnbCount: airbnbs.length,
            airbnbGuestCount: abGuests,
            reservedGuestsCount: resGuests
        };
    }, [houses]);

    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

    const masterStayList = useMemo(() => {
        const stays = new Map<string, { guestName: string; numberOfGuests: number; checkInDate: string; checkOutDate: string }>();
        const checkedInGuestKeys = new Set<string>();

        houses.forEach(house => {
            house.guests.forEach(guest => {
                const stayKey = `guest-${guest.id}`;
                stays.set(stayKey, {
                    guestName: guest.guestName,
                    numberOfGuests: guest.numberOfGuests || 1,
                    checkInDate: guest.checkInDate,
                    checkOutDate: guest.checkOutDate,
                });
                if (guest.guestName && guest.checkInDate) {
                     checkedInGuestKeys.add(`${guest.guestName.trim()}_${guest.checkInDate}`);
                }
            });
        });

        bookings.forEach(booking => {
            if (booking.status === 'confirmed') {
                const bookingKey = `${booking.guestName.trim()}_${booking.arrivalDate}`;
                if (!checkedInGuestKeys.has(bookingKey)) {
                    const stayKey = `booking-${booking.id}`;
                    stays.set(stayKey, {
                        guestName: booking.guestName,
                        numberOfGuests: booking.numberOfGuests || 1,
                        checkInDate: booking.arrivalDate,
                        checkOutDate: booking.departureDate,
                    });
                }
            }
        });

        return Array.from(stays.values());
    }, [houses, bookings]);

    const totalYearlyVisitors = useMemo(() => {
        return masterStayList.reduce((sum: number, stay) => sum + (stay.numberOfGuests || 1), 0);
    }, [masterStayList]);

    const monthlyStats = useMemo(() => {
        const stats: Record<string, { guests: Map<string, number>; totalDays: number }> = {};
        const statsStartDate = new Date('2025-11-01');
        statsStartDate.setMinutes(statsStartDate.getMinutes() + statsStartDate.getTimezoneOffset());
        statsStartDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        masterStayList.forEach(stay => {
            const { guestName, checkInDate, checkOutDate, numberOfGuests } = stay;
            if (!guestName || !checkInDate || !checkOutDate || !numberOfGuests || numberOfGuests <= 0) return;

            const startDate = new Date(checkInDate);
            const endDate = new Date(checkOutDate);
            startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
            endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate || endDate < statsStartDate) return;

            const effectiveStartDate = startDate < statsStartDate ? statsStartDate : startDate;
            let current = new Date(effectiveStartDate);
            
            const stayKey = `${guestName}-${checkInDate}`;

            while (current <= endDate) {
                if (current > today) {
                    break;
                }

                const monthKey = current.toISOString().substring(0, 7); // YYYY-MM

                if (!stats[monthKey]) {
                    stats[monthKey] = { guests: new Map(), totalDays: 0 };
                }
                
                const monthData = stats[monthKey] as { guests: Map<string, number>; totalDays: number };
                monthData.totalDays += numberOfGuests;
                monthData.guests.set(stayKey, numberOfGuests);

                current.setDate(current.getDate() + 1);
            }
        });
        
        return stats;
    }, [masterStayList]);

    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthData = monthlyStats[currentMonthKey];
    const currentMonthGuests = currentMonthData ? Array.from(currentMonthData.guests.values()).reduce((sum: number, count: number) => sum + count, 0) : 0;
    const currentMonthDays = currentMonthData ? currentMonthData.totalDays : 0;

    const pendingBookingsCount = pendingBookings.length;
    const hasPendingBookings = pendingBookingsCount > 0;

  return (
    <div className="space-y-8">
      
      {/* Main Action Button for Integrated Management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">관리 시스템 (Sistema de Gestión)</h3>
        <button
            onClick={() => setAdminView('integratedManagement')}
            className="w-full relative group bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <AdjustmentsHorizontalIcon className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-5 relative z-10">
                <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                    <AdjustmentsHorizontalIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                    <h2 className="text-2xl font-bold">통합 관리 센터</h2>
                    <p className="text-gray-300 text-sm mt-1">예약, 객실, 차량, 공과금 등 모든 관리 기능을 한곳에서 확인하세요.</p>
                </div>
            </div>

            {hasPendingBookings && (
                <div className="relative z-10 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-md animate-pulse">
                    <BellIcon className="w-5 h-5" />
                    <span>신규 요청 {pendingBookingsCount}건</span>
                </div>
            )}
            
            <div className="relative z-10 bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard 
            title={'현재 총 인원 (게스트)\n(Invitados GH)'} 
            value={<span className="text-2xl sm:text-3xl">{guesthouseGuests} 명</span>} 
            color="text-blue-600"
            onClick={() => setIsTotalGuestsModalOpen(true)}
        />
         <StatCard 
            title={'Airbnb 총 인원\n(Airbnb Total)'} 
            value={<span className="text-2xl sm:text-3xl">{airbnbGuestCount} 명</span>} 
            color="text-rose-600"
            onClick={() => setAdminView('airbnbList')}
        />
        <StatCard 
            title={'예약 대기 인원\n(Reservas Futuras)'} 
            value={<span className="text-2xl sm:text-3xl">{reservedGuestsCount} 명</span>} 
            color="text-indigo-600"
            onClick={() => setAdminView('reservedList')}
        />
        <StatCard 
            title={'연간 방문자\n(Visitantes Anuales)'} 
            value={<span className="text-2xl sm:text-3xl">{totalYearlyVisitors} 명</span>} 
            color="text-gray-600" 
        />
      </div>

      {/* Monthly Stats Chart Card */}
      <div 
        className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 group"
        onClick={() => setIsMonthlyStatsModalOpen(true)}
      >
        <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-gray-500"/> 
                월별 현황 (Mensual)
            </h3>
            <span className="text-sm text-primary-600 font-medium group-hover:underline">전체 보기 &gt;</span>
        </div>
        
        <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium mb-2">{today.getFullYear()}년 {today.getMonth() + 1}월 (Actual)</p>
            <div className="flex items-center gap-12">
                <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">{currentMonthGuests}</p>
                    <p className="text-xs text-gray-500 mt-1">방문 고객 (Personas)</p>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">{currentMonthDays}</p>
                    <p className="text-xs text-gray-500 mt-1">숙박일 (Días)</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">클릭하여 전체 통계 확인 (Ver todo)</p>
        </div>
      </div>

      {/* Admin Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">관리자 설정 (Admin)</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <p className="text-gray-600 w-32">현재 로그인:</p>
            <p className="font-semibold text-gray-800">{user?.email}</p>
          </div>
          <button
            onClick={() => setIsAddAdminModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            새 관리자 추가 (Nuevo Admin)
          </button>
        </div>
      </div>
      
      {/* Modals */}
      <Modal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        title="관리자 추가 (Agregar Admin)"
      >
        <div className="text-sm text-gray-700 space-y-4">
          <p>
            보안을 위해 새 관리자는 <strong>Firebase 콘솔</strong>에서 직접 추가해야 합니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>Firebase 콘솔 접속 -> '늘봄 게스트하우스' 프로젝트</li>
            <li><strong>Authentication</strong> -> <strong>Users</strong> 탭</li>
            <li><strong>[+ 사용자 추가]</strong> 버튼 클릭</li>
            <li>이메일/비밀번호 입력 후 추가</li>
          </ol>
        </div>
      </Modal>
      
      <Modal
        isOpen={isTotalGuestsModalOpen}
        onClose={() => setIsTotalGuestsModalOpen(false)}
        title="현재 입실 현황 (게스트하우스)"
        size="md"
      >
        {occupiedGuesthouses.length > 0 ? (
            <ul className="space-y-4 text-base">
              {occupiedGuesthouses.map((house) => (
                <li key={house.id}>
                  <p className="font-bold text-gray-800">{streetKor[house.street]} {house.number}호</p>
                  <ul className="pl-4 mt-1 space-y-1 text-gray-600">
                    {house.guests.map((guest) => (
                      <li key={guest.id}>
                        - {guest.guestName || guest.guestCompany || '정보 없음'} ({guest.numberOfGuests}명)
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
        ) : (
            <p className="text-gray-500 text-center py-4">현재 입실 중인 인원이 없습니다.</p>
        )}
      </Modal>

      <Modal
        isOpen={isMonthlyStatsModalOpen}
        onClose={() => setIsMonthlyStatsModalOpen(false)}
        title="전체 월별 통계 (Estadísticas Mensuales)"
        size="lg"
      >
        <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-sm text-left text-gray-500 mb-6">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-6 py-3">월 (Mes)</th>
                        <th className="px-6 py-3">방문 고객 (Visitantes)</th>
                        <th className="px-6 py-3">숙박일 (Días)</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(monthlyStats).sort().reverse().map(month => {
                        const statsData = monthlyStats[month];
                        const totalGuestsInMonth = Array.from(statsData.guests.values()).reduce((sum: number, count: number) => sum + count, 0);
                        return (
                            <tr key={month} className={`border-b hover:bg-gray-50 ${month === currentMonthKey ? 'bg-blue-50' : 'bg-white'}`}>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {month} {month === currentMonthKey && <span className="text-xs text-blue-600 ml-2">(이번 달)</span>}
                                </td>
                                <td className="px-6 py-4">{totalGuestsInMonth} 명</td>
                                <td className="px-6 py-4">{statsData.totalDays} 일</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <MonthlyChart stats={monthlyStats} />
        </div>
      </Modal>
    </div>
  );
};