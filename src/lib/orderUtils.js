export const ORDER_STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  PREPARING: "Preparing",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const BUYER_CANCELABLE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
];

export function canBuyerCancelOrder(status) {
  return BUYER_CANCELABLE_STATUSES.includes(status);
}

export function buildOrderTitle(status) {
  if (status === ORDER_STATUS.ACCEPTED) return "Order accepted";
  if (status === ORDER_STATUS.PREPARING) return "Order dispatch started";
  if (status === ORDER_STATUS.DISPATCHED) return "Order dispatched";
  if (status === ORDER_STATUS.DELIVERED) return "Order delivered to pickup point";
  if (status === ORDER_STATUS.COMPLETED) return "Order completed";
  if (status === ORDER_STATUS.CANCELLED) return "Order cancelled";
  return "Order update";
}

export function getSellerNextAction(order) {
  const nextActionByStatus = {
    [ORDER_STATUS.PENDING]: { label: "Accept order", status: ORDER_STATUS.ACCEPTED },
    [ORDER_STATUS.ACCEPTED]: { label: "Start dispatch", status: ORDER_STATUS.PREPARING },
    [ORDER_STATUS.PREPARING]: { label: "Mark dispatched", status: ORDER_STATUS.DISPATCHED },
    [ORDER_STATUS.DISPATCHED]: { label: "Mark delivered", status: ORDER_STATUS.DELIVERED },
    [ORDER_STATUS.DELIVERED]: { label: "Mark completed", status: ORDER_STATUS.COMPLETED },
  };

  return nextActionByStatus[order.status] || null;
}

export function getOrderStatusOptions(currentStatus) {
  const orderStatusFlow = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED],
    [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.PREPARING, ORDER_STATUS.DISPATCHED],
    [ORDER_STATUS.DISPATCHED]: [ORDER_STATUS.DISPATCHED, ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.CANCELLED]: [ORDER_STATUS.CANCELLED],
  };

  return orderStatusFlow[currentStatus] || [currentStatus];
}
