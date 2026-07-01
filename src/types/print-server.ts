export type DeployContext = "vercel" | "localhost" | "lan" | "unknown";

export type PrintTransport = "direct" | "cloud-queue" | "api-local";

export interface PrintServerConfig {
  /** URL en red local, ej. http://192.168.1.146:3100 */
  localUrl: string;
  /** URL HTTPS (túnel) o misma LAN sin mixed-content */
  remoteUrl: string;
  /** Si true, elige URL según contexto de despliegue */
  autoDetect: boolean;
}

export const PRINT_SERVER_CONFIG_DEFAULT: PrintServerConfig = {
  localUrl: "",
  remoteUrl: "",
  autoDetect: true,
};

export interface PrintServerHealth {
  ok: boolean;
  message: string;
  transport: PrintTransport;
  url?: string;
  mixedContentBlocked?: boolean;
}
