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
  customer: CheckoutDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};
