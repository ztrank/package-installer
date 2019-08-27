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
        console.log('askForVersionSelection');
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
        console.log('downloadPackage');
        return this.ensureDownloadDirectory(metadata)
            .pipe(
                mergeMap(() => this.downloader.download(this.settings.bucket, this.cleanRemote(metadata.name, metadata.version, 'package-files.json'), Path.join(this.temp, metadata.name, metadata.version, 'package-files.json'))),
                mergeMap(() => this.downloader.download(this.settings.bucket, this.cleanRemote(metadata.name, metadata.version, 'package-metadata.json'), Path.join(this.temp, metadata.name, metadata.version, 'package-metadata.json'))),
                mergeMap(() => this.fileSystem.readFile(Path.join(this.temp, metadata.name, metadata.version, 'package-files.json'))),
                map(file => JSON.parse(file)),
                mergeMap((file: PackageFiles) => from(file.files)),
                concatMap(file => {
                    const localPath = file.replace(this.cleanRemote(Path.join(metadata.name, metadata.version)), '').split('/');
                    return this.fileSystem.ensureDirectory(this.temp, metadata.name, metadata.version, ...localPath)
                        .pipe(
                            mergeMap(() => this.downloader.download(this.settings.bucket, file, Path.join(this.temp, metadata.name, metadata.version, ...localPath)))
                        )
                }),
                reduce((acc: any[], value: any) => {
                    return acc;
                }, []),
                map(() => metadata)
            );
            
    }

    public ensureDownloadDirectory(metadata: PackageMetadata): Observable<PackageMetadata> {
        console.log('ensureDownloadDirectory');
        return this.fileSystem.remove(this.temp, metadata.name, metadata.version)
            .pipe(
                catchError(() => of(undefined)),
                mergeMap(() => this.fileSystem.ensureDirectory(this.temp, metadata.name, metadata.version)),
                map(() => metadata)
            );
            
    }

    public ensureDestination(metadata: PackageMetadata): Observable<PackageMetadata> {
        console.log('ensureDestination');
        return this.fileSystem.remove(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name)
            .pipe(
                catchError(() => of(undefined)),
                mergeMap(() => this.fileSystem.ensureDirectory(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name)),
                map(() => metadata)
            );
    }

    public copyFiles(metadata: PackageMetadata): Observable<PackageMetadata> {
        console.log('copyFiles');
        return this.fileSystem.copy(Path.join(this.temp, metadata.name, metadata.version), Path.join(this.fileSystem.workingDirectory, 'src', 'service-references', metadata.name))
            .pipe(map(() => metadata));
    }

    public updateIndex(metadata: PackageMetadata): Observable<PackageMetadata> {
        console.log('updateIndex');
        return this.fileSystem.readFile(this.fileSystem.workingDirectory, 'src', 'service-references', 'index.ts')
            .pipe(
                map(file => {
                    if(file.includes(`export * from './${metadata.name}';`)) {
                        return file;
                    } else {
                        file += `\nexport * from './${metadata.name}';`;
                        return file;
                    }
                }),
                mergeMap(file => this.fileSystem.writeFile(file, this.fileSystem.workingDirectory, 'src', 'service-references', 'index.ts')),
                map(() => metadata)
            );
    }

    public updateProjectMetadata(metadata: PackageMetadata): Observable<void> {
        console.log('updateProjectMetadata');
        this.projectMetadata.packages = this.projectMetadata.packages || {};
        this.projectMetadata.packages[metadata.name] = metadata;
        return this.fileSystem.writeFile(JSON.stringify(this.projectMetadata), this.fileSystem.workingDirectory, 'src', 'service-references', 'project-metadata.json');
    }
}