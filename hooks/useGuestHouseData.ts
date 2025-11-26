
import { useState, useEffect, useRef } from 'react';
import type { House, Booking, Guest, GalleryMediaItem, GalleryCategory, GalleryImage, GalleryVideo, StreetName, Car, RecommendationItem, RecommendationCategoryConfig, RecommendationCategory } from '../types';
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
  setDoc,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInAnonymously, User } from 'firebase/auth';

const defaultHouses: Omit<House, 'id'>[] = [
    { street: 'Arteal', number: '413', rooms: 3, capacity: 5, guests: [], utilities: { gas: '202580', water: '577284401', electricity: '420161200955', internet: '26348316', paymentDate: '10' }, houseType: 'guesthouse' },
    { street: 'Arteal', number: '415', rooms: 3, capacity: 5, guests: [], utilities: { gas: '201769', water: '577284501', electricity: '420170501062' }, houseType: 'guesthouse' },
    { street: 'Arteal', number: '416', rooms: 3, capacity: 5, guests: [], utilities: { gas: '187208', water: '577282301', electricity: '420160906668' }, houseType: 'guesthouse' },
    { street: 'Arteal', number: '428', rooms: 3, capacity: 5, guests: [], utilities: { gas: '187342', water: '577282901', electricity: '420161003718', internet: '40955037' }, houseType: 'guesthouse' },
    { street: 'Arteal', number: '431', rooms: 3, capacity: 5, guests: [], utilities: { gas: '187253', water: '577285301', electricity: '420160504845', internet: '2456893 1', paymentDate: '25' }, houseType: 'guesthouse' },
    { street: 'Arteal', number: '432', rooms: 3, capacity: 5, guests: [], utilities: { gas: '188248', water: '577283101', electricity: '420161005109', internet: '23445693', paymentDate: '25' }, houseType: 'guesthouse' },
    { street: 'Arteal', number: '447', rooms: 3, capacity: 5, guests: [], utilities: { gas: '190002', water: '577286101', electricity: '420161103186', internet: '36526064 5', paymentDate: '23' }, houseType: 'guesthouse' },
    { street: 'Retamar', number: '418', rooms: 3, capacity: 5, guests: [], utilities: { gas: '178613', water: '577287101', electricity: '420160509014', internet: '22944980', paymentDate: '8' }, houseType: 'guesthouse' },
    { street: 'Retamar', number: '420', rooms: 3, capacity: 5, guests: [], utilities: { gas: '203230', water: '577287201', electricity: '420170103202', internet: '36526064', paymentDate: '2' }, houseType: 'guesthouse' },
    { street: 'Tahal', number: '506', rooms: 4, capacity: 5, guests: [], utilities: { gas: '180425', electricity: '420160408030', internet: '23302449' }, houseType: 'guesthouse' },
    { street: 'Ubedas', number: '407', rooms: 3, capacity: 5, guests: [], utilities: { gas: '181485', water: '577288601', electricity: '420160306911', internet: '36078791', paymentDate: '1' }, houseType: 'guesthouse' },
    { street: 'Ubedas', number: '433', rooms: 3, capacity: 5, guests: [], utilities: { gas: '174700', electricity: '420151202593' }, houseType: 'guesthouse' },
    { street: 'Ragol', number: '507', rooms: 3, capacity: 5, guests: [], utilities: { gas: '171039', water: '577296702', electricity: '420151002977', internet: '36209092', paymentDate: '20' }, houseType: 'guesthouse' },
    { street: 'Ragol', number: '509', rooms: 3, capacity: 5, guests: [], utilities: { gas: '171293', water: '577296801', electricity: '420151006786', internet: '37157335', paymentDate: '27' }, houseType: 'guesthouse' },
    { street: 'Ragol', number: '443', rooms: 3, capacity: 5, guests: [], utilities: { gas: '233649', water: '577291901', electricity: '420241200506' }, houseType: 'guesthouse' },
    { street: 'Ragol', number: '453', rooms: 3, capacity: 5, guests: [], utilities: { gas: '231007', water: '700102691', electricity: '420191001477', internet: '0 37000913 6' }, houseType: 'guesthouse' },
    { street: 'Ragol', number: '480', rooms: 4, capacity: 5, guests: [], utilities: { gas: '172928', water: '700137425', electricity: '420151104460', internet: '30362910' }, houseType: 'guesthouse' },
    { street: 'Ragol', number: '489', rooms: 3, capacity: 5, guests: [], utilities: { gas: '170648', water: '577294201', electricity: '420151001717', internet: '28253416', paymentDate: '20' }, houseType: 'guesthouse' },
    { street: 'Ragol', number: '491', rooms: 3, capacity: 5, guests: [], utilities: { gas: '173118', water: '577294301', electricity: '420151103897', internet: '8112978592(텔멕스)', paymentDate: '23' }, houseType: 'guesthouse' },
    { street: 'Vera', number: '528', rooms: 4, capacity: 5, guests: [], utilities: { gas: '213218', water: '700142437', electricity: '420180601596', internet: '44490461', paymentDate: '16' }, houseType: 'guesthouse' },
    { street: 'PRIVADA3', number: '231', rooms: 4, capacity: 5, guests: [], utilities: { gas: '144489', water: '558333701', electricity: '420131202236', internet: '8119575712(텔멕스)' }, houseType: 'guesthouse' },
    { street: 'PRIVADA6', number: '415', rooms: 3, capacity: 5, guests: [], utilities: { gas: '239231', water: '611850301', electricity: '420200405098' }, houseType: 'guesthouse' },
];

const legacyDefaultRecommendations: Omit<RecommendationItem, 'id'>[] = [];

export const useGuestHouseData = (onNewBooking?: (booking: Booking) => void) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [categoryConfigs, setCategoryConfigs] = useState<RecommendationCategoryConfig[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const bookingsInitialLoad = useRef(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser && !currentUser.isAnonymous);
      setIsLoading(false);
      
      if (!currentUser) {
          signInAnonymously(auth).catch(err => console.error("Auto-anonymous sign-in failed:", err));
      }
    });

    return () => unsubscribeAuth();
  }, []);
  
  // --- VISITOR COUNTING ---
  useEffect(() => {
    const visitorDocRef = doc(db, 'stats', 'visitors');

    const hasVisited = sessionStorage.getItem('neulbom_visited');
    if (!hasVisited) {
        setDoc(visitorDocRef, { count: increment(1) }, { merge: true })
            .then(() => {
                sessionStorage.setItem('neulbom_visited', 'true');
            })
            .catch(err => {
                if (err.code === 'permission-denied') {
                    console.warn("Visitor counting skipped: Missing permissions.");
                } else {
                    console.error("Error incrementing visitor count:", err);
                }
            });
    }

    const unsubscribeVisitor = onSnapshot(visitorDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setVisitorCount(docSnap.data().count || 0);
        }
    }, (error) => {
         if (error.code === 'permission-denied') {
             console.warn("Visitor stats subscription skipped: Missing permissions.");
         } else {
             console.error("Error subscribing to visitor stats:", error);
         }
    });

    return () => unsubscribeVisitor();
  }, []);


  // --- PUBLIC DATA FETCHING ---
  useEffect(() => {
    if (!user) return; 

    const galleryQuery = query(collection(db, 'gallery'), orderBy('order'));
    const unsubGallery = onSnapshot(galleryQuery, (snapshot) => {
      const galleryData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GalleryMediaItem));
      setGalleryMedia(galleryData);
    }, (error) => {
      console.error("Error fetching public gallery:", error);
    });
    
    // Recommendations Fetch
    const recQuery = query(collection(db, 'recommendations'));
    const unsubRec = onSnapshot(recQuery, async (snapshot) => {
        const recData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RecommendationItem));
        setRecommendations(recData);
    }, (error) => {
        console.error("Error fetching recommendations:", error);
    });
    
    // Category Configs Fetch
    const catConfigQuery = query(collection(db, 'recommendation_categories'));
    const unsubCatConfig = onSnapshot(catConfigQuery, (snapshot) => {
        const configs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RecommendationCategoryConfig));
        setCategoryConfigs(configs);
    }, (error) => {
        console.error("Error fetching category configs:", error);
    });
    
    return () => {
        unsubGallery();
        unsubRec();
        unsubCatConfig();
    }
  }, [user]);

  // --- ADMIN-ONLY DATA FETCHING ---
  useEffect(() => {
    if (!isAuthenticated) {
        setHouses([]);
        setBookings([]);
        setCars([]);
        bookingsInitialLoad.current = true;
        return;
    }
    
    const housesQuery = query(collection(db, 'houses'));
    const bookingsQuery = query(collection(db, 'bookings'), orderBy('arrivalDate', 'desc'));
    const carsQuery = query(collection(db, 'cars'), orderBy('model'));

    let unsubHouses = () => {};

    const initializeAndSubscribeToHouses = async () => {
        try {
            const housesSnapshot = await getDocs(housesQuery);
            const currentHouses = housesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as House));
            const existingHouseKeys = new Set(currentHouses.map(h => `${h.street}-${h.number}`));
            
            const batch = writeBatch(db);
            let hasUpdates = false;

            const missingHouses = defaultHouses.filter(defaultHouse => {
                const key = `${defaultHouse.street}-${defaultHouse.number}`;
                return !existingHouseKeys.has(key);
            });

            if (missingHouses.length > 0) {
                missingHouses.forEach(house => {
                    const docRef = doc(collection(db, 'houses'));
                    const cap = house.houseType === 'airbnb' ? 10 : 5;
                    batch.set(docRef, { ...house, capacity: cap, houseType: house.houseType || 'guesthouse' });
                });
                hasUpdates = true;
            }

            currentHouses.forEach(existingHouse => {
                const key = `${existingHouse.street}-${existingHouse.number}`;
                const defaultData = defaultHouses.find(d => `${d.street}-${d.number}` === key);
                
                let needsUpdate = false;
                const updatePayload: any = {};

                if (defaultData && defaultData.utilities && !existingHouse.utilities) {
                    updatePayload.utilities = defaultData.utilities;
                    needsUpdate = true;
                }

                const effectiveHouseType = existingHouse.houseType || 'guesthouse';
                if (!existingHouse.houseType) {
                    updatePayload.houseType = 'guesthouse';
                    needsUpdate = true;
                }
                
                const requiredCapacity = effectiveHouseType === 'airbnb' ? 10 : 5;
                if (!existingHouse.capacity || existingHouse.capacity < requiredCapacity) {
                    updatePayload.capacity = requiredCapacity;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                     const docRef = doc(db, 'houses', existingHouse.id);
                     batch.update(docRef, updatePayload);
                     hasUpdates = true;
                }
            });

            if (hasUpdates) {
                await batch.commit();
            }

        } catch (error) {
            console.error("Error during house initialization:", error);
        }

        unsubHouses = onSnapshot(housesQuery, (snapshot) => {
            const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Partial<House> }));
            
            const uniqueHousesMap = new Map<string, House>();
            
            for (const house of rawData) {
                if (house.street && typeof house.number !== 'undefined') {
                    const key = `${house.street}-${house.number}`;
                    if (!uniqueHousesMap.has(key)) {
                        const effectiveType = house.houseType || 'guesthouse';
                        const minCapacity = effectiveType === 'airbnb' ? 10 : 5;

                        uniqueHousesMap.set(key, {
                            guests: [],
                            rooms: 3,
                            houseType: effectiveType,
                            ...house,
                            capacity: Math.max(house.capacity || minCapacity, minCapacity),
                        } as House);
                    }
                }
            }
            
            setHouses(Array.from(uniqueHousesMap.values()));

        }, (error) => {
            console.error("Error fetching houses:", error);
        });
    };

    initializeAndSubscribeToHouses();

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
    
    const unsubCars = onSnapshot(carsQuery, (snapshot) => {
        const carsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Car));
        setCars(carsData);
    }, (error) => {
        console.error("Error fetching cars:", error);
    });

    return () => {
      unsubHouses();
      unsubBookings();
      unsubCars();
    };
  }, [isAuthenticated, onNewBooking]);

  // Watcher for Auto-Checkout
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
        const now = new Date();
        const housesToUpdate: { houseId: string; newGuests: Guest[] }[] = [];

        houses.forEach(house => {
            let changed = false;
            const newGuests = house.guests.filter(guest => {
                if (guest.scheduledCheckoutTime) {
                    const checkoutTime = new Date(guest.scheduledCheckoutTime);
                    if (now >= checkoutTime) {
                        changed = true;
                        return false; 
                    }
                }
                return true; 
            });

            if (changed) {
                housesToUpdate.push({ houseId: house.id, newGuests });
            }
        });

        housesToUpdate.forEach(({ houseId, newGuests }) => {
            updateDoc(doc(db, 'houses', houseId), { guests: newGuests })
                .then(() => console.log(`Auto-checked out guests from house ${houseId}`))
                .catch(err => console.error("Error in auto-checkout:", err));
        });

    }, 1000); 

    return () => clearInterval(interval);
  }, [houses, isAuthenticated]);

  // --- CRUD Operations ---

  const updateHouse = async (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => {
    const houseDocRef = doc(db, 'houses', houseId);
    await updateDoc(houseDocRef, updatedData);
  };

  const addBooking = async (newBooking: Omit<Booking, 'id' | 'status' | 'flightTicketUrl'>, flightTicket?: File) => {
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
        } catch (error: any) {
            console.error("Anonymous auth failed:", error);
            if (error.code === 'auth/admin-restricted-operation') {
                const msg = "⚠️ 시스템 설정 오류: Firebase Console에서 'Anonymous(익명)' 로그인이 활성화되지 않았습니다.\n\n관리자 페이지 > Authentication > Sign-in method 에서 'Anonymous'를 활성화해주세요.";
                alert(msg);
                throw new Error(msg);
            } else if (error.code === 'auth/operation-not-allowed') {
                 const msg = "⚠️ 시스템 설정 오류: 이메일/익명 로그인이 허용되지 않았습니다. Firebase 설정을 확인해주세요.";
                 alert(msg);
                 throw new Error(msg);
            }
        }
    }

    try {
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
    } catch (error: any) {
        console.error("Error adding booking:", error);
        if (error.code === 'permission-denied') {
            alert("🚫 권한 오류: 데이터베이스 쓰기 권한이 없습니다.\n익명 인증이 실패했거나 데이터베이스 규칙(Rules)이 차단 중입니다.\n관리자에게 '익명 인증' 활성화 여부를 확인해주세요.");
        } else {
             alert("예약 신청 저장 중 오류가 발생했습니다: " + error.message);
        }
        throw error;
    }
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
      isCheckedIn: false,
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
  
  const checkInGuest = async (houseId: string, guestId: string) => {
    const houseToUpdate = houses.find(h => h.id === houseId);
    if (!houseToUpdate) return;

    const updatedGuests = houseToUpdate.guests.map(guest => {
        if (guest.id === guestId) {
            return { ...guest, isCheckedIn: true };
        }
        return guest;
    });

    try {
        const houseDocRef = doc(db, 'houses', houseId);
        await updateDoc(houseDocRef, { guests: updatedGuests });
    } catch (error) {
        console.error("Error checking in guest:", error);
        alert("입실 처리 중 오류가 발생했습니다.");
    }
  };

  const checkOutGuest = async (houseId: string, guestId: string) => {
      const house = houses.find(h => h.id === houseId);
      if (!house) return;
      
      const updatedGuests = house.guests.filter(g => g.id !== guestId);
      try {
          await updateDoc(doc(db, 'houses', houseId), { guests: updatedGuests });
      } catch (error) {
          console.error("Error checking out guest:", error);
          alert("퇴실 처리 중 오류가 발생했습니다.");
      }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      let flightTicketUrlToDelete: string | undefined;
  
      await runTransaction(db, async (transaction) => {
        const bookingDocRef = doc(db, 'bookings', bookingId);
        const bookingDoc = await transaction.get(bookingDocRef);
  
        if (!bookingDoc.exists()) return;
  
        const bookingData = bookingDoc.data() as Booking;
        flightTicketUrlToDelete = bookingData.flightTicketUrl;
  
        if (bookingData.status === 'confirmed' && bookingData.houseId) {
          const houseDocRef = doc(db, 'houses', bookingData.houseId);
          const houseDoc = await transaction.get(houseDocRef);
  
          if (houseDoc.exists()) {
            const houseData = houseDoc.data() as House;
            
            const updatedGuests = (houseData.guests || []).filter(guest => {
                if (guest.bookingId) {
                    return guest.bookingId !== bookingId;
                }
                const isLegacyMatch = guest.guestName === bookingData.guestName &&
                                      guest.checkInDate === bookingData.arrivalDate &&
                                      guest.checkOutDate === bookingData.departureDate;
                return !isLegacyMatch;
            });
  
            if (updatedGuests.length < (houseData.guests || []).length) {
                transaction.update(houseDocRef, { guests: updatedGuests });
            }
          }
        }
        
        transaction.delete(bookingDocRef);
      });
  
      if (flightTicketUrlToDelete) {
          try {
              const ticketRef = ref(storage, flightTicketUrlToDelete);
              await deleteObject(ticketRef);
          } catch (storageError: any) {
              if (storageError.code !== 'storage/object-not-found') {
                  console.warn(`Error deleting flight ticket:`, storageError);
              }
          }
      }
    } catch (error) {
      console.error(`Failed to delete booking ${bookingId}:`, error);
      alert("예약 삭제 중 오류가 발생했습니다.");
    }
  };
  
  const addCar = async (newCar: Omit<Car, 'id' | 'imageUrl' | 'imagePath'>, imageFile?: File) => {
    let imageUrl: string | null = null;
    let imagePath: string | null = null;
    if (imageFile) {
        try {
            const filePath = `cars/${Date.now()}-${imageFile.name}`;
            const storageRef = ref(storage, filePath);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
            imagePath = snapshot.ref.fullPath;
        } catch (error: any) {
            if (error.code === 'storage/unauthorized') {
                alert("이미지 업로드 권한이 없습니다. Firebase Storage Rules를 확인해주세요.");
            } else {
                throw error;
            }
        }
    }
    await addDoc(collection(db, 'cars'), { ...newCar, imageUrl, imagePath });
  };

  const updateCar = async (carId: string, updatedData: Partial<Omit<Car, 'id'>>, imageFile?: File) => {
    const carDocRef = doc(db, 'cars', carId);
    
    if (imageFile) {
        const carToUpdate = cars.find(c => c.id === carId);
        if (carToUpdate?.imagePath) {
            const oldImageRef = ref(storage, carToUpdate.imagePath);
            await deleteObject(oldImageRef).catch(e => console.warn("Failed to delete old car image.", e));
        }
        
        try {
            const filePath = `cars/${Date.now()}-${imageFile.name}`;
            const newImageRef = ref(storage, filePath);
            const snapshot = await uploadBytes(newImageRef, imageFile);
            updatedData.imageUrl = await getDownloadURL(snapshot.ref);
            updatedData.imagePath = snapshot.ref.fullPath;
        } catch (error: any) {
             if (error.code === 'storage/unauthorized') {
                alert("이미지 업로드 권한이 없습니다. Firebase Storage Rules를 확인해주세요.");
                return; 
            } else {
                throw error;
            }
        }
    }
    
    const cleanData: any = { ...updatedData };
    Object.keys(cleanData).forEach(key => cleanData[key] === undefined && delete cleanData[key]);

    await updateDoc(carDocRef, cleanData);
  };

  const deleteCar = async (carId: string) => {
    const carToDelete = cars.find(c => c.id === carId);
    if (carToDelete?.imagePath) {
        const imageRef = ref(storage, carToDelete.imagePath);
        await deleteObject(imageRef).catch(error => {
            if (error.code !== 'storage/object-not-found') {
                console.warn("Error deleting car image:", error);
            }
        });
    }
    await deleteDoc(doc(db, 'cars', carId));
  };
  
  const addRecommendation = async (item: Omit<RecommendationItem, 'id' | 'imageUrl' | 'imagePath'>, imageFile?: File, imageUrlStr?: string) => {
      let imageUrl: string | null = imageUrlStr || null;
      let imagePath: string | null = null;

      if (imageFile) {
          try {
            const filePath = `recommendations/${Date.now()}-${imageFile.name}`;
            const storageRef = ref(storage, filePath);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
            imagePath = snapshot.ref.fullPath;
          } catch (error: any) {
             if (error.code === 'storage/unauthorized') {
                alert("이미지 업로드 권한이 없습니다. Firebase Storage Rules를 확인해주세요.");
             }
             throw error;
          }
      }

      await addDoc(collection(db, 'recommendations'), { 
          ...item, 
          imageUrl, 
          imagePath,
          imagePosition: item.imagePosition || null 
      });
  };

  const updateRecommendation = async (id: string, data: Partial<Omit<RecommendationItem, 'id'>>, imageFile?: File) => {
      const recDocRef = doc(db, 'recommendations', id);
      const oldRec = recommendations.find(r => r.id === id);
      
      const updates: any = { ...data };

      if (imageFile) {
          if (oldRec?.imagePath) {
              const oldRef = ref(storage, oldRec.imagePath);
              await deleteObject(oldRef).catch(e => console.warn("Failed to delete old recommendation image", e));
          }
          
          try {
            const filePath = `recommendations/${Date.now()}-${imageFile.name}`;
            const newRef = ref(storage, filePath);
            const snapshot = await uploadBytes(newRef, imageFile);
            updates.imageUrl = await getDownloadURL(snapshot.ref);
            updates.imagePath = snapshot.ref.fullPath;
          } catch (error: any) {
             if (error.code === 'storage/unauthorized') {
                alert("이미지 업로드 권한이 없습니다. Firebase Storage Rules를 확인해주세요.");
                return;
             }
             throw error;
          }
      } else if (data.imageUrl && data.imageUrl !== oldRec?.imageUrl) {
          // If URL provided manually (and differs from old one) and no file uploaded
          if (oldRec?.imagePath) {
              const oldRef = ref(storage, oldRec.imagePath);
              await deleteObject(oldRef).catch(e => console.warn("Failed to delete old recommendation image", e));
          }
           // We are switching to a manually provided URL, so clear imagePath
          updates.imagePath = null;
      }
      
      Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
      if (updates.imagePosition === undefined && data.hasOwnProperty('imagePosition')) {
          updates.imagePosition = null;
      }

      await updateDoc(recDocRef, updates);
  };
  
  const updateCategoryConfig = async (id: RecommendationCategory, data: Partial<RecommendationCategoryConfig>, imageFile?: File) => {
      // Use setDoc with merge to ensure document exists, since IDs are fixed
      const docRef = doc(db, 'recommendation_categories', id);
      const updates: any = { ...data };
      
      const oldConfig = categoryConfigs.find(c => c.id === id);

      if (imageFile) {
          // If a config already exists and has an image path, we might want to clean it up.
          if (oldConfig?.imagePath) {
               const oldRef = ref(storage, oldConfig.imagePath);
               await deleteObject(oldRef).catch(e => console.warn("Failed to delete old category image", e));
          }

          try {
            const filePath = `recommendation_categories/${id}-${Date.now()}-${imageFile.name}`;
            const newRef = ref(storage, filePath);
            const snapshot = await uploadBytes(newRef, imageFile);
            updates.imageUrl = await getDownloadURL(snapshot.ref);
            updates.imagePath = snapshot.ref.fullPath;
          } catch (error: any) {
             if (error.code === 'storage/unauthorized') {
                alert("이미지 업로드 권한이 없습니다. Firebase Storage Rules를 확인해주세요.");
                return;
             }
             throw error;
          }
      } else if (updates.imageUrl && updates.imageUrl !== oldConfig?.imageUrl) {
          // If a new URL is provided (string) and it's different from the old one,
          // AND we are NOT uploading a file (because if imageFile was true, we'd be in the if block),
          // check if we need to clean up an old file from storage.
          if (oldConfig?.imagePath) {
               const oldRef = ref(storage, oldConfig.imagePath);
               await deleteObject(oldRef).catch(e => console.warn("Failed to delete old category image", e));
          }
          // We are switching to a manually provided URL, so clear imagePath
          updates.imagePath = null;
      }
      
      await setDoc(docRef, updates, { merge: true });
  };

  const deleteRecommendation = async (id: string) => {
      const recToDelete = recommendations.find(r => r.id === id);
      if (recToDelete?.imagePath) {
          const imageRef = ref(storage, recToDelete.imagePath);
          await deleteObject(imageRef).catch(e => {
              if (e.code !== 'storage/object-not-found') console.warn("Error deleting recommendation image:", e);
          });
      }
      await deleteDoc(doc(db, 'recommendations', id));
  };
  
  const cleanupDefaultData = async () => {
      setIsLoading(true);
      try {
          const snapshot = await getDocs(collection(db, 'recommendations'));
          const batch = writeBatch(db);
          let deleteCount = 0;
          
          const defaultNames = new Set(legacyDefaultRecommendations.map(r => r.name));

          snapshot.docs.forEach((doc) => {
              const data = doc.data();
              if (defaultNames.has(data.name)) {
                   batch.delete(doc.ref);
                   deleteCount++;
              }
          });

          if (deleteCount > 0) {
              await batch.commit();
              alert(`${deleteCount}개의 기본 추천 장소가 삭제되었습니다.`);
          } else {
              alert("삭제할 기본 추천 장소가 없습니다.");
          }
      } catch (error) {
          console.error("Error cleaning up defaults:", error);
          alert("오류가 발생했습니다.");
      } finally {
          setIsLoading(false);
      }
  };

  const removeDuplicates = async () => {
      setIsLoading(true);
      try {
          const snapshot = await getDocs(collection(db, 'recommendations'));
          const seenNames = new Set();
          const batch = writeBatch(db);
          let deleteCount = 0;

          snapshot.docs.forEach((doc) => {
              const data = doc.data();
              const name = data.name ? data.name.trim() : '';

              if (!name) return;

              if (seenNames.has(name)) {
                  batch.delete(doc.ref);
                  deleteCount++;
              } else {
                  seenNames.add(name);
              }
          });

          if (deleteCount > 0) {
              await batch.commit();
              alert(`${deleteCount}개의 중복 항목이 삭제되었습니다.`);
          } else {
              alert("중복된 항목이 없습니다.");
          }
      } catch (error) {
          console.error("Error removing duplicates:", error);
          alert("중복 제거 중 오류가 발생했습니다.");
      } finally {
          setIsLoading(false);
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
              filePath: filePath,
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
                      deletePromises.push(deleteObject(imageRef).catch(e => console.warn("Could not delete file by URL.", e)));
                    } catch (e) {
                      console.error("Invalid URL for deletion:", imageItem.url);
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
    cars,
    recommendations,
    categoryConfigs,
    addCar,
    updateCar,
    deleteCar,
    updateHouse,
    addBooking,
    confirmBooking,
    checkInGuest,
    checkOutGuest,
    deleteBooking,
    addGalleryMediaItems,
    addGalleryVideoItem,
    updateGalleryMediaItem,
    deleteGalleryMediaItems,
    reorderGalleryMedia,
    addRecommendation,
    updateRecommendation,
    deleteRecommendation,
    cleanupDefaultData,
    removeDuplicates,
    updateCategoryConfig,
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    visitorCount,
  };
};
