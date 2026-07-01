import { describe, expect, it, vi, beforeEach } from "vitest";
import { EventEmitter } from "node:events";

function createMockSocket() {
  const socket = Object.assign(new EventEmitter(), {
    setTimeout: vi.fn(),
    setNoDelay: vi.fn(),
    write: vi.fn((buf: Buffer, cb?: (err?: Error) => void) => {
      cb?.();
      return true;
    }),
    end: vi.fn(() => {
      queueMicrotask(() => socket.emit("close"));
    }),
    destroy: vi.fn(),
    once: vi.fn((event: string, handler: () => void) => {
      if (event === "drain") queueMicrotask(handler);
      return socket;
    }),
  });
  return socket;
}

let mockSocket = createMockSocket();

vi.mock("node:net", () => ({
  default: {
    createConnection: vi.fn(
      (_opts: unknown, onConnect: () => void) => {
        queueMicrotask(() => onConnect());
        return mockSocket;
      },
    ),
  },
}));

import { probePrinter, testPrinter } from "@/lib/impresion/escpos-network";

describe("escpos-network", () => {
  beforeEach(() => {
    mockSocket = createMockSocket();
    vi.clearAllMocks();
  });

  it("testPrinter devuelve success tras envío completo", async () => {
    const result = await testPrinter("192.168.1.100", 9100);
    expect(result.success).toBe(true);
    expect(mockSocket.setNoDelay).toHaveBeenCalledWith(true);
    expect(mockSocket.write).toHaveBeenCalled();
    expect(mockSocket.end).toHaveBeenCalled();
  });

  it("probePrinter no devuelve success si write falla", async () => {
    mockSocket.write = vi.fn(() => {
      throw new Error("ECONNREFUSED");
    }) as typeof mockSocket.write;

    const result = await probePrinter("192.168.1.100", 9100);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("rechaza IP vacía", async () => {
    const result = await testPrinter("", 9100);
    expect(result.success).toBe(false);
    expect(result.error).toContain("IP");
  });
});
