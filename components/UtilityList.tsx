
import React, { useState, useMemo } from 'react';
import type { House, StreetName } from '../types';
import { ArrowLeftIcon, PrinterIcon, AdjustmentsHorizontalIcon, FireIcon, DropIcon, BoltIcon, WifiIcon, CalendarIcon } from './icons';

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

interface UtilityListProps {
    houses: House[];
    onBack: () => void;
}

const initialState = {
    gas: true,
    water: true,
    electricity: true,
    internet: true
};

export const UtilityList: React.FC<UtilityListProps> = ({ houses, onBack }) => {
    const [filters, setFilters] = useState(initialState);
    const [showFilters, setShowFilters] = useState(false);

    const sortedHouses = useMemo(() => {
        return [...houses].sort((a, b) => {
            const order = ['Arteal', 'Retamar', 'Tahal', 'Ubedas', 'Ragol', 'Vera', 'PRIVADA3', 'PRIVADA6'];
            const streetDiff = order.indexOf(a.street) - order.indexOf(b.street);
            if (streetDiff !== 0) return streetDiff;
            return a.number.localeCompare(b.number, undefined, { numeric: true });
        });
    }, [houses]);

    const handlePrint = () => {
        window.print();
    };

    const toggleFilter = (key: keyof typeof initialState) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <header className="flex items-center justify-between px-4 py-4 border-b print:hidden flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">공과금 관리</h2>
                </div>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="필터 설정"
                    >
                        <AdjustmentsHorizontalIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">인쇄</span>
                    </button>
                </div>
            </header>

            {showFilters && (
                <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-3 print:hidden animate-fade-in-down flex-shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border shadow-sm text-sm sm:text-base hover:bg-gray-50">
                        <input type="checkbox" checked={filters.gas} onChange={() => toggleFilter('gas')} className="rounded text-primary-600 focus:ring-primary-500" />
                        <FireIcon className="w-4 h-4 text-orange-500" /> <span>GAS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border shadow-sm text-sm sm:text-base hover:bg-gray-50">
                        <input type="checkbox" checked={filters.water} onChange={() => toggleFilter('water')} className="rounded text-primary-600 focus:ring-primary-500" />
                        <DropIcon className="w-4 h-4 text-blue-500" /> <span>수도</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border shadow-sm text-sm sm:text-base hover:bg-gray-50">
                        <input type="checkbox" checked={filters.electricity} onChange={() => toggleFilter('electricity')} className="rounded text-primary-600 focus:ring-primary-500" />
                        <BoltIcon className="w-4 h-4 text-yellow-500" /> <span>전기</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border shadow-sm text-sm sm:text-base hover:bg-gray-50">
                        <input type="checkbox" checked={filters.internet} onChange={() => toggleFilter('internet')} className="rounded text-primary-600 focus:ring-primary-500" />
                        <WifiIcon className="w-4 h-4 text-purple-500" /> <span>인터넷</span>
                    </label>
                </div>
            )}

            <div className="flex-1 overflow-auto p-4 sm:p-6 print:p-0 print:overflow-visible bg-gray-100 sm:bg-white">
                <div className="print:mb-4 hidden print:block text-center">
                     <h1 className="text-2xl font-bold text-gray-900">늘봄 게스트하우스 공과금 현황</h1>
                     <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
                </div>

                {/* Desktop & Print View (Table) */}
                <div className="hidden md:block print:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg print:shadow-none print:ring-0">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50 print:bg-gray-100">
                            <tr>
                                <th scope="col" className="py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 w-1/5">주소 (Dirección)</th>
                                {filters.gas && <th scope="col" className="px-3 py-3 text-left text-sm font-semibold text-gray-900 w-1/5">GAS</th>}
                                {filters.water && <th scope="col" className="px-3 py-3 text-left text-sm font-semibold text-gray-900 w-1/5">수도 (Agua)</th>}
                                {filters.electricity && <th scope="col" className="px-3 py-3 text-left text-sm font-semibold text-gray-900 w-1/5">전기 (CFE)</th>}
                                {filters.internet && <th scope="col" className="px-3 py-3 text-left text-sm font-semibold text-gray-900 w-1/5">인터넷 (Internet)</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {sortedHouses.map((house) => (
                                <tr key={house.id} className="break-inside-avoid">
                                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-bold text-gray-900 sm:pl-6 bg-gray-50/50">
                                        {streetKor[house.street]} {house.number}
                                        {house.houseType === 'airbnb' && <span className="ml-2 text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full border border-rose-200 print:border-gray-300">ABNB</span>}
                                    </td>
                                    {filters.gas && (
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                                            <div className="flex flex-col">
                                                <span className="font-mono">{house.utilities?.gas || '-'}</span>
                                                {house.utilities?.gasPaymentDate && <span className="text-xs text-red-600 font-semibold">납부일: {house.utilities.gasPaymentDate}일</span>}
                                            </div>
                                        </td>
                                    )}
                                    {filters.water && (
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                                             <div className="flex flex-col">
                                                <span className="font-mono">{house.utilities?.water || '-'}</span>
                                                {house.utilities?.waterPaymentDate && <span className="text-xs text-red-600 font-semibold">납부일: {house.utilities.waterPaymentDate}일</span>}
                                            </div>
                                        </td>
                                    )}
                                    {filters.electricity && (
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                                             <div className="flex flex-col">
                                                <span className="font-mono">{house.utilities?.electricity || '-'}</span>
                                                {house.utilities?.electricityPaymentDate && <span className="text-xs text-red-600 font-semibold">납부일: {house.utilities.electricityPaymentDate}일</span>}
                                            </div>
                                        </td>
                                    )}
                                    {filters.internet && (
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                                             <div className="flex flex-col">
                                                <span className="font-mono">{house.utilities?.internet || '-'}</span>
                                                {house.utilities?.internetPaymentDate && <span className="text-xs text-red-600 font-semibold">납부일: {house.utilities.internetPaymentDate}일</span>}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet View (Card Grid) - Hidden on Print */}
                <div className="md:hidden print:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sortedHouses.map((house) => (
                        <div key={house.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 text-lg">
                                    {streetKor[house.street]} {house.number}
                                </h3>
                                {house.houseType === 'airbnb' && (
                                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded-full border border-rose-200 font-bold">Airbnb</span>
                                )}
                            </div>
                            <div className="p-4 space-y-3">
                                {filters.gas && (
                                    <div className="flex justify-between items-start pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                                            <div className="p-1.5 bg-orange-50 rounded-full text-orange-500"><FireIcon className="w-4 h-4" /></div>
                                            <span>GAS</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-medium text-gray-900 text-sm">{house.utilities?.gas || '-'}</div>
                                            {house.utilities?.gasPaymentDate && <div className="text-xs text-red-600 font-bold">매월 {house.utilities.gasPaymentDate}일</div>}
                                        </div>
                                    </div>
                                )}
                                {filters.water && (
                                    <div className="flex justify-between items-start pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                                            <div className="p-1.5 bg-blue-50 rounded-full text-blue-500"><DropIcon className="w-4 h-4" /></div>
                                            <span>수도</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-medium text-gray-900 text-sm">{house.utilities?.water || '-'}</div>
                                            {house.utilities?.waterPaymentDate && <div className="text-xs text-red-600 font-bold">매월 {house.utilities.waterPaymentDate}일</div>}
                                        </div>
                                    </div>
                                )}
                                {filters.electricity && (
                                    <div className="flex justify-between items-start pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                                            <div className="p-1.5 bg-yellow-50 rounded-full text-yellow-500"><BoltIcon className="w-4 h-4" /></div>
                                            <span>전기</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-medium text-gray-900 text-sm">{house.utilities?.electricity || '-'}</div>
                                            {house.utilities?.electricityPaymentDate && <div className="text-xs text-red-600 font-bold">매월 {house.utilities.electricityPaymentDate}일</div>}
                                        </div>
                                    </div>
                                )}
                                {filters.internet && (
                                    <div className="flex justify-between items-start pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                                            <div className="p-1.5 bg-purple-50 rounded-full text-purple-500"><WifiIcon className="w-4 h-4" /></div>
                                            <span>인터넷</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-medium text-gray-900 text-sm">{house.utilities?.internet || '-'}</div>
                                            {house.utilities?.internetPaymentDate && <div className="text-xs text-red-600 font-bold">매월 {house.utilities.internetPaymentDate}일</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <style>{`
                @media print {
                    @page { size: landscape; margin: 5mm; }
                    body { -webkit-print-color-adjust: exact; zoom: 0.9; }
                    table { font-size: 10px; width: 100%; }
                    th, td { padding: 4px 8px !important; }
                }
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
