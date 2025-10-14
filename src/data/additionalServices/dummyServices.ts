export interface AdditionalService {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly category: 'equipment' | 'catering' | 'technical' | 'cleaning' | 'staff';
  readonly facilityTypes: readonly string[];
  readonly available: boolean;
}

export const dummyAdditionalServices: readonly AdditionalService[] = [
  {
    id: "service-1",
    name: "Fotballutstyr",
    description: "Komplett sett med fotballer, kjegler og mål",
    price: 150,
    category: "equipment",
    facilityTypes: ["Idrettshall", "Fotballbane"],
    available: true
  },
  {
    id: "service-2",
    name: "Lydanlegg",
    description: "Profesjonelt lydanlegg med mikrofoner og høyttalere",
    price: 300,
    category: "technical",
    facilityTypes: ["Kulturhus", "Idrettshall", "Møterom"],
    available: true
  },
  {
    id: "service-3",
    name: "Kaffe og kaker",
    description: "Servering av kaffe, te og assorterte kaker for inntil 25 personer",
    price: 450,
    category: "catering",
    facilityTypes: ["Møterom", "Kulturhus"],
    available: true
  },
  {
    id: "service-4",
    name: "Projektor og lerret",
    description: "HD-projektor med stort lerret for presentasjoner",
    price: 200,
    category: "technical",
    facilityTypes: ["Møterom", "Kulturhus"],
    available: true
  },
  {
    id: "service-5",
    name: "Ekstra rengjøring",
    description: "Grundig rengjøring etter arrangement",
    price: 500,
    category: "cleaning",
    facilityTypes: ["Idrettshall", "Kulturhus", "Møterom", "Fotballbane"],
    available: true
  },
  {
    id: "service-6",
    name: "Svømmeutstyr",
    description: "Kickboards, pull-buoys og andre svømmehjelpemidler",
    price: 100,
    category: "equipment",
    facilityTypes: ["Svømmehall"],
    available: true
  },
  {
    id: "service-7",
    name: "Tennisracketer",
    description: "Utleie av tennisracketer og baller",
    price: 80,
    category: "equipment",
    facilityTypes: ["Tennisbane"],
    available: true
  },
  {
    id: "service-8",
    name: "Vaktmester",
    description: "Vaktmester tilstede under arrangement",
    price: 400,
    category: "staff",
    facilityTypes: ["Idrettshall", "Kulturhus", "Svømmehall"],
    available: true
  },
  {
    id: "service-9",
    name: "Lunch-pakke",
    description: "Lunsjpakker for inntil 20 personer",
    price: 800,
    category: "catering",
    facilityTypes: ["Møterom", "Kulturhus"],
    available: true
  },
  {
    id: "service-10",
    name: "Belysningsrigger",
    description: "Profesjonell scenebelysning for kulturarrangementer",
    price: 600,
    category: "technical",
    facilityTypes: ["Kulturhus"],
    available: false
  }
] as const;
