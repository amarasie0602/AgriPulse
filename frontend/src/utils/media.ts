import type { Crop } from '@/types/crop'
export interface PhotoAsset { src: string; alt: string; position?: string }
const photo = (name: string, alt: string, position = 'center'): PhotoAsset => ({ src: `/images/photography/${name}.jpg`, alt, position })
export const MEDIA = {
  login: photo('login-tea-dawn', 'Morning light over a misty tea-growing landscape'),
  register: photo('register-rice-dawn', 'Rice terraces in the early morning mist'),
  farms: [photo('farm-rice-terraces', 'Representative rice terrace landscape'), photo('farm-crop-rows', 'Representative cultivated field landscape'), photo('farm-tea-hills', 'Representative tea-growing landscape')],
  crops: {
    rice: photo('crop-rice', 'Ripening grains on rice plants'), tea: photo('crop-tea', 'Rows of tea bushes'), coconut: photo('crop-coconut', 'Aerial view of a coconut plantation'),
    tomato: photo('crop-tomato', 'Tomatoes growing on a vine'), chilli: photo('crop-chilli', 'Chilli peppers growing on a plant'), maize: photo('crop-maize', 'A maize cob growing in a field'),
    legumes: photo('crop-legumes', 'Peas growing on a plant'), vegetables: photo('crop-vegetables', 'Cabbage plants growing in a field'), spices: photo('crop-spices', 'Peppercorns growing on a black pepper plant'),
    fruits: photo('crop-fruits', 'Mango growing on a fruit tree'), tubers: photo('crop-tubers', 'Potato harvesting in a field'),
  },
}
export function cropPhoto(crop: Pick<Crop, 'name' | 'category'>): PhotoAsset | undefined {
  const name = crop.name.toLowerCase()
  if (/tomato/.test(name)) return MEDIA.crops.tomato
  if (/chilli|chili/.test(name)) return MEDIA.crops.chilli
  const categories: Record<string, keyof typeof MEDIA.crops> = { 'Rice & paddy':'rice', Tea:'tea', Coconut:'coconut', Vegetables:'vegetables', Fruits:'fruits', Maize:'maize', 'Pulses & legumes':'legumes', Tubers:'tubers', Spices:'spices' }
  return categories[crop.category] ? MEDIA.crops[categories[crop.category]] : undefined
}
/** Stable stock fallback, never represented as a photograph of the user's actual property. */
export function farmPhoto(id: string): PhotoAsset {
  const hash = [...id].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0)
  return MEDIA.farms[hash % MEDIA.farms.length]
}
