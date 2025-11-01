import React, { useState, useEffect, useRef } from 'react';
import type { GalleryMediaItem, GalleryImage, GalleryVideo, GalleryCategory } from '../types';
import { Modal } from './Modal';
import { PhotoIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, CameraIcon, PencilIcon, ArrowUpTrayIcon } from './icons';

interface MediaFormState {
  type: 'image' | 'video';
  url: string;
  alt: string;
  youtubeId: string;
  title: string;
  category: GalleryCategory;
}

const MediaEditForm: React.FC<{
  mediaItem: Partial<MediaFormState>;
  onSave: (data: MediaFormState | MediaFormState[]) => void;
  onCancel: () => void;
}> = ({ mediaItem, onSave, onCancel }) => {
  const [formState, setFormState] = useState<MediaFormState>({
    type: 'image',
    url: '',
    alt: '',
    youtubeId: '',
    title: '',
    category: 'guesthouse',
    ...mediaItem,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stagedFiles, setStagedFiles] = useState<{url: string; name: string}[]>([]);

  useEffect(() => {
    setStagedFiles([]);
    setFormState({
      type: 'image',
      url: '',
      alt: '',
      youtubeId: '',
      title: '',
      category: 'guesthouse',
      ...mediaItem,
    });
  }, [mediaItem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedFiles.length > 0) {
      const itemsToSave: MediaFormState[] = stagedFiles.map(file => ({
        type: 'image',
        url: file.url,
        alt: file.name,
        youtubeId: '',
        title: '',
        category: formState.category,
      }));
      onSave(itemsToSave);
    } else {
      onSave(formState);
    }
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      setFormState(prev => ({ ...prev, url: '', alt: '' }));
      setStagedFiles([]);
      
      try {
        // FIX: Explicitly type `file` as `File` to resolve potential type inference issues where it might be treated as `unknown`.
        const filePromises = Array.from(files).map(async (file: File) => {
            const base64 = await fileToBase64(file);
            return { url: base64, name: file.name };
        });
        const processedFiles = await Promise.all(filePromises);
        setStagedFiles(processedFiles);

      } catch (error) {
          console.error("Error converting files to base64:", error);
          alert("파일을 업로드하는 중 오류가 발생했습니다.");
      } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
              fileInputRef.current.value = "";
          }
      }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">카테고리</label>
        <select
          id="category"
          name="category"
          value={formState.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="guesthouse">게스트 하우스</option>
          <option value="restaurant">늘봄 식당</option>
        </select>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">종류</label>
        <select
          id="type"
          name="type"
          value={formState.type}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="image">이미지</option>
          <option value="video">비디오 (유튜브)</option>
        </select>
      </div>

      {formState.type === 'image' ? (
        <>
          {stagedFiles.length === 0 && (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">이미지 URL</label>
              <input type="text" name="url" id="url" value={formState.url} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="https://... 또는 아래에서 업로드" required={stagedFiles.length === 0} />
            </div>
          )}

          <div className="mt-2">
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
              />
              <div className="grid grid-cols-2 gap-3">
                   <button type="button" onClick={() => triggerFileInput('file')} className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                      <ArrowUpTrayIcon className="w-5 h-5"/>
                      <span>파일 업로드</span>
                  </button>
                   <button type="button" onClick={() => triggerFileInput('camera')} className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                      <CameraIcon className="w-5 h-5"/>
                      <span>카메라 촬영</span>
                  </button>
              </div>
          </div>

          {isUploading && <p className="text-sm text-gray-500 mt-2 text-center">업로드 중...</p>}
          
          {stagedFiles.length > 0 ? (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">업로드될 사진 ({stagedFiles.length}개)</label>
              <div className="mt-1 grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-gray-50">
                {stagedFiles.map((file, index) => (
                  <img key={index} src={file.url} alt={file.name} className="w-full h-auto object-cover rounded" title={file.name} />
                ))}
              </div>
            </div>
          ) : formState.url && (
              <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">미리보기</label>
                  <img src={formState.url} alt="미리보기" className="mt-1 w-full h-auto max-h-48 object-contain rounded-md border border-gray-200 bg-gray-50" />
              </div>
          )}

          {stagedFiles.length === 0 && (
            <div>
              <label htmlFor="alt" className="block text-sm font-medium text-gray-700">대체 텍스트 (설명)</label>
              <input type="text" name="alt" id="alt" value={formState.alt} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" required={stagedFiles.length === 0} />
            </div>
          )}
          {stagedFiles.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">사진 설명은 저장 후 각 항목을 수정하여 개별적으로 추가할 수 있습니다. 파일명이 기본값으로 사용됩니다.</p>
          )}
        </>
      ) : (
        <>
          <div>
            <label htmlFor="youtubeId" className="block text-sm font-medium text-gray-700">유튜브 비디오 ID</label>
            <input type="text" name="youtubeId" id="youtubeId" value={formState.youtubeId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="LXb3EKWsInQ" required />
            <p className="text-xs text-gray-500 mt-1">예: https://www.youtube.com/watch?v=<strong className="text-red-500">LXb3EKWsInQ</strong> 주소에서 ID 부분만 입력하세요.</p>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">비디오 제목</label>
            <input type="text" name="title" id="title" value={formState.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">취소</button>
        <button type="submit" className="rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700">저장</button>
      </div>
    </form>
  );
};

export const GalleryManagement: React.FC<{
  galleryMedia: GalleryMediaItem[];
  updateGalleryMedia: (media: GalleryMediaItem[]) => void;
}> = ({ galleryMedia, updateGalleryMedia }) => {
  const [editingItem, setEditingItem] = useState<GalleryMediaItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleSave = (data: MediaFormState | MediaFormState[]) => {
    if (Array.isArray(data)) {
      const newItems: GalleryMediaItem[] = data.map(itemData => ({
        id: `img-${Date.now()}-${Math.random()}`,
        type: 'image',
        url: itemData.url,
        alt: itemData.alt,
        category: itemData.category,
      }));
      updateGalleryMedia([...galleryMedia, ...newItems]);
    } else if (editingItem) { // Edit existing
      const updatedItem: GalleryMediaItem = data.type === 'image'
        ? { id: editingItem.id, type: 'image', url: data.url, alt: data.alt, category: data.category }
        : { id: editingItem.id, type: 'video', youtubeId: data.youtubeId, title: data.title, category: data.category };
      updateGalleryMedia(galleryMedia.map(item => item.id === editingItem.id ? updatedItem : item));
    } else { // Add new
      const newItem: GalleryMediaItem = data.type === 'image'
        ? { id: `img-${Date.now()}`, type: 'image', url: data.url, alt: data.alt, category: data.category }
        : { id: `vid-${Date.now()}`, type: 'video', youtubeId: data.youtubeId, title: data.title, category: data.category };
      updateGalleryMedia([...galleryMedia, newItem]);
    }
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      updateGalleryMedia(galleryMedia.filter(item => item.id !== id));
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= galleryMedia.length) return;

    const newList = [...galleryMedia];
    const item = newList.splice(index, 1)[0];
    newList.splice(newIndex, 0, item);
    updateGalleryMedia(newList);
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
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(galleryMedia.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    if (window.confirm(`선택된 ${selectedItems.size}개의 항목을 정말로 삭제하시겠습니까?`)) {
      const newMediaList = galleryMedia.filter(item => !selectedItems.has(item.id));
      updateGalleryMedia(newMediaList);
      setSelectedItems(new Set());
    }
  };


  const formInitialData = editingItem
    ? {
      type: editingItem.type,
      url: editingItem.type === 'image' ? editingItem.url : '',
      alt: editingItem.type === 'image' ? editingItem.alt : '',
      youtubeId: editingItem.type === 'video' ? editingItem.youtubeId : '',
      title: editingItem.type === 'video' ? editingItem.title : '',
      category: editingItem.category || 'guesthouse',
    }
    : { type: 'image' as const, category: 'guesthouse' as const };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <PhotoIcon className="w-8 h-8 text-primary-600"/>
            시설 사진/비디오 관리
        </h2>
        <button
          onClick={handleAddNew}
          className="rounded-md bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          + 새 항목 추가
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    onChange={handleSelectAll}
                    checked={galleryMedia.length > 0 && selectedItems.size === galleryMedia.length}
                    disabled={galleryMedia.length === 0}
                    aria-label="모두 선택"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                    {selectedItems.size > 0 ? `${selectedItems.size}개 선택됨` : '모두 선택'}
                </label>
            </div>
            {selectedItems.size > 0 && (
                <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-colors"
                >
                    <TrashIcon className="w-4 h-4" />
                    <span>선택 삭제</span>
                </button>
            )}
        </div>

        <ul className="divide-y divide-gray-200 -mx-4 sm:-mx-6">
          {galleryMedia.map((item, index) => {
            const isSelected = selectedItems.has(item.id);
            return (
              <li key={item.id} className={`py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${isSelected ? 'bg-primary-50' : ''}`}>
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
                    checked={isSelected}
                    onChange={() => handleSelectItem(item.id)}
                    aria-label={`${item.type === 'image' ? item.alt : item.title} 선택`}
                  />
                  <div className="w-24 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.alt} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.552 11.41a3.001 3.001 0 0 0-4.104 4.105m4.104-4.105a3.001 3.001 0 1 0-4.104 4.105m4.104-4.105L19.5 15.5m-3-3-3-5.5-3 5.5m0 0a3.001 3.001 0 1 0 5.196 3.033 3.001 3.001 0 0 0-5.196-3.033Z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="text-sm flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800 truncate">{item.type === 'image' ? item.alt : item.title}</p>
                       <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.category === 'guesthouse' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {item.category === 'guesthouse' ? '게스트하우스' : '늘봄식당'}
                      </span>
                    </div>
                    <p className="text-gray-500 truncate max-w-xs">{item.type === 'image' ? item.url : `Youtube ID: ${item.youtubeId}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <div className="flex flex-col">
                      <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                          <ArrowUpIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => moveItem(index, 'down')} disabled={index === galleryMedia.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                          <ArrowDownIcon className="w-5 h-5"/>
                      </button>
                  </div>
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>수정</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>삭제</span>
                  </button>
                </div>
              </li>
            );
          })}
           {galleryMedia.length === 0 && (
                <li className="py-10 text-center text-gray-500">
                    표시할 미디어가 없습니다. 새 항목을 추가해주세요.
                </li>
            )}
        </ul>
      </div>

      <Modal isOpen={isAddingNew} onClose={handleCloseModal} title={editingItem ? "미디어 수정" : "새 미디어 추가"}>
        <MediaEditForm 
            mediaItem={formInitialData}
            onSave={handleSave} 
            onCancel={handleCloseModal} 
        />
      </Modal>
    </div>
  );
};