export interface FacilityFilters {
  readonly searchTerm?: string;
  readonly facilityType?: string;
  readonly location?: string;
  readonly accessibility?: string;
  readonly capacity?: readonly number[];
  readonly date?: Date;
  readonly priceRange?: {
    readonly min: number;
    readonly max: number;
  };
  readonly availableNow?: boolean;
  readonly amenities?: readonly string[];
}
