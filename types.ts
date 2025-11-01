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
  id: number;
  guestName: string;
  arrivalDate: string;
  departureDate: string;
  flightTicket?: File;
  flightTicketName?: string;
  kakaoId: string;
  flightNumber: string;
  status: 'pending' | 'confirmed';
}

export type GalleryCategory = 'guesthouse' | 'restaurant';

export type GalleryImage = {
  id: string;
  type: 'image';
  url: string;
  alt: string;
  category: GalleryCategory;
};

export type GalleryVideo = {
  id: string;
  type: 'video';
  youtubeId: string;
  title: string;
  category: GalleryCategory;
};

export type GalleryMediaItem = GalleryImage | GalleryVideo;