
import React, { useState } from 'react';
import type { Booking, StreetName } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, PaperAirplaneIcon, TrashIcon } from './icons';

const PendingBookingCard: React.FC<{
    booking: Booking;
    onAssign: (booking: Booking) => void;
    onDelete: (id: string) => void;
}> = ({ booking, onAssign, onDelete }) => {
    const [idCopied, setIdCopied] = useState(false);

    const handleCopyKakaoId = () => {
        if (!booking.kakaoId) return;
        const text = booking.kakaoId;

        const fallbackCopy = () => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setIdCopied(true);
                setTimeout(() => setIdCopied(false), 2000);
            } catch (err) {
                alert('카카오톡 ID 복사에 실패했습니다.');
            }
            document.body.removeChild(textArea);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
             navigator.clipboard.writeText(text).then(() => {
                setIdCopied(true);
                setTimeout(() => setIdCopied(false), 2000);
            }).catch(err => {
                console.warn('Clipboard API failed, trying fallback', err);
                fallbackCopy();
            });
        } else {
            fallbackCopy();
        }
    };

    return (
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <p className="font-bold text-gray-800">{booking.guestName} <span className="text-sm font-normal text-gray-600">({booking.numberOfGuests}명)</span></p>
                <p className="text-sm text-gray-600">{booking.arrivalDate} ~ {booking.departureDate}</p>
                
                <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-gray-500">카톡ID:</span>
                    <button onClick={handleCopyKakaoId} className="text-gray-700 hover:text-primary-600 hover:underline cursor-pointer" title="클릭하여 복사">
                        {booking.kakaoId}
                    </button>
                    {idCopied && <span className="text-xs text-primary-600 font-semibold animate-pulse">복사됨!</span>}
                </div>
                
                {booking.phoneNumber && (
                     <p className="text-sm text-gray-600 mt-0.5">
                        <span className="text-gray-500">전화:</span> {booking.phoneNumber}
                     </p>
                )}

                {booking.flightNumber && (
                    <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(booking.flightNumber + ' flight status')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 cursor-pointer mt-1"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        {booking.flightNumber}
                    </a>
                )}
                {booking.flightTicketName && <p className="text-sm text-gray-500 mt-1">첨부: {booking.flightTicketName}</p>}
            </div>
            <div className="flex gap-2 self-end sm:self-center">
                <button onClick={() => onAssign(booking)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow"><CheckCircleIcon className="w-5 h-5"/></button>
                <button onClick={() => onDelete(booking.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow"><TrashIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

export const PendingBookingList: React.FC<{
    bookings: Booking[];
    onAssign: (booking: Booking) => void;
    onDelete: (id: string) => void;
    onBack: () => void;
}> = ({ bookings, onAssign, onDelete, onBack }) => {

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-6 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                    aria-label="뒤로가기"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold text-gray-800">신규 예약 요청 (Solicitudes)</h2>
            </header>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
                {bookings.length > 0 ? (
                    <div className="space-y-4 pb-4">
                        {bookings.map(booking => <PendingBookingCard key={booking.id} booking={booking} onAssign={onAssign} onDelete={onDelete} />)}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow-md flex-1">
                        <p className="text-gray-500">새로운 예약 요청이 없습니다. (Sin solicitudes)</p>
                    </div>
                )}
            </div>
        </div>
    );
};
