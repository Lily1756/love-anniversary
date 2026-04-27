export interface Letter {
  id: string
  title: string
  content: string
  date: string
  year: number
  tag?: string
  isFavorite?: boolean
}

export interface Photo {
  src: string
  caption: string
}

export interface Album {
  id: string
  title: string
  cover: string
  date: string
  tag: string
  photos: Photo[]
}

export interface Footprint {
  id: string
  name: string
  location: [number, number] // [lng, lat]
  date: string
  photo: string
  memory: string
}

export interface Wish {
  id: string
  title: string
  category: string
  completed: boolean
  createdAt: string
}

export interface Capsule {
  id: string
  title: string
  content: string
  openDate: string
  createdAt: string
  isOpened: boolean
}
