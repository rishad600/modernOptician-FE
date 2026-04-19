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

    private getAuthHeaders(headers: HttpHeaders = new HttpHeaders()): HttpHeaders {
        const token = localStorage.getItem('token');
        if (token && !headers.has('Authorization')) {
            return headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    get<T>(path: string, params: HttpParams = new HttpParams(), headers: HttpHeaders = new HttpHeaders()): Observable<T> {
        const authHeaders = this.getAuthHeaders(headers);
        return this.http.get<T>(this.getFullUrl(path), { params, headers: authHeaders }).pipe(
            catchError(this.formatErrors)
        );
    }

    put<T>(path: string, body: any = {}, headers: HttpHeaders = new HttpHeaders()): Observable<T> {
        let authHeaders = this.getAuthHeaders(headers);
        authHeaders = authHeaders.has('Content-Type') ? authHeaders : authHeaders.set('Content-Type', 'application/json');
        const finalBody = authHeaders.get('Content-Type') === 'application/json' ? JSON.stringify(body) : body;
        return this.http.put<T>(this.getFullUrl(path), finalBody, {
            headers: authHeaders
        }).pipe(catchError(this.formatErrors));
    }

    patch<T>(path: string, body: any = {}, headers: HttpHeaders = new HttpHeaders()): Observable<T> {
        let authHeaders = this.getAuthHeaders(headers);
        authHeaders = authHeaders.has('Content-Type') ? authHeaders : authHeaders.set('Content-Type', 'application/json');
        const finalBody = authHeaders.get('Content-Type') === 'application/json' ? JSON.stringify(body) : body;
        return this.http.patch<T>(this.getFullUrl(path), finalBody, {
            headers: authHeaders
        }).pipe(catchError(this.formatErrors));
    }

    post<T>(path: string, body: any = {}, headers: HttpHeaders = new HttpHeaders()): Observable<T> {
        let authHeaders = this.getAuthHeaders(headers);
        authHeaders = authHeaders.has('Content-Type') ? authHeaders : authHeaders.set('Content-Type', 'application/json');
        const finalBody = authHeaders.get('Content-Type') === 'application/json' ? JSON.stringify(body) : body;
        return this.http.post<T>(this.getFullUrl(path), finalBody, {
            headers: authHeaders
        }).pipe(catchError(this.formatErrors));
    }

    delete<T>(path: string, headers: HttpHeaders = new HttpHeaders(), body: any = null): Observable<T> {
        let authHeaders = this.getAuthHeaders(headers);
        const options: any = { headers: authHeaders };
        if (body) {
            authHeaders = authHeaders.has('Content-Type') ? authHeaders : authHeaders.set('Content-Type', 'application/json');
            options.headers = authHeaders;
            options.body = authHeaders.get('Content-Type') === 'application/json' ? JSON.stringify(body) : body;
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
