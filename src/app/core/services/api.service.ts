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

    get<T>(path: string, params: HttpParams = new HttpParams(), headers: HttpHeaders = new HttpHeaders()): Observable<T> {
        return this.http.get<T>(this.getFullUrl(path), { params, headers }).pipe(
            catchError(this.formatErrors)
        );
    }

    put<T>(path: string, body: any = {}, headers: HttpHeaders = new HttpHeaders()): Observable<T> {
        const defaultHeaders = headers.has('Content-Type') ? headers : headers.set('Content-Type', 'application/json');
        const finalBody = headers.get('Content-Type') === 'application/json' ? JSON.stringify(body) : body;
        return this.http.put<T>(this.getFullUrl(path), finalBody, {
            headers: defaultHeaders
        }).pipe(catchError(this.formatErrors));
    }

    patch<T>(path: string, body: any = {}, headers: HttpHeaders = new HttpHeaders()): Observable<T> {
        const defaultHeaders = headers.has('Content-Type') ? headers : headers.set('Content-Type', 'application/json');
        const finalBody = headers.get('Content-Type') === 'application/json' ? JSON.stringify(body) : body;
        return this.http.patch<T>(this.getFullUrl(path), finalBody, {
            headers: defaultHeaders
        }).pipe(catchError(this.formatErrors));
    }

    post<T>(path: string, body: any = {}, headers: HttpHeaders = new HttpHeaders()): Observable<T> {
        const defaultHeaders = headers.has('Content-Type') ? headers : headers.set('Content-Type', 'application/json');
        const finalBody = headers.get('Content-Type') === 'application/json' ? JSON.stringify(body) : body;
        return this.http.post<T>(this.getFullUrl(path), finalBody, {
            headers: defaultHeaders
        }).pipe(catchError(this.formatErrors));
    }

    delete<T>(path: string, headers: HttpHeaders = new HttpHeaders(), body: any = null): Observable<T> {
        const options: any = { headers };
        if (body) {
            const defaultHeaders = headers.has('Content-Type') ? headers : headers.set('Content-Type', 'application/json');
            options.headers = defaultHeaders;
            options.body = defaultHeaders.get('Content-Type') === 'application/json' ? JSON.stringify(body) : body;
        }
        return this.http.delete<T>(this.getFullUrl(path), options as { headers?: HttpHeaders, body?: any }).pipe(
            catchError(this.formatErrors)
        );
    }

    private formatErrors(error: any) {
        console.error('API Error:', error);
        return throwError(() => error.error || error);
    }
}
