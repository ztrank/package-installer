import { Observable, from, of } from 'rxjs';
import { injectable, inject } from 'inversify';
import { mergeMap, map, concatMap, reduce, catchError } from 'rxjs/operators';
import { Symbols } from '../symbols';
import { Downloader } from '../interfaces/Downloader';
import { Settings } from '../interfaces/Settings';
import Path from 'path';
import { FileSystem } from '../interfaces/File.System';
import { PackageMetadata } from '../interfaces/Package.Metadata';
import { PackageFiles } from '../interfaces/Package.Files';
import { RepositoryMetadata } from '../interfaces/Repository.Metadata';
import { ProjectMetadata } from '../interfaces/Project.Metadata';
import inquirer from 'inquirer';

function upperCaseFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function properCase(str: string): string {
    return str.split(/[-_\s\.]/).map(s => upperCaseFirst(s)).join('');
}

@injectable()
export class InstallerImpl {

    public repoMetadata: RepositoryMetadata;
    public projectMetadata: ProjectMetadata;
    
    public constructor(
        @inject(Symbols.Settings) private settings: Settings,
        @inject(Symbols.Downloader) private downloader: Downloader,
        @inject(Symbols.FileSystem) private fileSystem: FileSystem
    ) {}

    private cleanRemote(...remote: string[]): string {
        return Path.join(...remote).replace(/\\/g, '/');
    }

    public get temp(): string {
        return this.settings.temp;
    }

    public downloadMetadata(): Observable<void> {
        return this.fileSystem.ensureDirectory(this.temp)
            .pipe(
                mergeMap(() => this.downloader.download(this.settings.bucket, this.cleanRemote('repository-metadata.json'), Path.join(this.temp, 'repository-metadata.json')))
            );
            
    }

    public loadMetadata(): Observable<void> {
        return this.fileSystem.readFile(this.temp, 'repository-metadata.json')
            .pipe(
                map(file => JSON.parse(file)),
                map(file => {this.repoMetadata = file;})
            );
    }

    public ensureServiceReferenceDirectory(): Observable<void> {
        return this.fileSystem.ensureDirectory(this.fileSystem.workingDirectory, 'src', 'service-references');
    }

    public ensureIndex(): Observable<void> {
        return this.fileSystem.ensureFile(this.fileSystem.workingDirectory, 'src', 'service-references', 'index.ts')
    }

    public ensureProjectMetadata(): Observable<void> {
        return this.fileSystem.ensureFile(this.fileSystem.workingDirectory, 'src', 'service-references', 'project-metadata.json')
    }

    public loadProjectMetadata(): Observable<void> {
        return this.fileSystem.readFile(this.fileSystem.workingDirectory, 'src', 'service-references', 'project-metadata.json')
        .pipe(
            map(file => JSON.parse(file || '{}')),
            map(file => {this.projectMetadata = file;})
        );
    }

    public askForPackageSelection(): Observable<string> {
        const packages = Object.getOwnPropertyNames(this.repoMetadata);
        packages.sort();
        return from(inquirer.prompt([{
            type: 'list',
            name: 'packageToInstall',
            message: 'Choose a package to install.',
            choices: packages
        }]).then(answers => {
            return <string>answers.packageToInstall;
        }));
    }

    public askForVersionSelection(packageName: string): Observable<PackageMetadata> {
        const versions = Object.getOwnPropertyNames(this.repoMetadata[packageName]);
        versions.sort((a, b) => {
            const as = a.split(/\./).map(r => parseInt(r, 10));
            const bs = b.split(/\./).map(r => parseInt(r, 10));
            if(as[0] - bs[0] === 0) {
                if(as[1] - bs[1] === 0) {   
                    return bs[2] - as[2];
                } else {
                    return bs[1] - as[1];
                }
            } else {
                return bs[0] - as[0];
            }
        })
        return from(inquirer.prompt([{
            type: 'list',
            name: 'versionToInstall',
            message: 'Choose a Version to Install',
            choices: versions
        }]).then(answers => {
            return <string>answers.versionToInstall;
        })).pipe(
            map(version => this.repoMetadata[packageName][version])
        );
    }

    public downloadPackage(metadata: PackageMetadata): Observable<PackageMetadata> {
        return this.ensureDownloadDirectory(metadata)
            .pipe(
                mergeMap(() => this.downloader.download(this.settings.bucket, this.cleanRemote(metadata.name, metadata.version, 'package-files.json'), Path.join(this.temp, metadata.name, metadata.version, 'package-files.json'))),
                mergeMap(() => this.downloader.download(this.settings.bucket, this.cleanRemote(metadata.name, metadata.version, 'package-metadata.json'), Path.join(this.temp, metadata.name, metadata.version, 'package-metadata.json'))),
                mergeMap(() => this.fileSystem.readFile(Path.join(this.temp, metadata.name, metadata.version, 'package-files.json'))),
                map(file => JSON.parse(file)),
                mergeMap((file: PackageFiles) => from(file.files)),
                concatMap(file => {
                    const localPath = file.replace(this.cleanRemote(Path.join(metadata.name, metadata.version)), '').split('/');
                    const fileName = <string>localPath.pop();
                    
                    return this.fileSystem.ensureDirectory(this.temp, metadata.name, metadata.version, ...localPath)
                        .pipe(
                            mergeMap(() => this.downloader.download(this.settings.bucket, file, Path.join(this.temp, metadata.name, metadata.version, ...localPath, fileName)))
                        )
                }),
                reduce((acc: any[], value: any) => {
                    return acc;
                }, []),
                map(() => metadata)
            );
            
    }

    public ensureDownloadDirectory(metadata: PackageMetadata): Observable<PackageMetadata> {
        return this.fileSystem.remove(this.temp, metadata.name, metadata.version)
            .pipe(
                catchError(() => of(undefined)),
                mergeMap(() => this.fileSystem.ensureDirectory(this.temp, metadata.name, metadata.version)),
                map(() => metadata)
            );
            
    }

    public ensureDestination(metadata: PackageMetadata): Observable<PackageMetadata> {
        return this.fileSystem.remove(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name)
            .pipe(
                catchError(() => of(undefined)),
                mergeMap(() => this.fileSystem.ensureDirectory(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name)),
                map(() => metadata)
            );
    }

    public copyFiles(metadata: PackageMetadata): Observable<PackageMetadata> {
        return this.fileSystem.copy(Path.join(this.temp, metadata.name, metadata.version), Path.join(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name))
            .pipe(
                mergeMap(() => this.fileSystem.remove(Path.join(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name, 'package-files.json'))),
                mergeMap(() => this.fileSystem.remove(Path.join(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name, 'package-metadata.json'))),
                map(() => metadata)
            );
    }

    public updateIndex(metadata: PackageMetadata): Observable<PackageMetadata> {
        return this.fileSystem.readFile(this.fileSystem.workingDirectory, 'src', 'service-references', 'index.ts')
            .pipe(
                map(file => {
                    const importName = properCase(metadata.importName ? metadata.importName : metadata.name);
                    const importString = `import * as ${importName} from './${metadata.name}';`;
                    const exportString = `export { ${importName} }`;
                    if(!file.includes(importString)) {
                        file = [importString, file].join('\n');
                    }
                    if(!file.includes(exportString)) {
                        file = [file, exportString].join('\n');
                    }
                    return file;
                }),
                mergeMap(file => this.fileSystem.writeFile(file, this.fileSystem.workingDirectory, 'src', 'service-references', 'index.ts')),
                map(() => metadata)
            );
    }

    public updateProjectMetadata(metadata: PackageMetadata): Observable<void> {
        this.projectMetadata.packages = this.projectMetadata.packages || {};
        this.projectMetadata.packages[metadata.name] = metadata;
        return this.fileSystem.writeFile(JSON.stringify(this.projectMetadata), this.fileSystem.workingDirectory, 'src', 'service-references', 'project-metadata.json');
    }
}