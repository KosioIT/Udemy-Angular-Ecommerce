import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Purchase } from '../common/purchase';
import { PaymentInfo } from '../common/payment-info';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private httpClient = inject(HttpClient);


  private purchaseUrl = environment.luv2shopApiUrl + '/checkout/purchase';

  private paymentIntentUrl = environment.luv2shopApiUrl + '/checkout/payment-intent';

  placeOrder(purchase: Purchase): Observable<Purchase> {
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);    
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<PaymentInfo> {
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);
  }
  
}
