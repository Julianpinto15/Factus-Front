import { Invoice } from './Invoice';

export interface PaginatedResponse {
  data: Invoice[];
  total: number;
}
