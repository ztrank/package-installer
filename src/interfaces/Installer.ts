import { Observable } from 'rxjs';
import { PackageMetadata } from './Package.Metadata';

export interface Installer {
    downloadMetadata(): Observable<void>;
    loadMetadata(): Observable<void>;
    ensureServiceReferenceDirectory(): Observable<void>;
    ensureIndex(): Observable<void>;
    ensureProjectMetadata(): Observable<void>;
    loadProjectMetadata(): Observable<void>;
    askForPackageSelection(): Observable<string>;
    askForVersionSelection(name: string): Observable<PackageMetadata>;
    downloadPackage(meta: PackageMetadata): Observable<PackageMetadata>;
    ensureDestination(meta: PackageMetadata): Observable<PackageMetadata>;
    copyFiles(meta: PackageMetadata): Observable<PackageMetadata>;
    updateIndex(meta: PackageMetadata): Observable<PackageMetadata>;
    updateProjectMetadata(meta: PackageMetadata): Observable<void>;
}