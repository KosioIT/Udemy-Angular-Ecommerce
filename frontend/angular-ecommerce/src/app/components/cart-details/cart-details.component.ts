import { inject } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { CartItem } from "../../common/cart-item";
import { CartService } from "../../services/cart.service";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

const cartService = inject(CartService);
@Component({
  selector: "app-cart-details",
  templateUrl: "./cart-details.component.html",
  styleUrls: ["./cart-details.component.css"],
  standalone: true,
  imports: [CurrencyPipe, CommonModule, RouterModule],
})
export class CartDetailsComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.listCartDetails();
  }

  listCartDetails() {
    this.cartItems = cartService.cartItems;

    cartService.totalPrice.subscribe(
      (data: number) => (this.totalPrice = data)
    );

    cartService.totalQuantity.subscribe((data: number) => (this.totalQuantity = data));

    cartService.computeCartTotals();
  }

  incrementQuantity(theCartItem: CartItem) {
    cartService.addToCart(theCartItem);
  }

  decrementQuantity(theCartItem: CartItem) {
    cartService.decrementQuantity(theCartItem);
  }

  remove(theCartItem: CartItem) {
    cartService.remove(theCartItem);
  }
}
