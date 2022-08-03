import { UserInterface } from './interfaces';
import { inject, injectable } from 'tsyringe';

/**
 * Runner is the bridge between an interface and the services.
 * @class
 */
@injectable()
export class Runner {
  constructor(@inject('UserInterface') private readonly userInterface: UserInterface) {}

  run() {
    return this.userInterface.run();
  }
}
