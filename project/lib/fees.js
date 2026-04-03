export const GST_RATE = 0.05;
export const DELIVERY_FEE = 30;

export function computeFees(subtotal) {
  const safeSubtotal = Number(subtotal) || 0;
  if (safeSubtotal <= 0) {
    return { subtotal: 0, gstAmount: 0, deliveryFee: 0, grandTotal: 0 };
  }

  const gstAmount = Math.round(safeSubtotal * GST_RATE);
  const deliveryFee = DELIVERY_FEE;
  const grandTotal = safeSubtotal + gstAmount + deliveryFee;

  return { subtotal: safeSubtotal, gstAmount, deliveryFee, grandTotal };
}
