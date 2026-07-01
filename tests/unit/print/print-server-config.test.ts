import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  detectDeployContext,
  isMixedContentBlocked,
  resolveDirectPrintServerUrl,
  resolvePrintTransport,
} from "@/lib/print/print-server-config";
import type { PrintServerConfig } from "@/types/print-server";

describe("print-server-config", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("detecta Vercel por hostname", () => {
    Object.defineProperty(window, "location", {
      value: {
        protocol: "https:",
        hostname: "comandero-taberneta.vercel.app",
      },
      writable: true,
    });
    expect(detectDeployContext()).toBe("vercel");
  });

  it("detecta localhost", () => {
    Object.defineProperty(window, "location", {
      value: { protocol: "http:", hostname: "localhost" },
      writable: true,
    });
    expect(detectDeployContext()).toBe("localhost");
  });

  it("bloquea mixed-content HTTPS -> HTTP", () => {
    Object.defineProperty(window, "location", {
      value: { protocol: "https:", hostname: "comandero-taberneta.vercel.app" },
      writable: true,
    });
    expect(isMixedContentBlocked("http://192.168.1.146:3100")).toBe(true);
    expect(isMixedContentBlocked("https://print.example.com")).toBe(false);
  });

  it("en Vercel con URL HTTP usa cola en nube", () => {
    Object.defineProperty(window, "location", {
      value: { protocol: "https:", hostname: "comandero-taberneta.vercel.app" },
      writable: true,
    });
    const config: PrintServerConfig = {
      localUrl: "http://192.168.1.146:3100",
      remoteUrl: "",
      autoDetect: true,
    };
    expect(resolveDirectPrintServerUrl(config)).toBeNull();
    expect(resolvePrintTransport(config)).toBe("cloud-queue");
  });

  it("en localhost usa print-server local", () => {
    Object.defineProperty(window, "location", {
      value: { protocol: "http:", hostname: "localhost" },
      writable: true,
    });
    const config: PrintServerConfig = {
      localUrl: "",
      remoteUrl: "",
      autoDetect: true,
    };
    expect(resolveDirectPrintServerUrl(config)).toBe("http://localhost:3100");
    expect(resolvePrintTransport(config)).toBe("direct");
  });
});
