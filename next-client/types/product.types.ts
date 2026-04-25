export type ProductSize = "s" | "m" | "l" | "xl" | "2xl" | "3xl";

export type ProductVariant = {
  sku: string;
  color: string;
  sizes: ProductSize | string;
  stock: number;
};

export type ProductCategoryRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      slug?: string;
    }
  | null
  | undefined;

export type AdminProduct = {
  _id?: string;
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  category?: ProductCategoryRef;
  price?: number;
  discountPercentage?: number;
  variants?: ProductVariant[];
  tags?: string[];
  thumbnail?: string;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminProductListResponse = {
  success: boolean;
  products: AdminProduct[];
  pagination: AdminProductPagination;
};

export type GetAdminProductsParams = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  isActive?: "true" | "false" | "all";
  sortPrice?: "asc" | "desc";
};

export type UpsertProductPayload = {
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  variants: ProductVariant[];
  tags?: string[];
  isActive?: boolean;
  thumbnail?: File | Blob | null;
  images?: Array<File | Blob>;
  destroyImages?: string[];
};
