// app/ui/src/contexts/GoogleMapsContext.tsx
import { createContext, useContext, ReactNode, useState } from "react";
import { LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "../constants/google-maps";

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(
  undefined,
);

interface GoogleMapsProviderProps {
  children: ReactNode;
  apiKey: string;
}

export function GoogleMapsProvider({
  children,
  apiKey,
}: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const handleLoad = () => {
    setIsLoaded(true);
    setLoadError(null);
  };

  const handleError = (error: Error) => {
    setLoadError(error);
    setIsLoaded(false);
  };

  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      onLoad={handleLoad}
      onError={handleError}
    >
      <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
}
