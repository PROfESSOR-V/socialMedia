import apiClient from "./apiClient";

export const api = {
  products: {
    list: async () => {
      const { data } = await apiClient.get("/api/products");
      return Array.isArray(data) ? data : data?.data || data?.products || [];
    },
    get: async (id: string) => {
      const { data } = await apiClient.get(`/api/products/${id}`);
      return data?.data || data || null;
    },
  },
  cart: {
    get: async () => {
      const { data } = await apiClient.get("/api/cart");
      return data?.data || data || null;
    },
    add: async (productId: string, quantity: number) => {
      const { data } = await apiClient.post("/api/cart/items", { productId, quantity });
      return data?.data || data || null;
    },
    update: async (productId: string, quantity: number) => {
      const { data } = await apiClient.put("/api/cart/items", { productId, quantity });
      return data?.data || data || null;
    },
    remove: async (productId: string) => {
      const { data } = await apiClient.delete(`/api/cart/items/${productId}`);
      return data?.data || data || null;
    },
    clear: async () => {
      const { data } = await apiClient.delete("/api/cart/items");
      return data?.data || data || null;
    },
    calculateTotal: (items: any[]) => {
      return items.reduce((acc, item) => acc + item.price, 0);
    },
  },
  orders: {
    createFromCart: async () => {
      const { data } = await apiClient.post("/api/orders");
      return data?.data || data || null;
    },
  },
  payments: {
    createIntent: async (orderId: string, provider: string = "dummy") => {
      const { data } = await apiClient.post("/api/payments/order", { orderId, provider });
      return data?.data || data || null;
    }
  }
};
