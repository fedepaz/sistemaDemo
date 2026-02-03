// src/features/dashboard/api/dolarApi.ts

const DOLAR_API_URL = "https://dolarapi.com";
const DOLAR_OFICIAL = "/v1/dolares/oficial";
const DOLAR_BLUE = "/v1/dolares/blue";
const EURO = "/v1/cotizaciones/eur";
const ESTADOS = "/v1/estado";

interface EstadoAPIResponse {
  estado: string;
  aleatorio: number;
}

interface DolarAPIResponse {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  mondeda: string;
  fechaActualizacion: string;
}

async function fetchDolarOficial(): Promise<DolarAPIResponse> {
  const response = await fetch(`${DOLAR_API_URL}${DOLAR_OFICIAL}`);
  const data = await response.json();
  return data;
}

async function fetchDolarBlue(): Promise<DolarAPIResponse> {
  const response = await fetch(`${DOLAR_API_URL}${DOLAR_BLUE}`);
  const data = await response.json();
  return data;
}

async function fetchEuro(): Promise<DolarAPIResponse> {
  const response = await fetch(`${DOLAR_API_URL}${EURO}`);
  const data = await response.json();
  return data;
}

async function fetchEstado(): Promise<EstadoAPIResponse> {
  const response = await fetch(`${DOLAR_API_URL}${ESTADOS}`);
  const data = await response.json();
  return data;
}

export { fetchDolarOficial, fetchDolarBlue, fetchEuro, fetchEstado };
