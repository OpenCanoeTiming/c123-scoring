import { WebSocketServer, WebSocket } from 'ws';
import * as mockData from './fixtures/mock-data';

interface MockServerOptions {
  port?: number;
  scenario?: 'full' | 'no-races' | 'no-competitors' | 'disconnected';
}

export function createMockServer(options: MockServerOptions = {}) {
  const { port = 27123, scenario = 'full' } = options;

  let wss: WebSocketServer;
  try {
    wss = new WebSocketServer({ port });
  } catch (err) {
    console.error(`[MockWS] Failed to start server on port ${port}:`, err);
    throw err;
  }

  wss.on('connection', (ws: WebSocket) => {
    console.log('[MockWS] Client connected');

    // Send ServerInfo
    ws.send(JSON.stringify(mockData.serverInfoMessage));

    // Scenario-based messages
    switch (scenario) {
      case 'no-races':
        ws.send(JSON.stringify(mockData.emptyScheduleMessage));
        break;

      case 'no-competitors':
        ws.send(JSON.stringify(mockData.scheduleMessage));
        ws.send(JSON.stringify(mockData.raceConfigMessage));
        ws.send(JSON.stringify(mockData.emptyOnCourseMessage));
        break;

      case 'full':
      default:
        ws.send(JSON.stringify(mockData.scheduleMessage));
        ws.send(JSON.stringify(mockData.raceConfigMessage));
        ws.send(JSON.stringify(mockData.onCourseMessage));
        break;
    }

    ws.on('close', () => {
      console.log('[MockWS] Client disconnected');
    });
  });

  console.log(`[MockWS] Server listening on port ${port}, scenario: ${scenario}`);

  return {
    close: () => {
      return new Promise<void>((resolve) => {
        wss.close(() => {
          console.log('[MockWS] Server closed');
          resolve();
        });
      });
    },
  };
}

// CLI mode
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const scenario = (process.argv[2] as MockServerOptions['scenario']) || 'full';
  const server = createMockServer({ scenario });

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}
