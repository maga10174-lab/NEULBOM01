import { useState, useEffect, useCallback } from 'react';
import type { House, Booking, StreetName, Guest, GalleryMediaItem } from '../types';

const STREETS: Record<StreetName, string[]> = {
  'Arteal': ['413', '415', '416', '428', '431', '432', '447'],
  'Retamar': ['418', '420'],
  'Tahal': ['506'],
  'Ubedas': ['407', '433'],
  'Ragol': ['507', '509', '443', '453', '480', '489', '491'],
  'Vera': ['528'],
  'PRIVADA3': ['231'],
};

const SPECIAL_CAPACITY: Record<string, number> = {
  '506': 4,
  '480': 5,
  '528': 4,
  '231': 5,
};

const initialHouses: House[] = Object.entries(STREETS).flatMap(([street, numbers]) => 
  numbers.map(number => ({
    id: `${street}-${number}`,
    street: street as StreetName,
    number,
    rooms: 3,
    capacity: SPECIAL_CAPACITY[number] || 3,
    guests: [],
  }))
);

const initialGalleryMedia: GalleryMediaItem[] = [];


const ADMIN_PASSWORDS = ['4751', '3329']; 

export const useGuestHouseData = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedHouses = localStorage.getItem('neulbom_houses');
      const savedBookings = localStorage.getItem('neulbom_bookings');
      const savedGalleryMedia = localStorage.getItem('neulbom_gallery_media');
      
      if (savedHouses) {
        try {
          const parsedSavedHouses: any[] = JSON.parse(savedHouses);

          const migratedHouses = parsedSavedHouses.map(h => {
            if (h.isOccupied !== undefined) { // Data migration for old structure
              const newHouse: House = {
                id: h.id, street: h.street, number: h.number, rooms: h.rooms,
                capacity: h.capacity, guests: [],
              };
              if (h.isOccupied && h.guestName) {
                newHouse.guests.push({
                  id: `migrated-${h.id}-${Date.now()}`,
                  guestName: h.guestName,
                  guestCompany: h.guestCompany || '',
                  rentalCar: h.rentalCar || '',
                  numberOfGuests: h.numberOfGuests || 1,
                  checkInDate: h.checkInDate || '',
                  checkOutDate: h.checkOutDate || '',
                });
              }
              return newHouse;
            }
            return { ...h, guests: h.guests || [] };
          });

          const savedHousesMap = new Map<string, House>(migratedHouses.map(h => [h.id, h]));
          
          const housesToSet = initialHouses.map(initialHouse => {
            const savedHouse = savedHousesMap.get(initialHouse.id);
            if (savedHouse) {
              return { ...initialHouse, guests: savedHouse.guests };
            }
            return initialHouse;
          });

          setHouses(housesToSet);
        } catch (e) {
            console.error("Failed to parse or merge saved houses, resetting.", e);
            setHouses(initialHouses);
        }
      } else {
        setHouses(initialHouses);
      }
      
      setBookings(savedBookings ? JSON.parse(savedBookings) : []);
      
      if (savedGalleryMedia) {
        try {
            const parsedMedia: any[] = JSON.parse(savedGalleryMedia);
            // Migration for items without category
            const migratedMedia = parsedMedia.map(item => ({
                ...item,
                category: item.category || 'guesthouse' 
            }));
            setGalleryMedia(migratedMedia);
        } catch (e) {
            console.error("Failed to parse gallery media, resetting.", e);
            setGalleryMedia(initialGalleryMedia);
        }
      } else {
        setGalleryMedia(initialGalleryMedia);
      }


      const sessionAuth = sessionStorage.getItem('neulbom_auth');
      if (sessionAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setHouses(initialHouses);
      setBookings([]);
      setGalleryMedia(initialGalleryMedia);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const saveData = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save data to localStorage: ${key}`, error);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveData('neulbom_houses', houses);
    }
  }, [houses, isLoading, saveData]);

  useEffect(() => {
    if (!isLoading) {
      saveData('neulbom_bookings', bookings);
    }
  }, [bookings, isLoading, saveData]);

  useEffect(() => {
    if (!isLoading) {
      saveData('neulbom_gallery_media', galleryMedia);
    }
  }, [galleryMedia, isLoading, saveData]);


  const updateHouse = (houseId: string, updatedData: Partial<Omit<House, 'id'>>) => {
    setHouses(prev =>
      prev.map(h => (h.id === houseId ? { ...h, ...updatedData } : h))
    );
  };

  const addBooking = (newBooking: Omit<Booking, 'id' | 'status'>) => {
    setBookings(prev => [
      { ...newBooking, id: Date.now(), status: 'pending' },
      ...prev,
    ]);
  };

  const confirmBooking = (bookingId: number) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: 'confirmed'} : b));
  };

  const deleteBooking = (bookingId: number) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };
  
  const updateGalleryMedia = (newMedia: GalleryMediaItem[]) => {
    setGalleryMedia(newMedia);
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
    updateGalleryMedia,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
};