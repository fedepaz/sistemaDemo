// Components
export { ExtendidoDashboardSkeleton } from "./components/extendido-dashboad-skeleton";
export { ExtendidoDashboard } from "./components/ExtendidoDashboard";

// Hooks
export { useAllExtendidos, useAvailableExtendidoDates, useExtendidosByFecha } from "./hooks/useExtendidos";
export { useExtendidos } from "./hooks/useExtendidosWithFilters";
export { useDepositos, useCamaras, useDepositoByCodigo } from "./hooks/useDepositos";
export { usePartidaMutation } from "./hooks/usePartidaMutation";

// Services
export { extendidoService } from "./api/extendidoService";
export { partidaService } from "./api/partidaService";
export { depositosService } from "./api/depositosService";
