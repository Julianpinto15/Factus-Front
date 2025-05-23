export interface Customer {
  identification: string;
  identification_document_id: number;
  dv: number | null;
  graphic_representation_name: string;
  company: string;
  trade_name: string;
  names: string;
  address: string;
  email: string;
  phone: string;
  legal_organization_id: string;
  tribute_id: string;
  municipality_id: string;
}
