import { describe, expect, it, vi, beforeEach } from "vitest";
import { EventEmitter } from "node:events";

function createMockSocket() {
  const socket = Object.assign(new EventEmitter(), {
    setTimeout: vi.fn(),
    write: vi.fn((buf: Buffer, cb: (err?: Error) => void) => {
      cb();
      queueMicrotask(() => socket.emit("close"));
    }),
    end: vi.fn(() => {
      queueMicrotask(() => socket.emit("close"));
    }),
    destroy: vi.fn(),
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

  it("testPrinter devuelve success tras socket conectado", async () => {
    const result = await testPrinter("192.168.1.100", 9100);
    expect(result.success).toBe(true);
    expect(mockSocket.write).toHaveBeenCalled();
  });

  it("probePrinter no devuelve success si write falla", async () => {
    mockSocket.write = vi.fn((_buf: Buffer, cb: (err?: Error) => void) => {
      cb(new Error("ECONNREFUSED"));
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
