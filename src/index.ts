import { Observable } from 'rxjs';
import { Container } from 'inversify';
import { Symbols } from './symbols';
import { Storage } from '@google-cloud/storage';
import { FileSystemImpl } from './implementations/File.System';
import { DownloaderImpl } from './implementations/Downloader';
import { InstallerImpl } from './implementations/Installer';
import { InstallerRunnerImpl } from './implementations/Installer.Runner';
import { InstallerRunner } from './interfaces/Installer.Runner';

export function Run(
    storageClientCertLocation: string = 'C:\\service-accounts\\azimuth-package-manager.json',
    bucket: string = 'azimuth-packages'
): Observable<void> {
    const container = new Container();
    container.bind(Symbols.StorageClient).toConstantValue(new Storage({keyFilename: storageClientCertLocation}));
    container.bind(Symbols.Settings).toConstantValue({bucket: bucket});
    container.bind(Symbols.FileSystem).to(FileSystemImpl);
    container.bind(Symbols.Downloader).to(DownloaderImpl);
    container.bind(Symbols.Installer).to(InstallerImpl);
    container.bind(Symbols.Runner).to(InstallerRunnerImpl);
    const runner = container.get<InstallerRunner>(Symbols.Runner);
    return runner.run();
}