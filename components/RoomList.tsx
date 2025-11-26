
import React, { useState, useEffect } from 'react';
import type { House, StreetName, Guest, HouseUtilities, HouseType } from '../types';
import { Modal } from './Modal';
import { CarIcon, UserIcon, BuildingIcon, CalendarIcon, TrashIcon, HomeIcon, ArrowLeftIcon, FireIcon, DropIcon, BoltIcon, WifiIcon, ClockIcon } from './icons';

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

const HeaderClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-lg shadow-sm border border-gray-200 shrink-0">
             <div className="text-xs sm:text-sm font-semibold text-gray-600">
                {time.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </div>
            <div className="hidden sm:block w-px h-3 bg-gray-300"></div>
            <div className="text-base sm:text-lg font-bold text-primary-600 font-mono tabular-nums leading-none">
                {time.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
        </div>
    );
};

const Countdown: React.FC<{ targetDate: string; compact?: boolean }> = ({ targetDate, compact }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)));
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                
                if (compact) {
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                return `${hours}시간 ${minutes}분 ${seconds}초`;
            } else {
                return compact ? '00:00:00' : '퇴실 처리 중...';
            }
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        
        setTimeLeft(calculateTimeLeft()); // Initial call

        return () => clearInterval(timer);
    }, [targetDate, compact]);

    return <span>{timeLeft}</span>;
};

// New Component for Mobile-Friendly Time Picking
const AutoCheckoutControl: React.FC<{
    value: string | undefined;
    onChange: (isoDate: string | undefined) => void;
}> = ({ value, onChange }) => {
    // Helper to get Monterrey date parts
    const getParts = (dateObj: Date) => {
        // Use Intl to get parts specifically for Monterrey timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Monterrey',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });

        const parts = formatter.formatToParts(dateObj);
        const getPart = (type: string) => parts.find(p => p.type === type)?.value;

        const year = getPart('year');
        const month = getPart('month');
        const day = getPart('day');
        let h = parseInt(getPart('hour') || '0', 10);
        const m = parseInt(getPart('minute') || '0', 10);

        // AM/PM Logic
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;

        return {
            date: `${year}-${month}-${day}`,
            hour: displayHour,
            minute: m,
            ampm: ampm as 'AM' | 'PM'
        };
    };

    // Initialize state
    const [localState, setLocalState] = useState(() => {
        if (value) {
            return getParts(new Date(value));
        }
        const now = new Date();
        return getParts(now);
    });

    // Update parent whenever local state changes
    const applyChange = (newState: typeof localState) => {
        setLocalState(newState);
    };

    const handleConfirm = () => {
        let h = Number(localState.hour);
        if (localState.ampm === 'PM' && h < 12) h += 12;
        if (localState.ampm === 'AM' && h === 12) h = 0;
        
        // Construct ISO-like string for the inputs (Local Time perspective)
        const timeStr = `${h.toString().padStart(2, '0')}:${localState.minute.toString().padStart(2, '0')}:00`;
        const dateTimeString = `${localState.date}T${timeStr}`;
        
        // Create Date object. 
        // Note: new Date('YYYY-MM-DDTHH:mm:ss') uses local browser time.
        // Since the user is IN Monterrey, this is correct. 
        // If the user was in Korea setting a time for Monterrey, this would be offset, 
        // but the requirement assumes the user is present in Monterrey.
        const d = new Date(dateTimeString);
        
        onChange(d.toISOString());
    };

    const handleClear = () => {
        onChange(undefined);
    };
    
    // Generate options
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    // Allow 1-minute granularity for better control
    const minutes = Array.from({ length: 60 }, (_, i) => i); 

    if (value) {
        return (
             <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded border border-red-200">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-lg animate-pulse">
                        <ClockIcon className="w-5 h-5" />
                        <Countdown targetDate={value} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        예약: {new Date(value).toLocaleDateString()} {new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={handleClear} 
                    className="w-full sm:w-auto text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow transition-colors"
                >
                    예약 취소 (Cancelar)
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
             {/* Date Picker */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">날짜 (Fecha)</label>
                <input 
                    type="date" 
                    value={localState.date}
                    onChange={(e) => applyChange({ ...localState, date: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5 text-base"
                />
            </div>

            <div className="flex gap-2">
                {/* AM/PM Toggle */}
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">오전/오후</label>
                    <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden h-[46px]">
                        <button
                            type="button"
                            onClick={() => applyChange({ ...localState, ampm: 'AM' })}
                            className={`flex-1 font-bold transition-colors ${localState.ampm === 'AM' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            AM
                        </button>
                        <div className="w-px bg-gray-300"></div>
                        <button
                            type="button"
                            onClick={() => applyChange({ ...localState, ampm: 'PM' })}
                            className={`flex-1 font-bold transition-colors ${localState.ampm === 'PM' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            PM
                        </button>
                    </div>
                </div>

                {/* Time Picker */}
                <div className="flex-[2] flex gap-2">
                    <div className="flex-1">
                         <label className="block text-xs font-semibold text-gray-500 mb-1">시 (Hora)</label>
                         <select 
                            value={localState.hour}
                            onChange={(e) => applyChange({ ...localState, hour: Number(e.target.value) })}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5 text-base"
                         >
                             {hours.map(h => <option key={h} value={h}>{h}</option>)}
                         </select>
                    </div>
                    <div className="flex-1">
                         <label className="block text-xs font-semibold text-gray-500 mb-1">분 (Min)</label>
                         <select 
                            value={localState.minute}
                            onChange={(e) => applyChange({ ...localState, minute: Number(e.target.value) })}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5 text-base"
                         >
                             {minutes.map(m => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
                         </select>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={handleConfirm}
                className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 shadow-md transition-colors flex items-center justify-center gap-2"
            >
                <ClockIcon className="w-5 h-5" />
                <span>퇴실 예약 설정 (Guardar Horario)</span>
            </button>
             <p className="text-[10px] text-gray-500 text-center">* 설정된 시간에 자동으로 퇴실 처리됩니다.</p>
        </div>
    );
}

interface ManageHouseModalProps {
  house: House;
  onClose: () => void;
  onSave: (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => void;
  checkInGuest: (houseId: string, guestId: string) => void;
}

const ManageHouseModal: React.FC<ManageHouseModalProps> = ({ house, onClose, onSave, checkInGuest }) => {
  const [guests, setGuests] = useState<Guest[]>(house.guests);
  const [rooms, setRooms] = useState<number>(house.rooms || 3);
  const [memo, setMemo] = useState(house.memo || { text: '', color: '#000000', fontSize: 'medium' as const });
  const [utilities, setUtilities] = useState<HouseUtilities>(house.utilities || {});
  const [houseType, setHouseType] = useState<HouseType>(house.houseType || 'guesthouse');

  const handleGuestChange = (index: number, field: keyof Omit<Guest, 'id' | 'isCheckedIn'>, value: string | number) => {
    const newGuests = [...guests];
    if (typeof value === 'number') {
        (newGuests[index] as any)[field] = value;
    } else {
        (newGuests[index] as any)[field] = value;
    }
    setGuests(newGuests);
  };
  
  const handleAutoCheckoutChange = (index: number, isoDate: string | undefined) => {
      const newGuests = [...guests];
      if (isoDate) {
          newGuests[index].scheduledCheckoutTime = isoDate;
      } else {
          delete newGuests[index].scheduledCheckoutTime;
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
      checkOutDate: '',
      isCheckedIn: false,
    }]);
  };

  const handleRemoveGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };
  
  const handleMemoChange = (field: 'text' | 'color' | 'fontSize', value: string) => {
    setMemo(prev => ({ ...prev, [field]: value }));
  };

  const handleUtilityChange = (field: keyof HouseUtilities, value: string) => {
    setUtilities(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestCheckIn = (index: number) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], isCheckedIn: true };
    setGuests(newGuests);
    checkInGuest(house.id, newGuests[index].id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCapacity = houseType === 'airbnb' ? 10 : 5;
    onSave(house.id, { guests, rooms, memo, utilities, houseType, capacity: newCapacity });
    onClose();
  };
  
  const memoFontSizes = {
    small: '작게 (Pequeno)',
    medium: '중간 (Medio)',
    large: '크게 (Grande)',
  };

  const memoColors = [
    { name: '검정', value: '#000000' },
    { name: '빨강', value: '#ef4444' },
    { name: '파랑', value: '#3b82f6' },
    { name: '초록', value: '#22c55e' },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title={`${streetKor[house.street]} ${house.number}호 관리 (Gestión)`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
            <label className="block text-base font-medium text-gray-700 mb-2">숙소 유형 (Tipo de Alojamiento)</label>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setHouseType('guesthouse')}
                    className={`flex-1 py-3 px-4 rounded-lg text-base font-medium transition-colors ${houseType === 'guesthouse' ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                    게스트하우스 (5인)
                </button>
                <button
                    type="button"
                    onClick={() => setHouseType('airbnb')}
                    className={`flex-1 py-3 px-4 rounded-lg text-base font-medium transition-colors ${houseType === 'airbnb' ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                    에어비앤비 (최대 10인)
                </button>
            </div>
        </div>

        <div>
            <label className="block text-base font-medium text-gray-700 mb-2">방 개수 (Habitaciones)</label>
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

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">공과금 정보 (Servicios Públicos)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GAS */}
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                    <label className="flex items-center gap-1 text-sm font-bold text-orange-600 mb-2">
                        <FireIcon className="w-4 h-4"/> GAS (Gas)
                    </label>
                    <div className="space-y-2">
                        <div>
                            <label className="block text-xs text-gray-500">번호 (Número)</label>
                            <input type="text" value={utilities.gas || ''} onChange={(e) => handleUtilityChange('gas', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">납부일 (Fecha de pago)</label>
                            <input type="text" placeholder="예: 10" value={utilities.gasPaymentDate || ''} onChange={(e) => handleUtilityChange('gasPaymentDate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2" />
                        </div>
                    </div>
                </div>

                {/* WATER */}
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                    <label className="flex items-center gap-1 text-sm font-bold text-blue-600 mb-2">
                        <DropIcon className="w-4 h-4"/> 수도 (Agua)
                    </label>
                     <div className="space-y-2">
                        <div>
                            <label className="block text-xs text-gray-500">번호 (Número)</label>
                            <input type="text" value={utilities.water || ''} onChange={(e) => handleUtilityChange('water', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2" />
                        </div>
                        <div>
                             <label className="block text-xs text-gray-500">납부일 (Fecha de pago)</label>
                            <input type="text" placeholder="예: 15" value={utilities.waterPaymentDate || ''} onChange={(e) => handleUtilityChange('waterPaymentDate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2" />
                        </div>
                    </div>
                </div>

                {/* ELECTRICITY */}
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                    <label className="flex items-center gap-1 text-sm font-bold text-yellow-600 mb-2">
                        <BoltIcon className="w-4 h-4"/> 전기 (CFE)
                    </label>
                     <div className="space-y-2">
                        <div>
                            <label className="block text-xs text-gray-500">번호 (Número)</label>
                            <input type="text" value={utilities.electricity || ''} onChange={(e) => handleUtilityChange('electricity', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2" />
                        </div>
                         <div>
                            <label className="block text-xs text-gray-500">납부일 (Fecha de pago)</label>
                            <input type="text" placeholder="예: 20" value={utilities.electricityPaymentDate || ''} onChange={(e) => handleUtilityChange('electricityPaymentDate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2" />
                        </div>
                    </div>
                </div>

                {/* INTERNET */}
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                    <label className="flex items-center gap-1 text-sm font-bold text-purple-600 mb-2">
                        <WifiIcon className="w-4 h-4"/> 인터넷 (Internet)
                    </label>
                     <div className="space-y-2">
                        <div>
                            <label className="block text-xs text-gray-500">번호 (Número)</label>
                            <input type="text" value={utilities.internet || ''} onChange={(e) => handleUtilityChange('internet', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2" />
                        </div>
                         <div>
                             <label className="block text-xs text-gray-500">납부일 (Fecha de pago)</label>
                            <input type="text" placeholder="예: 25" value={utilities.internetPaymentDate || ''} onChange={(e) => handleUtilityChange('internetPaymentDate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm p-2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6">
          {guests.map((guest, index) => (
            <div key={guest.id} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50/50 space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-3">
                    <span>고객 {index + 1} (Huésped)</span>
                    {guest.isCheckedIn ? (
                        <span className="text-xs font-bold text-green-800 bg-green-100 px-2 py-1 rounded-full">입실 완료 (Check-in)</span>
                    ) : (
                        <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-full">예약중 (Reservado)</span>
                    )}
                </h3>
                 <button type="button" onClick={() => handleRemoveGuest(index)} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full">
                    <TrashIcon className="w-6 h-6"/>
                </button>
                
                {!guest.isCheckedIn && (
                    <div className="pt-2 pb-4 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => handleGuestCheckIn(index)}
                            className="w-full bg-primary-600 text-white py-3 rounded-lg text-base font-bold hover:bg-primary-700 transition-colors"
                        >
                            입실 확인 (Confirmar Check-in)
                        </button>
                    </div>
                 )}

              <div>
                <label htmlFor={`guestName-${index}`} className="block text-base font-medium text-gray-700 mb-2">이름 (Nombre)</label>
                <input type="text" id={`guestName-${index}`} value={guest.guestName} onChange={(e) => handleGuestChange(index, 'guestName', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
              </div>
              <div>
                <label htmlFor={`numberOfGuests-${index}`} className="block text-base font-medium text-gray-700 mt-2 mb-2">인원수 (Personas)</label>
                <input type="number" id={`numberOfGuests-${index}`} value={guest.numberOfGuests} onChange={(e) => handleGuestChange(index, 'numberOfGuests', parseInt(e.target.value, 10) || 0)} min="0" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`checkInDate-${index}`} className="block text-base font-medium text-gray-700 mb-2">체크인 (Entrada)</label>
                    <input type="date" id={`checkInDate-${index}`} value={guest.checkInDate} onChange={(e) => handleGuestChange(index, 'checkInDate', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
                  </div>
                  <div>
                    <label htmlFor={`checkOutDate-${index}`} className="block text-base font-medium text-gray-700 mb-2">체크아웃 (Salida)</label>
                    <input type="date" id={`checkOutDate-${index}`} value={guest.checkOutDate} onChange={(e) => handleGuestChange(index, 'checkOutDate', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
                  </div>
              </div>
              
              {/* Auto Checkout Section */}
              <div className="bg-red-50 p-3 rounded-md border border-red-100 mt-2">
                  <label className="block text-base font-bold text-red-800 mb-2">
                      자동 퇴실 설정 (Salida Automática)
                  </label>
                  <AutoCheckoutControl 
                      value={guest.scheduledCheckoutTime}
                      onChange={(isoDate) => handleAutoCheckoutChange(index, isoDate)}
                  />
              </div>

              <div>
                <label htmlFor={`guestCompany-${index}`} className="block text-base font-medium text-gray-700 mt-2 mb-2">소속 (Empresa)</label>
                <input type="text" id={`guestCompany-${index}`} value={guest.guestCompany} onChange={(e) => handleGuestChange(index, 'guestCompany', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
              </div>
              <div>
                <label htmlFor={`rentalCar-${index}`} className="block text-base font-medium text-gray-700 mt-2 mb-2">차량 (Coche)</label>
                <input type="text" id={`rentalCar-${index}`} value={guest.rentalCar} onChange={(e) => handleGuestChange(index, 'rentalCar', e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" />
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleAddGuest} className="w-full mt-6 text-base font-semibold text-primary-600 border-2 border-dashed border-primary-300 rounded-lg py-3 hover:bg-primary-50 transition-colors">
          + 고객 추가 (Agregar Huésped)
        </button>
        
        <div className="mt-6 pt-6 border-t">
          <label htmlFor="memo-text" className="block text-base font-medium text-gray-700 mb-2">메모 (Nota)</label>
          <textarea
            id="memo-text"
            rows={3}
            value={memo.text}
            onChange={(e) => handleMemoChange('text', e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base"
            placeholder="메모를 입력하세요 (Escribir nota)..."
          />
          <div className="mt-3 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">글자 크기:</span>
              <div className="flex items-center rounded-lg border border-gray-300 p-0.5">
                {(Object.keys(memoFontSizes) as Array<keyof typeof memoFontSizes>).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleMemoChange('fontSize', size)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${memo.fontSize === size ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {memoFontSizes[size]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">색상 (Color):</span>
              <div className="flex items-center gap-2">
                {memoColors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleMemoChange('color', color.value)}
                    className={`w-7 h-7 rounded-full transition-all duration-200 ${memo.color === color.value ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
                    style={{ backgroundColor: color.value }}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>


        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">취소 (Cancelar)</button>
          <button type="submit" className="rounded-lg border border-transparent bg-primary-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">저장 (Guardar)</button>
        </div>
      </form>
    </Modal>
  );
};


const HouseCard: React.FC<{ house: House; onEdit: (house: House) => void; }> = ({ house, onEdit }) => {
    const todayStr = new Date().toISOString().split('T')[0];

    const hasUtilities = house.utilities && Object.values(house.utilities).some(val => typeof val === 'string' && val.trim() !== '');

    const currentGuests = house.guests.filter(g => g.isCheckedIn === true);
    
    // Check for any scheduled checkouts
    const hasScheduledCheckout = house.guests.some(g => !!g.scheduledCheckoutTime);

    const pendingGuests = house.guests.filter(g => 
        !g.isCheckedIn && g.checkOutDate >= todayStr
    ).sort((a, b) => a.checkInDate.localeCompare(b.checkInDate));

    let status: 'occupied' | 'reserved' | 'vacant' = 'vacant';
    let statusText: string;

    const totalCurrentGuests = currentGuests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
    
    if (currentGuests.length > 0) {
        status = 'occupied';
        statusText = `사용 중 (Ocupado) - ${totalCurrentGuests}명`;
    } else if (pendingGuests.length > 0) {
        status = 'reserved';
        const nextCheckIn = pendingGuests[0].checkInDate.slice(5).replace('-', '/');
        statusText = `입실 예정 (${nextCheckIn})`;
    } else {
        status = 'vacant';
        statusText = '공실 (Vacío)';
    }

    // Determine list of guests to display on the card
    // We show current guests first, then reserved guests.
    const guestDisplayInfo = house.guests
        .filter(g => {
            const isCurrent = g.isCheckedIn;
            const isPending = !g.isCheckedIn && g.checkOutDate >= todayStr;
            return isCurrent || isPending;
        })
        .sort((a, b) => Number(b.isCheckedIn) - Number(a.isCheckedIn)) // Show checked-in first
        .map(guest => ({
            id: guest.id,
            name: guest.guestName || guest.guestCompany,
            car: guest.rentalCar,
            isReserved: !guest.isCheckedIn
        }))
        .filter(info => info.name || info.car)
        .slice(0, 3); // Slightly increased to allow seeing mixed states


    const isPrivada = house.street.startsWith('PRIVADA');

    const statusConfig = {
        occupied: { bg: 'bg-secondary-50', border: 'border-secondary-200', textBg: 'bg-secondary-100', textColor: 'text-secondary-800', divider: 'border-secondary-200/80' },
        reserved: { bg: 'bg-indigo-50', border: 'border-indigo-200', textBg: 'bg-indigo-100', textColor: 'text-indigo-800', divider: 'border-indigo-200/80' },
        vacant: { bg: 'bg-primary-50', border: 'border-primary-200', textBg: 'bg-green-100', textColor: 'text-green-800', divider: '' }
    };
    const currentStatusConfig = statusConfig[status];
    
    const memoFontSizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    };

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
                    <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-lg ${isPrivada ? 'text-privada' : 'text-gray-800'}`}>{streetKor[house.street]} {house.number}호</h4>
                        {hasScheduledCheckout && (
                            <div className="flex items-center gap-1 text-[10px] text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                <ClockIcon className="w-3 h-3" />
                                {house.guests.map(g => {
                                    if (g.scheduledCheckoutTime) {
                                            return <Countdown key={g.id} targetDate={g.scheduledCheckoutTime} compact />
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${currentStatusConfig.textBg} ${currentStatusConfig.textColor}`}>
                            {statusText}
                        </span>
                        {status === 'occupied' && pendingGuests.length > 0 && (
                             <span className="px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse">
                                + 예약 대기 ({pendingGuests.length})
                            </span>
                        )}
                    </div>
                </div>
                
                {house.houseType === 'airbnb' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 mb-2 inline-block mt-1 shadow-sm">
                        Airbnb
                    </span>
                )}

                {(guestDisplayInfo.length > 0) ? (
                    <div className="mt-3 space-y-3 text-sm text-gray-600">
                        {guestDisplayInfo.map((info, index) => (
                           <div key={info.id} className={index > 0 ? `pt-3 border-t ${currentStatusConfig.divider}` : ''}>
                                <div className="flex justify-between items-start">
                                    <p className="flex items-center gap-2 font-semibold">
                                        <UserIcon className="w-4 h-4 text-gray-400" /> 
                                        {info.name || '정보 없음'}
                                        {info.isReserved && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 font-bold ml-1">예약</span>}
                                    </p>
                                </div>
                                {info.car && (
                                    <p className="flex items-center gap-2 pl-1 border-t border-dashed border-gray-300 pt-1 mt-1">
                                        <CarIcon className="w-3 h-3 text-gray-400" /> 
                                        <span className="font-medium text-gray-700">{info.car}</span>
                                    </p>
                                )}
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-3 flex items-center justify-center text-center h-24 text-gray-400">
                        <p>정보 없음 (Sin Información)<br/>(클릭하여 수정/Editar)</p>
                    </div>
                )}
                
                {hasUtilities && (
                    <div className="mt-4 pt-2 border-t border-gray-200/60 text-xs text-gray-600">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            {/* Individual Payment Date Display if available */}
                            {house.utilities?.gas && (
                                <div className="flex items-center gap-1 overflow-hidden" title={`GAS: ${house.utilities.gas}`}>
                                    <FireIcon className="w-3 h-3 text-orange-500 flex-shrink-0" />
                                    <span className="truncate">{house.utilities.gas}{house.utilities.gasPaymentDate ? ` (${house.utilities.gasPaymentDate}일)` : ''}</span>
                                </div>
                            )}
                            {house.utilities?.water && (
                                <div className="flex items-center gap-1 overflow-hidden" title={`AGUA: ${house.utilities.water}`}>
                                    <DropIcon className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                    <span className="truncate">{house.utilities.water}{house.utilities.waterPaymentDate ? ` (${house.utilities.waterPaymentDate}일)` : ''}</span>
                                </div>
                            )}
                            {house.utilities?.electricity && (
                                <div className="flex items-center gap-1 overflow-hidden" title={`ELEC: ${house.utilities.electricity}`}>
                                    <BoltIcon className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                    <span className="truncate">{house.utilities.electricity}{house.utilities.electricityPaymentDate ? ` (${house.utilities.electricityPaymentDate}일)` : ''}</span>
                                </div>
                            )}
                            {house.utilities?.internet && (
                                <div className="flex items-center gap-1 overflow-hidden" title={`INT: ${house.utilities.internet}`}>
                                    <WifiIcon className="w-3 h-3 text-purple-500 flex-shrink-0" />
                                    <span className="truncate">{house.utilities.internet}{house.utilities.internetPaymentDate ? ` (${house.utilities.internetPaymentDate}일)` : ''}</span>
                                </div>
                            )}
                            
                            {/* Legacy/Fallback Payment Date */}
                            {!house.utilities?.gasPaymentDate && !house.utilities?.waterPaymentDate && !house.utilities?.electricityPaymentDate && !house.utilities?.internetPaymentDate && house.utilities?.paymentDate && (
                                <div className="col-span-2 flex items-center gap-1 mt-1 font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded w-fit">
                                    <CalendarIcon className="w-3 h-3" />
                                    <span>통합 납부일: {house.utilities.paymentDate}일</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

             {house.memo?.text && (
                <div className="mt-3 pt-3 border-t border-gray-200/80">
                    <div className="bg-secondary-100/70 p-2 rounded-md border-l-4 border-secondary-300 shadow-sm">
                        <p 
                            style={{ color: house.memo.color }} 
                            className={`whitespace-pre-wrap break-words leading-tight font-pen ${memoFontSizeClasses[house.memo.fontSize]}`}
                        >
                            {house.memo.text}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};


export const Management: React.FC<{ 
    houses: House[], 
    updateHouse: (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => void;
    checkInGuest: (houseId: string, guestId: string) => void;
    title?: string;
    onBack?: () => void;
    compact?: boolean;
    registerBackHandler?: (handler: () => boolean) => void;
    unregisterBackHandler?: () => void;
}> = ({ houses, updateHouse, checkInGuest, title = "주택 관리 (Gestión)", onBack, compact = false, registerBackHandler, unregisterBackHandler }) => {
  const [editingHouse, setEditingHouse] = useState<House | null>(null);

  // Handle Back Button for Modal
  useEffect(() => {
    if (editingHouse && registerBackHandler) {
        registerBackHandler(() => {
            setEditingHouse(null);
            return true;
        });
    } else if (unregisterBackHandler) {
        unregisterBackHandler();
    }
  }, [editingHouse, registerBackHandler, unregisterBackHandler]);

  const groupedHouses = houses.reduce((acc, house) => {
    if (!acc[house.street]) {
      acc[house.street] = [];
    }
    acc[house.street].push(house);
    return acc;
  }, {} as Record<StreetName, House[]>);
  
  const header = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 px-2 sm:px-0 pt-4 sm:pt-0">
        <div className="flex items-center gap-3">
            {onBack && (
            <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 shrink-0"
                aria-label="뒤로가기"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{title}</h2>
        </div>
        <HeaderClock />
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {compact || onBack ? header : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
           <HeaderClock />
        </div>
      )}

      {houses.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md flex-1">
           {compact ? (
             <p className="mt-4 text-gray-500">해당하는 주택이 없습니다. (No se encontraron casas)</p>
           ) : (
            <>
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
               <p className="mt-4 text-gray-500">데이터를 불러오는 중입니다... (Cargando...)</p>
            </>
           )}
        </div>
      ) : compact ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 flex-1 overflow-y-auto pb-4">
            {[...houses].sort((a, b) => {
                const guestsA = a.guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
                const guestsB = b.guests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);
                if (guestsA !== guestsB) {
                    return guestsA - guestsB; 
                }
                const streetOrder = ['Arteal', 'Retamar', 'Tahal', 'Ubedas', 'Ragol', 'Vera', 'PRIVADA3', 'PRIVADA6'];
                const streetCompare = streetOrder.indexOf(a.street) - streetOrder.indexOf(b.street);
                if (streetCompare !== 0) return streetCompare;
                return a.number.localeCompare(b.number, undefined, { numeric: true });
            }).map(house => {
                const todayStr = new Date().toISOString().split('T')[0];
                
                // Strict Occupancy Check: Just checking isCheckedIn
                const currentGuests = house.guests.filter(g => g.isCheckedIn);
                const totalCurrentGuests = currentGuests.reduce((sum, g) => sum + Number(g.numberOfGuests), 0);

                const pendingGuests = house.guests.filter(g => !g.isCheckedIn && g.checkOutDate >= todayStr);
                const hasPending = pendingGuests.length > 0;
                
                const hasScheduled = house.guests.some(g => !!g.scheduledCheckoutTime);
                const earliestCheckout = house.guests
                    .filter(g => g.scheduledCheckoutTime)
                    .sort((a,b) => new Date(a.scheduledCheckoutTime!).getTime() - new Date(b.scheduledCheckoutTime!).getTime())[0]?.scheduledCheckoutTime;

                let displayStatus: 'occupied' | 'reserved' | 'vacant' = 'vacant';
                if (totalCurrentGuests > 0) displayStatus = 'occupied';
                else if (hasPending) displayStatus = 'reserved';

                const isPrivada = house.street.startsWith('PRIVADA');
                
                let displayHouseIdentifier = house.number;
                if (house.street === 'PRIVADA3' && house.number === '231') {
                    displayHouseIdentifier = 'P3 231';
                } else if (house.street === 'PRIVADA6' && house.number === '415') {
                    displayHouseIdentifier = 'P6 415';
                }
                const numberTextSize = (displayHouseIdentifier.length > 3) ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl';

                let colorClasses = {
                    gradient: 'bg-gradient-to-br from-green-400 to-green-600',
                    border: 'border-green-700',
                    activeBorder: 'active:border-green-600',
                };
        
                if (displayStatus === 'occupied') {
                    if (totalCurrentGuests === 1) {
                        colorClasses = { gradient: 'bg-gradient-to-br from-yellow-300 to-yellow-500', border: 'border-yellow-600', activeBorder: 'active:border-yellow-500' };
                    } else if (totalCurrentGuests === 2) {
                        colorClasses = { gradient: 'bg-gradient-to-br from-pink-300 to-pink-500', border: 'border-pink-600', activeBorder: 'active:border-pink-500' };
                    } else if (totalCurrentGuests === 3) {
                        colorClasses = { gradient: 'bg-gradient-to-br from-red-500 to-red-700', border: 'border-red-800', activeBorder: 'active:border-red-700' };
                    } else if (totalCurrentGuests >= 4) {
                        colorClasses = { gradient: 'bg-gradient-to-br from-purple-500 to-purple-700', border: 'border-purple-800', activeBorder: 'active:border-purple-700' };
                    }
                } else if (displayStatus === 'reserved') {
                    colorClasses = { gradient: 'bg-gradient-to-br from-indigo-400 to-indigo-600', border: 'border-indigo-700', activeBorder: 'active:border-indigo-600' };
                }

                const numberTextColorClass = isPrivada ? 'text-blue-500 font-extrabold' : 'text-white';
                
                const guestDisplayInfo = house.guests
                  .filter(g => {
                      // Show current AND pending guests in the quick view
                      const isCurrent = g.isCheckedIn;
                      const isPending = !g.isCheckedIn && g.checkOutDate >= todayStr;
                      return isCurrent || isPending;
                  })
                  .map(guest => ({
                    id: guest.id,
                    name: guest.guestName || guest.guestCompany,
                    car: guest.rentalCar,
                    isReserved: !guest.isCheckedIn
                  }))
                  .filter(info => info.name || info.car)
                  .slice(0, 3); // Allow up to 3 guests to be shown if space permits (previously 2)

                return (
                    <button
                        key={house.id}
                        onClick={() => setEditingHouse(house)}
                        className={`relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl p-2 text-white shadow-lg border-b-4 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-md active:border-b-2 ${colorClasses.gradient} ${colorClasses.border} ${colorClasses.activeBorder}`}
                    >
                         {house.houseType === 'airbnb' && (
                             <div className="absolute top-0 left-0 bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded-tl-xl rounded-br-lg font-bold z-10 shadow-sm">
                                 Airbnb
                             </div>
                         )}
                         
                         {hasScheduled && (
                             <div className="absolute top-0 right-0 p-1">
                                 <ClockIcon className="w-4 h-4 text-white animate-pulse filter drop-shadow-md" />
                             </div>
                         )}

                         <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-inset ring-white/20"></div>
                         <div className="absolute top-0 left-0 w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/25 to-transparent"></div>

                        <div className="relative flex flex-col items-center text-center pb-4 sm:pb-5" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }}>
                            <div className="flex items-center justify-center gap-1.5 mt-1">
                                <HomeIcon className="w-5 h-5 sm:w-7 sm:h-7" />
                                <span className={`${numberTextSize} font-bold ${numberTextColorClass}`}>{displayHouseIdentifier}</span>
                            </div>

                            {earliestCheckout && (
                                <div className="mt-1 flex items-center justify-center gap-1 bg-red-600 text-white text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded shadow-sm animate-pulse z-10">
                                    <ClockIcon className="w-3 h-3" />
                                    <Countdown targetDate={earliestCheckout} compact />
                                </div>
                            )}
                            
                            <div className="flex items-center justify-center gap-1 text-xs sm:text-sm mt-1 font-semibold h-4 sm:h-5">
                                {displayStatus === 'occupied' ? (
                                    <>
                                        <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>{totalCurrentGuests}명</span>
                                        {hasPending && <span className="text-[9px] sm:text-[10px] bg-indigo-500 text-white px-1 py-0.5 rounded ml-1 font-bold shadow-sm animate-pulse">+예약</span>}
                                    </>
                                ) : displayStatus === 'reserved' ? (
                                    (() => {
                                        const nextGuest = pendingGuests.sort((a,b) => a.checkInDate.localeCompare(b.checkInDate))[0];
                                        const nextDate = nextGuest ? nextGuest.checkInDate.slice(5).replace('-', '/') : '';
                                        return <span className="text-[10px] sm:text-xs font-bold text-indigo-100">입실 예정 ({nextDate})</span>;
                                    })()
                                ) : (
                                    <span className="text-[10px] sm:text-xs">공실</span>
                                )}
                            </div>
                            
                            <div className="min-h-[32px] sm:min-h-[40px] mt-1 flex flex-col justify-center items-center text-[10px] sm:text-xs w-full px-1 gap-0.5 sm:gap-1">
                                {guestDisplayInfo.length > 0 ? (
                                    guestDisplayInfo.map(info => (
                                        <div key={info.id} className="w-full overflow-hidden">
                                            {info.name && (
                                                <p className="font-medium truncate w-full text-center px-1">
                                                    {info.name} {info.isReserved && <span className="text-[9px] bg-indigo-500 text-white px-1 rounded ml-0.5">예약</span>}
                                                </p>
                                            )}
                                            {info.car && (
                                                <p className="font-light truncate w-full text-center flex items-center justify-center gap-1 text-white/90 px-1">
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
                        {house.memo?.text && (
                          <div className="absolute bottom-0 left-0 right-0 px-2 py-0.5 sm:py-1 bg-black/40 text-white text-[10px] sm:text-xs text-center truncate rounded-b-lg sm:rounded-b-xl">
                            {house.memo.text}
                          </div>
                        )}
                    </button>
                );
            })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4">
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
            checkInGuest={checkInGuest}
        />
      )}
    </div>
  );
};
