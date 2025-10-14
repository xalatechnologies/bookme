export interface Facility {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: string;
  readonly location: string;
  readonly address: string;
  readonly capacity: number;
  readonly pricePerHour: number;
  readonly amenities: readonly string[];
  readonly images: readonly string[];
  readonly availability: {
    readonly monday: { readonly start: string; readonly end: string; };
    readonly tuesday: { readonly start: string; readonly end: string; };
    readonly wednesday: { readonly start: string; readonly end: string; };
    readonly thursday: { readonly start: string; readonly end: string; };
    readonly friday: { readonly start: string; readonly end: string; };
    readonly saturday: { readonly start: string; readonly end: string; };
    readonly sunday: { readonly start: string; readonly end: string; };
  };
  readonly coordinates: {
    readonly lat: number;
    readonly lng: number;
  };
  readonly rating: number;
  readonly reviewCount: number;
  readonly area?: string;
  readonly accessibilityFeatures?: readonly string[];
}

export const coreFacilities: readonly Facility[] = [
  {
    id: "1",
    name: "Drammen Idrettshall",
    description: "Moderne idrettshall med full utstyr for ballsport og trening. Perfekt for fotball, håndball, basketball og volleyball.",
    type: "Idrettshall",
    location: "Drammen Sentrum",
    address: "Bragernes Torg 2, 3017 Drammen",
    capacity: 200,
    pricePerHour: 850,
    amenities: ["Garderober", "Dusj", "Parkering", "Lyd/lys", "Tribuner"],
    images: [
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center"
    ],
    availability: {
      monday: { start: "08:00", end: "22:00" },
      tuesday: { start: "08:00", end: "22:00" },
      wednesday: { start: "08:00", end: "22:00" },
      thursday: { start: "08:00", end: "22:00" },
      friday: { start: "08:00", end: "22:00" },
      saturday: { start: "09:00", end: "20:00" },
      sunday: { start: "10:00", end: "18:00" }
    },
    coordinates: {
      lat: 59.7436,
      lng: 10.2045
    },
    rating: 4.5,
    reviewCount: 127
  },
  {
    id: "2",
    name: "Strømsø Kulturhus",
    description: "Fleksibelt kulturhus med scene og sal. Ideelt for konserter, teaterforestillinger, møter og kulturarrangementer.",
    type: "Kulturhus",
    location: "Strømsø",
    address: "Gamle Kirkegate 18, 3019 Drammen",
    capacity: 150,
    pricePerHour: 1200,
    amenities: ["Scene", "Lyd/lys", "Projektor", "Kjøkken", "Garderober"],
    images: [
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&crop=center"
    ],
    availability: {
      monday: { start: "09:00", end: "23:00" },
      tuesday: { start: "09:00", end: "23:00" },
      wednesday: { start: "09:00", end: "23:00" },
      thursday: { start: "09:00", end: "23:00" },
      friday: { start: "09:00", end: "24:00" },
      saturday: { start: "10:00", end: "24:00" },
      sunday: { start: "12:00", end: "22:00" }
    },
    coordinates: {
      lat: 59.7389,
      lng: 10.2134
    },
    rating: 4.2,
    reviewCount: 89
  },
  {
    id: "3",
    name: "Bragernes Møterom",
    description: "Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for bedriftsmøter og presentasjoner.",
    type: "Møterom",
    location: "Bragernes",
    address: "Nedre Storgate 15, 3015 Drammen",
    capacity: 25,
    pricePerHour: 450,
    amenities: ["Projektor", "Whiteboard", "WiFi", "Kaffe/te", "Klimaanlegg"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&crop=center"
    ],
    availability: {
      monday: { start: "07:00", end: "20:00" },
      tuesday: { start: "07:00", end: "20:00" },
      wednesday: { start: "07:00", end: "20:00" },
      thursday: { start: "07:00", end: "20:00" },
      friday: { start: "07:00", end: "18:00" },
      saturday: { start: "09:00", end: "16:00" },
      sunday: { start: "10:00", end: "16:00" }
    },
    coordinates: {
      lat: 59.7425,
      lng: 10.2067
    },
    rating: 4.7,
    reviewCount: 203
  },
  {
    id: "4",
    name: "Spiralen Fotballbane",
    description: "Utendørs fotballbane med kunstgress. Flombelyst bane som kan brukes hele året. Perfekt for fotballtrening og kamper.",
    type: "Fotballbane",
    location: "Spiralen",
    address: "Spiralveien 45, 3020 Drammen",
    capacity: 50,
    pricePerHour: 650,
    amenities: ["Kunstgress", "Flombelysning", "Garderober", "Parkering"],
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&crop=center"
    ],
    availability: {
      monday: { start: "16:00", end: "22:00" },
      tuesday: { start: "16:00", end: "22:00" },
      wednesday: { start: "16:00", end: "22:00" },
      thursday: { start: "16:00", end: "22:00" },
      friday: { start: "16:00", end: "22:00" },
      saturday: { start: "08:00", end: "20:00" },
      sunday: { start: "08:00", end: "20:00" }
    },
    coordinates: {
      lat: 59.7512,
      lng: 10.1876
    },
    rating: 4.3,
    reviewCount: 156
  },
  {
    id: "5",
    name: "Konnerud Svømmehall",
    description: "Moderne svømmehall med 25-meter basseng. Ideell for svømmetrening, vanngymnastikk og fritidssvømming.",
    type: "Svømmehall",
    location: "Konnerud",
    address: "Konnerudgata 88, 3049 Drammen",
    capacity: 80,
    pricePerHour: 950,
    amenities: ["25m basseng", "Garderober", "Dusj", "Parkering", "Cafeteria"],
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop&crop=center"
    ],
    availability: {
      monday: { start: "06:00", end: "22:00" },
      tuesday: { start: "06:00", end: "22:00" },
      wednesday: { start: "06:00", end: "22:00" },
      thursday: { start: "06:00", end: "22:00" },
      friday: { start: "06:00", end: "22:00" },
      saturday: { start: "08:00", end: "20:00" },
      sunday: { start: "08:00", end: "20:00" }
    },
    coordinates: {
      lat: 59.7234,
      lng: 10.1567
    },
    rating: 4.6,
    reviewCount: 298
  },
  {
    id: "6",
    name: "Åssiden Tennisbane",
    description: "Innendørs tennisbane med profesjonell underlag. Perfekt for tennisturneringer og trening året rundt.",
    type: "Tennisbane",
    location: "Åssiden",
    address: "Åssiden Terrasse 12, 3021 Drammen",
    capacity: 20,
    pricePerHour: 380,
    amenities: ["Innendørs", "Profesjonell underlag", "Garderober", "Utstyr utleie"],
    images: [
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop&crop=center"
    ],
    availability: {
      monday: { start: "07:00", end: "23:00" },
      tuesday: { start: "07:00", end: "23:00" },
      wednesday: { start: "07:00", end: "23:00" },
      thursday: { start: "07:00", end: "23:00" },
      friday: { start: "07:00", end: "23:00" },
      saturday: { start: "08:00", end: "22:00" },
      sunday: { start: "09:00", end: "21:00" }
    },
    coordinates: {
      lat: 59.7398,
      lng: 10.1923
    },
    rating: 4.4,
    reviewCount: 87
  }
] as const;
