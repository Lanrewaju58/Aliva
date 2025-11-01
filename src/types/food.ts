export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  calories?: number;
  category: string;
  image?: string;
  allergens: string[];
  healthy: boolean;
  available: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  priceRange: string;
  address: string;
  coordinates: { lat: number; lng: number };
  image?: string;
  phoneNumber?: string;
  website?: string;
  menuItems: MenuItem[];
  isOpen: boolean;
  distance: number;
  provider: string;
  providerId: string;
}

export interface RestaurantDetails extends Restaurant {
  openingHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  photos: string[];
  features: string[];
  deliveryZones: string[];
}

export interface FoodApiProvider {
  searchRestaurants(query: string, location: { lat: number; lng: number }, radius?: number): Promise<Restaurant[]>;
  getMenuItems(restaurantId: string): Promise<MenuItem[]>;
  getRestaurantDetails(restaurantId: string): Promise<RestaurantDetails>;
  getRestaurantById(restaurantId: string): Promise<Restaurant>;
}

export interface RegionalApiConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  country: string;
  currency: string;
  supportedCities: string[];
}

export interface LocationInfo {
  country: string;
  countryCode: string;
  city: string;
  state?: string;
  coordinates: { lat: number; lng: number };
}
