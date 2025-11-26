
import React, { useState, useEffect, useRef } from 'react';
import type { RecommendationItem, RecommendationCategory } from '../types';
import { Modal } from './Modal';
import { PencilIcon, TrashIcon, ArrowLeftIcon, CameraIcon, PhotoIcon, ArrowUpTrayIcon, LinkIcon } from './icons';

interface RecommendationManagementProps {
    recommendations: RecommendationItem[];
    addRecommendation: (item: Omit<RecommendationItem, 'id' | 'imageUrl' | 'imagePath'>, imageFile?: File, imageUrlStr?: string) => Promise<void>;
    updateRecommendation: (id: string, data: Partial<Omit<RecommendationItem, 'id'>>, imageFile?: File) => Promise<void>;
    deleteRecommendation: (id: string) => Promise<void>;
    removeDuplicates: () => Promise<void>;
    cleanupDefaultData: () => Promise<void>;
    onBack: () => void;
    registerBackHandler?: (handler: () => boolean) => void;
    unregisterBackHandler?: () => void;
}

const categories: { id: RecommendationCategory; label: string }[] = [
    { id: 'korean', label: '한인 편의시설 & 맛집 (Coreano)' },
    { id: 'food', label: '로컬 맛집 탐방 (Restaurantes Locales)' },
    { id: 'shopping', label: '쇼핑 및 여가 (Compras)' },
    { id: 'tour', label: '관광 명소 (Turismo)' },
];

const positionOptions: { value: string; label: string }[] = [
    { value: 'object-center', label: '중앙 (Centro)' },
    { value: 'object-top', label: '위쪽 (Arriba)' },
    { value: 'object-bottom', label: '아래쪽 (Abajo)' },
    { value: 'object-left', label: '왼쪽 (Izquierda)' },
    { value: 'object-right', label: '오른쪽 (Derecha)' },
];

const RecommendationFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<RecommendationItem, 'id' | 'imageUrl' | 'imagePath'>, imageFile?: File, imageUrlStr?: string) => Promise<void>;
    itemToEdit?: RecommendationItem | null;
}> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [formData, setFormData] = useState<{
        category: RecommendationCategory;
        name: string;
        description: string;
        tags: string;
        mapUrl: string;
        imagePosition: string;
        imageUrlStr: string;
    }>({
        category: 'food',
        name: '',
        description: '',
        tags: '',
        mapUrl: '',
        imagePosition: 'object-center',
        imageUrlStr: '',
    });
    
    const [imageSource, setImageSource] = useState<'file' | 'url'>('file');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setFormData({
                    category: itemToEdit.category,
                    name: itemToEdit.name,
                    description: itemToEdit.description,
                    tags: itemToEdit.tags.join(', '),
                    mapUrl: itemToEdit.mapUrl,
                    imagePosition: itemToEdit.imagePosition || 'object-center',
                    imageUrlStr: itemToEdit.imageUrl || '',
                });
                setImagePreview(itemToEdit.imageUrl);
                setImageSource('url'); // Default to URL view for editing if exists
            } else {
                setFormData({
                    category: 'food',
                    name: '',
                    description: '',
                    tags: '',
                    mapUrl: '',
                    imagePosition: 'object-center',
                    imageUrlStr: '',
                });
                setImagePreview(null);
                setImageSource('file');
            }
            setImageFile(null);
        }
    }, [itemToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
            
            await onSave({
                category: formData.category,
                name: formData.name,
                description: formData.description,
                tags: tagsArray,
                mapUrl: formData.mapUrl,
                imagePosition: formData.imagePosition as any,
            }, 
            imageSource === 'file' && imageFile ? imageFile : undefined,
            imageSource === 'url' ? formData.imageUrlStr : undefined
            );
            
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? '추천 장소 수정 (Editar)' : '새 추천 장소 추가 (Agregar)'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 (Categoría)</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm">
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이미지 (Imagen)</label>
                    
                    <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="imgSrc" checked={imageSource === 'file'} onChange={() => setImageSource('file')} className="text-primary-600 focus:ring-primary-500" />
                            <span className="text-sm">파일 업로드 (Subir)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="imgSrc" checked={imageSource === 'url'} onChange={() => setImageSource('url')} className="text-primary-600 focus:ring-primary-500" />
                            <span className="text-sm">URL 입력 (Enlace)</span>
                        </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-1/3 aspect-video bg-gray-100 rounded-md border flex items-center justify-center overflow-hidden relative">
                            {imagePreview || (imageSource === 'url' && formData.imageUrlStr) ? (
                                <img 
                                    src={imageSource === 'file' ? imagePreview! : formData.imageUrlStr} 
                                    alt="Preview" 
                                    className={`w-full h-full object-cover ${formData.imagePosition}`} 
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image')}
                                />
                            ) : (
                                <PhotoIcon className="w-10 h-10 text-gray-300" />
                            )}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                            {imageSource === 'file' ? (
                                <div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    <button type="button" onClick={triggerFileInput} className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                        <ArrowUpTrayIcon className="w-5 h-5"/> <span>이미지 선택 (Seleccionar)</span>
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">* 새 이미지를 선택하면 기존 이미지는 삭제됩니다.</p>
                                </div>
                            ) : (
                                <div>
                                    <input type="text" name="imageUrlStr" value={formData.imageUrlStr} onChange={handleChange} placeholder="https://example.com/image.jpg" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" />
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">이미지 정렬 (Alineación)</label>
                                <select name="imagePosition" value={formData.imagePosition} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm">
                                    {positionOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">장소 이름 (Nombre)</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명 (Descripción)</label>
                    <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" required></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">태그 (Tags) - 쉼표(,)로 구분</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="예: 한식, 바베큐, 맛집" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">구글맵 링크 (Enlace Mapa)</label>
                    <input type="text" name="mapUrl" value={formData.mapUrl} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 text-sm" required />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">취소 (Cancelar)</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-lg border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:bg-gray-400">
                        {isSubmitting ? '저장 중...' : '저장 (Guardar)'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export const RecommendationManagement: React.FC<RecommendationManagementProps> = ({ 
    recommendations, 
    addRecommendation, 
    updateRecommendation, 
    deleteRecommendation, 
    removeDuplicates,
    cleanupDefaultData,
    onBack,
    registerBackHandler,
    unregisterBackHandler
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<RecommendationItem | null>(null);
    const [filterCategory, setFilterCategory] = useState<RecommendationCategory | 'all'>('all');

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

    const handleAddNew = () => {
        setItemToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: RecommendationItem) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('정말로 삭제하시겠습니까? (¿Eliminar?)')) {
            await deleteRecommendation(id);
        }
    };
    
    const handleRemoveDuplicates = async () => {
        if (window.confirm('중복된 추천 장소 정보를 모두 삭제하시겠습니까?\n이름이 같은 항목 중 하나만 남기고 나머지는 삭제됩니다.\n(¿Eliminar recomendaciones duplicadas?)')) {
            await removeDuplicates();
        }
    };

    const handleCleanupDefaults = async () => {
        if (window.confirm('경고: 앱에서 기본적으로 제공하던 추천 장소를 모두 삭제하시겠습니까?\n\n직접 등록한 장소는 유지되지만, 기본 데이터는 영구적으로 제거됩니다.')) {
            await cleanupDefaultData();
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemToEdit(null);
    };

    const handleSave = async (data: Omit<RecommendationItem, 'id' | 'imageUrl' | 'imagePath'>, imageFile?: File, imageUrlStr?: string) => {
        if (itemToEdit) {
            const updates: any = { ...data };
            // Only update imageUrl if explicitly provided (file or new url string)
            if (imageUrlStr && !imageFile) {
                updates.imageUrl = imageUrlStr;
            }
            await updateRecommendation(itemToEdit.id, updates, imageFile);
        } else {
            await addRecommendation(data, imageFile, imageUrlStr);
        }
    };

    const filteredItems = filterCategory === 'all' 
        ? recommendations 
        : recommendations.filter(r => r.category === filterCategory);

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-800">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">추천 장소 관리 (Recomendaciones)</h2>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                     <button
                        onClick={handleCleanupDefaults}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm text-sm font-medium transition-colors"
                        title="기본 제공 데이터만 삭제합니다."
                    >
                        기본 데이터 삭제
                    </button>
                    <button
                        onClick={handleRemoveDuplicates}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-sm text-sm font-medium transition-colors"
                    >
                        중복 제거
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm text-sm font-medium transition-colors"
                    >
                        + 추가 (Agregar)
                    </button>
                </div>
            </header>

            <div className="p-4 border-b bg-white flex gap-2 overflow-x-auto whitespace-nowrap flex-shrink-0">
                <button onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${filterCategory === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>전체 (Todos)</button>
                {categories.map(c => (
                    <button key={c.id} onClick={() => setFilterCategory(c.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${filterCategory === c.id ? 'bg-primary-100 text-primary-800 border-primary-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="h-40 bg-gray-100 relative group">
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.name} 
                                    className={`w-full h-full object-cover ${item.imagePosition || 'object-center'}`} 
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image')}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => handleEdit(item)} className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40"><PencilIcon className="w-6 h-6" /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/20 text-white rounded-full hover:bg-red-500"><TrashIcon className="w-6 h-6" /></button>
                                </div>
                                <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                    {categories.find(c => c.id === item.category)?.label.split(' ')[0]}
                                </span>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{item.description}</p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {item.tags.map((tag, i) => (
                                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">#{tag}</span>
                                    ))}
                                </div>
                                <a href={item.mapUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center gap-1 hover:underline mt-auto">
                                    <LinkIcon className="w-3 h-3" /> 지도 보기
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredItems.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        등록된 장소가 없습니다. (No hay recomendaciones)
                    </div>
                )}
            </div>

            <RecommendationFormModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSave} 
                itemToEdit={itemToEdit} 
            />
        </div>
    );
}
