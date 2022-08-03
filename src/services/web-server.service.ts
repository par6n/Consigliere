import { EventEmitter } from 'events';
import express, { Express } from 'express';
import { Server } from 'http';
import { injectable } from 'tsyringe';
import { readFileSync } from 'fs';

/**
 * Spins up an Express application.
 */
@injectable()
export class WebServerService extends EventEmitter {
  public expressApp: Express;
  public server: Server | undefined = undefined;

  /**
   * Creates an Express app and listens to the given port and host.
   */
  constructor() {
    super();
    this.expressApp = express();

    this.expressApp.get('/redirect', (req, res) => {
      this.emit('callbackCalled', { code: req.query.code });
      res.send(readFileSync('../../assets/redirect-page.html', 'utf-8')).end();
    });
  }

  /**
   * Listens to the given port awaiting callback.
   * @param {number} port
   * @param {string} host
   */
  listen(port: number, host = '0.0.0.0'): Server {
    this.server = this.expressApp.listen(port, host);
    return this.server;
  }

  /**
   * Shuts down the server.
   */
  close() {
    return this.server?.close();
  }
}
