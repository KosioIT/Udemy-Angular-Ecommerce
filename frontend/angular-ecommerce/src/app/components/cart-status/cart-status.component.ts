import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { RouterModule } from '@angular/router';

const cartService = inject(CartService);
@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrls: ['./cart-status.component.css'],
  standalone: true,
  imports: [CurrencyPipe, RouterModule]
})
export class CartStatusComponent implements OnInit {

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.updateCartStatus();
  }

  updateCartStatus() {
    cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

  }

}
