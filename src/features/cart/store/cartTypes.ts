export interface CartItem {
  productId: number;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
  category?: string;
}

export interface CartState {
  items: CartItem[];
}
