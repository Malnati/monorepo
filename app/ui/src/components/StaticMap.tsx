// app/ui/src/components/StaticMap.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMaps } from "../contexts/GoogleMapsContext";
import { useAdvancedMarker } from "../hooks/useAdvancedMarker";
import { createMarkerContent } from "./MarkerIcon";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "300px",
};

interface StaticMapProps {
  latitude: number;
  longitude: number;
  label?: string;
}

export default function StaticMap({
  latitude,
  longitude,
  label,
}: StaticMapProps) {
  const { isLoaded } = useGoogleMaps();
  const { markerLibrary, loading: markerLibraryLoading } =
    useAdvancedMarker(isLoaded);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  );

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (!map || !markerLibrary || markerLibraryLoading) {
      return;
    }

    // Limpar marcador anterior
    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current = null;
    }

    // Validar coordenadas válidas (latitude e longitude devem estar entre -90 e 90, e -180 e 180 respectivamente)
    const isValidLat = latitude >= -90 && latitude <= 90 && latitude !== 0;
    const isValidLng = longitude >= -180 && longitude <= 180 && longitude !== 0;

    if (!isValidLat || !isValidLng) {
      return;
    }

    const center = { lat: latitude, lng: longitude };

    // Criar novo marcador
    const content = createMarkerContent({
      color: "#28a745",
      scale: 1,
      ariaLabel: label || "Localização",
    });

    const marker = new markerLibrary.AdvancedMarkerElement({
      map,
      position: center,
      content,
      title: label || "Localização",
    });

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, markerLibrary, markerLibraryLoading, latitude, longitude, label]);

  if (!isLoaded || markerLibraryLoading) {
    return (
      <div className="w-full h-72 flex items-center justify-center rounded-lg border border-background-light dark:border-background-dark bg-card-light dark:bg-card-dark">
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          Carregando mapa...
        </p>
      </div>
    );
  }

  if (!markerLibrary) {
    return (
      <div className="w-full h-72 flex items-center justify-center rounded-lg border border-background-light dark:border-background-dark bg-card-light dark:bg-card-dark">
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          Erro ao carregar biblioteca de marcadores
        </p>
      </div>
    );
  }

  // Validar coordenadas válidas (latitude e longitude devem estar entre -90 e 90, e -180 e 180 respectivamente)
  const isValidLat = latitude >= -90 && latitude <= 90 && latitude !== 0;
  const isValidLng = longitude >= -180 && longitude <= 180 && longitude !== 0;

  if (!isValidLat || !isValidLng) {
    return (
      <div className="w-full h-72 flex items-center justify-center rounded-lg border border-background-light dark:border-background-dark bg-card-light dark:bg-card-dark">
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          Localização não disponível
        </p>
      </div>
    );
  }

  const center = { lat: latitude, lng: longitude };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-background-light dark:border-background-dark">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={15}
        onLoad={onMapLoad}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          mapId: "DEMO_MAP_ID",
        }}
      />
    </div>
  );
}
