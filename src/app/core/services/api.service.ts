import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private getFullUrl(path: string): string {
        return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    }

    get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
        return this.http.get<T>(this.getFullUrl(path), { params }).pipe(
            catchError(this.formatErrors)
        );
    }

    put<T>(path: string, body: any = {}): Observable<T> {
        return this.http.put<T>(this.getFullUrl(path), JSON.stringify(body), {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        }).pipe(catchError(this.formatErrors));
    }

    post<T>(path: string, body: any = {}): Observable<T> {
        return this.http.post<T>(this.getFullUrl(path), JSON.stringify(body), {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        }).pipe(catchError(this.formatErrors));
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(this.getFullUrl(path)).pipe(
            catchError(this.formatErrors)
        );
    }

    private formatErrors(error: any) {
        console.error('API Error:', error);
        return throwError(() => error.error || error);
    }
}
