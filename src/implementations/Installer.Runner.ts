import { injectable, inject } from 'inversify';
import { Installer } from '../interfaces/Installer';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Symbols } from '../symbols';

@injectable()
export class InstallerRunnerImpl {
    public constructor(
        @inject(Symbols.Installer) private installer: Installer
    ) {}

    run(): Observable<void> {
        return this.installer.downloadMetadata()
            .pipe(
                mergeMap(() => this.installer.loadMetadata()),
                mergeMap(() => this.installer.ensureServiceReferenceDirectory()),
                mergeMap(() => this.installer.ensureIndex()),
                mergeMap(() => this.installer.ensureProjectMetadata()),
                mergeMap(() => this.installer.loadProjectMetadata())
            ).pipe(
                mergeMap(() => this.installer.askForPackageSelection()),
                mergeMap(name => this.installer.askForVersionSelection(name)),
                mergeMap(meta => this.installer.ensureDestination(meta)),
                mergeMap(meta => this.installer.downloadPackage(meta)),
                mergeMap(meta => this.installer.copyFiles(meta)),
                mergeMap(meta => this.installer.updateIndex(meta)),
                mergeMap(meta => this.installer.updateProjectMetadata(meta))
            );
    }
}