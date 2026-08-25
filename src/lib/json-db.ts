import fs from 'fs/promises';
import path from 'path';
import type { Bus, City, Route } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

const BUSES_FILE = path.join(DATA_DIR, 'buses.json');
const CITIES_FILE = path.join(DATA_DIR, 'cities.json');
const ROUTES_FILE = path.join(DATA_DIR, 'routes.json');

type BusesContainer = { buses: Bus[] };
type CitiesContainer = { cities: City[] };
type RoutesContainer = { routes: Route[] };

const readJsonFile = async <T>(filePath: string): Promise<T> => {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
};

const writeJsonFile = async <T>(filePath: string, data: T): Promise<void> => {
  const serialized = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, serialized, 'utf-8');
};

export const getBuses = async (): Promise<Bus[]> => {
  const container = await readJsonFile<BusesContainer>(BUSES_FILE);
  return container.buses;
};

export const saveBuses = async (buses: Bus[]): Promise<void> => {
  await writeJsonFile<BusesContainer>(BUSES_FILE, { buses });
};

export const getCities = async (): Promise<City[]> => {
  const container = await readJsonFile<CitiesContainer>(CITIES_FILE);
  return container.cities;
};

export const saveCities = async (cities: City[]): Promise<void> => {
  await writeJsonFile<CitiesContainer>(CITIES_FILE, { cities });
};

export const getRoutes = async (): Promise<Route[]> => {
  const container = await readJsonFile<RoutesContainer>(ROUTES_FILE);
  return container.routes;
};

export const saveRoutes = async (routes: Route[]): Promise<void> => {
  await writeJsonFile<RoutesContainer>(ROUTES_FILE, { routes });
};

export const generateId = (prefix: string, items: { id: string }[]): string => {
  const existingNums = items
    .map((item) => {
      const match = item.id.match(/^[A-Z]+(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));

  const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
};
