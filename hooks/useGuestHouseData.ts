import { useState, useEffect, useRef } from 'react';
import type { House, Booking, Guest, GalleryMediaItem, GalleryCategory, GalleryImage, GalleryVideo, StreetName } from '../types';
import { db, storage, auth } from '../services/firebase'; // Import central auth instance
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';

const defaultHouses: Omit<House, 'id'>[] = [
    { street: 'Arteal', number: '413', rooms: 3, capacity: 3, guests: [] },
    { street: 'Arteal', number: '415', rooms: 3, capacity: 3, guests: [] },
    { street: 'Arteal', number: '416', rooms: 3, capacity: 3, guests: [] },
    { street: 'Arteal', number: '428', rooms: 3, capacity: 3, guests: [] },
    { street: 'Arteal', number: '431', rooms: 3, capacity: 3, guests: [] },
    { street: 'Arteal', number: '432', rooms: 3, capacity: 3, guests: [] },
    { street: 'Arteal', number: '447', rooms: 3, capacity: 3, guests: [] },
    { street: 'Retamar', number: '418', rooms: 3, capacity: 3, guests: [] },
    { street: 'Retamar', number: '420', rooms: 3, capacity: 3, guests: [] },
    { street: 'Tahal', number: '506', rooms: 4, capacity: 4, guests: [] },
    { street: 'Ubedas', number: '407', rooms: 3, capacity: 3, guests: [] },
    { street: 'Ubedas', number: '433', rooms: 3, capacity: 3, guests: [] },
    { street: 'Ragol', number: '507', rooms: 3, capacity: 3, guests: [] },
    { street: 'Ragol', number: '509', rooms: 3, capacity: 3, guests: [] },
    { street: 'Ragol', number: '443', rooms: 3, capacity: 3, guests: [] },
    { street: 'Ragol', number: '453', rooms: 3, capacity: 3, guests: [] },
    { street: 'Ragol', number: '480', rooms: 4, capacity: 5, guests: [] },
    { street: 'Ragol', number: '489', rooms: 3, capacity: 3, guests: [] },
    { street: 'Ragol', number: '491', rooms: 3, capacity: 3, guests: [] },
    { street: 'Vera', number: '528', rooms: 4, capacity: 4, guests: [] },
    { street: 'PRIVADA3', number: '231', rooms: 4, capacity: 5, guests: [] },
    { street: 'PRIVADA6', number: '415', rooms: 3, capacity: 3, guests: [] },
];


export const useGuestHouseData = (onNewBooking?: (booking: Booking) => void) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const bookingsInitialLoad = useRef(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsLoading(false); 
    });

    return () => unsubscribeAuth();
  }, []);

  // --- PUBLIC DATA FETCHING (Gallery) ---
  // This runs for everyone, regardless of login state.
  useEffect(() => {
    const galleryQuery = query(collection(db, 'gallery'), orderBy('order'));
    const unsubGallery = onSnapshot(galleryQuery, (snapshot) => {
      const galleryData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GalleryMediaItem));
      setGalleryMedia(galleryData);
    }, (error) => {
      console.error("Error fetching public gallery:", error);
    });
    
    return () => unsubGallery();
  }, []);

  // --- ADMIN-ONLY DATA FETCHING (Houses, Bookings) ---
  // This runs only when the user is authenticated.
  useEffect(() => {
    if (!isAuthenticated) {
        setHouses([]);
        setBookings([]);
        bookingsInitialLoad.current = true; // Reset for next login
        return;
    }
    
    const housesQuery = query(collection(db, 'houses'));
    const bookingsQuery = query(collection(db, 'bookings'), orderBy('arrivalDate', 'desc'));

    const unsubHouses = onSnapshot(housesQuery, async (snapshot) => {
      
      const syncDefaultHouses = async (currentHouses: House[]) => {
        const existingHouseKeys = new Set(currentHouses.map(h => `${h.street}-${h.number}`));
        const missingHouses = defaultHouses.filter(defaultHouse => {
          const key = `${defaultHouse.street}-${defaultHouse.number}`;
          return !existingHouseKeys.has(key);
        });

        if (missingHouses.length > 0) {
          console.log(`Found ${missingHouses.length} missing houses in DB. Syncing...`);
          const batch = writeBatch(db);
          missingHouses.forEach(house => {
            const docRef = doc(collection(db, 'houses'));
            batch.set(docRef, house);
          });
          await batch.commit();
          console.log("Missing houses have been added to the database.");
          return true;
        }
        return false;
      };

      const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Partial<House> }));
      const validHouses: House[] = [];
      const invalidHouses: any[] = [];

      for (const house of rawData) {
        if (house.street && typeof house.number !== 'undefined') {
          validHouses.push({
            guests: [],
            rooms: 3, 
            capacity: 3, 
            ...house,
          } as House);
        } else {
          invalidHouses.push(house);
        }
      }
      
      if (invalidHouses.length > 0) {
        console.warn("다음 주택 데이터가 유효하지 않아 목록에서 제외되었습니다 (필수 필드 누락):", invalidHouses);
      }
      
      const changesMade = await syncDefaultHouses(validHouses);
      if (!changesMade) {
          setHouses(validHouses);
      }

    }, (error) => {
      console.error("Error fetching houses:", error);
    });

    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      setBookings(bookingsData);

      if (bookingsInitialLoad.current) {
        bookingsInitialLoad.current = false;
        return; 
      }

      if (onNewBooking) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newBooking = { id: change.doc.id, ...change.doc.data() } as Booking;
            if (newBooking.status === 'pending') {
              onNewBooking(newBooking);
            }
          }
        });
      }
    }, (error) => {
      console.error("Error fetching bookings:", error);
    });
    
    return () => {
      unsubHouses();
      unsubBookings();
    };
  }, [isAuthenticated, onNewBooking]);

  // --- CRUD Operations ---

  const updateHouse = async (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => {
    const houseDocRef = doc(db, 'houses', houseId);
    await updateDoc(houseDocRef, updatedData);
  };

  const addBooking = async (newBooking: Omit<Booking, 'id' | 'status' | 'flightTicketUrl'>, flightTicket?: File) => {
    let flightTicketUrl: string | undefined = undefined;
    if (flightTicket) {
      const ticketRef = ref(storage, `flight-tickets/${Date.now()}-${flightTicket.name}`);
      const snapshot = await uploadBytes(ticketRef, flightTicket);
      flightTicketUrl = await getDownloadURL(snapshot.ref);
    }
    
    const bookingData: { [key: string]: any } = {
      ...newBooking,
      flightTicketUrl,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const cleanedBookingData: { [key: string]: any } = {};
    Object.keys(bookingData).forEach(key => {
      if (bookingData[key] !== undefined) {
        cleanedBookingData[key] = bookingData[key];
      }
    });

    await addDoc(collection(db, 'bookings'), cleanedBookingData);
  };

  const confirmBooking = async (bookingId: string, houseId: string) => {
    const batch = writeBatch(db);

    const bookingDocRef = doc(db, 'bookings', bookingId);
    const bookingToConfirm = bookings.find(b => b.id === bookingId);
    if (!bookingToConfirm) {
      throw new Error(`Booking with ID ${bookingId} not found in local state.`);
    }

    const houseDocRef = doc(db, 'houses', houseId);
    const houseToUpdate = houses.find(h => h.id === houseId);
    if (!houseToUpdate) {
      throw new Error(`House with ID ${houseId} not found in local state.`);
    }

    const newGuest: Guest = {
      id: `guest_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      bookingId: bookingToConfirm.id,
      guestName: bookingToConfirm.guestName,
      guestCompany: '', 
      rentalCar: '', 
      numberOfGuests: bookingToConfirm.numberOfGuests || 1,
      checkInDate: bookingToConfirm.arrivalDate,
      checkOutDate: bookingToConfirm.departureDate,
    };
    
    const updatedGuests = [...houseToUpdate.guests, newGuest];

    batch.update(bookingDocRef, { 
      status: 'confirmed',
      houseId: houseId,
      houseInfo: {
        street: houseToUpdate.street,
        number: houseToUpdate.number,
      }
    });
    batch.update(houseDocRef, { guests: updatedGuests });

    await batch.commit();
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      console.log(`Attempting to delete booking: ${bookingId}`);
      let flightTicketUrlToDelete: string | undefined;
  
      await runTransaction(db, async (transaction) => {
        const bookingDocRef = doc(db, 'bookings', bookingId);
        const bookingDoc = await transaction.get(bookingDocRef);
  
        if (!bookingDoc.exists()) {
          console.warn(`Booking ${bookingId} not found in transaction. It might have been already deleted.`);
          return;
        }
  
        const bookingData = bookingDoc.data() as Booking;
        flightTicketUrlToDelete = bookingData.flightTicketUrl;
  
        if (bookingData.status === 'confirmed' && bookingData.houseId) {
          console.log(`Booking ${bookingId} is confirmed for house ${bookingData.houseId}. Removing guest entry.`);
          const houseDocRef = doc(db, 'houses', bookingData.houseId);
          const houseDoc = await transaction.get(houseDocRef);
  
          if (houseDoc.exists()) {
            const houseData = houseDoc.data() as House;
            const initialGuestCount = (houseData.guests || []).length;
            
            const updatedGuests = (houseData.guests || []).filter(guest => {
                // Primary, reliable match: Use the bookingId if it exists on the guest object.
                if (guest.bookingId) {
                    return guest.bookingId !== bookingId;
                }
                // Fallback for older data that might lack a bookingId.
                // This is less precise but handles legacy cases.
                const isLegacyMatch = guest.guestName === bookingData.guestName &&
                                      guest.checkInDate === bookingData.arrivalDate &&
                                      guest.checkOutDate === bookingData.departureDate;
                return !isLegacyMatch;
            });
  
            if (updatedGuests.length < initialGuestCount) {
                console.log(`Guest removed from house ${bookingData.houseId}. Updating guests list.`);
                transaction.update(houseDocRef, { guests: updatedGuests });
            } else {
                console.warn(`No matching guest found in house ${bookingData.houseId} for booking ${bookingId}. House guest list remains unchanged.`);
            }
          } else {
            console.warn(`House ${bookingData.houseId} for booking ${bookingId} not found. Cannot remove guest entry.`);
          }
        }
        
        console.log(`Deleting booking document ${bookingId}.`);
        transaction.delete(bookingDocRef);
      });
  
      if (flightTicketUrlToDelete) {
          try {
              const ticketRef = ref(storage, flightTicketUrlToDelete);
              await deleteObject(ticketRef);
              console.log(`Associated flight ticket deleted from storage for booking ${bookingId}.`);
          } catch (storageError: any) {
              if (storageError.code !== 'storage/object-not-found') {
                  console.error(`Error deleting flight ticket for booking ${bookingId}:`, storageError);
              }
          }
      }
      console.log(`Successfully completed deletion process for booking ${bookingId}.`);
    } catch (error) {
      console.error(`Failed to delete booking ${bookingId} due to a transaction error:`, error);
      alert("예약 삭제 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해 주세요.");
    }
  };
  
  const addGalleryMediaItems = async (files: File[], category: GalleryCategory) => {
      const batch = writeBatch(db);
      const currentMaxOrder = galleryMedia.length > 0 ? Math.max(...galleryMedia.map(item => item.order)) : -1;

      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = `gallery/${Date.now()}-${file.name}`;
          const storageRef = ref(storage, filePath);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);

          const newMediaDocRef = doc(collection(db, 'gallery'));
          const newMediaItem: Omit<GalleryImage, 'id'> = {
              type: 'image',
              url: downloadURL,
              filePath: filePath, // Store the internal path
              alt: file.name,
              category,
              order: currentMaxOrder + 1 + i,
              isVisible: true,
          };
          batch.set(newMediaDocRef, newMediaItem);
      }
      await batch.commit();
  };
  
  const addGalleryVideoItem = async (videoData: Omit<GalleryVideo, 'id' | 'order' | 'type'>) => {
     const currentMaxOrder = galleryMedia.length > 0 ? Math.max(...galleryMedia.map(item => item.order)) : -1;
     const newVideoItem: Omit<GalleryVideo, 'id'> = {
         ...videoData,
         type: 'video',
         order: currentMaxOrder + 1,
         isVisible: true,
     };
     await addDoc(collection(db, 'gallery'), newVideoItem);
  };
  
  const updateGalleryMediaItem = async (itemId: string, data: Partial<GalleryMediaItem>) => {
      await updateDoc(doc(db, 'gallery', itemId), data);
  };

  const deleteGalleryMediaItems = async (itemIds: string[]) => {
      const batch = writeBatch(db);
      const deletePromises: Promise<void>[] = [];

      for (const id of itemIds) {
          const itemToDelete = galleryMedia.find(item => item.id === id);
          if (itemToDelete) {
              if (itemToDelete.type === 'image') {
                  const imageItem = itemToDelete as GalleryImage;
                  if (imageItem.filePath) {
                    const imageRef = ref(storage, imageItem.filePath);
                    deletePromises.push(deleteObject(imageRef).catch(e => console.warn(`Could not delete file by path: ${imageItem.filePath}`, e)));
                  } else if (imageItem.url) {
                    try {
                      const imageRef = ref(storage, imageItem.url);
                      deletePromises.push(deleteObject(imageRef).catch(e => console.warn("Could not delete file by URL, it might not exist.", e)));
                    } catch (e) {
                      console.error("Invalid URL for deletion, skipping:", imageItem.url);
                    }
                  }
              }
              batch.delete(doc(db, 'gallery', id));
          }
      }
      
      await Promise.all(deletePromises);
      await batch.commit();
  };
  
  const reorderGalleryMedia = async (orderedMedia: GalleryMediaItem[]) => {
      const batch = writeBatch(db);
      orderedMedia.forEach((item, index) => {
          const docRef = doc(db, 'gallery', item.id);
          batch.update(docRef, { order: index });
      });
      await batch.commit();
  };

  const login = async (email: string, password: string):Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const logout = async ():Promise<void> => {
    await signOut(auth);
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
    addGalleryVideoItem,
    updateGalleryMediaItem,
    deleteGalleryMediaItems,
    reorderGalleryMedia,
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };
};