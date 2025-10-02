import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import { Search, Filter } from 'lucide-react';

interface SearchFilterProps {
  readonly searchQuery: string;
  readonly selectedType: string;
  readonly onSearchChange: (query: string) => void;
  readonly onTypeChange: (type: string) => void;
}

export const SearchFilter = ({
  searchQuery,
  selectedType,
  onSearchChange,
  onTypeChange
}: SearchFilterProps): JSX.Element => {
  const { t } = useTranslation();

  const facilityTypes = [
    { value: 'all', label: t('facility.facilityTypes.all') },
    { value: 'idrettshall', label: t('facility.facilityTypes.idrettshall') },
    { value: 'kulturhus', label: t('facility.facilityTypes.kulturhus') },
    { value: 'møterom', label: t('facility.facilityTypes.møterom') },
    { value: 'fotballbane', label: t('facility.facilityTypes.fotballbane') },
    { value: 'svømmehall', label: t('facility.facilityTypes.svømmehall') },
    { value: 'tennisbane', label: t('facility.facilityTypes.tennisbane') }
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={t('facility.searchFacilities')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Type Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-wrap gap-2">
          {facilityTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
