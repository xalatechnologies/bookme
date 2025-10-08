export interface IBookingHistoryItem {
  readonly id: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly title: string;
  readonly start: string;   // ISO
  readonly end: string;     // ISO
  readonly status: "completed" | "cancelled";
  readonly totalPriceNok?: number;
  readonly invoiceId?: string;
  readonly createdAt: string;
}

export interface IHistoryQuery {
  readonly from?: string;
  readonly to?: string;
  readonly statuses?: readonly ("completed" | "cancelled")[];
  readonly facilityIds?: readonly string[];
  readonly text?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sort?: "start_desc" | "start_asc";
}

export interface IHistoryPage {
  readonly items: readonly IBookingHistoryItem[];
  readonly total: number;
}
