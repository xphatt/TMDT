export type CategoryId = "milk-tea" | "fruit-tea" | "macchiato" | "topping";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  description: string;
  ingredients: string;
  tags: Array<"Bán chạy" | "Mới">;
  popularity: number;
  image: string;
  imagePosition: string;
  tone: "milk" | "orange" | "green" | "purple";
  originalPrice?: number;
  promotion?: Promotion;
  isActive?: boolean;
};

export type Promotion = {
  id: string;
  productId: string;
  label: string;
  salePrice: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export type DrinkSize = "M" | "L";
export type SugarLevel = "0%" | "30%" | "50%" | "70%" | "100%";
export type IceLevel = "Không đá" | "Ít đá" | "Vừa" | "Nhiều đá";

export type ToppingOption = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  key: string;
  productId: string;
  size: DrinkSize;
  sugar: SugarLevel;
  ice: IceLevel;
  toppings: string[];
  quantity: number;
  unitPrice: number;
  productName?: string;
  toppingDetails?: Array<{ id: string; name: string; price: number }>;
};

export type CheckoutDetails = {
  fullName: string;
  phone: string;
  address: string;
  note: string;
  payment: "cash" | "bank";
};

export type MockOrder = {
  id: string;
  createdAt: string;
  confirmedAt: string | null;
  status: "pending" | "confirmed";
  customer: CheckoutDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: {
    provider: "cash_on_delivery" | "mock_qr";
    paymentStatus: "unpaid" | "simulation_only";
    message: string;
    reference: string | null;
  };
};
