
import React, { useState } from 'react';
import type { Booking, StreetName } from '../types';
import { ArrowLeftIcon, CalendarIcon, UserIcon, HomeModernIcon, PaperAirplaneIcon, LinkIcon, TrashIcon } from './icons';

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

const BookingCard: React.FC<{ booking: Booking; deleteBooking: (id: string) => void; }> = ({ booking, deleteBooking }) => {
    const [idCopied, setIdCopied] = useState(false);

    const handleFlightSearch = (flightNumber: string) => {
        const url = `https://www.google.com/search?q=${encodeURIComponent(flightNumber + ' flight status')}`;
        const windowFeatures = 'width=800,height=600,scrollbars=yes,resizable=yes';
        window.open(url, 'flight-status-popup', windowFeatures);
    };
    
    const handleDelete = () => {
        if (window.confirm(`'${booking.guestName}'님의 예약 정보를 삭제하시겠습니까? (Eliminar reserva?)`)) {
            deleteBooking(booking.id);
        }
    };

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
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-gray-800">{booking.guestName}</p>
                    <p className="text-sm text-gray-500">{booking.numberOfGuests}명 (Personas)</p>
                </div>
                 <div className="flex items-start gap-2">
                    {booking.houseInfo && (
                        <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-primary-700 flex items-center gap-1.5 justify-end">
                                <HomeModernIcon className="w-5 h-5" />
                                <span>{streetKor[booking.houseInfo.street]} {booking.houseInfo.number}호</span>
                            </p>
                        </div>
                    )}
                    <button 
                        onClick={handleDelete}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        aria-label="예약 삭제"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2 border-t pt-3">
                 <p className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span>{booking.arrivalDate.replace(/-/g, '.')} ~ {booking.departureDate.replace(/-/g, '.')}</span>
                </p>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">ID</span>
                    <button 
                        onClick={handleCopyKakaoId}
                        className="text-gray-600 hover:text-primary-600 hover:underline cursor-pointer"
                        title="클릭하여 아이디 복사"
                    >
                        {booking.kakaoId}
                    </button>
                    {idCopied && <span className="text-xs text-primary-600 font-semibold animate-pulse">복사됨!</span>}
                </div>
                
                {booking.phoneNumber && (
                     <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">TEL</span>
                        <span>{booking.phoneNumber}</span>
                    </div>
                )}

                <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                    {booking.flightNumber && (
                        <button 
                            onClick={() => handleFlightSearch(booking.flightNumber!)}
                            className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1.5"
                            aria-label={`Search for flight ${booking.flightNumber}`}
                        >
                            <PaperAirplaneIcon className="w-4 h-4" />
                            <span>{booking.flightNumber}</span>
                        </button>
                    )}
                     {booking.flightTicketUrl && (
                        <a href={booking.flightTicketUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1.5">
                            <LinkIcon className="w-4 h-4" />
                            항공권 (Boleto)
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ConfirmedBookingList: React.FC<{
    bookings: Booking[];
    deleteBooking: (id: string) => void;
    onBack: () => void;
}> = ({ bookings, onBack, deleteBooking }) => {
    const confirmedBookings = bookings
        .filter(b => b.status === 'confirmed')
        .sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime());

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
                <h2 className="text-3xl font-bold text-gray-800">확정된 예약 목록 (Reservas)</h2>
            </header>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
                {confirmedBookings.length > 0 ? (
                    <div className="space-y-4 pb-4">
                        {confirmedBookings.map(booking => <BookingCard key={booking.id} booking={booking} deleteBooking={deleteBooking} />)}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow-md flex-1">
                        <p className="text-gray-500">확정된 예약이 없습니다. (Sin reservas)</p>
                    </div>
                )}
            </div>
        </div>
    );
};
