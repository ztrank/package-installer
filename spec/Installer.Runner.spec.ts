import 'reflect-metadata';
import { InstallerRunnerImpl } from '../src/implementations/Installer.Runner';
import { of } from 'rxjs';

const installer = {
    downloadMetadata: jest.fn().mockImplementation(() => of(undefined)),
    loadMetadata: jest.fn().mockImplementation(() => of(undefined)),
    ensureServiceReferenceDirectory: jest.fn().mockImplementation(() => of(undefined)),
    ensureIndex: jest.fn().mockImplementation(() => of(undefined)),
    ensureProjectMetadata: jest.fn().mockImplementation(() => of(undefined)),
    loadProjectMetadata: jest.fn().mockImplementation(() => of(undefined)),
    askForPackageSelection: jest.fn().mockImplementation(() => of('package')),
    askForVersionSelection: jest.fn().mockImplementation(() => of({})),
    ensureDestination: jest.fn().mockImplementation(() => of({})),
    copyFiles: jest.fn().mockImplementation(() => of({})),
    updateIndex: jest.fn().mockImplementation(() => of({})),
    updateProjectMetadata: jest.fn().mockImplementation(() => of(undefined)),
    downloadPackage: jest.fn().mockImplementation(() => of({}))
};

test('Run', (done) => {
    const runner = new InstallerRunnerImpl(installer);
    runner.run()
        .subscribe(() => {
            expect(installer.downloadMetadata).toHaveBeenCalledTimes(1);
            expect(installer.loadMetadata).toHaveBeenCalledTimes(1);
            expect(installer.ensureServiceReferenceDirectory).toHaveBeenCalledTimes(1);
            expect(installer.ensureIndex).toHaveBeenCalledTimes(1);
            expect(installer.ensureProjectMetadata).toHaveBeenCalledTimes(1);
            expect(installer.loadProjectMetadata).toHaveBeenCalledTimes(1);
            expect(installer.askForPackageSelection).toHaveBeenCalledTimes(1);
            expect(installer.askForVersionSelection).toHaveBeenCalledTimes(1);
            expect(installer.ensureDestination).toHaveBeenCalledTimes(1);
            expect(installer.copyFiles).toHaveBeenCalledTimes(1);
            expect(installer.updateIndex).toHaveBeenCalledTimes(1);
            expect(installer.updateProjectMetadata).toHaveBeenCalledTimes(1);
            done();
        })
})