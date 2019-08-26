import 'reflect-metadata';
import fs from 'fs-extra';
jest.mock('fs-extra', () => ({
    ...jest.requireActual('fs-extra'),
    readFile: jest.fn().mockImplementation(() => {
        return Promise.resolve('anything');
    }),
    ensureDir: jest.fn().mockImplementation(() => {
        return Promise.resolve();
    }),
    ensureFile: jest.fn().mockImplementation(() => {
        return Promise.resolve();
    }),
    remove: jest.fn().mockImplementation(() => {
        return Promise.resolve();
    }),
    copy: jest.fn().mockImplementation(() => {
        return Promise.resolve();
    }),
    writeFile: jest.fn().mockImplementation(() => {
        return Promise.resolve();
    })
}));

import { FileSystemImpl } from '../src/implementations/File.System';

test('readFile', (done) => {
    const fileSystem = new FileSystemImpl();    
    fileSystem.readFile('file')
        .subscribe(() => {
            expect(fs.readFile).toHaveBeenCalled();
            done();
        })
});

test('ensureDirectory', (done) => {
    const fileSystem = new FileSystemImpl();
    fileSystem.ensureDirectory('dir')
        .subscribe(() => {
            expect(fs.ensureDir).toHaveBeenCalled();
            done();
        })
});

test('ensureFile', (done) => {
    const fileSystem = new FileSystemImpl();
    fileSystem.ensureFile('dir', 'file')
        .subscribe(() => {
            expect(fs.ensureFile).toHaveBeenCalled();
            done();
        })
});

test('remove', (done) => {
    const fileSystem = new FileSystemImpl();
    fileSystem.remove('dir')
        .subscribe(() => {
            expect(fs.remove).toHaveBeenCalled();
            done();
        })
});

test('copy', (done) => {
    const fileSystem = new FileSystemImpl();
    fileSystem.copy('src', 'dest')
        .subscribe(() => {
            expect(fs.copy).toHaveBeenCalled();
            done();
        })
});

test('writeFile', (done) => {
    const fileSystem = new FileSystemImpl();
    fileSystem.writeFile('content', 'dir', 'file')
        .subscribe(() => {
            expect(fs.writeFile).toHaveBeenCalled();
            done();
        })
});

test('workingDirectory', (done) => {
    const fileSystem = new FileSystemImpl();
    expect(fileSystem.workingDirectory).toBe(process.cwd());
    done();
});


