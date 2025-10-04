"use client";

export interface IAdminFacility {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly address: string;
  readonly description: string;
  readonly image: string;
  readonly tags: readonly string[];
  readonly status: "published" | "draft" | "archived";
  readonly capacity: number;
  readonly owner: string;
  readonly lastUpdated: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly coordinates?: {
    readonly lat: number;
    readonly lng: number;
  };
}

export const adminFacilities: readonly IAdminFacility[] = [
  {
    id: "1",
    name: "Drammen Idrettshall",
    type: "Idrettshall",
    address: "Bragernes Torg 2, 3017 Drammen",
    description: "Moderne idrettshall med full utstyr for ballsport og trening. Perfekt for fotball, håndball, basketball og volleyball.",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&crop=center",
    tags: ["Garderober", "Dusj", "Parkering", "Lyd/lys", "Tribuner"],
    status: "published",
    capacity: 200,
    owner: "Anna Hansen",
    lastUpdated: "2 timer siden",
    createdAt: "2023-01-15",
    updatedAt: "2023-10-20",
    coordinates: { lat: 59.7436, lng: 10.2045 }
  },
  {
    id: "2",
    name: "Strømsø Kulturhus",
    type: "Kulturhus",
    address: "Gamle Kirkegate 18, 3019 Drammen",
    description: "Fleksibelt kulturhus med scene og sal. Ideelt for konserter, teaterforestillinger, møter og kulturarrangementer.",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&crop=center",
    tags: ["Scene", "Lyd/lys", "Projektor", "Kjøkken", "Garderober"],
    status: "published",
    capacity: 150,
    owner: "Erik Larsen",
    lastUpdated: "1 dag siden",
    createdAt: "2023-02-10",
    updatedAt: "2023-10-18",
    coordinates: { lat: 59.7389, lng: 10.2134 }
  },
  {
    id: "3",
    name: "Bragernes Møterom",
    type: "Møterom",
    address: "Nedre Storgate 15, 3015 Drammen",
    description: "Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for bedriftsmøter og presentasjoner.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&crop=center",
    tags: ["Projektor", "Whiteboard", "WiFi", "Kaffe/te", "Klimaanlegg"],
    status: "published",
    capacity: 25,
    owner: "Maria Olsen",
    lastUpdated: "3 timer siden",
    createdAt: "2023-03-05",
    updatedAt: "2023-10-15",
    coordinates: { lat: 59.7425, lng: 10.2067 }
  },
  {
    id: "4",
    name: "Spiralen Fotballbane",
    type: "Fotballbane",
    address: "Spiralveien 45, 3020 Drammen",
    description: "Utendørs fotballbane med kunstgress. Flombelyst bane som kan brukes hele året. Perfekt for fotballtrening og kamper.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop&crop=center",
    tags: ["Kunstgress", "Flombelysning", "Garderober", "Parkering"],
    status: "published",
    capacity: 50,
    owner: "Lars Andersen",
    lastUpdated: "1 uke siden",
    createdAt: "2023-04-12",
    updatedAt: "2023-10-22",
    coordinates: { lat: 59.7512, lng: 10.1876 }
  },
  {
    id: "5",
    name: "Konnerud Svømmehall",
    type: "Svømmehall",
    address: "Konnerudgata 88, 3049 Drammen",
    description: "Moderne svømmehall med 25-meter basseng. Ideell for svømmetrening, vanngymnastikk og fritidssvømming.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center",
    tags: ["25m basseng", "Garderober", "Dusj", "Parkering", "Cafeteria"],
    status: "published",
    capacity: 80,
    owner: "Sofia Johansen",
    lastUpdated: "5 timer siden",
    createdAt: "2023-05-20",
    updatedAt: "2023-10-19",
    coordinates: { lat: 59.7234, lng: 10.1567 }
  },
  {
    id: "6",
    name: "Åssiden Tennisbane",
    type: "Tennisbane",
    address: "Åssiden Terrasse 12, 3021 Drammen",
    description: "Innendørs tennisbane med profesjonell underlag. Perfekt for tennisturneringer og trening året rundt.",
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop&crop=center",
    tags: ["Innendørs", "Profesjonell underlag", "Garderober", "Utstyr utleie"],
    status: "published",
    capacity: 20,
    owner: "Tom Hansen",
    lastUpdated: "2 uker siden",
    createdAt: "2023-06-08",
    updatedAt: "2023-10-17",
    coordinates: { lat: 59.7398, lng: 10.1923 }
  }
];
