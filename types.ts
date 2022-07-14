export interface Lautta {
    id: string,
    name: string,
    url_name: string,
    location: string,
    capacity: number,
    pricemin: number
    pricemax: number,
    equipment: string[]
    images: string[]
    mainImage: string,
    email?: String,
    phone?: String,
    url?: String,
    notes?: String,
  }