
import { useState, useEffect, useRef } from 'react';
import type { House, Booking, Guest, GalleryMediaItem, GalleryCategory, GalleryImage, GalleryVideo, StreetName, Car, RecommendationItem } from '../types';
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

// Renamed to 'legacy' to avoid auto-using them, but kept for cleanup reference.
const legacyDefaultRecommendations: Omit<RecommendationItem, 'id'>[] = [
    { category: 'korean', name: "민속촌 (Minsokchon)", description: "몬테레이 대표 한식당. 삼겹살, 갈비 등 숯불구이와 다양한 한식 메뉴를 즐길 수 있습니다.", tags: ["Korean BBQ", "Apodaca", "한식"], imageUrl: "https://pdbig.com/files/attach/images/2021/09/18/ed6d9d0aa9bb816739a3ce30e1c56fce.jpg", mapUrl: "https://www.google.com/search?q=Restaurante+Minsokchon+Monterrey" },
    { category: 'korean', name: "명가 (Myungga)", description: "정갈한 반찬과 깊은 맛의 찌개류가 일품인 한식 맛집. 가족 식사 장소로 추천합니다.", tags: ["Traditional", "Stew", "Banchan"], imageUrl: "https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Restaurante+Myungga+Monterrey" },
    { category: 'korean', name: "골목식당 (Golmok Sikdang)", description: "다양한 찌개류와 덮밥 등 가정식 백반을 즐길 수 있는 편안한 분위기의 한식당입니다.", tags: ["Korean Food", "Home Style", "Apodaca"], imageUrl: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Restaurante+Golmok+Sikdang+Monterrey" },
    { category: 'korean', name: "작살치킨 (Jaksal Chicken)", description: "바삭한 한국식 치킨과 맥주를 즐길 수 있는 곳. 야식이나 가벼운 모임에 제격입니다.", tags: ["Chicken", "Beer", "K-Food"], imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Jaksal+Chicken+Monterrey" },
    { category: 'korean', name: "꼬꼬리꼬 (Kkokko Rico)", description: "바삭하고 다양한 맛의 한국식 치킨 전문점입니다. 양념치킨과 간장치킨이 인기입니다. (배달 가능)", tags: ["Fried Chicken", "Spicy", "Delivery"], imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/maps/search/?api=1&query=Kkokko+Rico+Monterrey" },
    { category: 'korean', name: "갈비스 (Galbi's)", description: "깔끔한 인테리어와 퀄리티 높은 고기를 제공하는 프리미엄 한식 바베큐 레스토랑입니다.", tags: ["Premium BBQ", "Galbi", "Dining"], imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwHlvXUWkiQme35khJAqYUWDoEziLPoTGpr9OzJkRNy7elPUOyw5oYDMLmAhexYUBCxktB-PAJpnBKxiTZ4S49dHHkJ_Odr4CjjF3P8KZerPrnxQMd0_uTd-NsYLW0zPoqkWqJG=s680-w680-h510-rw", mapUrl: "https://www.google.com/search?q=Galbi's+Monterrey" },
    { category: 'korean', name: "중국성 (Jung Guk Seong)", description: "아포다카에 위치한 한국식 중화요리 전문점. 짜장면, 짬뽕, 탕수육 세트 메뉴가 인기입니다.", tags: ["Jjajangmyeon", "Chinese", "Noodles"], imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/maps/search/?api=1&query=Restaurante+Jung+Guk+Seong+Monterrey" },
    { category: 'korean', name: "이자카야 한 (Izakaya Han)", description: "다양한 안주와 주류를 즐길 수 있는 퓨전 이자카야. 퇴근 후 술 한잔하기 좋은 분위기입니다.", tags: ["Izakaya", "Sake", "Fusion"], imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Izakaya+Han+Monterrey" },
    { category: 'korean', name: "Won Korean BBQ", description: "프리미엄 숯불구이 전문점. 고급스러운 분위기에서 최상급 고기를 즐길 수 있습니다.", tags: ["Premium BBQ", "Charcoal", "Beef"], imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d580690dd0?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Won+Korean+BBQ+Monterrey" },
    { category: 'korean', name: "비원 (Biwon)", description: "조용한 분위기의 전통 한식당. 손님 접대나 조용한 식사를 원하실 때 추천합니다.", tags: ["Traditional", "Private", "Quiet"], imageUrl: "https://images.unsplash.com/photo-1604579278540-2872e3b55cc2?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Restaurante+Biwon+Monterrey" },
    { category: 'korean', name: "서울 식당 (Seoul)", description: "가성비 좋은 점심 특선과 다양한 한식 메뉴를 갖춘 편안한 식당입니다.", tags: ["Lunch Special", "Casual", "Variety"], imageUrl: "https://images.unsplash.com/photo-1563245372-f21720e32c4d?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Restaurante+Seoul+Monterrey" },
    { category: 'korean', name: "오마트 (O Mart)", description: "다양한 한국 식료품과 생필품을 구매할 수 있는 대형 한인 마트입니다.", tags: ["Grocery", "Korean Market", "Snacks"], imageUrl: "https://mblogthumb-phinf.pstatic.net/MjAxOTEyMDFfMjMz/MDAxNTc1MTM4NjY1OTU1.ToRuXMohAGM1G8dgXdDs5HN1L-XmLr5hc2iqbNiuuKAg.kb76VZU5GEY00gmg5n7POmGsqocntDgIPvQ2RTdHKnUg.JPEG.canadastudy7/1575138663051.jpg?type=w800", mapUrl: "https://www.google.com/search?q=O+Mart+Monterrey", imagePosition: 'object-top' },
    { category: 'korean', name: "M-MART", description: "다양한 한국 식재료와 신선한 정육, 반찬류를 판매하는 한인 마트입니다.", tags: ["Grocery", "Butcher", "Vegetables"], imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSz6NyYCkvbKJ0gVCUfq_7JVjMdnsYUVoyO8No04S81nrWK1nlAChO2DQiFOIy2lmi4Isx187Zw1kRNy7elPUOyw5oYDMLmAhexYUBCxktB-PAJpnBKxiTZ4S49dHHkJ_Odr4CjjF3P8KZerPrnxQMd0_uTd-NsYLW0zPoqkWqJG=s680-w680-h980-n-k-no-nu", mapUrl: "https://www.google.com/search?q=M-MART+Monterrey", imagePosition: 'object-top' },
    { category: 'food', name: "El Gran Pastor", description: "몬테레이 전통 요리인 '카브리토(새끼 염소 구이)'를 맛볼 수 있는 가장 유명한 식당입니다.", tags: ["Cabrito", "Traditional", "Must-Visit"], imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=El+Gran+Pastor+Monterrey" },
    { category: 'food', name: "La Nacional", description: "고급스러운 분위기에서 최상급 립아이 스테이크와 멕시코 전통 요리를 즐길 수 있습니다.", tags: ["Steakhouse", "Fine Dining", "Wine"], imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxiiDTLyHh2lsZoz5Wum67WlMTvwblmerbf0X08AQlCJPTsATkbnPrjWHUaofic5uuz3C91e_3FKhWdW01SWLqedv7TYpngFxZaj97QOtMnregIGzqsd3XX0ZxRTJ6fVmjviHcG=s680-w680-h510-rw", mapUrl: "https://www.google.com/search?q=La+Nacional+Monterrey" },
    { category: 'food', name: "Los Arcos", description: "신선한 해산물 요리로 유명한 멕시코 대표 레스토랑 체인. 새우 요리와 타코가 일품입니다.", tags: ["Seafood", "Mariscos", "Casual"], imageUrl: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Los+Arcos+Monterrey" },
    { category: 'food', name: "Sonora Grill Prime", description: "세련된 분위기의 스테이크 하우스. DJ 음악과 함께 트렌디한 식사를 즐길 수 있습니다.", tags: ["Steak", "Trendy", "Bar"], imageUrl: "https://lh3.googleusercontent.com/p/AF1QipPhZuMfzutIb5Kv-flNbgnu4f1EmCNWRLo26Wtk=s680-w680-h510-rw", mapUrl: "https://www.google.com/search?q=Sonora+Grill+Prime+Monterrey" },
    { category: 'food', name: "El Rey del Cabrito", description: "몬테레이의 상징적인 카브리토 맛집. 현지 분위기를 제대로 느낄 수 있는 곳입니다.", tags: ["Cabrito", "History", "Local"], imageUrl: "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=El+Rey+del+Cabrito" },
    { category: 'food', name: "Mochomos Monterrey", description: "소노라 스타일의 고급 요리와 칵테일. 새우 부뉴엘로(Buñuelos de Camarón)가 시그니처 메뉴입니다. 화려한 분위기를 즐겨보세요.", tags: ["Fine Dining", "Sonora Style", "Hotspot"], imageUrl: "https://costeno.com/wp-content/uploads/2022/10/A4B0242-1653x823.jpg", mapUrl: "https://www.google.com/search?q=Mochomos+Monterrey" },
    { category: 'food', name: "Tacos Orinoco", description: "북부 스타일의 치차론 타코가 유명한 힙한 타코 가게. 늦은 시간까지 운영합니다.", tags: ["Tacos", "Street Food", "Famous"], imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Tacos+Orinoco+Monterrey" },
    { category: 'food', name: "Gallo 71", description: "산 페드로 지역의 핫플레이스. 훌륭한 타코와 스테이크, 활기찬 분위기를 자랑합니다.", tags: ["Hotspot", "Vibrant", "Grill"], imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Gallo+71+Monterrey" },
    { category: 'food', name: "Casa Prime", description: "최상급 스테이크와 와인, 그리고 훌륭한 분위기를 즐길 수 있는 프리미엄 레스토랑입니다.", tags: ["Steakhouse", "Premium", "Wine"], imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop", mapUrl: "https://maps.app.goo.gl/3WHTTNi18xMiTyEK7" },
    { category: 'food', name: "La Casa Grande", description: "전통적인 멕시코 분위기와 역사를 느낄 수 있는 박물관 같은 레스토랑. 정통 멕시코 요리를 맛보세요.", tags: ["Traditional", "History", "Authentic"], imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=La+Casa+Grande+Monterrey" },
    { category: 'food', name: "Prime Steak Club", description: "테라스 뷰가 멋진 현대적인 스테이크 하우스. 최상급 고기와 세련된 분위기로 인기 있는 곳입니다.", tags: ["Modern", "View", "Steak"], imageUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Prime+Steak+Club+Monterrey" },
    { category: 'shopping', name: "Paseo La Fe", description: "게스트하우스에서 가장 가까운 대형 쇼핑몰. 다양한 브랜드와 식당가, 영화관이 있어 편리합니다.", tags: ["Mall", "Cinema", "Near"], imageUrl: "https://images.unsplash.com/photo-1519567241046-7f570eee3d9f?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Paseo+La+Fe+Monterrey" },
    { category: 'shopping', name: "Citadel (Plaza Citadel)", description: "아포다카 지역의 접근성 좋은 쇼핑몰. 대형 마트와 다양한 편의시설이 갖춰져 있습니다.", tags: ["Shopping", "Apodaca", "Convenience"], imageUrl: "https://images.unsplash.com/photo-1567958451986-2de427a4a0be?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Plaza+Citadel+Monterrey" },
    { category: 'shopping', name: "Punto Valle", description: "산 페드로 지역의 현대적인 럭셔리 쇼핑 센터. 고급 브랜드와 세련된 레스토랑이 즐비합니다.", tags: ["Luxury", "San Pedro", "Premium"], imageUrl: "https://images.unsplash.com/photo-1567449303078-57a636256d0c?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Punto+Valle+Monterrey" },
    { category: 'shopping', name: "Fashion Drive", description: "몬테레이 최고의 쇼핑 & 엔터테인먼트 복합 시설. 트렌디한 브랜드와 맛집이 모여있습니다.", tags: ["Fashion", "Dining", "Hotspot"], imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Fashion+Drive+Monterrey" },
    { category: 'shopping', name: "Galerías Monterrey", description: "오랜 전통을 자랑하는 몬테레이의 대표적인 대형 쇼핑몰. 가족 단위 방문객에게 인기입니다.", tags: ["Classic", "Family", "Shopping"], imageUrl: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Galerias+Monterrey" },
    { category: 'shopping', name: "Pueblo Serena", description: "아름다운 조경과 스페인풍 건축이 어우러진 야외 쇼핑몰. 산책하며 쇼핑하기 좋습니다.", tags: ["Outdoor", "Beautiful", "Relax"], imageUrl: "https://images.unsplash.com/photo-1575438596634-110023055375?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Pueblo+Serena+Monterrey" },
    { category: 'shopping', name: "Topgolf Monterrey", description: "골프와 파티를 동시에 즐길 수 있는 스포츠 엔터테인먼트 공간. 친구, 동료와 함께하기 좋습니다.", tags: ["Golf", "Party", "Activity"], imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Topgolf+Monterrey" },
    { category: 'shopping', name: "Casino Jubilee", description: "몬테레이 최대 규모의 카지노. 화려한 분위기 속에서 다양한 게임과 공연을 즐길 수 있습니다.", tags: ["Casino", "Entertainment", "Nightlife"], imageUrl: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Casino+Jubilee+Monterrey" },
    { category: 'tour', name: "Parque Fundidora", description: "과거 제철소를 개조한 몬테레이 최대 규모의 공원. 산책, 자전거, 박물관 등 볼거리가 가득합니다.", tags: ["Park", "Museum", "History"], imageUrl: "https://images.unsplash.com/photo-1628744876497-eb30460be9f6?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Parque+Fundidora" },
    { category: 'tour', name: "Paseo Santa Lucía", description: "푼디도라 공원까지 이어지는 아름다운 인공 수로. 보트를 타며 야경을 즐기기 좋습니다.", tags: ["Riverwalk", "Boat", "Night View"], imageUrl: "https://images.unsplash.com/photo-1588616330240-6b93223404c6?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Paseo+Santa+Lucia" },
    { category: 'tour', name: "Cola de Caballo", description: "말 꼬리 모양을 닮은 웅장한 폭포. 자연 속에서 힐링할 수 있는 최고의 명소입니다.", tags: ["Waterfall", "Nature", "Hiking"], imageUrl: "https://images.unsplash.com/photo-1646626198873-3362769027e0?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Cola+de+Caballo+Monterrey" },
    { category: 'tour', name: "Chipinque", description: "몬테레이 시내를 한눈에 내려다볼 수 있는 생태 공원. 야생동물을 만날 수도 있습니다.", tags: ["Mountain", "View", "Coati"], imageUrl: "https://images.unsplash.com/photo-1598384536785-700607c46626?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Chipinque+Ecological+Park" },
    { category: 'tour', name: "Grutas de García", description: "케이블카를 타고 올라가는 신비로운 석회암 동굴. 웅장한 종유석과 석순을 감상하세요.", tags: ["Caves", "Cable Car", "Nature"], imageUrl: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Grutas+de+Garcia" },
    { category: 'tour', name: "Macroplaza", description: "중남미 최대 규모의 광장. 정부 청사, 성당, 박물관 등이 모여 있는 몬테레이의 중심입니다.", tags: ["City Center", "Plaza", "Landmark"], imageUrl: "https://images.unsplash.com/photo-1596481373740-647375626459?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Macroplaza+Monterrey" },
    { category: 'tour', name: "Museo de Historia Mexicana", description: "멕시코의 역사를 한눈에 볼 수 있는 박물관. 현대적인 건축물과 다양한 전시가 인상적입니다.", tags: ["Museum", "History", "Culture"], imageUrl: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Museo+de+Historia+Mexicana" },
    { category: 'tour', name: "Bioparque Estrella", description: "사파리 투어를 즐길 수 있는 동물원 테마파크. 가족 단위 여행객에게 강력 추천합니다.", tags: ["Safari", "Zoo", "Family"], imageUrl: "https://images.unsplash.com/photo-1534567176735-984763282169?q=80&w=800&auto=format&fit=crop", mapUrl: "https://www.google.com/search?q=Bioparque+Estrella+Monterrey" }
];


export const useGuestHouseData = (onNewBooking?: (booking: Booking) => void) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const bookingsInitialLoad = useRef(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Only set as authenticated if user exists AND is not anonymous
      // This prevents guests (anonymous users) from seeing the admin dashboard
      setIsAuthenticated(!!currentUser && !currentUser.isAnonymous);
      setIsLoading(false);
      
      // Auto sign-in anonymously if no user
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


  // --- PUBLIC DATA FETCHING (Gallery & Recommendations) ---
  useEffect(() => {
    if (!user) return; // Guard: Ensure user is authenticated (even anonymously) before fetching

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
    
    return () => {
        unsubGallery();
        unsubRec();
    }
  }, [user]); // Re-run when user auth state changes

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
    // Ensure we have a user (even anonymous)
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
                return; // Abort update if image failed
            } else {
                throw error;
            }
        }
    }
    
    // Ensure no undefined values
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
          // Ensure optional fields are null if undefined to satisfy Firestore
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
      }
      
      // Clean undefined values
      Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
      // Handle null for imagePosition explicitly if passed as undefined in partial (should be handled by caller, but safety check)
      if (updates.imagePosition === undefined && data.hasOwnProperty('imagePosition')) {
          updates.imagePosition = null;
      }

      await updateDoc(recDocRef, updates);
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

  // Function to remove duplicates based on 'name'
  const removeDuplicates = async () => {
      setIsLoading(true);
      try {
          const snapshot = await getDocs(collection(db, 'recommendations'));
          const seenNames = new Set();
          const batch = writeBatch(db);
          let deleteCount = 0;

          // Process in memory, then batch delete duplicates
          // We keep the first occurrence and delete subsequent ones
          snapshot.docs.forEach((doc) => {
              const data = doc.data();
              const name = data.name ? data.name.trim() : '';

              if (!name) return; // Skip invalid entries

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
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    visitorCount,
  };
};
