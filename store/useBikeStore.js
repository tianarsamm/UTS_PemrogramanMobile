// store/bikesStore.ts
import { create } from "zustand";

export const useBikesStore = create((set) => ({
  bikes: [],
  setBikes: (newBikes) => set({ bikes: newBikes }),
  updateBikeUnit: (id, newUnit) =>
    set((state) => ({
      bikes: state.bikes.map((bike) =>
        bike.id === id ? { ...bike, unit: newUnit } : bike
      ),
    })),
}));
