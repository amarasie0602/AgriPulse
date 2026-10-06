export interface FieldDto {
  id: string;
  name: string;
  areaHectares: number;
  crop?: string;
}

export interface FarmDto {
  id: string;
  name: string;
  location?: string;
  totalAreaHectares: number;
  fields: FieldDto[];
  createdAt: string;
}
