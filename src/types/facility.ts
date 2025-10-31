export interface IFacility {
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
  // Admin-specific fields
  readonly status: "published" | "draft" | "archived";
  readonly owner: string;
  readonly lastUpdated: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly updatedBy?: string;
  // Additional fields for admin editing
  readonly rules?: string;
  readonly contactEmail?: string;
  readonly openingHours?: string;
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
  readonly emergencyContact?: string;
}

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