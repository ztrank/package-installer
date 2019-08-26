import { Observable } from 'rxjs';

export interface InstallerRunner {
    run(): Observable<void>;
}