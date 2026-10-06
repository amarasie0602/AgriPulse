export interface Field {
  id: string
  name: string
  areaHectares: number
  crop?: string
}

export interface Farm {
  id: string
  name: string
  location?: string
  totalAreaHectares: number
  fields: Field[]
  createdAt: string
}

export interface CreateFarmInput {
  name: string
  location?: string
  totalAreaHectares: number
}

export interface UpdateFarmInput {
  name?: string
  location?: string
  totalAreaHectares?: number
}

export interface CreateFieldInput {
  name: string
  areaHectares: number
  crop?: string
}

export interface UpdateFieldInput {
  name?: string
  areaHectares?: number
  crop?: string
}

export interface FarmService {
  list(): Promise<Farm[]>
  create(input: CreateFarmInput): Promise<Farm>
  getById(id: string): Promise<Farm>
  update(id: string, input: UpdateFarmInput): Promise<Farm>
  remove(id: string): Promise<void>
  addField(farmId: string, input: CreateFieldInput): Promise<Farm>
  updateField(farmId: string, fieldId: string, input: UpdateFieldInput): Promise<Farm>
  removeField(farmId: string, fieldId: string): Promise<Farm>
}
