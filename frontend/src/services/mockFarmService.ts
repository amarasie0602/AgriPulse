import type {
  CreateFarmInput,
  CreateFieldInput,
  Farm,
  FarmService,
  Field,
  UpdateFarmInput,
  UpdateFieldInput,
} from '@/types'
import { AuthError } from './errors'
import { tokenStorage } from './tokenStorage'

const FARMS_KEY = 'agripulse.mock.farms'
const LATENCY_MS = 350

interface StoredFarm extends Farm {
  userId: string | number
}

function readFarms(): StoredFarm[] {
  try {
    const raw = localStorage.getItem(FARMS_KEY)
    if (raw) return JSON.parse(raw) as StoredFarm[]
  } catch {
    return []
  }
  return []
}

function writeFarms(farms: StoredFarm[]): void {
  localStorage.setItem(FARMS_KEY, JSON.stringify(farms))
}

function currentUserId(): string | number {
  const session = tokenStorage.load()
  if (!session) throw new AuthError('Your session has expired. Please sign in again.', 401)
  return session.user.id
}

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

function nextId(): string {
  return String(Date.now()) + Math.random().toString(36).slice(2, 8)
}

function toFarm(farm: StoredFarm): Farm {
  const { userId: _drop, ...rest } = farm
  return rest
}

function fieldsArea(fields: Field[], skipFieldId?: string): number {
  return fields.reduce((sum, field) => {
    if (skipFieldId && field.id === skipFieldId) return sum
    return sum + field.areaHectares
  }, 0)
}

function assertFits(totalAreaHectares: number, usedArea: number): void {
  if (usedArea > totalAreaHectares) {
    throw new AuthError('Field area cannot exceed the farm’s total area.', 400)
  }
}

function ownedFarm(id: string): StoredFarm {
  const userId = currentUserId()
  const farm = readFarms().find((item) => item.id === id && item.userId === userId)
  if (!farm) throw new AuthError('This farm could not be found.', 404)
  return farm
}

export const mockFarmService: FarmService = {
  async list(): Promise<Farm[]> {
    await wait()
    const userId = currentUserId()
    return readFarms()
      .filter((farm) => farm.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toFarm)
  },

  async create(input: CreateFarmInput): Promise<Farm> {
    await wait()
    const farms = readFarms()
    const farm: StoredFarm = {
      id: nextId(),
      userId: currentUserId(),
      name: input.name,
      location: input.location,
      totalAreaHectares: input.totalAreaHectares,
      fields: [],
      createdAt: new Date().toISOString(),
    }
    farms.push(farm)
    writeFarms(farms)
    return toFarm(farm)
  },

  async getById(id: string): Promise<Farm> {
    await wait()
    return toFarm(ownedFarm(id))
  },

  async update(id: string, input: UpdateFarmInput): Promise<Farm> {
    await wait()
    const farms = readFarms()
    const index = farms.findIndex((farm) => farm.id === id && farm.userId === currentUserId())
    if (index === -1) throw new AuthError('This farm could not be found.', 404)

    const current = farms[index]
    const nextArea = input.totalAreaHectares ?? current.totalAreaHectares
    assertFits(nextArea, fieldsArea(current.fields))

    farms[index] = {
      ...current,
      name: input.name ?? current.name,
      location: input.location ?? current.location,
      totalAreaHectares: nextArea,
    }
    writeFarms(farms)
    return toFarm(farms[index])
  },

  async remove(id: string): Promise<void> {
    await wait()
    ownedFarm(id)
    writeFarms(readFarms().filter((farm) => !(farm.id === id && farm.userId === currentUserId())))
  },

  async addField(farmId: string, input: CreateFieldInput): Promise<Farm> {
    await wait()
    const farms = readFarms()
    const index = farms.findIndex((farm) => farm.id === farmId && farm.userId === currentUserId())
    if (index === -1) throw new AuthError('This farm could not be found.', 404)

    const current = farms[index]
    assertFits(current.totalAreaHectares, fieldsArea(current.fields) + input.areaHectares)

    const field: Field = {
      id: nextId(),
      name: input.name,
      areaHectares: input.areaHectares,
      crop: input.crop,
    }
    farms[index] = { ...current, fields: [...current.fields, field] }
    writeFarms(farms)
    return toFarm(farms[index])
  },

  async updateField(farmId: string, fieldId: string, input: UpdateFieldInput): Promise<Farm> {
    await wait()
    const farms = readFarms()
    const index = farms.findIndex((farm) => farm.id === farmId && farm.userId === currentUserId())
    if (index === -1) throw new AuthError('This farm could not be found.', 404)

    const current = farms[index]
    const fieldIndex = current.fields.findIndex((field) => field.id === fieldId)
    if (fieldIndex === -1) throw new AuthError('This field could not be found.', 404)

    const field = current.fields[fieldIndex]
    const nextArea = input.areaHectares ?? field.areaHectares
    assertFits(current.totalAreaHectares, fieldsArea(current.fields, fieldId) + nextArea)

    const fields = current.fields.map((item, i) =>
      i === fieldIndex
        ? {
            ...item,
            name: input.name ?? item.name,
            areaHectares: nextArea,
            crop: input.crop ?? item.crop,
          }
        : item,
    )
    farms[index] = { ...current, fields }
    writeFarms(farms)
    return toFarm(farms[index])
  },

  async removeField(farmId: string, fieldId: string): Promise<Farm> {
    await wait()
    const farms = readFarms()
    const index = farms.findIndex((farm) => farm.id === farmId && farm.userId === currentUserId())
    if (index === -1) throw new AuthError('This farm could not be found.', 404)

    const current = farms[index]
    if (!current.fields.some((field) => field.id === fieldId)) {
      throw new AuthError('This field could not be found.', 404)
    }

    farms[index] = { ...current, fields: current.fields.filter((field) => field.id !== fieldId) }
    writeFarms(farms)
    return toFarm(farms[index])
  },
}
