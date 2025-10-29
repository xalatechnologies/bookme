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
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Test organization ID (proper UUID format)
const TEST_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * Seed Organizations or get existing
 */
async function seedOrganizations() {
  console.log('🏢 Checking organizations...');

  // Try to get existing organization first
  const { data: existing, error: fetchError } = await supabase
    .from('organizations')
    .select('id, slug')
    .eq('slug', 'drammen-kommune')
    .single();

  if (existing) {
    console.log(`✅ Using existing organization: ${existing.slug} (${existing.id})`);
    // Update TEST_ORG_ID to match existing
    return [existing];
  }

  // If no existing org, create new one
  const organizations = [
    {
      id: TEST_ORG_ID,
      name: 'Drammen Kommune',
      slug: 'drammen-kommune',
    },
  ];

  const { data, error } = await supabase
    .from('organizations')
    .insert(organizations)
    .select();

  if (error) {
    console.error('❌ Error creating organization:', error);
    throw error;
  }

  console.log(`✅ Created ${organizations.length} organization(s)`);
  return data;
}

/**
 * Seed Facilities (from coreFacilities.ts)
 */
async function seedFacilities(orgId: string) {
  console.log('🏟️  Seeding facilities...');

  const facilities = [
    {
      id: '11111111-1111-1111-1111-111111111001',
      org_id: orgId,
      name: 'Drammen Idrettshall',
      description: 'Moderne idrettshall med full utstyr for ballsport og trening. Perfekt for fotball, håndball, basketball og volleyball.',
      facility_type: 'Idrettshall',
      address: 'Hauges gate 100',
      city: 'Drammen',
      postal_code: '3019',
      country: 'NO',
      capacity: 200,
      rating: 4.5,
      review_count: 100,
      status: 'published',
      amenities: ['Garderober', 'Dusj', 'Parkering', 'Lyd/lys', 'Tribuner'],
      images: [
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
      ],
      status: 'published',
    },
    {
      id: '11111111-1111-1111-1111-111111111002',
      org_id: orgId,
      name: 'Strømsø Kulturhus',
      description: 'Fleksibelt kulturhus med scene og sal. Ideelt for konserter, teaterforestillinger, møter og kulturarrangementer.',
      facility_type: 'Møterom',
      address: 'Gamle Kirkegate 18, 3019 Drammen',
      capacity: 150,
      amenities: ['Scene', 'Lyd/lys', 'Projektor', 'Kjøkken', 'Garderober'],
      images: [
        'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&crop=center',
      ],
      rating: 4.2,
      review_count: 100,
      status: 'published',
    },
    {
      id: '11111111-1111-1111-1111-111111111003',
      org_id: orgId,
      name: 'Bragernes Møterom',
      description: 'Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for bedriftsmøter og presentasjoner.',
      facility_type: 'Møterom',
      address: 'Nedre Storgate 15, 3015 Drammen',
      capacity: 25,
      amenities: ['Projektor', 'Tavle', 'WiFi', 'Kaffe/te', 'Video konferanse'],
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&crop=center',
      ],
      rating: 4.7,
      review_count: 100,
      status: 'published',
    },
    {
      id: '11111111-1111-1111-1111-111111111004',
      org_id: orgId,
      name: 'Konnerud Fotballbane',
      description: 'Moderne kunstgressbane med flombelysning. Perfekt for fotballkamper og trening året rundt.',
      facility_type: 'Idrettshall',
      address: 'Konnerudgata 80, 3045 Drammen',
      capacity: 100,
      amenities: ['Garderober', 'Dusj', 'Flombelysning', 'Parkering', 'Tribuner'],
      images: [
        'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&h=600&fit=crop&crop=center',
      ],
      rating: 4.4,
      review_count: 100,
      status: 'published',
    },
    {
      id: '11111111-1111-1111-1111-111111111005',
      org_id: orgId,
      name: 'Drammen Svømmehall',
      description: 'Moderne svømmeanlegg med 25m basseng, barnebasseng og badstue. Åpent for svømmetrening og arrangementer.',
      facility_type: 'Idrettshall',
      address: 'Marienlystveien 2, 3016 Drammen',
      capacity: 80,
      amenities: ['25m basseng', 'Barnebasseng', 'Badstue', 'Garderober', 'Dusj', 'Parkering'],
      images: [
        'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&h=600&fit=crop&crop=center',
      ],
      rating: 4.6,
      review_count: 100,
      status: 'published',
    },
    {
      id: '11111111-1111-1111-1111-111111111006',
      org_id: orgId,
      name: 'Solberghallen',
      description: 'Solberghallen (Solberg Sport- og Kultursenter AS) er en idrettshall for inneidretter, foreninger, skoler, SFO, og private videregående skoler i Drammen kommune.',
      facility_type: 'Idrettshall',
      address: 'Gamle Riksvei 102A, 3057 Solbergelva',
      capacity: 100,
      amenities: ['Garderober', 'Dusj', 'Fotball', 'Basketball'],
      images: [
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&crop=center',
      ],
      rating: 4.6,
      review_count: 100,
      status: 'published',
    },
    {
      id: '11111111-1111-1111-1111-111111111007',
      org_id: orgId,
      name: 'Åssiden Tennisbane',
      description: 'Innendørs tennisbane med profesjonell underlag. Perfekt for tennisturneringer og trening året rundt.',
      facility_type: 'Idrettshall',
      address: 'Buskerudveien 200, 3027 Drammen',
      capacity: 20,
      amenities: ['Innendørs', 'Profesjonell underlag', 'Garderober', 'Utstyr utleie'],
      images: [
        'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop&crop=center',
      ],
      rating: 4.4,
      review_count: 100,
      status: 'published',
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
      facility_id: '11111111-1111-1111-1111-111111111002',
      name: 'Store Sal',
      description: 'Hovedsal med scene og full lyd/lys',
      capacity: 150,
      price_adjustment: 0,
      features: ['Scene', 'Fullsize lyd/lys', 'Projektor'],
    },
    {
      id: 'zone-kulturhus-small',
      facility_id: '11111111-1111-1111-1111-111111111002',
      name: 'Lille Sal',
      description: 'Mindre sal for møter og mindre arrangementer',
      capacity: 40,
      price_adjustment: -600,
      features: ['Møtebord', 'Projektor', 'WiFi'],
    },
    // Konnerud Fotballbane zones
    {
      id: 'zone-fotballbane-full',
      facility_id: '11111111-1111-1111-1111-111111111004',
      name: 'Full Bane',
      description: 'Full 11-er fotballbane',
      capacity: 100,
      price_adjustment: 0,
      features: ['11-er', 'Flombelysning', 'Kunstgress'],
    },
    {
      id: 'zone-fotballbane-half',
      facility_id: '11111111-1111-1111-1111-111111111004',
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
    },
    {
      id: 'service-referee',
      facility_id: '11111111-1111-1111-1111-111111111004',
      name: 'Dommer',
      description: 'Profesjonell dommer for kamper',
      price: 500,
    },
    {
      id: 'service-cleaning',
      facility_id: 'fac-drammen-idrettshall-001',
      name: 'Ekstra Renhold',
      description: 'Grundig renhold etter arrangement',
      price: 300,
    },
    // Conference/cultural facility services
    {
      id: 'service-av-equipment',
      facility_id: '11111111-1111-1111-1111-111111111002',
      name: 'Lyd/Lys Tekniker',
      description: 'Profesjonell lyd og lys tekniker',
      price: 800,
    },
    {
      id: 'service-catering-basic',
      facility_id: '11111111-1111-1111-1111-111111111003',
      name: 'Grunnleggende Servering',
      description: 'Kaffe, te, vann og kjeks',
      price: 250,
    },
    {
      id: 'service-catering-lunch',
      facility_id: '11111111-1111-1111-1111-111111111003',
      name: 'Lunsj Servering',
      description: 'Komplett lunsj for møtedeltakere',
      price: 400,
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
    const orgs = await seedOrganizations();
    const orgId = orgs[0].id;

    await seedFacilities(orgId);
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
