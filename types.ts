export interface Saunalautta {
  id: string;
  name: string;
  location: string;
  capacity: number;
  pricemin: number;
  pricemax: number;
  equipment: SaunaEquipment[];
  images: string[];
  mainImage: string;
  email: string;
  phone: string;
  url: string;
  notes?: string;
  url_name: string;
  eventLength: number;
  urlArray: string[];
}

export type SaunaEquipment =
  | "Kattoterassi"
  | "Palju"
  | "Äänentoisto"
  | "Kahvinkeitin"
  | "TV"
  | "WC"
  | "Suihku"
  | "Grilli"
  | "Mikro"
  | "Kylmäsäilytys"
  | "Pukuhuone"
  | "Puulämmitteinen kiuas"
  | "Jääkaappi"
  | "Kaasugrilli"
  | "Poreallas"
  | "Jääpalakone"
  | "Takka"
  | "Ilmastointi"
  | "Mikroaaltouuni"
  | "Astiasto";
