import type { CheckoutDetails } from "../types";

export type CheckoutFieldErrors = Partial<Record<keyof CheckoutDetails, string>>;

export function validateCheckoutDetails(details: CheckoutDetails): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const address = details.address.trim();

  if (details.fullName.trim().length < 2) {
    errors.fullName = "Nhập họ tên có ít nhất 2 ký tự.";
  }
  if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(details.phone.replace(/\s/g, ""))) {
    errors.phone = "Nhập số điện thoại Việt Nam hợp lệ.";
  }
  if (address.length < 10 || !/[\p{L}]/u.test(address)) {
    errors.address = "Nhập số nhà, tên đường và khu vực giao hàng cụ thể hơn.";
  }

  return errors;
}
