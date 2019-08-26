import { Observable } from 'rxjs';

export interface FileSystem {
    readFile(...paths: string[]): Observable<string>;
    ensureDirectory(...path: string[]): Observable<void>;
    ensureFile(...path: string[]): Observable<void>;
    remove(...path: string[]): Observable<void>;
    copy(from: string, to: string): Observable<void>;
    writeFile(content: any, ...paths: string[]): Observable<void>;
    readonly workingDirectory: string;
}