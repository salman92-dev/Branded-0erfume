export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string;
  notes: string[];
  category: string;
  image_url: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}
