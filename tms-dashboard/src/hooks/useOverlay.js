import { create } from "zustand";

export const useOverlay = create((set) => ({
  open: false,
  type: null, // "customer" | "driver" | "truck" | "trailer" | "order"
  data: null,

  openOverlay: (type, data = null) => set({ open: true, type, data }),
  closeOverlay: () => set({ open: false, type: null, data: null }),
}));
