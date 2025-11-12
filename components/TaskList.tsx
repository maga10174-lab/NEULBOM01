import React, { useMemo, useState } from 'react';
import type { Booking, House, AdminView, StreetName, Guest } from '../types';
import { BellIcon, CheckCircleIcon, PaperAirplaneIcon, TrashIcon, UserIcon, CarIcon, BuildingIcon, CalendarIcon, HomeIcon, HomeModernIcon } from './icons';
import { Modal } from './Modal';
import { Management } from './RoomList';
import type { User } from 'firebase/auth';

const StatCard: React.FC<{ title: string; value: React.ReactNode; color: string; onClick?: () => void }> = ({ title, value, color, onClick }) => (
  <div 
    className={`bg-white p-6 rounded-lg shadow-md ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : ''}`}
    onClick={onClick}
  >
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className={`font-bold ${color}`}>{value}</div>
  </div>
);

const MainStat: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    value: React.ReactNode;
    onClick?: () => void;
}> = ({ icon, label, value, onClick }) => {
    const content = (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg w-full text-left h-full hover:bg-gray-100 transition-colors">
            <div className="bg-primary-100 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="w-full h-full transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-300 rounded-lg">
                {content}
            </button>
        );
    }
    return <div className="w-full h-full">{content}</div>;
};


const streetKor: Record<StreetName, string> = {
  Arteal: "아르테알",
  Retamar: "레타마르",
  Tahal: "타알",
  Ubedas: "우베다스",
  Ragol: "라골",
  Vera: "베라",
  PRIVADA3: "프리바다3",
  PRIVADA6: "프리바다6",
};

type ChartData = { month: string; value: number };
type ChartType = 'guests' | 'days';

const MonthlyChart: React.FC<{ stats: Record<string, { guests: Map<string, number>; totalDays: number }> }> = ({ stats }) => {
  const [chartType, setChartType] = useState<ChartType>('guests');

  const chartData: ChartData[] = useMemo(() => {
    return Object.entries(stats)
      .map(([month, data]) => {
        // FIX: The type of `data` is inferred as `unknown`. Explicitly cast it to the expected type.
        const typedData = data as { guests: Map<string, number>; totalDays: number };
        const totalGuestsInMonth = Array.from(typedData.guests.values()).reduce((sum, count) => sum + count, 0);
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
          총 숙박일 (인원-일)
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

const PendingBookingCard: React.FC<{
    booking: Booking;
    onAssign: (booking: Booking) => void;
    onDelete: (id: string) => void;
}> = ({ booking, onAssign, onDelete }) => {
    const [idCopied, setIdCopied] = useState(false);

    const handleCopyKakaoId = () => {
        if (!booking.kakaoId) return;
        navigator.clipboard.writeText(booking.kakaoId)
            .then(() => {
                setIdCopied(true);
                setTimeout(() => setIdCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy KakaoTalk ID:', err);
                alert('카카오톡 ID 복사에 실패했습니다.');
            });
    };

    return (
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <p className="font-bold text-gray-800">{booking.guestName}</p>
                <p className="text-sm text-gray-600">{booking.arrivalDate} ~ {booking.departureDate}</p>
                
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">카톡ID:</span>
                    <button onClick={handleCopyKakaoId} className="text-gray-700 hover:text-primary-600 hover:underline cursor-pointer" title="클릭하여 복사">
                        {booking.kakaoId}
                    </button>
                    {idCopied && <span className="text-xs text-primary-600 font-semibold animate-pulse">복사됨!</span>}
                </div>

                {booking.flightNumber && (
                    <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(booking.flightNumber + ' flight status')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        {booking.flightNumber}
                    </a>
                )}
                {booking.flightTicketName && <p className="text-sm text-gray-500">첨부: {booking.flightTicketName}</p>}
            </div>
            <div className="flex gap-2 self-end sm:self-center">
                <button onClick={() => onAssign(booking)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow"><CheckCircleIcon className="w-5 h-5"/></button>
                <button onClick={() => onDelete(booking.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow"><TrashIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};


export const Admin: React.FC<{ 
    bookings: Booking[]; 
    houses: House[];
    confirmBooking: (bookingId: string, houseId: string) => void;
    deleteBooking: (id: string) => void;
    setAdminView: (view: AdminView) => void;
    user: User | null;
    updateHouse: (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => void;
}> = ({ bookings, houses, confirmBooking, deleteBooking, setAdminView, user, updateHouse }) => {
    const [isTotalGuestsModalOpen, setIsTotalGuestsModalOpen] = useState(false);
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [bookingToAssign, setBookingToAssign] = useState<Booking | null>(null);
    
    const { occupiedCount, totalGuests, occupiedHouses, vacantCount } = useMemo(() => {
        const occupied = houses.filter(h => h.guests.length > 0);
        const guests = occupied.reduce((sum, house) => {
            return sum + house.guests.reduce((guestSum, g) => guestSum + Number(g.numberOfGuests), 0);
        }, 0);
        return { 
            occupiedCount: occupied.length, 
            totalGuests: guests, 
            occupiedHouses: occupied,
            vacantCount: houses.length - occupied.length
        };
    }, [houses]);

    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

    const handleOpenAssignModal = (booking: Booking) => {
        setBookingToAssign(booking);
        setIsAssignModalOpen(true);
    };

    const handleAssignHouse = async (houseId: string) => {
        if (bookingToAssign) {
            try {
                await confirmBooking(bookingToAssign.id, houseId);
            } catch (error) {
                console.error("Failed to confirm booking and assign house:", error);
                alert("주택 배정 중 오류가 발생했습니다.");
            } finally {
                setIsAssignModalOpen(false);
                setBookingToAssign(null);
            }
        }
    };

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
        return masterStayList.reduce((sum, stay) => sum + (stay.numberOfGuests || 1), 0);
    }, [masterStayList]);

    const monthlyStats = useMemo(() => {
        const stats: Record<string, { guests: Map<string, number>; totalDays: number }> = {};
        const statsStartDate = new Date('2025-11-01');
        statsStartDate.setMinutes(statsStartDate.getMinutes() + statsStartDate.getTimezoneOffset());
        statsStartDate.setHours(0, 0, 0, 0);

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
                const monthKey = current.toISOString().substring(0, 7); // YYYY-MM

                if (!stats[monthKey]) {
                    stats[monthKey] = { guests: new Map(), totalDays: 0 };
                }
                
                // FIX: TypeScript can struggle with type inference on indexed properties inside loops.
                // By explicitly getting the object and asserting its type, we ensure that `totalDays`
                // is treated as a number, resolving the `unknown` type error.
                const monthData = stats[monthKey] as { guests: Map<string, number>; totalDays: number };
                monthData.totalDays += numberOfGuests;
                monthData.guests.set(stayKey, numberOfGuests);

                current.setDate(current.getDate() + 1);
            }
        });
        
        return stats;
    }, [masterStayList]);


  return (
    <div className="space-y-8">
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">총 주택 현황</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <MainStat 
                onClick={() => setAdminView('allHousesStatus')}
                icon={<HomeModernIcon className="w-6 h-6 text-primary-600" />}
                label="전체"
                value={`${houses.length} 채`}
            />
            <MainStat 
                onClick={() => setAdminView('occupiedList')}
                icon={<BuildingIcon className="w-6 h-6 text-secondary-600" />}
                label="점유"
                value={`${occupiedCount} 채`}
            />
             <MainStat 
                onClick={() => setAdminView('vacantList')}
                icon={<HomeIcon className="w-6 h-6 text-green-600" />}
                label="공실"
                value={`${vacantCount} 채`}
            />
             <MainStat 
                onClick={() => setAdminView('confirmedList')}
                icon={<CheckCircleIcon className="w-6 h-6 text-purple-600" />}
                label="예약 확정"
                value={`${confirmedBookings.length} 건`}
            />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <StatCard 
            title="현재 총 인원" 
            value={<span className="text-2xl sm:text-3xl">{totalGuests} 명</span>} 
            color="text-blue-600"
            onClick={() => setIsTotalGuestsModalOpen(true)}
        />
        <StatCard 
            title="연간 방문자" 
            value={<span className="text-2xl sm:text-3xl">{totalYearlyVisitors} 명</span>} 
            color="text-blue-600" 
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2"><BellIcon className="w-6 h-6 text-primary-600"/> 신규 예약 요청 ({pendingBookings.length}건)</h3>
        <div className="space-y-3">
          {pendingBookings.length > 0 ? pendingBookings.map(booking => (
            <PendingBookingCard 
                key={booking.id}
                booking={booking}
                onAssign={handleOpenAssignModal}
                onDelete={deleteBooking}
            />
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
                        <th className="px-6 py-3">총 숙박일 (인원-일)</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(monthlyStats).sort().map(month => {
                        const statsData = monthlyStats[month];
                        const totalGuestsInMonth = Array.from(statsData.guests.values()).reduce((sum, count) => sum + count, 0);
                        return (
                            <tr key={month} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{month}</td>
                                <td className="px-6 py-4">{totalGuestsInMonth} 명</td>
                                <td className="px-6 py-4">{statsData.totalDays} 일</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <MonthlyChart stats={monthlyStats} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">관리자 설정</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <p className="text-gray-600 w-32">현재 로그인된 관리자:</p>
            <p className="font-semibold text-gray-800">{user?.email}</p>
          </div>
          <button
            onClick={() => setIsAddAdminModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            새 관리자 추가
          </button>
        </div>
      </div>
      
      <Modal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        title="새 관리자 추가 안내"
      >
        <div className="text-sm text-gray-700 space-y-4">
          <p>
            보안을 위해 새 관리자는 <strong>Firebase 콘솔</strong>에서 직접 추가해야 합니다.
            아래 단계에 따라 새 관리자 계정을 생성해주세요.
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>Firebase 콘솔에 접속하여 '늘봄 게스트하우스' 프로젝트를 엽니다.</li>
            <li>왼쪽 메뉴에서 <strong>Authentication</strong>으로 이동합니다.</li>
            <li><strong>Users</strong> 탭에서 <strong>[+ 사용자 추가]</strong> 버튼을 클릭합니다.</li>
            <li>새 관리자의 이메일과 비밀번호를 입력하고 사용자를 추가합니다.</li>
          </ol>
          <p>
            사용자 추가가 완료되면, 해당 계정으로 앱에 즉시 로그인할 수 있습니다.
          </p>
        </div>
      </Modal>
      
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`'${bookingToAssign?.guestName}'님 주택 배정`}
        size="md"
      >
        <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">배정 가능한 주택 (공실 또는 2명 이하 입실)</h4>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-2 -mr-2">
                {assignableHouses.length > 0 ? (
                    assignableHouses.map(house => {
                        const totalGuestsInHouse = house.guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
                        return (
                            <button
                                key={house.id}
                                onClick={() => handleAssignHouse(house.id)}
                                className="w-full text-left p-3 bg-gray-50 hover:bg-primary-100 rounded-lg transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <span className="font-bold text-gray-800">{streetKor[house.street]} {house.number}</span>
                                </div>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${totalGuestsInHouse === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {totalGuestsInHouse > 0 ? `${totalGuestsInHouse}명 입실 중` : '공실'}
                                </span>
                            </button>
                        )
                    })
                ) : (
                    <p className="text-gray-500 text-center py-4">배정 가능한 주택이 없습니다.</p>
                )}
            </div>
        </div>
      </Modal>

      <Modal
        isOpen={isTotalGuestsModalOpen}
        onClose={() => setIsTotalGuestsModalOpen(false)}
        title="현재 입실 인원 현황"
        size="md"
      >
        {occupiedHouses.length > 0 ? (
            <ul className="space-y-4 text-base">
              {occupiedHouses.map((house) => (
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
    </div>
  );
};