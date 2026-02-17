export interface Studio {
  id: string;
  name: string;
  activity_type: 'yoga' | 'pilates' | 'both';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  url: string | null;
  image_url: string | null;
  logo_url: string | null;
  city: string | null;
  address: string | null;
  location_pill: string | null;
}

export type StudioInsert = Omit<Studio, 'id' | 'created_at' | 'updated_at'>;

export type StudioUpdate = Partial<StudioInsert>;

export type ActivityFilter = 'all' | 'yoga' | 'pilates';
