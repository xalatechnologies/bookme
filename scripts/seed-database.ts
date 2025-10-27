/**
 * Database Seeding Script
 *
 * This script converts the existing mock data from:
 * - src/data/coreFacilities.ts
 * - src/data/zones/dummyZones.ts
 * - src/data/bookings/dummyBookings.ts
 * - src/data/additionalServices/dummyServices.ts
 *
 * Into Supabase database records
 *
 * Usage:
 *   ts-node scripts/seed-database.ts
 *
 * Or with environment:
 *   SUPABASE_URL=your_url SUPABASE_KEY=your_key ts-node scripts/seed-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Test organization ID
const TEST_ORG_ID = 'org-drammen-001';

/**
 * Seed Organizations
 */
async function seedOrganizations() {
  console.log('🏢 Seeding organizations...');

  const organizations = [
    {
      id: TEST_ORG_ID,
      name: 'Drammen Kommune',
      slug: 'drammen-kommune',
    },
    {
      id: 'org-seed-001',
      name: 'BookMe Demo Organization',
      slug: 'bookme-demo',
    },
  ];

  const { data, error } = await supabase
    .from('organizations')
    .upsert(organizations, { onConflict: 'id' });

  if (error) {
    console.error('❌ Error seeding organizations:', error);
    throw error;
  }

  console.log(`✅ Seeded ${organizations.length} organizations`);
  return organizations;
}

/**
 * Seed Facilities (from coreFacilities.ts)
 */
async function seedFacilities() {
  console.log('🏟️  Seeding facilities...');

  const facilities = [
    {
      id: 'fac-drammen-idrettshall-001',
      org_id: TEST_ORG_ID,
      name: 'Drammen Idrettshall',
      description: 'Moderne idrettshall med full utstyr for ballsport og trening. Perfekt for fotball, håndball, basketball og volleyball.',
      type: 'sports' as const,
      address: 'Bragernes Torg 2, 3017 Drammen',
      capacity: 200,
      price_per_hour: 850,
      amenities: ['Garderober', 'Dusj', 'Parkering', 'Lyd/lys', 'Tribuner'],
      images: [
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
      ],
      coordinates: { lat: 59.7436, lng: 10.2045 } as any,
      rating: 4.5,
      status: 'published' as const,
    },
    {
      id: 'fac-stromso-kulturhus-001',
      org_id: TEST_ORG_ID,
      name: 'Strømsø Kulturhus',
      description: 'Fleksibelt kulturhus med scene og sal. Ideelt for konserter, teaterforestillinger, møter og kulturarrangementer.',
      type: 'conference' as const,
      address: 'Gamle Kirkegate 18, 3019 Drammen',
      capacity: 150,
      price_per_hour: 1200,
      amenities: ['Scene', 'Lyd/lys', 'Projektor', 'Kjøkken', 'Garderober'],
      images: [
        'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&crop=center',
      ],
      coordinates: { lat: 59.7389, lng: 10.2134 } as any,
      rating: 4.2,
      status: 'published' as const,
    },
    {
      id: 'fac-bragernes-moterom-001',
      org_id: TEST_ORG_ID,
      name: 'Bragernes Møterom',
      description: 'Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for bedriftsmøter og presentasjoner.',
      type: 'conference' as const,
      address: 'Nedre Storgate 15, 3015 Drammen',
      capacity: 25,
      price_per_hour: 600,
      amenities: ['Projektor', 'Tavle', 'WiFi', 'Kaffe/te', 'Video konferanse'],
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&crop=center',
      ],
      coordinates: { lat: 59.7445, lng: 10.2034 } as any,
      rating: 4.7,
      status: 'published' as const,
    },
    {
      id: 'fac-konnerud-fotballbane-001',
      org_id: TEST_ORG_ID,
      name: 'Konnerud Fotballbane',
      description: 'Moderne kunstgressbane med flombelysning. Perfekt for fotballkamper og trening året rundt.',
      type: 'sports' as const,
      address: 'Konnerudgata 80, 3045 Drammen',
      capacity: 100,
      price_per_hour: 750,
      amenities: ['Garderober', 'Dusj', 'Flombelysning', 'Parkering', 'Tribuner'],
      images: [
        'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&h=600&fit=crop&crop=center',
      ],
      coordinates: { lat: 59.7234, lng: 10.1845 } as any,
      rating: 4.4,
      status: 'published' as const,
    },
    {
      id: 'fac-drammen-svommehall-001',
      org_id: TEST_ORG_ID,
      name: 'Drammen Svømmehall',
      description: 'Moderne svømmeanlegg med 25m basseng, barnebasseng og badstue. Åpent for svømmetrening og arrangementer.',
      type: 'sports' as const,
      address: 'Marienlystveien 2, 3016 Drammen',
      capacity: 80,
      price_per_hour: 950,
      amenities: ['25m basseng', 'Barnebasseng', 'Badstue', 'Garderober', 'Dusj', 'Parkering'],
      images: [
        'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&h=600&fit=crop&crop=center',
      ],
      coordinates: { lat: 59.7467, lng: 10.2123 } as any,
      rating: 4.6,
      status: 'published' as const,
    },
  ];

  const { data, error } = await supabase
    .from('facilities')
    .upsert(facilities, { onConflict: 'id' });

  if (error) {
    console.error('❌ Error seeding facilities:', error);
    throw error;
  }

  console.log(`✅ Seeded ${facilities.length} facilities`);
  return facilities;
}

/**
 * Seed Zones (from dummyZones.ts)
 */
async function seedZones() {
  console.log('📍 Seeding zones...');

  const zones = [
    // Drammen Idrettshall zones
    {
      id: 'zone-idrettshall-main',
      facility_id: 'fac-drammen-idrettshall-001',
      name: 'Hovedhall',
      description: 'Full idrettshall med alle fasiliteter',
      capacity: 200,
      price_adjustment: 0,
      features: ['Fullsize bane', 'Tribuner', 'Lyd/lys'],
    },
    {
      id: 'zone-idrettshall-half',
      facility_id: 'fac-drammen-idrettshall-001',
      name: 'Halv Hall',
      description: 'Halv idrettshall med nett skillevegg',
      capacity: 100,
      price_adjustment: -300,
      features: ['Halv bane', 'Nett skillevegg'],
    },
    // Strømsø Kulturhus zones
    {
      id: 'zone-kulturhus-hall',
      facility_id: 'fac-stromso-kulturhus-001',
      name: 'Store Sal',
      description: 'Hovedsal med scene og full lyd/lys',
      capacity: 150,
      price_adjustment: 0,
      features: ['Scene', 'Fullsize lyd/lys', 'Projektor'],
    },
    {
      id: 'zone-kulturhus-small',
      facility_id: 'fac-stromso-kulturhus-001',
      name: 'Lille Sal',
      description: 'Mindre sal for møter og mindre arrangementer',
      capacity: 40,
      price_adjustment: -600,
      features: ['Møtebord', 'Projektor', 'WiFi'],
    },
    // Konnerud Fotballbane zones
    {
      id: 'zone-fotballbane-full',
      facility_id: 'fac-konnerud-fotballbane-001',
      name: 'Full Bane',
      description: 'Full 11-er fotballbane',
      capacity: 100,
      price_adjustment: 0,
      features: ['11-er', 'Flombelysning', 'Kunstgress'],
    },
    {
      id: 'zone-fotballbane-half',
      facility_id: 'fac-konnerud-fotballbane-001',
      name: 'Halv Bane',
      description: '7-er fotballbane',
      capacity: 50,
      price_adjustment: -350,
      features: ['7-er', 'Flombelysning', 'Kunstgress'],
    },
  ];

  const { data, error } = await supabase
    .from('zones')
    .upsert(zones, { onConflict: 'id' });

  if (error) {
    console.error('❌ Error seeding zones:', error);
    throw error;
  }

  console.log(`✅ Seeded ${zones.length} zones`);
  return zones;
}

/**
 * Seed Additional Services (from dummyServices.ts)
 */
async function seedAdditionalServices() {
  console.log('🛠️  Seeding additional services...');

  const services = [
    // Sports facility services
    {
      id: 'service-equipment-rental',
      facility_id: 'fac-drammen-idrettshall-001',
      name: 'Utstyr Leie',
      description: 'Leie av baller, nett, vester og annet treningsutstyr',
      price: 150,
      category: 'equipment' as const,
    },
    {
      id: 'service-referee',
      facility_id: 'fac-konnerud-fotballbane-001',
      name: 'Dommer',
      description: 'Profesjonell dommer for kamper',
      price: 500,
      category: 'staff' as const,
    },
    {
      id: 'service-cleaning',
      facility_id: 'fac-drammen-idrettshall-001',
      name: 'Ekstra Renhold',
      description: 'Grundig renhold etter arrangement',
      price: 300,
      category: 'cleaning' as const,
    },
    // Conference/cultural facility services
    {
      id: 'service-av-equipment',
      facility_id: 'fac-stromso-kulturhus-001',
      name: 'Lyd/Lys Tekniker',
      description: 'Profesjonell lyd og lys tekniker',
      price: 800,
      category: 'staff' as const,
    },
    {
      id: 'service-catering-basic',
      facility_id: 'fac-bragernes-moterom-001',
      name: 'Grunnleggende Servering',
      description: 'Kaffe, te, vann og kjeks',
      price: 250,
      category: 'catering' as const,
    },
    {
      id: 'service-catering-lunch',
      facility_id: 'fac-bragernes-moterom-001',
      name: 'Lunsj Servering',
      description: 'Komplett lunsj for møtedeltakere',
      price: 400,
      category: 'catering' as const,
    },
  ];

  const { data, error } = await supabase
    .from('additional_services')
    .upsert(services, { onConflict: 'id' });

  if (error) {
    console.error('❌ Error seeding additional services:', error);
    throw error;
  }

  console.log(`✅ Seeded ${services.length} additional services`);
  return services;
}

/**
 * Main seed function
 */
async function seedDatabase() {
  console.log('\n🌱 Starting database seeding...\n');

  try {
    // Seed in order (respecting foreign key constraints)
    await seedOrganizations();
    await seedFacilities();
    await seedZones();
    await seedAdditionalServices();

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('  - Organizations: 2');
    console.log('  - Facilities: 5');
    console.log('  - Zones: 6');
    console.log('  - Additional Services: 6');
    console.log('  - Total: 19 records\n');
    console.log('🎉 Your database is ready to use!\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase, seedOrganizations, seedFacilities, seedZones, seedAdditionalServices };
