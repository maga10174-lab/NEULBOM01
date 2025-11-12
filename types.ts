export type StreetName = 'Arteal' | 'Retamar' | 'Tahal' | 'Ubedas' | 'Ragol' | 'Vera' | 'PRIVADA3' | 'PRIVADA6';
export type PublicView = 'intro' | 'booking';
export type AdminView = 'home' | 'dashboard' | 'management' | 'vacantList' | 'occupiedList' | 'gallery' | 'allHousesStatus' | 'confirmedList';

export interface Guest {
  id: string;
  bookingId?: string; // To link guest to a booking for easier deletion
  guestName: string;
  guestCompany: string;
  rentalCar: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
}

export interface House {
  id:string;
  street: StreetName;
  number: string;
  rooms: number;
  capacity: number;
  guests: Guest[];
}

export interface Booking {
  id: string; // Changed from number
  guestName: string;
  arrivalDate: string;
  departureDate: string;
  flightTicketUrl?: string; // Changed from File
  flightTicketName?: string;
  kakaoId: string;
  flightNumber: string;
  status: 'pending' | 'confirmed';
  numberOfGuests?: number;
  houseId?: string;
  houseInfo?: { street: StreetName, number: string };
}

export type GalleryCategory = 'guesthouse' | 'restaurant';

export type GalleryImage = {
  id: string;
  type: 'image';
  url: string;
  filePath?: string; // Add this line for stable deletes
  alt: string;
  category: GalleryCategory;
  order: number; // Added for sorting
  isVisible?: boolean;
};

export type GalleryVideo = {
  id: string;
  type: 'video';
  youtubeId: string;
  title: string;
  category: GalleryCategory;
  order: number; // Added for sorting
  isVisible?: boolean;
};

export type GalleryMediaItem = GalleryImage | GalleryVideo;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success';
}