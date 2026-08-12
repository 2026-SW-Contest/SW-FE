import { apiGet } from "./client";

export type ServerHealthStatus = "UP" | "DOWN";

export interface ServerHealthResponse {
  status: ServerHealthStatus;
}

export const getServerHealth = () =>
  apiGet<ServerHealthResponse>("/actuator/health");
