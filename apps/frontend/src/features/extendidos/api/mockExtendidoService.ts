//src/features/plants/api/mockPlantService.ts
"server-only";

import { Plant, CreatePlantDto, UpdatePlantDto } from "../types";

const generatePlants = (count: number): Plant[] => {
  const species = [
    "Tomato",
    "Cucumber",
    "Lettuce",
    "Pepper",
    "Basil",
    "Spinach",
  ];

  const statuses: Plant["status"][] = ["healthy", "warning", "critical"];
  const locations = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const growthStages: Plant["growthStage"][] = [
    "Seedling",
    "Juvenile",
    "Fruiting",
    "Mature",
  ];
  const plantedDates: Plant["plantedDate"][] = [
    "2024-01-15",
    "2024-02-01",
    "2024-03-01",
    "2024-04-01",
  ];
  const lastWateredDates: Plant["lastWatered"][] = [
    "2024-01-15",
    "2024-02-01",
    "2024-03-01",
    "2024-04-01",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `plant-${i + 1}`,
    name: `Plant ${i + 1}`,
    species: species[Math.floor(Math.random() * species.length)],
    location: `Greenhouse ${locations[Math.floor(Math.random() * locations.length)]}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    growthStage: growthStages[Math.floor(Math.random() * growthStages.length)],
    plantedDate: plantedDates[Math.floor(Math.random() * plantedDates.length)],
    lastWatered:
      lastWateredDates[Math.floor(Math.random() * lastWateredDates.length)],
  }));
};
// Replace with your actual API call
// For example, you could fetch plants from a database or an API endpoint
// For now we'll just generate some mock data
const plantsData = generatePlants(200000);

export const mockPlantService = {
  async fetchPlants(): Promise<Plant[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000)); // Replace API response with plants
    // Simulate receiving plants from the API
    return plantsData;
  },

  async fetchPlantById(id: string): Promise<Plant | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with plant
    // Simulate receiving plant from the API
    return plantsData.find((plant) => plant.id === id) || null;
  },

  async createPlant(plantCreate: CreatePlantDto): Promise<Plant> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with plant
    // Simulate creating plant in the database
    const newPlant = {
      ...plantCreate,
      id: `plant-${Date.now()}`,
    };
    plantsData.push(newPlant);
    return newPlant;
  },

  async updatePlant(id: string, plantUpdate: UpdatePlantDto): Promise<Plant> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with plant
    // Simulate updating plant in the database
    const existingPlant = plantsData.find((plant) => plant.id === id);
    if (!existingPlant) throw new Error("Plant not found");
    const updatedPlant = { ...existingPlant, ...plantUpdate };
    plantsData.splice(plantsData.indexOf(existingPlant), 1, updatedPlant);
    return updatedPlant;
  },

  async deletePlant(id: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with plant
    // Simulate deleting plant from the database
    const existingPlant = plantsData.find((plant) => plant.id === id);
    if (!existingPlant) throw new Error("Plant not found");
    plantsData.splice(plantsData.indexOf(existingPlant), 1);
    return;
  },
};
