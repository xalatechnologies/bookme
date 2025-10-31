export interface IOrganization {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}