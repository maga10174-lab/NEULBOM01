import React, { useState } from 'react';
import type { House, StreetName, Guest } from '../types';
import { Modal } from './Modal';
import { CarIcon, UserIcon, BuildingIcon, CalendarIcon, TrashIcon, HomeIcon, ArrowLeftIcon } from './icons';

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

interface ManageHouseModalProps {
  house: House;
  onClose: () => void;
  onSave: (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => void;
}

const ManageHouseModal: React.FC<ManageHouseModalProps> = ({ house, onClose, onSave }) => {
  const [guests, setGuests] = useState<Guest[]>(house.guests);
  const [rooms, setRooms] = useState<number>(house.rooms || 3);

  const handleGuestChange = (index: number, field: keyof Omit<Guest, 'id'>, value: string | number) => {
    const newGuests = [...guests];
    if (typeof value === 'number') {
        (newGuests[index] as any)[field] = value;
    } else {
        (newGuests[index] as any)[field] = value;
    }
    setGuests(newGuests);
  };
  
  const handleAddGuest = () => {
    setGuests([...guests, {
      id: `new-${Date.now()}`,
      guestName: '',
      guestCompany: '',
      rentalCar: '',
      numberOfGuests: 1,
      checkInDate: '',
      checkOutDate: ''
    }]);
  };

  const handleRemoveGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalGuests = guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
    if (totalGuests > house.capacity) {
        alert(`수용 인원(${house.capacity}명)을 초과할 수 없습니다. 현재 인원: ${totalGuests}명`);
        return;
    }
    onSave(house.id, { guests, rooms });
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`${streetKor[house.street]} ${house.number}호 정보 관리`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
            <label className="block text-base font-medium text-gray-700 mb-2">방 개수</label>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setRooms(3)}
                    className={`py-3 px-4 rounded-lg text-base font-medium transition-colors w-full ${
                        rooms === 3 
                        ? 'bg-primary-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    3개
                </button>
                <button
                    type="button"
                    onClick={() => setRooms(4)}
                    className={`py-3 px-4 rounded-lg text-base font-medium transition-colors w-full ${
                        rooms === 4
                        ? 'bg-primary-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    4개
                </button>
            </div>
        </div>

        <div className="space-y-6">
          {guests.map((guest, index) => (
            <div key={guest.id} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50/50 space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">고객 {index + 1} 정보</h3>
                 <button type="button" onClick={() => handleRemoveGuest(index)} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full">
                    <TrashIcon className="w-6 h-6"/>
                </button>
              <div>
                <label htmlFor={`guestName-${index}`} className="block text-base font-medium text-gray-700 mb-2">고객명</label>
                <input type="text" id={`guestName-${index}`} value={guest.guestName} onChange={(e) => handleGuestChange(index, 'guestName', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
              </div>
              <div>
                <label htmlFor={`numberOfGuests-${index}`} className="block text-base font-medium text-gray-700 mt-2 mb-2">인원수</label>
                <input type="number" id={`numberOfGuests-${index}`} value={guest.numberOfGuests} onChange={(e) => handleGuestChange(index, 'numberOfGuests', parseInt(e.target.value, 10) || 0)} min="0" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`checkInDate-${index}`} className="block text-base font-medium text-gray-700 mb-2">체크인</label>
                    <input type="date" id={`checkInDate-${index}`} value={guest.checkInDate} onChange={(e) => handleGuestChange(index, 'checkInDate', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
                  </div>
                  <div>
                    <label htmlFor={`checkOutDate-${index}`} className="block text-base font-medium text-gray-700 mb-2">체크아웃</label>
                    <input type="date" id={`checkOutDate-${index}`} value={guest.checkOutDate} onChange={(e) => handleGuestChange(index, 'checkOutDate', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
                  </div>
              </div>
              <div>
                <label htmlFor={`guestCompany-${index}`} className="block text-base font-medium text-gray-700 mt-2 mb-2">소속 회사</label>
                <input type="text" id={`guestCompany-${index}`} value={guest.guestCompany} onChange={(e) => handleGuestChange(index, 'guestCompany', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
              </div>
              <div>
                <label htmlFor={`rentalCar-${index}`} className="block text-base font-medium text-gray-700 mt-2 mb-2">렌트 차량</label>
                <input type="text" id={`rentalCar-${index}`} value={guest.rentalCar} onChange={(e) => handleGuestChange(index, 'rentalCar', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleAddGuest} className="w-full mt-6 text-base font-semibold text-primary-600 border-2 border-dashed border-primary-300 rounded-lg py-3 hover:bg-primary-50 transition-colors">
          + 고객 추가
        </button>

        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">취소</button>
          <button type="submit" className="rounded-lg border border-transparent bg-primary-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">저장</button>
        </div>
      </form>
    </Modal>
  );
};


const HouseCard: React.FC<{ house: House; onEdit: (house: House) => void; }> = ({ house, onEdit }) => {
    const todayStr = new Date().toISOString().split('T')[0];

    const currentGuests = house.guests.filter(g => 
        g.checkInDate && g.checkOutDate && g.checkInDate <= todayStr && g.checkOutDate >= todayStr
    );

    const futureReservations = house.guests.filter(g => 
        g.checkInDate && g.checkInDate > todayStr
    ).sort((a, b) => a.checkInDate.localeCompare(b.checkInDate));

    let status: 'occupied' | 'reserved' | 'vacant' = 'vacant';
    let guestsToDisplay: Guest[] = [];
    let statusText: string;

    const totalCurrentGuests = currentGuests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
    const soonestReservation = futureReservations[0];
    const totalReservedGuests = soonestReservation ? Number(soonestReservation.numberOfGuests) : 0;

    if (currentGuests.length > 0) {
        status = 'occupied';
        guestsToDisplay = currentGuests;
        statusText = `사용 중 (${totalCurrentGuests}명)`;
    } else if (futureReservations.length > 0) {
        status = 'reserved';
        guestsToDisplay = [soonestReservation];
        statusText = `예약 중 (${totalReservedGuests}명)`;
    } else {
        status = 'vacant';
        statusText = '공실';
    }

    const isPrivada = house.street.startsWith('PRIVADA');

    const statusConfig = {
        occupied: { bg: 'bg-secondary-50', border: 'border-secondary-200', textBg: 'bg-secondary-100', textColor: 'text-secondary-800', divider: 'border-secondary-200/80' },
        reserved: { bg: 'bg-blue-50', border: 'border-blue-200', textBg: 'bg-blue-100', textColor: 'text-blue-800', divider: 'border-blue-200/80' },
        vacant: { bg: 'bg-primary-50', border: 'border-primary-200', textBg: 'bg-green-100', textColor: 'text-green-800', divider: '' }
    };
    const currentStatusConfig = statusConfig[status];

    return (
        <div 
            onClick={() => onEdit(house)}
            className={`rounded-lg shadow-md p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                isPrivada
                  ? 'bg-blue-50 border-2 border-privada'
                  : `${currentStatusConfig.bg} ${currentStatusConfig.border}`
              }`}
        >
            <div>
                <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-lg ${isPrivada ? 'text-privada' : 'text-gray-800'}`}>{streetKor[house.street]} {house.number}호</h4>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${currentStatusConfig.textBg} ${currentStatusConfig.textColor}`}>
                        {statusText}
                    </span>
                </div>
                {status !== 'vacant' ? (
                    <div className="mt-3 space-y-3 text-sm text-gray-600">
                        {guestsToDisplay.map((guest, index) => (
                           <div key={guest.id} className={index > 0 ? `pt-3 border-t ${currentStatusConfig.divider}` : ''}>
                                <p className="flex items-center gap-2 font-semibold"><UserIcon className="w-4 h-4 text-gray-400" /> {guest.guestName || '정보 없음'} ({guest.numberOfGuests}명)</p>
                                <p className="flex items-center gap-2 pl-1"><BuildingIcon className="w-3 h-3 text-gray-400" /> {guest.guestCompany || '정보 없음'}</p>
                                <p className="flex items-center gap-2 pl-1"><CarIcon className="w-3 h-3 text-gray-400" /> {guest.rentalCar || '정보 없음'}</p>
                                {(guest.checkInDate || guest.checkOutDate) && (
                                    <p className="flex items-center gap-2 pl-1 text-xs">
                                        <CalendarIcon className="w-3 h-3 text-gray-400" />
                                        <span>
                                            {guest.checkInDate?.replace(/-/g,'.') || '...'} ~ {guest.checkOutDate?.replace(/-/g,'.') || '...'}
                                        </span>
                                    </p>
                                )}
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-3 flex items-center justify-center text-center h-full min-h-[104px] text-gray-400">
                        <p>정보 없음<br/>(클릭하여 수정)</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export const Management: React.FC<{ 
    houses: House[], 
    updateHouse: (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => void;
    title?: string;
    onBack?: () => void;
    compact?: boolean;
}> = ({ houses, updateHouse, title = "주택 관리", onBack, compact = false }) => {
  const [editingHouse, setEditingHouse] = useState<House | null>(null);

  const groupedHouses = houses.reduce((acc, house) => {
    if (!acc[house.street]) {
      acc[house.street] = [];
    }
    acc[house.street].push(house);
    return acc;
  }, {} as Record<StreetName, House[]>);
  
  const header = (
    <div className="flex items-center gap-4 mb-6 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        {onBack && (
        <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
            aria-label="뒤로가기"
        >
            <ArrowLeftIcon className="w-6 h-6" />
        </button>
        )}
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {compact || onBack ? header : (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        </div>
      )}

      {houses.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md flex-1">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
           <p className="mt-4 text-gray-500">주택 정보를 불러오는 중입니다...</p>
        </div>
      ) : compact ? (
        <div className="grid grid-cols-5 gap-4 p-4 flex-1 overflow-y-auto">
            {[...houses].sort((a, b) => {
                const guestsA = a.guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
                const guestsB = b.guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
                if (guestsA !== guestsB) {
                    return guestsA - guestsB; // Sort by number of guests (ascending)
                }
                const streetOrder = ['Arteal', 'Retamar', 'Tahal', 'Ubedas', 'Ragol', 'Vera', 'PRIVADA3', 'PRIVADA6'];
                const streetCompare = streetOrder.indexOf(a.street) - streetOrder.indexOf(b.street);
                if (streetCompare !== 0) return streetCompare;
                return a.number.localeCompare(b.number, undefined, { numeric: true });
            }).map(house => {
                const totalGuests = house.guests.reduce((sum, guest) => sum + Number(guest.numberOfGuests), 0);
                const isPrivada = house.street.startsWith('PRIVADA');
                
                let displayHouseIdentifier = house.number;
                if (house.street === 'PRIVADA3' && house.number === '231') {
                    displayHouseIdentifier = 'P3 231';
                } else if (house.street === 'PRIVADA6' && house.number === '415') {
                    displayHouseIdentifier = 'P6 415';
                }
                const numberTextSize = (displayHouseIdentifier.length > 3) ? 'text-xl' : 'text-2xl';

                let colorClasses = {
                    gradient: 'bg-gradient-to-br from-green-400 to-green-600',
                    border: 'border-green-700',
                    activeBorder: 'active:border-green-600',
                };
        
                if (totalGuests === 1) {
                    colorClasses = { gradient: 'bg-gradient-to-br from-yellow-300 to-yellow-500', border: 'border-yellow-600', activeBorder: 'active:border-yellow-500' };
                } else if (totalGuests === 2) {
                    colorClasses = { gradient: 'bg-gradient-to-br from-pink-300 to-pink-500', border: 'border-pink-600', activeBorder: 'active:border-pink-500' };
                } else if (totalGuests === 3) {
                    colorClasses = { gradient: 'bg-gradient-to-br from-red-500 to-red-700', border: 'border-red-800', activeBorder: 'active:border-red-700' };
                } else if (totalGuests >= 4) {
                    colorClasses = { gradient: 'bg-gradient-to-br from-purple-500 to-purple-700', border: 'border-purple-800', activeBorder: 'active:border-purple-700' };
                }

                const numberTextColorClass = isPrivada ? 'text-blue-500 font-extrabold' : 'text-white';
                
                const guestDisplayInfo = house.guests
                  .map(guest => ({
                    id: guest.id,
                    name: guest.guestName || guest.guestCompany,
                    car: guest.rentalCar,
                  }))
                  .filter(info => info.name || info.car);

                return (
                    <button
                        key={house.id}
                        onClick={() => setEditingHouse(house)}
                        className={`relative flex flex-col items-center justify-center rounded-2xl p-2 text-white shadow-lg border-b-4 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-md active:border-b-2 ${colorClasses.gradient} ${colorClasses.border} ${colorClasses.activeBorder}`}
                    >
                         <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20"></div>
                         <div className="absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-b from-white/25 to-transparent"></div>

                        <div className="relative flex flex-col items-center text-center" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }}>
                            <div className="flex items-center justify-center gap-1.5">
                                <HomeIcon className="w-7 h-7" />
                                <span className={`${numberTextSize} font-bold ${numberTextColorClass}`}>{displayHouseIdentifier}</span>
                            </div>
                            
                            <div className="flex items-center justify-center gap-1 text-sm mt-1 font-semibold h-5">
                                {totalGuests > 0 ? (
                                    <>
                                        <UserIcon className="w-4 h-4" />
                                        <span>{totalGuests}명</span>
                                    </>
                                ) : (
                                    <span>공실</span>
                                )}
                            </div>
                            
                            <div className="min-h-[40px] mt-1 flex flex-col justify-center items-center text-xs w-full px-1 gap-1">
                                {guestDisplayInfo.length > 0 ? (
                                    guestDisplayInfo.map(info => (
                                        <div key={info.id} className="w-full">
                                            {info.name && (
                                                <p className="font-medium truncate w-full text-center">
                                                    {info.name}
                                                </p>
                                            )}
                                            {info.car && (
                                                <p className="font-light truncate w-full text-center flex items-center justify-center gap-1 text-white/90">
                                                    <CarIcon className="w-3 h-3 flex-shrink-0" />
                                                    <span>{info.car}</span>
                                                </p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p>&nbsp;</p> 
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
            {Object.entries(groupedHouses)
            .sort(([streetA], [streetB]) => {
                const order = ['Arteal', 'Retamar', 'Tahal', 'Ubedas', 'Ragol', 'Vera', 'PRIVADA3', 'PRIVADA6'];
                return order.indexOf(streetA as StreetName) - order.indexOf(streetB as StreetName);
            })
            .map(([street, houseList], sectionIndex) => (
            <section key={street} className={sectionIndex > 0 ? 'mt-8' : ''}>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">{streetKor[street as StreetName]}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {(houseList as House[]).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })).map(house => (
                        <HouseCard key={house.id} house={house} onEdit={setEditingHouse} />
                    ))}
                </div>
            </section>
            ))}
        </div>
      )}
      
      {editingHouse && (
        <ManageHouseModal 
            house={editingHouse} 
            onClose={() => setEditingHouse(null)} 
            onSave={updateHouse} 
        />
      )}
    </div>
  );
};