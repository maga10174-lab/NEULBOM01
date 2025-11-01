import React, { useState } from 'react';
import type { House, StreetName, Guest } from '../types';
import { Modal } from './Modal';
import { CarIcon, UserIcon, BuildingIcon, CalendarIcon, TrashIcon, HomeIcon } from './icons';

const streetKor: Record<StreetName, string> = {
  Arteal: "아르테알",
  Retamar: "레타마르",
  Tahal: "타알",
  Ubedas: "우베다스",
  Ragol: "라골",
  Vera: "베라",
  PRIVADA3: "프리바다3"
};

interface ManageHouseModalProps {
  house: House;
  onClose: () => void;
  onSave: (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => void;
}

const ManageHouseModal: React.FC<ManageHouseModalProps> = ({ house, onClose, onSave }) => {
  const [guests, setGuests] = useState<Guest[]>(house.guests);

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
    onSave(house.id, { guests });
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`${streetKor[house.street]} ${house.number}호 정보 관리`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-6">
          {guests.map((guest, index) => (
            <div key={guest.id} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50/50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">고객 {index + 1} 정보</h3>
                 <button type="button" onClick={() => handleRemoveGuest(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                    <TrashIcon className="w-5 h-5"/>
                </button>
              <div>
                <label htmlFor={`guestName-${index}`} className="block text-sm font-medium text-gray-700">고객명</label>
                <input type="text" id={`guestName-${index}`} value={guest.guestName} onChange={(e) => handleGuestChange(index, 'guestName', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor={`numberOfGuests-${index}`} className="block text-sm font-medium text-gray-700 mt-2">인원수</label>
                <input type="number" id={`numberOfGuests-${index}`} value={guest.numberOfGuests} onChange={(e) => handleGuestChange(index, 'numberOfGuests', parseInt(e.target.value, 10) || 0)} min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label htmlFor={`checkInDate-${index}`} className="block text-sm font-medium text-gray-700">체크인</label>
                    <input type="date" id={`checkInDate-${index}`} value={guest.checkInDate} onChange={(e) => handleGuestChange(index, 'checkInDate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor={`checkOutDate-${index}`} className="block text-sm font-medium text-gray-700">체크아웃</label>
                    <input type="date" id={`checkOutDate-${index}`} value={guest.checkOutDate} onChange={(e) => handleGuestChange(index, 'checkOutDate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>
              </div>
              <div>
                <label htmlFor={`guestCompany-${index}`} className="block text-sm font-medium text-gray-700 mt-2">소속 회사</label>
                <input type="text" id={`guestCompany-${index}`} value={guest.guestCompany} onChange={(e) => handleGuestChange(index, 'guestCompany', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor={`rentalCar-${index}`} className="block text-sm font-medium text-gray-700 mt-2">렌트 차량</label>
                <input type="text" id={`rentalCar-${index}`} value={guest.rentalCar} onChange={(e) => handleGuestChange(index, 'rentalCar', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleAddGuest} className="w-full mt-4 text-sm font-semibold text-primary-600 border-2 border-dashed border-primary-300 rounded-lg py-2 hover:bg-primary-50 transition-colors">
          + 고객 추가
        </button>

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">취소</button>
          <button type="submit" className="rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">저장</button>
        </div>
      </form>
    </Modal>
  );
};


const HouseCard: React.FC<{ house: House; onEdit: (house: House) => void; }> = ({ house, onEdit }) => {
    const isPrivada = house.street === 'PRIVADA3';
    const isOccupied = house.guests.length > 0;
    const totalGuests = house.guests.reduce((sum, guest) => sum + Number(guest.numberOfGuests), 0);

    return (
        <div 
            onClick={() => onEdit(house)}
            className={`rounded-lg shadow-md p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${isOccupied ? 'bg-secondary-50 border border-secondary-200' : 'bg-primary-50 border border-primary-200'}`}
        >
            <div>
                <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-lg ${isPrivada ? 'text-privada' : 'text-gray-800'}`}>{house.street} {house.number}호</h4>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isOccupied ? 'bg-secondary-100 text-secondary-800' : 'bg-green-100 text-green-800'}`}>
                        {isOccupied ? `사용 중 (${totalGuests}명)` : '공실'}
                    </span>
                </div>
                {isOccupied ? (
                    <div className="mt-3 space-y-3 text-sm text-gray-600">
                        {house.guests.map((guest, index) => (
                           <div key={guest.id} className={index > 0 ? 'pt-3 border-t border-secondary-200/80' : ''}>
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition-colors"
          >
            &larr; 뒤로가기
          </button>
        )}
      </div>

      {houses.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">표시할 주택이 없습니다.</p>
        </div>
      ) : (
        Object.entries(groupedHouses)
        .sort(([streetA], [streetB]) => {
            if (streetA === 'PRIVADA3') return 1;
            if (streetB === 'PRIVADA3') return -1;
            return streetA.localeCompare(streetB);
        })
        .map(([street, houseList]) => (
          <section key={street}>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">{streetKor[street as StreetName]}</h3>
             {compact ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-4">
                  {(houseList as House[])
                    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
                    .map(house => (
                    <button
                        key={house.id}
                        onClick={() => setEditingHouse(house)}
                        className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                        <HomeIcon className="w-10 h-10 text-green-500" />
                        <span className="mt-1 text-sm font-semibold text-gray-800">{house.number}호</span>
                    </button>
                    ))}
                </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {(houseList as House[]).map(house => (
                        <HouseCard key={house.id} house={house} onEdit={setEditingHouse} />
                    ))}
                </div>
             )}
          </section>
        ))
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