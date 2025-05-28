export interface Product {
  id?: number;
  code: string;
  name: string;
  description: string;
  price: number;
  taxRate: string;
  unitMeasureId: number;
  standardCodeId: number;
  isExcluded: number;
  tributeId: number;
  active: boolean;
  quantity?: number;
  discountRate?: number;
}

export interface PaginatedResponse {
  data: Product[];
  total: number;
}
