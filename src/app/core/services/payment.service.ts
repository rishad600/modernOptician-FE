import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, from, map, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paypalSdkLoaded = false;
  private lastCurrency = '';

  constructor(private api: ApiService) {}

  getPaypalConfig(): Observable<any> {
    return this.api.get<any>('web/public/config/paypal').pipe(
      map(res => res.data || res)
    );
  }

  loadPaypalSdk(clientId: string, currency: string): Promise<void> {
    if (this.paypalSdkLoaded && this.lastCurrency === currency) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Remove existing script if currency changed
      const existingScript = document.querySelector('script[data-paypal-sdk]');
      if (existingScript) {
        existingScript.remove();
        delete (window as any).paypal;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&enable-funding=card,venmo,paylater`;
      script.dataset['paypalSdk'] = 'true';
      script.onload = () => {
        this.paypalSdkLoaded = true;
        this.lastCurrency = currency;
        resolve();
      };
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }

  createOrder(courseId: string): Observable<string> {
    return this.api.post<any>('web/user/payment/create-order', { courseId }).pipe(
      map(res => res.data?.orderId || res.orderId)
    );
  }

  captureOrder(orderId: string): Observable<any> {
    return this.api.post<any>('web/user/payment/capture-order', { orderId });
  }
}
