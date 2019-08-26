import { PackageMetadata } from './Package.Metadata';

export interface ProjectMetadata {
    packages: {[packageName: string]: PackageMetadata};
}