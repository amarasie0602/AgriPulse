export const CROP_CATEGORIES = ['Rice & paddy', 'Vegetables', 'Fruits', 'Tea', 'Coconut', 'Maize', 'Pulses & legumes', 'Tubers', 'Spices', 'Other'] as const
export const CROP_STAGES = ['Planned', 'Planted', 'Growing', 'Flowering', 'Ready to harvest', 'Harvested'] as const
export interface CropInput {
  name: string
  farmId: string
  category: typeof CROP_CATEGORIES[number]
  areaHectares: number
  plantingDate: string
  harvestDate: string
  stage: typeof CROP_STAGES[number]
  variety: string
  season: string
  notes: string
}
export interface Crop extends CropInput { id: string; createdAt: string; updatedAt: string }
