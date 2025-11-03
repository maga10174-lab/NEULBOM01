import { useState, useEffect, useCallback } from 'react';
// FIX: Import GalleryImage to use for type casting.
import type { House, Booking, GalleryMediaItem, GalleryImage } from '../types';
import { db, storage } from '../services/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


const ADMIN_PASSWORDS = ['4751', '3329']; 

export const useGuestHouseData = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const housesQuery = query(collection(db, 'houses'));
    const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const galleryQuery = query(collection(db, 'galleryMedia'), orderBy('order'));

    const unsubHouses = onSnapshot(housesQuery, (snapshot) => {
      const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as House));
      setHouses(housesData);
    }, (error) => console.error("Error fetching houses:", error));

    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);
    }, (error) => console.error("Error fetching bookings:", error));
    
    const unsubGallery = onSnapshot(galleryQuery, (snapshot) => {
      const galleryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryMediaItem));
      setGalleryMedia(galleryData);
      setIsLoading(false); // Consider loaded after gallery (last query)
    }, (error) => {
      console.error("Error fetching gallery:", error);
      setIsLoading(false);
    });

    try {
      const sessionAuth = sessionStorage.getItem('neulbom_auth');
      if (sessionAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Could not read session storage", e);
    }
    

    return () => {
      unsubHouses();
      unsubBookings();
      unsubGallery();
    };
  }, []);

  const updateHouse = async (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => {
    const houseDocRef = doc(db, 'houses', houseId);
    await updateDoc(houseDocRef, updatedData);
  };

  const addBooking = async (newBooking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'flightTicketUrl'>, flightTicket?: File) => {
    let flightTicketUrl = '';
    if (flightTicket) {
      const ticketRef = ref(storage, `flight-tickets/${Date.now()}_${flightTicket.name}`);
      const snapshot = await uploadBytes(ticketRef, flightTicket);
      flightTicketUrl = await getDownloadURL(snapshot.ref);
    }
    
    await addDoc(collection(db, 'bookings'), {
      ...newBooking,
      flightTicketUrl,
      status: 'pending',
      createdAt: Date.now(),
    });
  };

  const confirmBooking = async (bookingId: string) => {
    const bookingDocRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingDocRef, { status: 'confirmed' });
  };

  const deleteBooking = async (bookingId: string) => {
    // Note: This doesn't delete the associated flight ticket from storage to prevent accidental data loss.
    // A cleanup script or more complex logic could handle this.
    await deleteDoc(doc(db, 'bookings', bookingId));
  };
  
  const addGalleryMediaItems = async (items: (Omit<GalleryMediaItem, 'id' | 'order'> & { file?: File })[]) => {
      const batch = writeBatch(db);
      let currentOrder = galleryMedia.length;

      for (const item of items) {
          const docRef = doc(collection(db, "galleryMedia"));
          let newItemData: any = { ...item, order: currentOrder++, id: docRef.id };
          
          if (item.type === 'image' && item.file) {
              const imageRef = ref(storage, `gallery/${docRef.id}_${item.file.name}`);
              const snapshot = await uploadBytes(imageRef, item.file);
              newItemData.url = await getDownloadURL(snapshot.ref);
          }
          delete newItemData.file;
          
          batch.set(docRef, newItemData);
      }
      await batch.commit();
  };

  const updateGalleryMediaItem = async (itemId: string, data: Partial<GalleryMediaItem>, newFile?: File) => {
      const docRef = doc(db, "galleryMedia", itemId);
      let updateData: any = { ...data };

      if (data.type === 'image' && newFile) {
          const imageRef = ref(storage, `gallery/${itemId}_${newFile.name}`);
          const snapshot = await uploadBytes(imageRef, newFile);
          updateData.url = await getDownloadURL(snapshot.ref);
      }
      
      await updateDoc(docRef, updateData);
  };
  
  const deleteGalleryMediaItems = async (itemIds: string[]) => {
    const batch = writeBatch(db);
    for (const id of itemIds) {
        const itemToDelete = galleryMedia.find(m => m.id === id);
        if (itemToDelete && itemToDelete.type === 'image') {
            try {
                // FIX: Explicitly cast `itemToDelete` to `GalleryImage` to ensure the `url` property is accessible.
                // This resolves cases where TypeScript's type narrowing might fail inside a try-catch block.
                const imageRef = ref(storage, (itemToDelete as GalleryImage).url);
                await deleteObject(imageRef);
            } catch (error: any) {
                // If file doesn't exist in storage (e.g., from old data), log error but continue
                if (error.code !== 'storage/object-not-found') {
                    console.error(`Failed to delete image from storage: ${(itemToDelete as GalleryImage).url}`, error);
                }
            }
        }
        batch.delete(doc(db, "galleryMedia", id));
    }
    await batch.commit();
  };
  
  const reorderGalleryMedia = async (newList: GalleryMediaItem[]) => {
      const batch = writeBatch(db);
      newList.forEach((item, index) => {
          const docRef = doc(db, "galleryMedia", item.id);
          batch.update(docRef, { order: index });
      });
      await batch.commit();
  };


  const login = (password: string): boolean => {
    if (ADMIN_PASSWORDS.includes(password)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('neulbom_auth', 'true');
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('neulbom_auth');
  };

  return {
    houses,
    bookings,
    galleryMedia,
    updateHouse,
    addBooking,
    confirmBooking,
    deleteBooking,
    addGalleryMediaItems,
    updateGalleryMediaItem,
    deleteGalleryMediaItems,
    reorderGalleryMedia,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
};
