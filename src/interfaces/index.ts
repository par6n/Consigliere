import { CliInterface } from './cli.interface';
import { constructor } from 'tsyringe/dist/typings/types';

/**
 * This is the interface for interfaces that the app supports.
 */
export interface UserInterface {
  run(): void;
}

export const interfaceClasses: Record<string, constructor<UserInterface>> = {
  cli: CliInterface,
};
