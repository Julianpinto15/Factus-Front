export interface Customer {
  identification: string; // Requerido, no puede ser null
  identification_document_id: number; // Requerido, no puede ser null
  dv?: string; // Opcional, permite null
  graphic_representation_name?: string | null; // Opcional, permite null
  company?: string | null; // Opcional, permite null
  trade_name?: string | null; // Opcional, permite null
  names?: string | null; // Opcional, permite null
  address?: string | null; // Opcional, permite null
  email?: string | null; // Opcional, permite null
  phone?: string | null; // Opcional, permite null
  legal_organization_id: string; // Requerido, no puede ser null
  tribute_id: string; // Requerido, ajustado a number para coincidir con la base de datos
  municipality_id?: string | null; // Opcional, permite null
}
