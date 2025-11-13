import React from 'react';
import { FacilityCard } from '@/components/features/facilities/components/FacilityCard';
import { useTranslation } from '@/i18n';
import { usePublishedFacilities } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';

interface FacilityGridProps {
  readonly searchQuery?: string;
  readonly selectedType?: string;
  readonly onBook?: (facilityId: string) => void;
  readonly onViewDetails?: (facilityId: string) => void;
}

export const FacilityGrid = ({
  searchQuery = '',
  selectedType = 'all',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBook: _onBook,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onViewDetails: _onViewDetails
}: FacilityGridProps): JSX.Element => {
  const { t } = useTranslation();
  const orgId = useOrganizationId();
  const { data: facilities = [], isLoading } = usePublishedFacilities(orgId);

  // Filter facilities based on search and type
  const filteredFacilities = React.useMemo(() => {
    return facilities.filter((facility) => {
      const matchesSearch = searchQuery === '' ||
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (facility.description && facility.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (facility.address && facility.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (facility.area && facility.area.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'all' ||
        (facility.facility_type && facility.facility_type.toLowerCase() === selectedType.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType, facilities]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">
          {t('facility.loading') || 'Loading...'}
        </div>
      </div>
    );
  }

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
          onAddressClick={(e) => {
            e.stopPropagation();
          }}
        />
      ))}
    </div>
  );
};
