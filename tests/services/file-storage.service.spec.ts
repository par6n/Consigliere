import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { FileStorageService } from '../../src/services/file-storage.service';
import { v4 } from 'uuid';
import { expect } from 'chai';

describe('FileStorageService', () => {
  let sut: FileStorageService;

  beforeEach(() => {
    const fileName = `/tmp/${v4()}.json`;
    const data = {
      entryKey1: {
        foo: 'bar',
      },
    };
    writeFileSync(fileName, JSON.stringify(data), 'utf-8');

    sut = new FileStorageService(fileName);
  });

  it('should find existing entry key', async () => {
    const actual = await sut.find('entryKey1');
    const expected = { foo: 'bar' };

    expect(actual).eql(expected);
  });

  it('should return error when trying to find a non-existent entry key', async () => {
    const actual = await sut.find('nonExistent').catch(() => 'error');
    const expected = 'error';

    expect(actual).eql(expected);
  });

  it('should create or update a new entry key when calling upsert', async () => {
    await sut.upsert('newEntry', { bar: 'baz' });

    const actual = await sut.find('newEntry');
    const expected = { bar: 'baz' };

    expect(actual).eql(expected);
  });
});
