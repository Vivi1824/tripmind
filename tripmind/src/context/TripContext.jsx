import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TripContext = createContext();
const FAVORITES_STORAGE_KEY = "tripmind-favorites";
const CURRENT_TRIP_STORAGE_KEY = "tripmind-current-trip";

export function TripProvider({ children }) {
  const [currentTrip, setCurrentTrip] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return JSON.parse(localStorage.getItem(CURRENT_TRIP_STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  });

  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_TRIP_STORAGE_KEY, JSON.stringify(currentTrip));
    }
  }, [currentTrip]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  const toggleFavorite = (place) => {
    setFavorites((previous) => {
      const exists = previous.some((item) => item.id === place.id);
      if (exists) {
        return previous.filter((item) => item.id !== place.id);
      }

      return [...previous, place];
    });
  };

  const value = useMemo(
    () => ({
      currentTrip,
      setCurrentTrip,
      favorites,
      toggleFavorite,
    }),
    [currentTrip, favorites]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  return useContext(TripContext);
}
