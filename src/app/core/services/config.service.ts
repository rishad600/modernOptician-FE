import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private paypalConfig$: Observable<any> | null = null;

  constructor(private api: ApiService) {}

  getPayPalConfig(): Observable<any> {
    if (!this.paypalConfig$) {
      this.paypalConfig$ = this.api.get<any>('web/public/config/paypal').pipe(
        shareReplay(1)
      );
    }
    return this.paypalConfig$;
  }
}
