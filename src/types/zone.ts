export interface IZone {
  readonly id: string;
  readonly name: string;
  readonly facilityId: string;
  readonly capacity: number;
  readonly pricePerHour: number;
  readonly area?: number;
  readonly description?: string;
  readonly amenities: readonly string[];
  readonly availability: {
    readonly monday: { readonly start: string; readonly end: string; };
    readonly tuesday: { readonly start: string; readonly end: string; };
    readonly wednesday: { readonly start: string; readonly end: string; };
    readonly thursday: { readonly start: string; readonly end: string; };
    readonly friday: { readonly start: string; readonly end: string; };
    readonly saturday: { readonly start: string; readonly end: string; };
    readonly sunday: { readonly start: string; readonly end: string; };
  };
}