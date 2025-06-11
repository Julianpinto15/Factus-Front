import { Customer } from '../../customer/interface/Customer';
import { Tribute } from '../../customer/interface/Tribute';
import { BillingPeriod } from './BillingPeriod';
import { InvoiceItem } from './InvoiceItem';

export interface Invoice {
  document: string;
  numbering_range_id: number;
  reference_code: string;
  observation: string;
  payment_form: string;
  payment_due_date: string;
  payment_method_code: string;
  billing_period: BillingPeriod;
  customer: Customer;
  items: InvoiceItem[];
}
