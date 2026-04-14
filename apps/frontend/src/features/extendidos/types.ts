//src/features/plants/types.ts

import z from "zod";

interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  status: "healthy" | "warning" | "critical" | "harvested";
  growthStage: string;
  plantedDate: string;
  lastWatered: string;
}

interface CreatePlantDto {
  name: string;
  species: string;
  location: string;
  status: "healthy" | "warning" | "critical" | "harvested";
  growthStage: string;
  plantedDate: string;
  lastWatered: string;
}
interface UpdatePlantDto {
  name?: string;
  species?: string;
  location?: string;
  status?: "healthy" | "warning" | "critical" | "harvested";
  growthStage?: string;
  plantedDate?: string;
  lastWatered?: string;
}

const plantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["healthy", "warning", "critical", "harvested"]),
  growthStage: z.string().min(1, "Growth stage is required"),
  plantedDate: z.string(),
  lastWatered: z.string(),
});

type PlantFormData = z.infer<typeof plantSchema>;

export type { Plant, CreatePlantDto, UpdatePlantDto, PlantFormData };
export { plantSchema };
