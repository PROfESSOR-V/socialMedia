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
    list: async () => {
      const { data } = await apiClient.get("/api/orders");
      return Array.isArray(data) ? data : data?.data || [];
    },
    get: async (id: string) => {
      const { data } = await apiClient.get(`/api/orders/${id}`);
      return data?.data || data || null;
    }
  },
  payments: {
    createIntent: async (orderId: string, provider: string = "CASHFREE", returnUrl?: string) => {
      const { data } = await apiClient.post("/api/payments/order", { orderId, provider, returnUrl });
      return data?.data || data || null;
    }
  },
  user: {
    profile: {
      get: async () => {
        const { data } = await apiClient.get("/api/user/profile");
        return data?.data || data || null;
      },
      update: async (profileData: any) => {
        const { data } = await apiClient.put("/api/user/profile", profileData);
        return data?.data || data || null;
      }
    }
  }
};
