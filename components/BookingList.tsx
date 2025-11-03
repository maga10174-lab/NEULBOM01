import React, { useState } from 'react';
import type { Booking as BookingType } from '../types';
import { CheckCircleIcon } from './icons';

interface BookingProps {
  addBooking: (booking: Omit<BookingType, 'id' | 'status' | 'createdAt' | 'flightTicketUrl'>, flightTicket?: File) => Promise<void>;
  onBack: () => void;
}

const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const Booking: React.FC<BookingProps> = ({ addBooking, onBack }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    arrivalDate: getTodayString(),
    departureDate: getTodayString(),
    kakaoId: '',
    flightNumber: '',
    flightTicketName: '',
  });
  const [flightTicket, setFlightTicket] = useState<File | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFlightTicket(e.target.files[0]);
      setFormData(prev => ({...prev, flightTicketName: e.target.files![0].name}))
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addBooking({ ...formData }, flightTicket);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit booking:", error);
      alert("예약 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto text-center">
        <CheckCircleIcon className="w-16 h-16 text-primary-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">예약 신청이 완료되었습니다.</h2>
        <p className="text-gray-600 mt-2">빠른 시일 내에 담당자가 카카오톡으로 연락드리겠습니다.</p>
        <button onClick={() => setIsSubmitted(false)} className="mt-6 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
          새 예약하기
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">예약 신청</h2>
          <button
            onClick={onBack}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition-colors"
          >
            &larr; 나가기
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">예약자 성함</label>
            <input type="text" name="guestName" id="guestName" value={formData.guestName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700">입국 예정일</label>
              <input type="date" name="arrivalDate" id="arrivalDate" value={formData.arrivalDate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
            </div>
            <div>
              <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">출국 예정일</label>
              <input type="date" name="departureDate" id="departureDate" value={formData.departureDate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
            </div>
          </div>
          <div>
            <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700">항공편명</label>
            <input type="text" name="flightNumber" id="flightNumber" value={formData.flightNumber} onChange={handleInputChange} placeholder="예: AM123" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            {formData.flightNumber && (
                <a href={`https://flightaware.com/live/flight/${formData.flightNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline mt-1 inline-block">실시간 위치 추적</a>
            )}
          </div>
           <div>
            <label htmlFor="kakaoId" className="block text-sm font-medium text-gray-700">카카오톡 ID</label>
            <input type="text" name="kakaoId" id="kakaoId" value={formData.kakaoId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
          </div>
          <div>
            <label htmlFor="flightTicket" className="block text-sm font-medium text-gray-700">항공권 사진/파일</label>
            <input type="file" name="flightTicket" id="flightTicket" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-bold transition-colors disabled:bg-gray-400">
            {isSubmitting ? '신청 중...' : '예약 신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
};
