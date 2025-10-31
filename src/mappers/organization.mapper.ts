import type { IOrganization } from '@/types/organization';

export function mapOrganizationFromDb(row: any): IOrganization {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    contactEmail: row.contact_email ?? '',
    contactPhone: row.contact_phone ?? '',
    address: row.address ?? '',
    website: row.website ?? '',
    logo: row.logo ?? '',
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapOrganizationToDb(organization: Partial<IOrganization>): any {
  const mapped: any = {};
  
  if (organization.name !== undefined) mapped.name = organization.name;
  if (organization.description !== undefined) mapped.description = organization.description;
  if (organization.contactEmail !== undefined) mapped.contact_email = organization.contactEmail;
  if (organization.contactPhone !== undefined) mapped.contact_phone = organization.contactPhone;
  if (organization.address !== undefined) mapped.address = organization.address;
  if (organization.website !== undefined) mapped.website = organization.website;
  if (organization.logo !== undefined) mapped.logo = organization.logo;
  if (organization.createdAt !== undefined) mapped.created_at = organization.createdAt;
  if (organization.updatedAt !== undefined) mapped.updated_at = organization.updatedAt;
  
  return mapped;
}