import { injectable } from 'inversify';
import { FileSystem } from '../interfaces/File.System';
import fs from 'fs-extra';
import { Observable, from } from 'rxjs';
import Path from 'path';

@injectable()
export class FileSystemImpl implements FileSystem {
    public constructor() {}

    get workingDirectory(): string {
        return process.cwd();
    }

    readFile(...paths: string[]): Observable<string> {
        return from(fs.readFile(Path.join(...paths), {encoding: 'utf8'}));
    }

    ensureDirectory(...path: string[]): Observable<void> {
        return from(fs.ensureDir(Path.join(...path)));
    }

    ensureFile(...path: string[]): Observable<void> {
        return from(fs.ensureFile(Path.join(...path)));
    }

    remove(...path: string[]): Observable<void> {
        return from(fs.remove(Path.join(...path)));
    }

    copy(frm: string, to: string): Observable<void> {
        return from(fs.copy(frm, to));
    }

    writeFile(content: any, ...paths: string[]): Observable<void> {
        return from(fs.writeFile(Path.join(...paths), content));
    }
    
}