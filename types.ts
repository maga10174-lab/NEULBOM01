export type StreetName = 'Arteal' | 'Retamar' | 'Tahal' | 'Ubedas' | 'Ragol' | 'Vera' | 'PRIVADA3';
export type PublicView = 'intro' | 'booking';
export type AdminView = 'dashboard' | 'management' | 'vacantList' | 'gallery';

export interface Guest {
  id: string;
  guestName: string;
  guestCompany: string;
  rentalCar: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
}

export interface House {
  id: string;
  street: StreetName;
  number: string;
  rooms: number;
  capacity: number;
  guests: Guest[];
}

export interface Booking {
  id: string; // Changed from number to string for Firestore ID
  guestName: string;
  arrivalDate: string;
  departureDate: string;
  flightTicketUrl?: string; // Changed from File to string URL
  flightTicketName?: string;
  kakaoId: string;
  flightNumber: string;
  status: 'pending' | 'confirmed';
  createdAt: number; // For sorting
}

export type GalleryCategory = 'guesthouse' | 'restaurant';

export interface GalleryImage {
  id: string;
  type: 'image';
  url: string;
  alt: string;
  category: GalleryCategory;
  order: number;
}

export interface GalleryVideo {
  id: string;
  type: 'video';
  youtubeId: string;
  title: string;
  category: GalleryCategory;
  order: number;
}

export type GalleryMediaItem = GalleryImage | GalleryVideo;
