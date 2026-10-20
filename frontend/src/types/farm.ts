export interface Farm {
  id: string
  farmName: string
  location: string
  farmSizeHectares: number
  cropTypes: string[]
  createdAt: string
  updatedAt: string
}
export type FarmInput = Pick<Farm, 'farmName' | 'location' | 'farmSizeHectares' | 'cropTypes'>
