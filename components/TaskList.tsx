import React, { useMemo, useState } from 'react';
import type { Booking, House, AdminView, StreetName, Guest } from '../types';
import { BellIcon, CheckCircleIcon, PaperAirplaneIcon, TrashIcon, UserIcon, CarIcon, BuildingIcon, CalendarIcon, HomeIcon } from './icons';
import { Modal } from './Modal';

const StatCard: React.FC<{ title: string; value: string | number; color: string; onClick?: () => void }> = ({ title, value, color, onClick }) => (
  <div 
    className={`bg-white p-6 rounded-lg shadow-md ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : ''}`}
    onClick={onClick}
  >
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const streetKor: Record<StreetName, string> = {
  Arteal: "아르테알",
  Retamar: "레타마르",
  Tahal: "타알",
  Ubedas: "우베다스",
  Ragol: "라골",
  Vera: "베라",
  PRIVADA3: "프리바다3"
};

type ChartData = { month: string; value: number };
type ChartType = 'guests' | 'days';

const MonthlyChart: React.FC<{ stats: Record<string, { guests: Set<string>; totalDays: number }> }> = ({ stats }) => {
  const [chartType, setChartType] = useState<ChartType>('guests');

  const chartData: ChartData[] = useMemo(() => {
    return Object.entries(stats)
      .map(([month, data]) => {
        const statsData = data as { guests: Set<string>; totalDays: number };
        return {
          month: month.slice(5) + '월', // '2024-07' -> '07월'
          value: chartType === 'guests' ? statsData.guests.size : statsData.totalDays,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [stats, chartType]);

  const maxValue = useMemo(() => Math.max(...chartData.map(d => d.value), 1), [chartData]);
  const unit = chartType === 'guests' ? '명' : '일';

  return (
    <div className="mt-6">
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setChartType('guests')}
          className={`px-4 py-2 text-sm font-semibold rounded-full ${chartType === 'guests' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          방문 고객 수
        </button>
        <button
          onClick={() => setChartType('days')}
          className={`px-4 py-2 text-sm font-semibold rounded-full ${chartType === 'days' ? 'bg-secondary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          총 숙박일
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
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none">
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
            <p className="text-gray-500">표시할 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
};


export const Admin: React.FC<{ 
    bookings: Booking[]; 
    houses: House[];
    confirmBooking: (id: number) => void;
    deleteBooking: (id: number) => void;
    setAdminView: (view: AdminView) => void;
}> = ({ bookings, houses, confirmBooking, deleteBooking, setAdminView }) => {
    const [isOccupiedModalOpen, setIsOccupiedModalOpen] = useState(false);
    const [isAllHousesModalOpen, setIsAllHousesModalOpen] = useState(false);
    
    const { occupiedCount, totalGuests, occupiedHouses } = useMemo(() => {
        const occupied = houses.filter(h => h.guests.length > 0);
        const guests = occupied.reduce((sum, house) => {
            return sum + house.guests.reduce((guestSum, g) => guestSum + Number(g.numberOfGuests), 0);
        }, 0);
        return { 
            occupiedCount: occupied.length, 
            totalGuests: guests, 
            occupiedHouses: occupied 
        };
    }, [houses]);

    const vacantHouses = houses.length - occupiedCount;
    const pendingBookings = bookings.filter(b => b.status === 'pending');

    const monthlyStats = useMemo(() => {
        const stats: Record<string, {guests: Set<string>, totalDays: number}> = {};
        const processedStays = new Set<string>(); // To avoid double counting

        const processStay = (guestName: string, startDateStr: string, endDateStr: string) => {
            if (!guestName || !startDateStr || !endDateStr) return;

            const stayKey = `${guestName}-${startDateStr}`;
            if (processedStays.has(stayKey)) return;
            processedStays.add(stayKey);

            // Parse dates as UTC to avoid timezone issues
            const startDate = new Date(startDateStr + 'T00:00:00Z');
            const endDate = new Date(endDateStr + 'T00:00:00Z');

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) return;

            let current = new Date(startDate);
            
            while (current <= endDate) {
                const monthKey = current.toISOString().substring(0, 7); // YYYY-MM

                if (!stats[monthKey]) {
                    stats[monthKey] = { guests: new Set(), totalDays: 0 };
                }
                
                stats[monthKey].totalDays += 1;
                stats[monthKey].guests.add(guestName);

                current.setUTCDate(current.getUTCDate() + 1);
            }
        };

        // 1. Process current guests from houses (most up-to-date info)
        houses.forEach(house => {
            house.guests.forEach(guest => {
                processStay(guest.guestName, guest.checkInDate, guest.checkOutDate);
            });
        });

        // 2. Process historical/confirmed bookings
        bookings.forEach(booking => {
            if (booking.status === 'confirmed') {
                processStay(booking.guestName, booking.arrivalDate, booking.departureDate);
            }
        });
        
        return stats;
    }, [houses, bookings]);

    const yearlyVisitors = useMemo(() => {
        const visitors = new Set<string>();
        
        houses.forEach(house => {
            house.guests.forEach(guest => {
                if (guest.guestName) visitors.add(guest.guestName);
            });
        });

        bookings.forEach(b => {
             if (b.status === 'confirmed' && b.guestName) visitors.add(b.guestName);
        });
        
        return visitors.size;
    }, [houses, bookings]);

    const groupedHouses = useMemo(() => {
        return houses.reduce((acc, house) => {
            if (!acc[house.street]) {
                acc[house.street] = [];
            }
            acc[house.street].push(house);
            return acc;
        }, {} as Record<StreetName, House[]>);
    }, [houses]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="총 주택" value={`${houses.length} 채`} color="text-gray-800" onClick={() => setIsAllHousesModalOpen(true)} />
        <StatCard 
            title="점유 중" 
            value={`${occupiedCount} 채 / ${totalGuests} 명`} 
            color="text-secondary-600" 
            onClick={() => setIsOccupiedModalOpen(true)}
        />
        <StatCard 
            title="공실" 
            value={`${vacantHouses} 채`} 
            color="text-primary-600"
            onClick={() => setAdminView('vacantList')} 
        />
        <StatCard title="연간 방문자" value={`${yearlyVisitors} 명`} color="text-blue-600" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2"><BellIcon className="w-6 h-6 text-primary-600"/> 신규 예약 요청 ({pendingBookings.length}건)</h3>
        <div className="space-y-3">
          {pendingBookings.length > 0 ? pendingBookings.map(booking => (
            <div key={booking.id} className="p-4 bg-primary-50 rounded-lg border border-primary-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-bold text-gray-800">{booking.guestName}</p>
                <p className="text-sm text-gray-600">{booking.arrivalDate} ~ {booking.departureDate}</p>
                <p className="text-sm text-gray-500">카톡ID: {booking.kakaoId}</p>
                {booking.flightNumber && <a href={`https://flightaware.com/live/flight/${booking.flightNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1"><PaperAirplaneIcon className="w-4 h-4" />{booking.flightNumber}</a>}
                {booking.flightTicketName && <p className="text-sm text-gray-500">첨부: {booking.flightTicketName}</p>}
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                  <button onClick={() => confirmBooking(booking.id)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow"><CheckCircleIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteBooking(booking.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow"><TrashIcon className="w-5 h-5"/></button>
              </div>
            </div>
          )) : <p className="text-gray-500">새로운 예약 요청이 없습니다.</p>}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">월별 현황</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">월</th>
                        <th className="px-6 py-3">방문 고객 수</th>
                        <th className="px-6 py-3">총 숙박일</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(monthlyStats).sort().map(month => {
                        const statsData = monthlyStats[month];
                        return (
                            <tr key={month} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{month}</td>
                                <td className="px-6 py-4">{statsData.guests.size} 명</td>
                                <td className="px-6 py-4">{statsData.totalDays} 일</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <MonthlyChart stats={monthlyStats} />
      </div>
      
      <Modal
        isOpen={isOccupiedModalOpen}
        onClose={() => setIsOccupiedModalOpen(false)}
        title="점유 중인 호실 정보"
        size="lg"
      >
        {occupiedHouses.length > 0 ? (
          <ul className="divide-y divide-gray-200 -my-6">
            {occupiedHouses.map((house) => (
              <li key={house.id} className="py-4">
                <h4 className="font-bold text-md text-gray-800 mb-2">{streetKor[house.street]} {house.number}호</h4>
                <div className="space-y-3">
                  {house.guests.map((guest, index) => (
                    <div key={guest.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="flex items-center gap-2 font-semibold text-gray-700"><UserIcon className="w-4 h-4 text-gray-400" /> {guest.guestName} ({guest.numberOfGuests}명)</p>
                        <div className="mt-1 space-y-1 text-sm text-gray-600 pl-6">
                          <p className="flex items-center gap-2">
                            <BuildingIcon className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{guest.guestCompany || '정보 없음'}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <CarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{guest.rentalCar || '정보 없음'}</span>
                          </p>
                           <p className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <span>
                                    {guest.checkInDate?.replace(/-/g,'.') || '...'} ~ {guest.checkOutDate?.replace(/-/g,'.') || '...'}
                                </span>
                            </p>
                        </div>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">점유 중인 호실이 없습니다.</p>
        )}
      </Modal>
      
      <Modal
        isOpen={isAllHousesModalOpen}
        onClose={() => setIsAllHousesModalOpen(false)}
        title="전체 주택 현황"
        size="xl"
      >
        <div className="space-y-6">
          {Object.entries(groupedHouses)
            .sort(([streetA], [streetB]) => {
                if (streetA === 'PRIVADA3') return 1;
                if (streetB === 'PRIVADA3') return -1;
                return streetA.localeCompare(streetB);
            })
            .map(([street, houseList]) => (
            <section key={street}>
              <h3 className="text-xl font-bold text-gray-700 mb-3 border-b pb-2">{streetKor[street as StreetName]}</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-4 pt-2">
                {(houseList as House[])
                  .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
                  .map(house => {
                    const totalGuests = house.guests.reduce((sum, guest) => sum + Number(guest.numberOfGuests), 0);
                    let colorClass = 'text-green-500';
                    if (totalGuests >= 3) {
                      colorClass = 'text-red-500';
                    } else if (totalGuests === 2) {
                      colorClass = 'text-orange-500';
                    } else if (totalGuests === 1) {
                      colorClass = 'text-yellow-500';
                    }
                    
                    return (
                      <div key={house.id} className="flex flex-col items-center text-center">
                        <HomeIcon className={`w-10 h-10 ${colorClass}`} />
                        <span className="mt-1 text-sm font-semibold text-gray-800">{house.number}호</span>
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </Modal>

    </div>
  );
};