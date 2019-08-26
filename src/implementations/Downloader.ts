import { injectable, inject } from 'inversify';
import { Downloader } from '../interfaces/Downloader';
import { Symbols } from '../symbols';
import { StorageClient } from '../interfaces/Storage.Client';
import { Observable, from } from 'rxjs';

@injectable()
export class DownloaderImpl implements Downloader {
    public constructor(
        @inject(Symbols.StorageClient) private storageClient: StorageClient
    ) {}

    download(bucket: string, remote: string, local: string): Observable<void> {
        return from(this.storageClient.bucket(bucket).file(remote).download({destination: local}));
    }
} 