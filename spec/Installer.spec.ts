import 'reflect-metadata';
import inquirer from 'inquirer';
jest.mock('inquirer', () => ({
    ...jest.requireActual('inquirer'),
    prompt: jest.fn()
}));
import Path from 'path';
import { InstallerImpl } from '../src/implementations/Installer';
import { of } from 'rxjs';
import { ProjectMetadata } from '../src/interfaces/Project.Metadata';

beforeEach(() => {
    (<jest.Mock><any>inquirer.prompt).mockReset();
});

class Downloader {
    download = jest.fn();
}

class FileSystem {
    readFile = jest.fn();
    ensureDirectory = jest.fn();
    ensureFile = jest.fn();
    remove = jest.fn();
    copy = jest.fn();
    writeFile = jest.fn();
    workingDirectory = 'C:\\installer'
}

const settings = {
    bucket: 'azimuth-packages'
};


/*
downloadMetadata
loadMetadata
ensureServiceReferenceDirectory
ensureIndex
ensureProjectMetadata
loadProjectMetadata
askForPackageSelection
askForVersionSelection
downloadPackage
ensureDownloadDirectory
ensureDestination
copyFiles
updateIndex
updateProjectMetadata
*/
function cleanRemote(...remote: string[]): string {
    return Path.join(...remote).replace(/\\/g, '/');
}

const packageFiles = {
    files: [
        "azimuth-secrets/1.0.3/Secret.Service.ts",
        "azimuth-secrets/1.0.3/index.ts"
    ]
};

const repoMetadata = {
    "azimuth-secrets": {
        "1.0.3": {
            name: 'azimuth-secrets',
            version: '1.0.3',
            author: 'ztrank',
            repository: 'git',
            directory: 'src/public'
        },
        "1.0.2": {
            name: 'azimuth-secrets',
            version: '1.0.2',
            author: 'ztrank',
            repository: 'git',
            directory: 'src/public'
        },
        "0.9.2": {
            name: 'azimuth-secrets',
            version: '1.0.2',
            author: 'ztrank',
            repository: 'git',
            directory: 'src/public'
        },
        "0.8.2": {
            name: 'azimuth-secrets',
            version: '1.0.2',
            author: 'ztrank',
            repository: 'git',
            directory: 'src/public'
        }
    }
};



test('downloadMetadata', (done) => {
    //this.downloader.download(this.settings.bucket, this.cleanRemote('repository-metadata.json'), Path.join(this.temp, 'repository-metadata.json'));
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);

    downloader.download.mockImplementation((bucket, remote, local) => {
        expect(bucket).toBe(settings.bucket);
        expect(remote).toBe(cleanRemote('repository-metadata.json'));
        expect(local).toBe(Path.join(installer.temp, 'repository-metadata.json'));
        return of(undefined);
    });

    installer.downloadMetadata()
        .subscribe(() => {
            expect(downloader.download).toHaveBeenCalled();
            done();
        });
});

test('loadMetadata', (done) => {
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);

    fileSystem.readFile.mockImplementation((a, b) => {
        expect(a).toBe(installer.temp);
        expect(b).toBe('repository-metadata.json');
        return of(JSON.stringify(repoMetadata));
    });

    installer.loadMetadata()
        .subscribe(() => {
            expect(fileSystem.readFile).toHaveBeenCalled();
            done();
        })
});

test('ensureServiceReferenceDirectory', (done) => {
    
    //return this.fileSystem.ensureDirectory(this.fileSystem.workingDirectory, 'src', 'service-references');
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    fileSystem.ensureDirectory.mockImplementation((a, b, c) => {
        expect(a).toBe(fileSystem.workingDirectory);
        expect(b).toBe('src');
        expect(c).toBe('service-references');
        return of(undefined);
    });
    installer.ensureServiceReferenceDirectory()
        .subscribe(() => {
            expect(fileSystem.ensureDirectory).toHaveBeenCalled();
            done();
        })
});

test('ensureIndex', (done) => {

    //return this.fileSystem.ensureFile(this.fileSystem.workingDirectory, 'src', 'service-references', 'index.ts')
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    fileSystem.ensureFile.mockImplementation((a, b, c, d) => {
        expect(a).toBe(fileSystem.workingDirectory);
        expect(b).toBe('src');
        expect(c).toBe('service-references');
        expect(d).toBe('index.ts');
        return of(undefined);
    });
    installer.ensureIndex()
        .subscribe(() => {
            expect(fileSystem.ensureFile).toHaveBeenCalled();
            done();
        });
});

test('ensureProjectMetadata', (done) => {

    //return this.fileSystem.ensureFile(this.fileSystem.workingDirectory, 'src', 'service-references', 'project-metadata.json')
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    fileSystem.ensureFile.mockImplementation((a, b, c, d) => {
        expect(a).toBe(fileSystem.workingDirectory);
        expect(b).toBe('src');
        expect(c).toBe('service-references');
        expect(d).toBe('project-metadata.json');
        return of(undefined);
    });
    installer.ensureProjectMetadata()
        .subscribe(() => {
            expect(fileSystem.ensureFile).toHaveBeenCalled();
            done();
        });

});

test('loadProjectMetadata', (done) => {
    //this.fileSystem.readFile(this.fileSystem.workingDirectory, 'src', 'service-references', 'project-metadata.json')
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    const projectMetadata = {
    
    };
    fileSystem.readFile.mockImplementation((a, b, c, d) => {
        expect(a).toBe(fileSystem.workingDirectory);
        expect(b).toBe('src');
        expect(c).toBe('service-references');
        expect(d).toBe('project-metadata.json');
        return of(JSON.stringify(projectMetadata));
    });

    installer.loadProjectMetadata()
        .subscribe(() => {
            expect(fileSystem.readFile).toHaveBeenCalled();
            done();
        });
});

test('askForPackageSelection', (done) => {
    (<jest.Mock><any>inquirer.prompt).mockImplementation(questions => {
        expect(questions).toHaveLength(1);
        expect(questions[0].type).toBe('list');
        expect(questions[0].name).toBe('packageToInstall');
        expect(questions[0].choices).toHaveLength(1);
        expect(questions[0].choices[0]).toBe('azimuth-secrets');
        return Promise.resolve({
            packageToInstall: 'azimuth-secrets'
        });
    });
    const projectMetadata: ProjectMetadata = <any>{
    
    };
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    installer.repoMetadata = repoMetadata;
    installer.projectMetadata = projectMetadata;
    installer.askForPackageSelection()
        .subscribe(() => {
            expect(inquirer.prompt).toHaveBeenCalled();
            done();
        });
});

test('askForVersionSelection', (done) => {
    (<jest.Mock><any>inquirer.prompt).mockImplementation(questions => {
        expect(questions).toHaveLength(1);
        expect(questions[0].type).toBe('list');
        expect(questions[0].name).toBe('versionToInstall');
        expect(questions[0].choices).toHaveLength(4);
        expect(questions[0].choices[0]).toBe('1.0.3');
        expect(questions[0].choices[1]).toBe('1.0.2');
        expect(questions[0].choices[2]).toBe('0.9.2');
        expect(questions[0].choices[3]).toBe('0.8.2');
        return Promise.resolve({
            versionToInstall: '1.0.3'
        });
    });
    const projectMetadata: ProjectMetadata = <any>{
    
    };
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    installer.repoMetadata = repoMetadata;
    installer.projectMetadata = projectMetadata;
    installer.askForVersionSelection('azimuth-secrets')
        .subscribe(() => {
            expect(inquirer.prompt).toHaveBeenCalled();
            done();
        });
});

test('downloadPackage', (done) => {
    const projectMetadata: ProjectMetadata = <any>{
    
    };
    const metadata = repoMetadata['azimuth-secrets']['1.0.3'];
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    installer.repoMetadata = repoMetadata;
    installer.projectMetadata = projectMetadata;
    //this.fileSystem.remove(this.temp, metadata.name, metadata.version)
    //this.fileSystem.ensureDirectory(this.temp, metadata.name, metadata.version, ...localPath)
    fileSystem.remove.mockImplementation((a, b, c) => {
        expect(a).toBe(installer.temp);
        expect(b).toBe(metadata.name);
        expect(c).toBe(metadata.version);
        return of(undefined);
    });
    fileSystem.ensureDirectory.mockImplementation((a: string, b: string, c: string, ...others: string[]) => {
        expect(a).toBe(installer.temp);
        expect(b).toBe(metadata.name);
        expect(c).toBe(metadata.version);
        return of(undefined);
    });
    //Path.join(this.temp, metadata.name, metadata.version, 'package-files.json')
    fileSystem.readFile.mockImplementation(a => {
        expect(a).toBe(Path.join(installer.temp, metadata.name, metadata.version, 'package-files.json'));
        return of(JSON.stringify(packageFiles));
    });
    downloader.download.mockImplementation((a: string, b: string, c: string) => {
        expect(a).toBe(settings.bucket);
        if(packageFiles.files.indexOf(b) < 0) {
            expect(b.startsWith(cleanRemote(Path.join(metadata.name, metadata.version)))).toBe(true);
            expect(b.endsWith('package-files.json') || b.endsWith('package-metadata.json')).toBe(true);

            expect(c.startsWith(Path.join(installer.temp, metadata.name, metadata.version))).toBe(true);
            expect(c.endsWith('package-files.json') || c.endsWith('package-metadata.json')).toBe(true);
        } else {
            const local = b.replace(cleanRemote(Path.join(metadata.name, metadata.version)), '').split('/');
            expect(c).toBe(Path.join(installer.temp, metadata.name, metadata.version, ...local));
        }
        
        return of(undefined);
    });

    installer.downloadPackage(metadata)
        .subscribe(meta => {
            expect(meta).toBeDefined();
            expect(fileSystem.ensureDirectory).toHaveBeenCalledTimes(3);
            expect(fileSystem.readFile).toHaveBeenCalledTimes(1);
            expect(downloader.download).toHaveBeenCalledTimes(4);
            expect(fileSystem.remove).toHaveBeenCalledTimes(1);
            done();
        })
});


test('ensureDestination', (done) => {
    //this.fileSystem.remove(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name)
    //this.fileSystem.ensureDirectory(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name)
    const projectMetadata: ProjectMetadata = <any>{
    
    };
    const metadata = repoMetadata['azimuth-secrets']['1.0.3'];
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    installer.repoMetadata = repoMetadata;
    installer.projectMetadata = projectMetadata;

    fileSystem.remove.mockImplementation((a, b, c, d) => {
        expect(a).toBe(fileSystem.workingDirectory);
        expect(b).toBe('src');
        expect(c).toBe('service-references');
        expect(d).toBe(metadata.name);
        return of(undefined);
    });
    fileSystem.ensureDirectory.mockImplementation((a, b, c, d) => {
        expect(a).toBe(fileSystem.workingDirectory);
        expect(b).toBe('src');
        expect(c).toBe('service-references');
        expect(d).toBe(metadata.name);
        return of(undefined);
    });    

    installer.ensureDestination(metadata)
        .subscribe(() => {
            expect(fileSystem.ensureDirectory).toBeCalled();
            expect(fileSystem.remove).toHaveBeenCalled();
            done();
        });
});

test('copyFiles', (done) => {
    const projectMetadata: ProjectMetadata = <any>{
    
    };
    const metadata = repoMetadata['azimuth-secrets']['1.0.3'];
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    installer.repoMetadata = repoMetadata;
    installer.projectMetadata = projectMetadata;
    //this.fileSystem.copy(Path.join(this.temp, metadata.name, metadata.version), Path.join(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name))
    fileSystem.copy.mockImplementation((from, to) => {
        expect(from).toBe(Path.join(installer.temp, metadata.name, metadata.version));
        expect(to).toBe(Path.join(fileSystem.workingDirectory, 'src', 'service-references', metadata.name));
        return of(undefined);
    });

    installer.copyFiles(metadata)
        .subscribe((meta) => {
            expect(meta).toBeDefined();
            expect(fileSystem.copy).toHaveBeenCalled();
            done();
        })
});

test('updateIndex', (done) => {
    const projectMetadata: ProjectMetadata = <any>{
    
    };
    const metadata = repoMetadata['azimuth-secrets']['1.0.3'];
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    installer.repoMetadata = repoMetadata;
    installer.projectMetadata = projectMetadata;
    //this.fileSystem.readFile(this.fileSystem.workingDirectory, 'src', 'service-references', 'index.ts')
    //his.fileSystem.writeFile(file, this.fileSystem.workingDirectory, 'src', 'service-references', 'index.ts')
    fileSystem.readFile.mockImplementation((a, b, c, d) => {
        expect(a).toBe(fileSystem.workingDirectory);
        expect(b).toBe('src');
        expect(c).toBe('service-references');
        expect(d).toBe('index.ts');
        return of(`export * from 'some-other-thing';`);
    });
    fileSystem.writeFile.mockImplementation((file, a, b, c, d) => {
        expect(a).toBe(fileSystem.workingDirectory);
        expect(b).toBe('src');
        expect(c).toBe('service-references');
        expect(d).toBe('index.ts');
        expect(file).toBe(`export * from 'some-other-thing';\nexport * from './azimuth-secrets';`);
        return of(undefined);
    });
    installer.updateIndex(metadata)
        .subscribe(meta => {
            expect(meta).toBeDefined();
            expect(fileSystem.readFile).toHaveBeenCalled();
            expect(fileSystem.writeFile).toHaveBeenCalled();
            done();
        });
});

test('updateProjectMetadata', (done) => {
    const projectMetadata: ProjectMetadata = <any>{
    
    };
    const metadata = repoMetadata['azimuth-secrets']['1.0.3'];
    const downloader = new Downloader();
    const fileSystem = new FileSystem();
    const installer = new InstallerImpl(settings, downloader, fileSystem);
    installer.repoMetadata = repoMetadata;
    installer.projectMetadata = projectMetadata;
    //this.fileSystem.writeFile(JSON.stringify(this.projectMetadata), this.fileSystem.workingDirectory, 'src', 'service-references', 'project-metadata.json')
    fileSystem.writeFile.mockImplementation((file, a, b, c, d) => {
        expect(file).toBeDefined();
        expect(a).toBe(fileSystem.workingDirectory);
        expect(b).toBe('src');
        expect(c).toBe('service-references');
        expect(d).toBe('project-metadata.json');
        return of(undefined);
    });

    installer.updateProjectMetadata(metadata)
        .subscribe(() => {
            expect(projectMetadata.packages).toBeDefined();
            expect(projectMetadata.packages["azimuth-secrets"]).toBeDefined();
            expect(fileSystem.writeFile).toHaveBeenCalled();
            done();
        });
});
