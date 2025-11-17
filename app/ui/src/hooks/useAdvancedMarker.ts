// app/ui/src/hooks/useAdvancedMarker.ts
import { useState, useEffect } from 'react';

interface AdvancedMarkerLibrary {
  AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
  PinElement: typeof google.maps.marker.PinElement;
}

interface UseAdvancedMarkerResult {
  markerLibrary: AdvancedMarkerLibrary | null;
  loading: boolean;
  error: Error | null;
}

const LIBRARY_NAME = 'marker';

export function useAdvancedMarker(isLoaded: boolean): UseAdvancedMarkerResult {
  const [markerLibrary, setMarkerLibrary] = useState<AdvancedMarkerLibrary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const loadMarkerLibrary = async () => {
      try {
        setLoading(true);
        setError(null);

        const lib = await google.maps.importLibrary(LIBRARY_NAME);
        
        if ('AdvancedMarkerElement' in lib && 'PinElement' in lib) {
          setMarkerLibrary({
            AdvancedMarkerElement: lib.AdvancedMarkerElement as typeof google.maps.marker.AdvancedMarkerElement,
            PinElement: lib.PinElement as typeof google.maps.marker.PinElement,
          });
        } else {
          throw new Error('AdvancedMarkerElement or PinElement not available in marker library');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load marker library';
        const loadError = new Error(errorMessage);
        setError(loadError);
        console.warn('Advanced Markers not available, will use fallback:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadMarkerLibrary();
  }, [isLoaded]);

  return { markerLibrary, loading, error };
}
