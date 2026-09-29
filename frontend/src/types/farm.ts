export interface Farm {
  id: string
  name: string
  location?: string
  totalArea: number
  fields?: Field[]
}

export interface Field {
  id: string
  farmId: string
  name: string
  area: number
  crop?: string
}

export interface CreateFarmInput {
  name: string
  location?: string
  totalArea: number
}

export interface UpdateFarmInput {
  name?: string
  location?: string
  totalArea?: number
}

export interface CreateFieldInput {
  name: string
  area: number
  crop?: string
}