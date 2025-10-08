import type { IHistoryQuery, IHistoryPage } from "@/types/history";

// Mock service - replace with actual HTTP calls
export const historyService = {
  async list(q: IHistoryQuery): Promise<IHistoryPage> {
    // Mock data for development
    const mockItems = [
      {
        id: "1",
        facilityId: "facility-1",
        facilityName: "Drammenshallen",
        title: "Fotballtrening",
        start: "2024-01-15T10:00:00.000Z",
        end: "2024-01-15T12:00:00.000Z",
        status: "completed" as const,
        totalPriceNok: 2400,
        invoiceId: "INV-001",
        createdAt: "2024-01-10T08:00:00.000Z"
      },
      {
        id: "2",
        facilityId: "facility-2",
        facilityName: "Kulturhuset",
        title: "Konsert",
        start: "2024-01-12T18:00:00.000Z",
        end: "2024-01-12T20:00:00.000Z",
        status: "cancelled" as const,
        totalPriceNok: 1200,
        invoiceId: "INV-002",
        createdAt: "2024-01-08T10:00:00.000Z"
      },
      {
        id: "3",
        facilityId: "facility-3",
        facilityName: "Idrettshallen",
        title: "Basketball",
        start: "2024-01-08T14:00:00.000Z",
        end: "2024-01-08T16:00:00.000Z",
        status: "completed" as const,
        totalPriceNok: 1800,
        invoiceId: "INV-003",
        createdAt: "2024-01-05T12:00:00.000Z"
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter based on query parameters
    let filtered = mockItems;
    
    if (q.facilityIds && q.facilityIds.length > 0) {
      filtered = filtered.filter(item => q.facilityIds!.includes(item.facilityId));
    }
    
    if (q.statuses && q.statuses.length > 0) {
      filtered = filtered.filter(item => q.statuses!.includes(item.status));
    }
    
    if (q.text) {
      const searchText = q.text.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchText) ||
        item.facilityName.toLowerCase().includes(searchText)
      );
    }
    
    if (q.from) {
      filtered = filtered.filter(item => item.start >= q.from!);
    }
    
    if (q.to) {
      filtered = filtered.filter(item => item.start <= q.to!);
    }
    
    // Sort
    if (q.sort === "start_asc") {
      filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
    }
    
    // Pagination
    const page = q.page || 1;
    const pageSize = q.pageSize || 25;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filtered.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      total: filtered.length
    };
  },
  
  async exportCsv(q: IHistoryQuery): Promise<Blob> {
    const { items } = await this.list(q);
    
    const headers = ["Dato", "Tid", "Lokale", "Aktivitet", "Varighet", "Status", "Sum", "Faktura"];
    const csvContent = [
      headers.join(","),
      ...items.map(item => [
        new Date(item.start).toLocaleDateString("nb-NO"),
        `${new Date(item.start).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}-${new Date(item.end).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`,
        item.facilityName,
        item.title,
        `${(new Date(item.end).getTime() - new Date(item.start).getTime()) / 3_600_000} t`,
        item.status,
        item.totalPriceNok ? `${item.totalPriceNok} kr` : "-",
        item.invoiceId || "-"
      ].join(","))
    ].join("\n");
    
    return new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  }
} as const;
