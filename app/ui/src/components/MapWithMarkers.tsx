// app/ui/src/components/MapWithMarkers.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import { MARKER_COLORS } from "../constants/google-maps";
import { formatCurrencyValue, formatNumber } from "../utils/format";
import { useAdvancedMarker } from "../hooks/useAdvancedMarker";
import { useGoogleMaps } from "../contexts/GoogleMapsContext";
import { createMarkerContent } from "./MarkerIcon";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

const DEFAULT_CENTER = {
  lat: -25.4284,
  lng: -49.2733,
};

const DEFAULT_ZOOM = 10;
const MAX_ZOOM = 15;

interface MarkerData {
  id: number;
  latitude: number;
  longitude: number;
  nome: string;
  label?: string;
  preco?: number;
  quantidade?: number;
}

interface MapWithMarkersProps {
  markers: MarkerData[];
  onMarkerClick?: (markerId: number) => void;
  initialBounds?: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
}

export default function MapWithMarkers({
  markers,
  onMarkerClick,
  initialBounds,
}: MapWithMarkersProps) {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const advancedMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>(
    [],
  );
  const { markerLibrary, loading: markerLibraryLoading } =
    useAdvancedMarker(isLoaded);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleMarkerClick = useCallback(
    (marker: MarkerData) => {
      setSelectedMarker(marker);
      if (onMarkerClick) {
        onMarkerClick(marker.id);
      }
    },
    [onMarkerClick],
  );

  useEffect(() => {
    if (!map || markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    markers.forEach((marker) => {
      if (marker.latitude !== 0 && marker.longitude !== 0) {
        bounds.extend(
          new google.maps.LatLng(marker.latitude, marker.longitude),
        );
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);

      const listener = google.maps.event.addListener(
        map,
        "bounds_changed",
        () => {
          const currentZoom = map.getZoom();
          if (currentZoom && currentZoom > MAX_ZOOM) {
            map.setZoom(MAX_ZOOM);
          }
          google.maps.event.removeListener(listener);
        },
      );
    }
  }, [map, markers]);

  useEffect(() => {
    if (!map || !initialBounds) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(
      new google.maps.LatLng(initialBounds.south, initialBounds.west),
    );
    bounds.extend(
      new google.maps.LatLng(initialBounds.north, initialBounds.east),
    );
    map.fitBounds(bounds);
  }, [map, initialBounds]);

  useEffect(() => {
    if (
      !map ||
      !markerLibrary ||
      markerLibraryLoading ||
      markers.length === 0
    ) {
      return;
    }

    advancedMarkersRef.current.forEach((marker) => {
      marker.map = null;
    });
    advancedMarkersRef.current = [];

    const newMarkers = markers.map((markerData) => {
      const content = createMarkerContent({
        color: MARKER_COLORS.DEFAULT,
        scale: 1,
        ariaLabel: `${markerData.nome} - Clique para ver detalhes`,
      });

      const advancedMarker = new markerLibrary.AdvancedMarkerElement({
        map,
        position: { lat: markerData.latitude, lng: markerData.longitude },
        content,
        title: markerData.nome,
      });

      advancedMarker.addListener("click", () => {
        handleMarkerClick(markerData);
      });

      return advancedMarker;
    });

    advancedMarkersRef.current = newMarkers;

    return () => {
      advancedMarkersRef.current.forEach((marker) => {
        marker.map = null;
      });
      advancedMarkersRef.current = [];
    };
  }, [map, markerLibrary, markerLibraryLoading, markers, handleMarkerClick]);

  if (!isLoaded || markerLibraryLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-lg border border-background-light dark:border-background-dark bg-card-light dark:bg-card-dark">
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          Carregando mapa...
        </p>
      </div>
    );
  }

  if (!markerLibrary) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-lg border border-background-light dark:border-background-dark bg-card-light dark:bg-card-dark">
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          Erro ao carregar biblioteca de marcadores
        </p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      onLoad={onMapLoad}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        mapId: "DEMO_MAP_ID",
      }}
    >
      {selectedMarker && (
        <InfoWindow
          position={{
            lat: selectedMarker.latitude,
            lng: selectedMarker.longitude,
          }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div>
            <h3 className="font-bold text-text-light-primary dark:text-text-dark-primary">
              {selectedMarker.nome}
            </h3>
            {selectedMarker.label &&
              selectedMarker.label !== selectedMarker.nome && (
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-1">
                  {selectedMarker.label}
                </p>
              )}
            {selectedMarker.preco && (
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                R$ {formatCurrencyValue(selectedMarker.preco)}
              </p>
            )}
            {selectedMarker.quantidade && (
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                {formatNumber(selectedMarker.quantidade)} unidades
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
