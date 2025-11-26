
export type StreetName = 'Arteal' | 'Retamar' | 'Tahal' | 'Ubedas' | 'Ragol' | 'Vera' | 'PRIVADA3' | 'PRIVADA6';
export type PublicView = 'intro' | 'booking';
export type AdminView = 'home' | 'dashboard' | 'integratedManagement' | 'management' | 'vacantList' | 'occupiedList' | 'gallery' | 'allHousesStatus' | 'confirmedList' | 'carManagement' | 'airbnbList' | 'reservedList' | 'utilities' | 'recommendationManagement' | 'pendingList';
export type HouseType = 'guesthouse' | 'airbnb';

export interface Guest {
  id: string;
  bookingId?: string; // To link guest to a booking for easier deletion
  guestName: string;
  guestCompany: string;
  rentalCar: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  isCheckedIn?: boolean;
  scheduledCheckoutTime?: string; // ISO string for auto-checkout
}

export interface HouseUtilities {
  gas?: string;
  gasPaymentDate?: string;
  
  water?: string;
  waterPaymentDate?: string;
  
  electricity?: string;
  electricityPaymentDate?: string;
  
  internet?: string;
  internetPaymentDate?: string;
  
  paymentDate?: string; // General fallback or Legacy
}

export interface House {
  id:string;
  street: StreetName;
  number: string;
  rooms: number;
  capacity: number;
  guests: Guest[];
  memo?: {
    text: string;
    color: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  utilities?: HouseUtilities;
  houseType?: HouseType;
}

export interface Booking {
  id: string; // Changed from number
  guestName: string;
  phoneNumber?: string; // Added phone number field
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

export type CarStatus = 'available' | 'rented' | 'maintenance';

export interface Car {
  id: string;
  model: string;
  plateNumber: string;
  status: CarStatus;
  currentGuest?: string;
  notes?: string;
  imageUrl?: string;
  imagePath?: string;
}

export type RecommendationCategory = 'food' | 'shopping' | 'tour' | 'korean';

export interface RecommendationItem {
    id: string;
    category: RecommendationCategory;
    name: string;
    description: string;
    tags: string[];
    imageUrl: string;
    imagePath?: string; // For storage cleanup
    mapUrl: string;
    imagePosition?: 'object-center' | 'object-top' | 'object-bottom' | 'object-left' | 'object-right';
}

export interface RecommendationCategoryConfig {
    id: RecommendationCategory;
    title: string;
    sub: string;
    imageUrl: string;
    imagePath?: string;
}