export interface Lautta {
    id: string,
    name: string,
    url_name: string[],
    location: string,
    capacity: number,
    pricemin: number
    pricemax: number,
    eventLength: number,
    equipment: string[]
    images: string[]
    mainImage: string,
    email?: string,
    phone?: string,
    url?: string,
    urlArray: string[],
    notes?: string,
  }