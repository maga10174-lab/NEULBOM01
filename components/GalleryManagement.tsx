
import React, { useState, useEffect, useRef } from 'react';
import type { GalleryMediaItem, GalleryImage, GalleryVideo, GalleryCategory } from '../types';
import { Modal } from './Modal';
import { PhotoIcon, TrashIcon, CameraIcon, PencilIcon, ArrowUpTrayIcon, EyeIcon, EyeSlashIcon } from './icons';

const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        const quality = 0.7;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Failed to get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            }));
                        } else {
                            reject(new Error('Canvas to Blob conversion failed'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};


interface MediaFormState {
  type: 'image' | 'video';
  url: string;
  alt: string;
  youtubeId: string;
  title: string;
  category: GalleryCategory;
  isVisible: boolean;
}

const MediaEditForm: React.FC<{
  mediaItem?: GalleryMediaItem;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}> = ({ mediaItem, onSave, onCancel }) => {
  const [formState, setFormState] = useState<MediaFormState>({
    type: 'image', url: '', alt: '', youtubeId: '', title: '', category: 'guesthouse', isVisible: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (mediaItem) {
      setFormState({
        type: mediaItem.type,
        url: mediaItem.type === 'image' ? mediaItem.url : '',
        alt: mediaItem.type === 'image' ? mediaItem.alt : '',
        youtubeId: mediaItem.type === 'video' ? mediaItem.youtubeId : '',
        title: mediaItem.type === 'video' ? mediaItem.title : '',
        category: mediaItem.category || 'guesthouse',
        isVisible: mediaItem.isVisible ?? true,
      });
    } else {
      setFormState({ type: 'image', url: '', alt: '', youtubeId: '', title: '', category: 'guesthouse', isVisible: true });
    }
    setStagedFiles([]);
    setPreviews([]);
  }, [mediaItem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
        if (stagedFiles.length > 0) { 
            await onSave({ files: stagedFiles, category: formState.category });
        } else if (mediaItem) { 
            await onSave({ itemId: mediaItem.id, data: formState });
        } else { 
            await onSave({ data: formState });
        }
    } catch (error) {
        console.error("Error saving media:", error);
        alert("저장 중 오류가 발생했습니다.");
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      setIsCompressing(true);
      setStagedFiles([]);
      setPreviews([]);
      
      try {
          const fileList = Array.from(files);
          const compressedFiles = await Promise.all(
              fileList.map((file: File) => compressImage(file))
          );
          setStagedFiles(compressedFiles);
          const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
          setPreviews(newPreviews);
      } catch (error) {
          console.error("Image compression failed:", error);
          alert("이미지 압축에 실패했습니다. 다른 파일을 시도해주세요.");
      } finally {
          setIsCompressing(false);
      }
      
      setFormState(prev => ({ ...prev, url: '', alt: '' }));
  };

  const triggerFileInput = (mode: 'file' | 'camera') => {
      if (fileInputRef.current) {
          if (mode === 'camera') {
              fileInputRef.current.removeAttribute('multiple');
              fileInputRef.current.setAttribute('capture', 'environment');
          } else {
              fileInputRef.current.setAttribute('multiple', 'true');
              fileInputRef.current.removeAttribute('capture');
          }
          fileInputRef.current.click();
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="category" className="block text-base font-medium text-gray-700 mb-2">카테고리 (Categoría)</label>
        <select id="category" name="category" value={formState.category} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base">
          <option value="guesthouse">게스트 하우스 (Guesthouse)</option>
          <option value="restaurant">늘봄 식당 (Restaurante)</option>
        </select>
      </div>
      <div>
        <label htmlFor="type" className="block text-base font-medium text-gray-700 mb-2">종류 (Tipo)</label>
        <select id="type" name="type" value={formState.type} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" disabled={!!mediaItem || stagedFiles.length > 0}>
          <option value="image">이미지 (Foto)</option>
          <option value="video">비디오 (Youtube)</option>
        </select>
      </div>

      {formState.type === 'image' ? (
        <>
          {!mediaItem && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <div className="grid grid-cols-2 gap-3">
                <button type="button" disabled={isCompressing} onClick={() => triggerFileInput('file')} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 px-4 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed">
                  <ArrowUpTrayIcon className="w-5 h-5"/> <span>{isCompressing ? '압축 중 (Comprimiendo)' : '업로드 (Subir)'}</span>
                </button>
                <button type="button" disabled={isCompressing} onClick={() => triggerFileInput('camera')} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 px-4 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed">
                  <CameraIcon className="w-5 h-5"/> <span>촬영 (Cámara)</span>
                </button>
              </div>
            </>
          )}

          {stagedFiles.length > 0 && (
            <div className="mt-4">
              <label className="block text-base font-medium text-gray-700 mb-2">업로드될 사진 ({stagedFiles.length}개)</label>
              <div className="mt-1 grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-gray-50">
                {previews.map((preview, index) => (
                  <img key={index} src={preview} alt={`preview ${index}`} className="w-full h-auto object-cover rounded" />
                ))}
              </div>
            </div>
          )}

          {mediaItem && mediaItem.type === 'image' && (
              <>
                <img src={formState.url} alt="미리보기" className="mt-1 w-full h-auto max-h-48 object-contain rounded-md border" />
                <div>
                    <label htmlFor="alt" className="block text-base font-medium text-gray-700 mb-2">설명 (Descripción)</label>
                    <input type="text" name="alt" id="alt" value={formState.alt} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" required />
                </div>
              </>
          )}

        </>
      ) : (
        <>
          <div>
            <label htmlFor="youtubeId" className="block text-base font-medium text-gray-700 mb-2">Youtube ID</label>
            <input type="text" name="youtubeId" id="youtubeId" value={formState.youtubeId} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" placeholder="예: LXb3EKWsInQ" required />
          </div>
          <div>
            <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-2">제목 (Título)</label>
            <input type="text" name="title" id="title" value={formState.title} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base" required />
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50">취소 (Cancelar)</button>
        <button type="submit" disabled={isProcessing || isCompressing} className="rounded-lg border border-transparent bg-primary-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-primary-700 disabled:bg-gray-400">
            {isProcessing ? '저장 중...' : (isCompressing ? '압축 중...' : '저장 (Guardar)')}
        </button>
      </div>
    </form>
  );
};

const MediaCard: React.FC<{
  item: GalleryMediaItem;
  isSelected: boolean;
  onSelectItem: (id: string) => void;
  onToggleVisibility: (item: GalleryMediaItem) => void;
  onEdit: (item: GalleryMediaItem) => void;
  onDelete: (id: string) => void;
}> = ({ item, isSelected, onSelectItem, onToggleVisibility, onEdit, onDelete }) => {
  const isVisible = item.isVisible ?? true;

  return (
    <div className={`relative group border rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${isSelected ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-200'} ${!isVisible ? 'opacity-60 bg-gray-100' : ''}`}>
      <div className="absolute top-2 left-2 z-10 bg-white/50 rounded-full">
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onSelectItem(item.id)}
          className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      </div>

      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
        {item.type === 'image' ? (
          <img src={item.url} alt={item.alt} className="w-full h-full object-cover" />
        ) : (
          <img src={`https://i.ytimg.com/vi/${item.youtubeId}/mqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end items-center gap-1">
        <button 
          onClick={() => onToggleVisibility(item)} 
          title={isVisible ? "공개 상태 (클릭하여 숨김)" : "숨김 상태 (클릭하여 공개)"} 
          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
        >
          {isVisible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => onEdit(item)} 
          title="수정"
          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onDelete(item.id)} 
          title="삭제"
          className="p-2 rounded-full bg-white/20 text-white hover:bg-red-500 transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
       <div className={`absolute top-2 right-2 z-10 text-xs font-bold px-2 py-1 rounded-full ${isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
          {isVisible ? "공개" : "숨김"}
        </div>
    </div>
  );
};


export const GalleryManagement: React.FC<{
  galleryMedia: GalleryMediaItem[];
  addGalleryMediaItems: (files: File[], category: GalleryCategory) => Promise<void>;
  addGalleryVideoItem: (videoData: Omit<GalleryVideo, 'id' | 'type' | 'order'>) => Promise<void>;
  updateGalleryMediaItem: (itemId: string, data: Partial<GalleryMediaItem>) => Promise<void>;
  deleteGalleryMediaItems: (itemIds: string[]) => Promise<void>;
  reorderGalleryMedia: (orderedMedia: GalleryMediaItem[]) => Promise<void>;
  registerBackHandler?: (handler: () => boolean) => void;
  unregisterBackHandler?: () => void;
}> = ({ galleryMedia, addGalleryMediaItems, addGalleryVideoItem, updateGalleryMediaItem, deleteGalleryMediaItems, registerBackHandler, unregisterBackHandler }) => {
  const [editingItem, setEditingItem] = useState<GalleryMediaItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Handle Back Button for Modal
  useEffect(() => {
    if (isAddingNew && registerBackHandler) {
        registerBackHandler(() => {
            handleCloseModal();
            return true;
        });
    } else if (unregisterBackHandler) {
        unregisterBackHandler();
    }
  }, [isAddingNew, registerBackHandler, unregisterBackHandler]);
  
  const handleSave = async (payload: any) => {
    if (payload.files) { 
        await addGalleryMediaItems(payload.files, payload.category);
    } else if (payload.itemId) { 
        const { itemId, data } = payload;
        const updateData = data.type === 'image'
            ? { alt: data.alt, category: data.category }
            : { title: data.title, youtubeId: data.youtubeId, category: data.category };
        await updateGalleryMediaItem(itemId, updateData);
    } else { 
        const { data } = payload;
        if(data.type === 'video') {
            await addGalleryVideoItem({title: data.title, youtubeId: data.youtubeId, category: data.category});
        }
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      await deleteGalleryMediaItems([id]);
    }
  };
  
  const handleToggleVisibility = async (item: GalleryMediaItem) => {
    const newVisibility = !(item.isVisible ?? true);
    await updateGalleryMediaItem(item.id, { isVisible: newVisibility });
  };
  
  const handleEdit = (item: GalleryMediaItem) => {
    setEditingItem(item);
    setIsAddingNew(true);
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setIsAddingNew(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsAddingNew(false);
  };
  
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedItems(new Set(galleryMedia.map(item => item.id)));
    else setSelectedItems(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;
    if (window.confirm(`선택된 ${selectedItems.size}개의 항목을 정말로 삭제하시겠습니까?`)) {
      await deleteGalleryMediaItems(Array.from(selectedItems));
      setSelectedItems(new Set());
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <PhotoIcon className="w-8 h-8 text-primary-600"/>
            사진/비디오 관리 (Galería)
        </h2>
        <button onClick={handleAddNew} className="rounded-lg bg-primary-600 py-3 px-5 text-base font-medium text-white shadow-sm hover:bg-primary-700">
          + 추가 (Agregar)
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center">
                <input type="checkbox" onChange={handleSelectAll} checked={galleryMedia.length > 0 && selectedItems.size === galleryMedia.length} disabled={galleryMedia.length === 0} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label className="ml-3 text-base font-medium text-gray-700">{selectedItems.size > 0 ? `${selectedItems.size}개 선택 (Seleccionado)` : '모두 선택 (Todos)'}</label>
            </div>
            {selectedItems.size > 0 && (
                <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 text-base font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
                    <TrashIcon className="w-5 h-5" /> <span>삭제 (Eliminar)</span>
                </button>
            )}
        </div>

        {galleryMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryMedia.map(item => (
              <MediaCard
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onSelectItem={handleSelectItem}
                onToggleVisibility={handleToggleVisibility}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">
            표시할 미디어가 없습니다. 새 항목을 추가해주세요.
          </div>
        )}
      </div>

      <Modal isOpen={isAddingNew} onClose={handleCloseModal} title={editingItem ? "미디어 수정 (Editar)" : "새 미디어 추가 (Agregar)"} size="lg">
        <MediaEditForm mediaItem={editingItem || undefined} onSave={handleSave} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};
