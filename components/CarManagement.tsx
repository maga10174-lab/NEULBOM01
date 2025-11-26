
import React, { useState, useEffect, useRef } from 'react';
import type { Car, CarStatus } from '../types';
import { Modal } from './Modal';
import { PencilIcon, TrashIcon, ArrowLeftIcon, CarIcon, CameraIcon, PhotoIcon, ArrowUpTrayIcon } from './icons';

interface CarManagementProps {
    cars: Car[];
    addCar: (car: Omit<Car, 'id'>, imageFile?: File) => Promise<void>;
    updateCar: (id: string, car: Partial<Omit<Car, 'id'>>, imageFile?: File) => Promise<void>;
    deleteCar: (id: string) => Promise<void>;
    onBack: () => void;
    registerBackHandler?: (handler: () => boolean) => void;
    unregisterBackHandler?: () => void;
}

const statusMap: Record<CarStatus, { text: string; color: string }> = {
    available: { text: '렌트 가능 (Disponible)', color: 'bg-green-100 text-green-800' },
    rented: { text: '사용 중 (Ocupado)', color: 'bg-yellow-100 text-yellow-800' },
    maintenance: { text: '정비 중 (Mantenimiento)', color: 'bg-gray-200 text-gray-800' },
};

const CarFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (carData: Omit<Car, 'id'>, imageFile: File | null) => void;
    carToEdit?: Car | null;
}> = ({ isOpen, onClose, onSave, carToEdit }) => {
    const [formData, setFormData] = useState({
        model: '',
        plateNumber: '',
        status: 'available' as CarStatus,
        currentGuest: '',
        notes: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (carToEdit) {
                setFormData({
                    model: carToEdit.model,
                    plateNumber: carToEdit.plateNumber,
                    status: carToEdit.status,
                    currentGuest: carToEdit.currentGuest || '',
                    notes: carToEdit.notes || '',
                });
                setImagePreview(carToEdit.imageUrl || null);
            } else {
                setFormData({ model: '', plateNumber: '', status: 'available', currentGuest: '', notes: '' });
                setImagePreview(null);
            }
            setImageFile(null);
        }
    }, [carToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const triggerFileInput = (mode: 'file' | 'camera') => {
        if (fileInputRef.current) {
            if (mode === 'camera') {
                fileInputRef.current.setAttribute('capture', 'environment');
            } else {
                fileInputRef.current.removeAttribute('capture');
            }
            fileInputRef.current.click();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, imageFile);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={carToEdit ? '차량 정보 수정 (Editar)' : '새 차량 추가 (Nuevo Coche)'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">차량 사진 (Foto)</label>
                    <div className="mt-1 flex items-center gap-4">
                        <div className="w-32 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                            {imagePreview ? (
                                <img src={imagePreview} alt="차량 미리보기" className="w-full h-full object-cover" />
                            ) : (
                                <PhotoIcon className="w-10 h-10 text-gray-300" />
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <button type="button" onClick={() => triggerFileInput('file')} className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                <ArrowUpTrayIcon className="w-5 h-5"/> <span>업로드 (Subir)</span>
                            </button>
                            <button type="button" onClick={() => triggerFileInput('camera')} className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                <CameraIcon className="w-5 h-5"/> <span>촬영 (Cámara)</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">모델명 (Modelo)</label>
                    <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" required />
                </div>
                <div>
                    <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">차량 번호 (Placa)</label>
                    <input type="text" name="plateNumber" id="plateNumber" value={formData.plateNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" required />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">상태 (Estado)</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm">
                        <option value="available">렌트 가능 (Disponible)</option>
                        <option value="rented">사용 중 (Ocupado)</option>
                        <option value="maintenance">정비 중 (Mantenimiento)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="currentGuest" className="block text-sm font-medium text-gray-700">이용 고객 (Cliente)</label>
                    <input type="text" name="currentGuest" id="currentGuest" value={formData.currentGuest} onChange={handleChange} placeholder={formData.status === 'rented' ? '고객명 입력' : ''} disabled={formData.status !== 'rented'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm disabled:bg-gray-100" />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">메모 (Nota)</label>
                    <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm"></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">취소 (Cancelar)</button>
                    <button type="submit" className="rounded-lg border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700">저장 (Guardar)</button>
                </div>
            </form>
        </Modal>
    );
};

export const CarManagement: React.FC<CarManagementProps> = ({ cars, addCar, updateCar, deleteCar, onBack, registerBackHandler, unregisterBackHandler }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [carToEdit, setCarToEdit] = useState<Car | null>(null);

    // Handle Back Button for Modal
    useEffect(() => {
        if (isModalOpen && registerBackHandler) {
            registerBackHandler(() => {
                handleCloseModal();
                return true;
            });
        } else if (unregisterBackHandler) {
            unregisterBackHandler();
        }
    }, [isModalOpen, registerBackHandler, unregisterBackHandler]);

    const handleOpenAddModal = () => {
        setCarToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (car: Car) => {
        setCarToEdit(car);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCarToEdit(null);
    };

    const handleSaveCar = async (carData: Omit<Car, 'id'>, imageFile: File | null) => {
        try {
            if (carToEdit) {
                await updateCar(carToEdit.id, carData, imageFile || undefined);
            } else {
                await addCar(carData, imageFile || undefined);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save car:", error);
            alert("차량 정보 저장 중 오류가 발생했습니다.");
        }
    };
    
    const handleDeleteCar = async (id: string) => {
        if (window.confirm("정말로 이 차량 정보를 삭제하시겠습니까? (Eliminar coche?)")) {
            try {
                await deleteCar(id);
            } catch (error) {
                console.error("Failed to delete car:", error);
                alert("차량 정보 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
             <header className="flex items-center gap-4 mb-2 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
                    aria-label="뒤로가기"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold text-gray-800">차량 렌탈 관리 (Gestión de Coches)</h2>
            </header>

            <div className="px-4 sm:px-6 lg:px-8">
                <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                    + 새 차량 추가 (Agregar Coche)
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4">
                <div className="space-y-3">
                    {cars.length > 0 ? (
                        cars.map(car => (
                            <div key={car.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
                                <div className="w-24 h-16 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {car.imageUrl ? (
                                        <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover" />
                                    ) : (
                                        <CarIcon className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 truncate">{car.model} <span className="text-gray-500 font-normal">({car.plateNumber})</span></p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusMap[car.status].color}`}>
                                            {statusMap[car.status].text}
                                        </span>
                                        {car.status === 'rented' && car.currentGuest && (
                                            <p className="text-sm text-gray-600 truncate">이용자: {car.currentGuest}</p>
                                        )}
                                    </div>
                                    {car.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-md truncate">{car.notes}</p>}
                                </div>
                                <div className="flex gap-2 self-center">
                                    <button onClick={() => handleOpenEditModal(car)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteCar(car.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white rounded-lg shadow-sm border">
                            <p className="text-gray-500">등록된 차량이 없습니다. (No hay coches)</p>
                        </div>
                    )}
                </div>
            </div>

            <CarFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveCar} carToEdit={carToEdit} />
        </div>
    );
};
