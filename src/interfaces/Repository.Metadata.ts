import { PackageMetadata } from './Package.Metadata';

export interface RepositoryMetadata {
    [projectName: string]: VersionedProject;
}

export interface VersionedProject {
    [version:string]: PackageMetadata;
}