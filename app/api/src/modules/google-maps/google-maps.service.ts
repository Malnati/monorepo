// app/api/src/modules/google-maps/google-maps.service.ts
import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const DEFAULT_GEOCODING_API_URL =
  "https://maps.googleapis.com/maps/api/geocode/json";

interface GeocodeResult {
  formattedAddress: string;
  placeId: string;
  latitude: number;
  longitude: number;
  accuracy: string;
  addressComponents?: AddressComponent[];
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface LocationLayer {
  latitude: number;
  longitude: number;
  label: string;
}

interface ExtractedLayers {
  real: LocationLayer;
  neighborhood?: LocationLayer;
  city?: LocationLayer;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly apiKey: string;
  private readonly geocodingApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>("GOOGLE_MAPS_SERVER_KEY") || "";
    this.geocodingApiUrl =
      this.configService.get<string>("GOOGLE_MAPS_GEOCODING_API_URL") ||
      DEFAULT_GEOCODING_API_URL;
    if (!this.apiKey) {
      this.logger.warn(
        "GOOGLE_MAPS_SERVER_KEY not configured - geocoding validation disabled",
      );
    }
  }

  async validatePlaceId(placeId: string): Promise<GeocodeResult> {
    // Modo mock para testes de inicialização
    if (this.apiKey === "mock-key-for-tests" || !this.apiKey) {
      this.logger.warn("Using mock Google Maps response for testing");
      return {
        formattedAddress: `Mock Address for ${placeId}`,
        placeId: placeId,
        latitude: -23.5505,
        longitude: -46.6333,
        accuracy: "APPROXIMATE",
        addressComponents: [
          { long_name: "São Paulo", short_name: "SP", types: ["locality"] },
          { long_name: "Centro", short_name: "Centro", types: ["sublocality"] },
        ],
      };
    }

    try {
      const url = `${this.geocodingApiUrl}?place_id=${encodeURIComponent(placeId)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new BadRequestException(`Invalid place_id: ${data.status}`);
      }

      const result = data.results[0];
      const location = result.geometry.location;

      return {
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        latitude: location.lat,
        longitude: location.lng,
        accuracy: result.geometry.location_type || "APPROXIMATE",
        addressComponents: result.address_components || [],
      };
    } catch (error) {
      this.logger.error(
        `Geocoding validation failed for place_id ${placeId}`,
        error,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        "Failed to validate location with Google Maps API",
      );
    }
  }

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    // Modo mock para testes de inicialização
    if (this.apiKey === "mock-key-for-tests" || !this.apiKey) {
      this.logger.warn("Using mock Google Maps response for testing");
      return {
        formattedAddress: address || "Mock Address",
        placeId: "mock-place-id",
        latitude: -23.5505,
        longitude: -46.6333,
        accuracy: "APPROXIMATE",
        addressComponents: [
          { long_name: "São Paulo", short_name: "SP", types: ["locality"] },
          { long_name: "Centro", short_name: "Centro", types: ["sublocality"] },
        ],
      };
    }

    try {
      const url = `${this.geocodingApiUrl}?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new BadRequestException(`Geocoding failed: ${data.status}`);
      }

      const result = data.results[0];
      const location = result.geometry.location;

      return {
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        latitude: location.lat,
        longitude: location.lng,
        accuracy: result.geometry.location_type || "APPROXIMATE",
        addressComponents: result.address_components || [],
      };
    } catch (error) {
      this.logger.error(`Geocoding failed for address: ${address}`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        "Failed to geocode address with Google Maps API",
      );
    }
  }

  /**
   * Extrai camadas de localização (real, bairro, cidade) a partir de um resultado do Google Maps
   * @param geocodeResult Resultado do geocoding
   * @returns Objeto com três camadas de localização
   */
  extractLocationLayers(geocodeResult: GeocodeResult): ExtractedLayers {
    const realLayer: LocationLayer = {
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
      label: geocodeResult.formattedAddress,
    };

    let cityName: string | undefined;
    let neighborhoodName: string | undefined;

    // Extrair nomes de componentes de endereço
    if (geocodeResult.addressComponents) {
      for (const component of geocodeResult.addressComponents) {
        // Cidade: priorizar locality, depois administrative_area_level_2
        if (
          component.types.includes("locality") ||
          component.types.includes("administrative_area_level_2")
        ) {
          if (!cityName) {
            cityName = component.long_name;
          }
        }
        // Bairro: priorizar sublocality, neighborhood
        if (
          component.types.includes("sublocality") ||
          component.types.includes("sublocality_level_1") ||
          component.types.includes("neighborhood")
        ) {
          if (!neighborhoodName) {
            neighborhoodName = component.long_name;
          }
        }
      }
    }

    const layers: ExtractedLayers = { real: realLayer };

    // Aproximar coordenadas para bairro e cidade
    // Nota: Idealmente deveria fazer uma geocode reversa ou buscar centroide do bairro/cidade
    // Por ora, aplicamos pequenos ajustes nas coordenadas como aproximação
    if (neighborhoodName) {
      layers.neighborhood = {
        latitude: geocodeResult.latitude + (Math.random() - 0.5) * 0.01, // Variação de ~0.005 graus (~500m)
        longitude: geocodeResult.longitude + (Math.random() - 0.5) * 0.01,
        label: neighborhoodName,
      };
    }

    if (cityName) {
      layers.city = {
        latitude: geocodeResult.latitude + (Math.random() - 0.5) * 0.02, // Variação de ~0.01 graus (~1km)
        longitude: geocodeResult.longitude + (Math.random() - 0.5) * 0.02,
        label: cityName,
      };
    }

    // Fallback: se não encontrou cidade ou bairro, usar localização real como aproximação
    if (!layers.city && !layers.neighborhood) {
      this.logger.warn(
        `No city or neighborhood found for address: ${geocodeResult.formattedAddress}`,
      );
      // Derivar da formatação do endereço
      const addressParts = geocodeResult.formattedAddress.split(",");
      if (addressParts.length >= 2) {
        const possibleCity = addressParts[addressParts.length - 2].trim();
        layers.city = {
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
          label: possibleCity,
        };
      }
    }

    return layers;
  }

  /**
   * Gera uma localização aproximada com deslocamento de ~15km da localização real
   * para preservar a privacidade do fornecedor
   * @param realLat Latitude real
   * @param realLng Longitude real
   * @returns Coordenadas aproximadas validadas pelo Google Maps
   */
  async generateApproximateLocation(
    realLat: number,
    realLng: number,
  ): Promise<GeocodeResult | null> {
    try {
      // Calcular deslocamento de ~15km em direção pseudoaleatória
      // 1 grau de latitude ≈ 111 km
      // Deslocamento de 15km ≈ 0.135 graus
      const OFFSET_DEGREES = 0.135;

      // Gerar ângulo pseudoaleatório baseado nas coordenadas originais (determinístico)
      const seed = Math.abs(
        Math.sin(realLat * 1000) * Math.cos(realLng * 1000),
      );
      const angle = seed * 2 * Math.PI;

      // Calcular novo ponto
      const approxLat = realLat + OFFSET_DEGREES * Math.sin(angle);
      const approxLng =
        realLng +
        (OFFSET_DEGREES * Math.cos(angle)) /
          Math.cos((realLat * Math.PI) / 180);

      // Modo mock para testes de inicialização
      if (this.apiKey === "mock-key-for-tests" || !this.apiKey) {
        this.logger.warn("Using mock Google Maps response for testing");
        return {
          formattedAddress: `Aproximadamente ${approxLat.toFixed(4)}, ${approxLng.toFixed(4)}`,
          placeId: "mock-place-id-approx",
          latitude: approxLat,
          longitude: approxLng,
          accuracy: "APPROXIMATE",
          addressComponents: [
            { long_name: "São Paulo", short_name: "SP", types: ["locality"] },
          ],
        };
      }

      // Fazer reverse geocoding no ponto aproximado
      const url = `${this.geocodingApiUrl}?latlng=${approxLat},${approxLng}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        return {
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          latitude: location.lat,
          longitude: location.lng,
          accuracy: "APPROXIMATE",
          addressComponents: result.address_components || [],
        };
      }

      // Se falhar, retornar coordenadas calculadas
      return {
        formattedAddress: `Aproximadamente ${approxLat.toFixed(4)}, ${approxLng.toFixed(4)}`,
        placeId: "",
        latitude: approxLat,
        longitude: approxLng,
        accuracy: "APPROXIMATE",
      };
    } catch (error) {
      this.logger.error(`Failed to generate approximate location`, error);
      return null;
    }
  }
}
