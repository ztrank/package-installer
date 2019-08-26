import { Observable } from 'rxjs';

export interface Downloader {
    download(bucket: string, remote: string, local: string): Observable<void>;
}