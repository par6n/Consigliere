import { singleton } from 'tsyringe';
import { readFile, writeFile } from 'fs/promises';

/**
 * This service is used for reading and storing data in the filesystem, used for
 * the CLI interface.
 */
@singleton()
export class FileStorageService {
  /**
   * @constructor
   */
  constructor(private readonly fileName: string) {}

  private async readOrCreateFile() {
    try {
      const fileBody = await readFile(this.fileName, 'utf-8');
      return JSON.parse(fileBody);
    } catch {
      await writeFile(this.fileName, '{}', 'utf-8');
      return {};
    }
  }

  /**
   * @param {string} entryKey
   * @return {Promise<object>}
   */
  public async find<T>(entryKey: string): Promise<T> {
    const document = await this.readOrCreateFile();

    if (!(entryKey in document)) {
      throw new Error(`Entry with key ${entryKey} was not found`);
    }

    return document[entryKey] as T;
  }

  /**
   * @param {string} entryKey
   * @param {object} data
   * @return {Promise<boolean>}
   */
  public async upsert(entryKey: string, data: object): Promise<boolean> {
    const document = await this.readOrCreateFile();

    document[entryKey] = data;

    const newData = JSON.stringify(document);

    return writeFile(this.fileName, newData, 'utf-8').then(() => true);
  }
}
