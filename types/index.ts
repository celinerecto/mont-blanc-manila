export interface Cafe {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  website?: string;
  hours?: string;
  is_verified: boolean;
  submitted_by?: string;
  created_at: string;
}

export interface Item {
  id: string;
  cafe_id: string;
  name: string;
  variant?: string;
  price?: number;
  description?: string;
  created_at: string;
  cafe?: Cafe;
  vote_count?: number;
  avg_rating?: number;
  user_has_voted?: boolean;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  item_id?: string;
  cafe_id?: string;
  user_id: string;
  storage_url: string;
  created_at: string;
}

export interface Review {
  id: string;
  item_id: string;
  user_id: string;
  body: string;
  rating: number;
  photo_url?: string;
  created_at: string;
  user?: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };
  item?: Item & { cafe?: Cafe };
}

export interface Vote {
  id: string;
  item_id: string;
  user_id: string;
  created_at: string;
}

export type Neighborhood =
  | "BGC"
  | "Makati"
  | "Poblacion"
  | "Quezon City"
  | "Mandaluyong"
  | "San Juan"
  | "Taguig"
  | "Pasig"
  | "Alabang"
  | "Eastwood";
