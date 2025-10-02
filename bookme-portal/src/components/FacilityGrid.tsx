import React from 'react';
import { FacilityCard } from '@/components/facility/FacilityCard';
import { useTranslation } from '@/i18n';
import { coreFacilities } from '@/data/coreFacilities';

interface FacilityGridProps {
  readonly searchQuery?: string;
  readonly selectedType?: string;
  readonly onBook?: (facilityId: string) => void;
  readonly onViewDetails?: (facilityId: string) => void;
}

export const FacilityGrid = ({ 
  searchQuery = '', 
  selectedType = 'all',
  onBook,
  onViewDetails 
}: FacilityGridProps): JSX.Element => {
  const { t } = useTranslation();

  // Filter facilities based on search and type
  const filteredFacilities = React.useMemo(() => {
    return coreFacilities.filter((facility) => {
      const matchesSearch = searchQuery === '' || 
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || 
        facility.type.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType]);

  if (filteredFacilities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">
          {t('facility.noFacilitiesFound')}
        </div>
        <p className="text-sm text-muted-foreground">
          Prøv å justere søkekriteriene dine
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredFacilities.map((facility) => (
        <FacilityCard
          key={facility.id}
          facility={facility}
          onAddressClick={(e, facility) => {
            e.stopPropagation();
            console.log('Address clicked for facility:', facility.name);
          }}
        />
      ))}
    </div>
  );
};
