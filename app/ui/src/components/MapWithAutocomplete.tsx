// app/ui/src/components/MapWithAutocomplete.tsx
import { useRef, useState, useCallback, useEffect } from "react";
import { GoogleMap, StandaloneSearchBox } from "@react-google-maps/api";
import { useGoogleMaps } from "../contexts/GoogleMapsContext";
import { useAdvancedMarker } from "../hooks/useAdvancedMarker";
import { createMarkerContent } from "./MarkerIcon";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "400px",
};

const DEFAULT_CENTER = {
  lat: -25.4284,
  lng: -49.2733,
};

const DEFAULT_ZOOM = 13;

interface MapWithAutocompleteProps {
  onLocationSelect?: (address: {
    formattedAddress: string;
    placeId: string;
    latitude: number;
    longitude: number;
    geocodingAccuracy?: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

export default function MapWithAutocomplete({
  onLocationSelect,
  initialLocation,
}: MapWithAutocompleteProps) {
  const { isLoaded } = useGoogleMaps();
  const { markerLibrary, loading: markerLibraryLoading } =
    useAdvancedMarker(isLoaded);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral>(
      initialLocation
        ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
        : DEFAULT_CENTER,
    );
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [hasGeocodedInitialLocation, setHasGeocodedInitialLocation] =
    useState(false);
  const [lastGeocodedLocation, setLastGeocodedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const advancedMarkerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const onMapLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      // Se houver localização inicial, centralizar o mapa nela
      if (initialLocation) {
        const location = {
          lat: initialLocation.latitude,
          lng: initialLocation.longitude,
        };
        mapInstance.setCenter(location);
        mapInstance.setZoom(16);
        setMarkerPosition(location);
      }
    },
    [initialLocation],
  );

  // Geocodificar localização inicial quando o mapa estiver pronto ou quando initialLocation mudar
  useEffect(() => {
    if (!map || !initialLocation || !onLocationSelect) return;

    // Verificar se a localização mudou
    const locationChanged =
      !lastGeocodedLocation ||
      lastGeocodedLocation.latitude !== initialLocation.latitude ||
      lastGeocodedLocation.longitude !== initialLocation.longitude;

    if (!locationChanged && hasGeocodedInitialLocation) return;

    const geocoder = new google.maps.Geocoder();
    const location = {
      lat: initialLocation.latitude,
      lng: initialLocation.longitude,
    };

    // Centralizar mapa na localização inicial
    map.setCenter(location);
    map.setZoom(16);
    setMarkerPosition(location);

    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const formattedAddress = results[0].formatted_address || "";
        // Preencher o campo de busca com o endereço formatado
        if (searchInputRef.current) {
          searchInputRef.current.value = formattedAddress;
        }

        onLocationSelect({
          formattedAddress,
          placeId: results[0].place_id || "",
          latitude: location.lat,
          longitude: location.lng,
          geocodingAccuracy: results[0].geometry.location_type || "APPROXIMATE",
        });
        setHasGeocodedInitialLocation(true);
        setLastGeocodedLocation(initialLocation);
      }
    });
  }, [
    map,
    initialLocation,
    hasGeocodedInitialLocation,
    onLocationSelect,
    lastGeocodedLocation,
  ]);

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const location = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      setMarkerPosition(location);
      if (advancedMarkerRef.current) {
        advancedMarkerRef.current.position = location;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results && results[0] && onLocationSelect) {
          const formattedAddress = results[0].formatted_address || "";
          // Atualizar o campo de busca com o endereço geocodificado
          if (searchInputRef.current) {
            searchInputRef.current.value = formattedAddress;
          }

          onLocationSelect({
            formattedAddress,
            placeId: results[0].place_id || "",
            latitude: location.lat,
            longitude: location.lng,
            geocodingAccuracy:
              results[0].geometry.location_type || "APPROXIMATE",
          });
        }
      });
    },
    [onLocationSelect],
  );

  // Criar/atualizar AdvancedMarkerElement
  useEffect(() => {
    if (!map || !markerLibrary || markerLibraryLoading) {
      return;
    }

    // Limpar marcador anterior
    if (advancedMarkerRef.current) {
      advancedMarkerRef.current.map = null;
      advancedMarkerRef.current = null;
    }

    // Criar novo marcador
    const content = createMarkerContent({
      color: "#28a745",
      scale: 1,
      ariaLabel: "Localização do resíduo - Arraste para ajustar",
    });

    const marker = new markerLibrary.AdvancedMarkerElement({
      map,
      position: markerPosition,
      content,
      title: "Localização do resíduo",
      gmpDraggable: true,
    });

    marker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
      handleMarkerDragEnd(e);
    });

    advancedMarkerRef.current = marker;

    return () => {
      if (advancedMarkerRef.current) {
        advancedMarkerRef.current.map = null;
        advancedMarkerRef.current = null;
      }
    };
  }, [
    map,
    markerLibrary,
    markerLibraryLoading,
    markerPosition,
    handleMarkerDragEnd,
  ]);

  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  const onPlacesChanged = useCallback(() => {
    if (!searchBox) return;

    const places = searchBox.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    if (!place.geometry || !place.geometry.location) return;

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setMarkerPosition(location);
    map?.setCenter(location);
    map?.setZoom(16);

    const formattedAddress = place.formatted_address || "";

    if (onLocationSelect) {
      onLocationSelect({
        formattedAddress,
        placeId: place.place_id || "",
        latitude: location.lat,
        longitude: location.lng,
        geocodingAccuracy: place.geometry.location_type || "APPROXIMATE",
      });
    }
  }, [searchBox, map, onLocationSelect]);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const location = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      setMarkerPosition(location);

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results && results[0] && onLocationSelect) {
          const formattedAddress = results[0].formatted_address || "";
          // Atualizar o campo de busca com o endereço geocodificado
          if (searchInputRef.current) {
            searchInputRef.current.value = formattedAddress;
          }

          onLocationSelect({
            formattedAddress,
            placeId: results[0].place_id || "",
            latitude: location.lat,
            longitude: location.lng,
            geocodingAccuracy:
              results[0].geometry.location_type || "APPROXIMATE",
          });
        }
      });
    },
    [onLocationSelect],
  );

  if (!isLoaded || markerLibraryLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center rounded-lg border border-background-light dark:border-background-dark bg-card-light dark:bg-card-dark">
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          Carregando mapa...
        </p>
      </div>
    );
  }

  if (!markerLibrary) {
    return (
      <div className="w-full h-96 flex items-center justify-center rounded-lg border border-background-light dark:border-background-dark bg-card-light dark:bg-card-dark">
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          Erro ao carregar biblioteca de marcadores
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <StandaloneSearchBox
          onLoad={onSearchBoxLoad}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar endereço..."
            className="w-full rounded-lg border border-background-light dark:border-background-dark bg-card-light dark:bg-card-dark text-text-light-primary dark:text-text-dark-primary h-14 px-4 py-3 text-sm font-normal leading-normal focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </StandaloneSearchBox>
      </div>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={markerPosition}
        zoom={DEFAULT_ZOOM}
        onLoad={onMapLoad}
        onClick={onMapClick}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          mapId: "DEMO_MAP_ID",
        }}
      />
    </div>
  );
}
