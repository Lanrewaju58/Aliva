import { LocationInfo } from '@/types/food';

export class LocationService {
  private static instance: LocationService;
  private cachedLocation: LocationInfo | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Lagos, Nigeria coordinates
          resolve({ lat: 6.5244, lng: 3.3792 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  async getLocationInfo(coordinates: { lat: number; lng: number }): Promise<LocationInfo> {
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    try {
      // Use Google Maps Geocoding API for reverse geocoding
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.error('Google Maps API key not configured');
        throw new Error('VITE_GOOGLE_MAPS_API_KEY is required');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${apiKey}`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        let country = '';
        let countryCode = '';
        let city = '';
        let state = '';

        for (const component of addressComponents) {
          if (component.types.includes('country')) {
            country = component.long_name;
            countryCode = component.short_name;
          }
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
        }

        const locationInfo: LocationInfo = {
          country,
          countryCode,
          city,
          state,
          coordinates
        };

        this.cachedLocation = locationInfo;
        return locationInfo;
      }
    } catch (error) {
      console.error('Error getting location info:', error);
    }

    // Fallback to Nigeria
    return {
      country: 'Nigeria',
      countryCode: 'NG',
      city: 'Lagos',
      state: 'Lagos',
      coordinates
    };
  }

  getCountryCode(): string {
    return this.cachedLocation?.countryCode || 'NG';
  }

  getCountry(): string {
    return this.cachedLocation?.country || 'Nigeria';
  }

  getCity(): string {
    return this.cachedLocation?.city || 'Lagos';
  }
}
