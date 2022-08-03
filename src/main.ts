import 'reflect-metadata';
import 'dotenv/config';
import { interfaceClasses } from './interfaces';
import { container } from 'tsyringe';
import { Runner } from './runner';

const selectedInterface = process.env.CON_INTERFACE ?? 'cli';
if (!(selectedInterface in interfaceClasses)) {
  console.log('Invalid interface value, supported interfaces are:', Object.keys(interfaceClasses).join(', '));
  process.exit(1);
}

container.register('UserInterface', { useClass: interfaceClasses[selectedInterface] });

const runner = container.resolve(Runner);
runner.run(); // , Forrest, run...
