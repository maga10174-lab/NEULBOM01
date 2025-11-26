
import React, { useState, useRef } from 'react';
import type { Booking as BookingType } from '../types';
import { CheckCircleIcon, ArrowUpTrayIcon, CameraIcon } from './icons';

interface BookingProps {
  addBooking: (booking: Omit<BookingType, 'id' | 'status' | 'flightTicketUrl'>, flightTicket?: File) => Promise<void>;
  onBack: () => void;
}

const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const Booking: React.FC<BookingProps> = ({ addBooking, onBack }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    phoneNumber: '',
    arrivalDate: getTodayString(),
    departureDate: getTodayString(),
    kakaoId: '',
    flightNumber: '',
    numberOfGuests: 1,
  });
  const [flightTicket, setFlightTicket] = useState<File | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseInt(value, 10) || 1 : value 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFlightTicket(e.target.files[0]);
    }
  };

  const triggerFileInput = (mode: 'file' | 'camera') => {
    if (fileInputRef.current) {
        if (mode === 'camera') {
            fileInputRef.current.removeAttribute('multiple');
            fileInputRef.current.setAttribute('capture', 'environment');
        } else {
            fileInputRef.current.removeAttribute('capture');
        }
        fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const bookingData = {
          ...formData,
          flightTicketName: flightTicket?.name || undefined
      };

      await addBooking(bookingData, flightTicket);
      setIsSubmitted(true);
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
          onBack();
      }, 2000);

    } catch (error) {
      console.error("Failed to add booking:", error);
      alert("예약 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.\n(Error al enviar la reserva. Inténtelo de nuevo.)");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto text-center animate-fade-in-up">
        <CheckCircleIcon className="w-16 h-16 text-primary-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">예약 신청 완료 (Solicitud Enviada)</h2>
        <p className="text-gray-600 mt-2">예약 정보가 성공적으로 전송되었습니다.<br/>빠른 시일 내에 담당자가 연락드리겠습니다.</p>
        <div className="mt-6 text-sm text-gray-500">
             잠시 후 메인 화면으로 이동합니다...<br/>(Volviendo al inicio...)
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">예약 신청 (Reserva)</h2>
          <button
            onClick={onBack}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition-colors text-sm"
          >
            &larr; 나가기 (Salir)
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-800">
             * <span className="font-bold">이름, 항공편명, 카카오톡 ID</span>는 필수 입력 항목입니다.<br/>
             (Nombre, Nº Vuelo, ID Kakao son obligatorios.)
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">예약자 성함 (Nombre) <span className="text-red-500">*</span></label>
              <input type="text" name="guestName" id="guestName" value={formData.guestName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" required />
            </div>
             <div>
              <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-1">총 인원 (Personas)</label>
              <input type="number" name="numberOfGuests" id="numberOfGuests" value={formData.numberOfGuests} onChange={handleInputChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" />
            </div>
          </div>
          
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">전화번호 (Teléfono)</label>
            <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="선택사항 (Opcional)" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700 mb-1">입국일 (Llegada)</label>
              <input type="date" name="arrivalDate" id="arrivalDate" value={formData.arrivalDate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" />
            </div>
            <div>
              <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-1">출국일 (Salida)</label>
              <input type="date" name="departureDate" id="departureDate" value={formData.departureDate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-1">항공편명 (Nº Vuelo) <span className="text-red-500">*</span></label>
            <input type="text" name="flightNumber" id="flightNumber" value={formData.flightNumber} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" required />
          </div>
           <div>
            <label htmlFor="kakaoId" className="block text-sm font-medium text-gray-700 mb-1">카카오톡 ID (ID Kakao) <span className="text-red-500">*</span></label>
            <input type="text" name="kakaoId" id="kakaoId" value={formData.kakaoId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">항공권 사진/파일 (Boleto de avión)</label>
            <input 
              type="file" 
              name="flightTicket" 
              id="flightTicket" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              className="hidden"
              accept="image/*"
            />
             <div className="mt-1 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => triggerFileInput('file')} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                    <ArrowUpTrayIcon className="w-5 h-5"/> <span>파일 업로드 (Archivo)</span>
                </button>
                <button type="button" onClick={() => triggerFileInput('camera')} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                    <CameraIcon className="w-5 h-5"/> <span>촬영 (Cámara)</span>
                </button>
            </div>
             {flightTicket && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded-md flex justify-between items-center">
                    <div>
                        <p className="font-medium">선택됨 (Seleccionado):</p>
                        <p className="truncate max-w-[200px]">{flightTicket.name}</p>
                    </div>
                    <button type="button" onClick={() => setFlightTicket(undefined)} className="text-red-500 hover:text-red-700 text-xs font-bold">삭제</button>
                </div>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-bold text-base transition-colors disabled:bg-gray-400 shadow-md">
            {isSubmitting ? '전송 중... (Enviando...)' : '예약 신청하기 (Enviar Solicitud)'}
          </button>
        </form>
      </div>
    </div>
  );
};
