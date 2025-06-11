import { WithholdingTax } from './WithholdingTax';

export interface InvoiceItem {
  code_reference: string;
  name: string;
  quantity: number;
  discount_rate: number;
  price: number;
  tax_rate: string;
  unit_measure_id: number;
  standard_code_id: number;
  is_excluded: number;
  tribute_id: string; // Ajustado a number para coincidir con la base de datos
  withholding_taxes: WithholdingTax[];
}
