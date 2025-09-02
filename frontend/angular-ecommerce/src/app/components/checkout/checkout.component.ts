import { Component, inject, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";

import {
  loadStripe,
  Stripe,
  StripeCardElement,
  StripeCardElementChangeEvent,
} from "@stripe/stripe-js";

import { Luv2ShopFormService } from "../../services/luv2-shop-form.service";
import { CartService } from "../../services/cart.service";
import { CheckoutService } from "../../services/checkout.service";

import { Country } from "../../common/country";
import { State } from "../../common/state";
import { Luv2ShopValidators } from "../../validators/luv2-shop-validators";
import { Order } from "../../common/order";
import { OrderItem } from "../../common/order-item";
import { Purchase } from "../../common/purchase";
import { environment } from "../../../environments/environment";
import { PaymentInfo } from "../../common/payment-info";

type NameOrString = string | { name: string };
const luv2ShopFormService = inject(Luv2ShopFormService);
const cartService = inject(CartService);
const checkoutService = inject(CheckoutService);

@Component({
  selector: "app-checkout",
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.css"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class CheckoutComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

  stripe: Stripe | null = null;
  cardElement!: StripeCardElement;
  displayError: HTMLElement | null = document.getElementById("card-errors");

  isDisabled: boolean = false;

  paymentInfo: PaymentInfo = new PaymentInfo();

  constructor() {
    if (!this.displayError){
      throw new Error("Cannot find card-errors element");
    }
  }

  async ngOnInit(): Promise<void> {
    this.reviewCartDetails();

    const emailString = this.storage.getItem("userEmail");
    const theEmail = emailString ? JSON.parse(emailString) : "";

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        lastName: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        email: new FormControl(theEmail, [
          Validators.required,
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl("", [Validators.required]),
        country: new FormControl("", [Validators.required]),
        zipCode: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl("", [Validators.required]),
        country: new FormControl("", [Validators.required]),
        zipCode: new FormControl("", [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
      }),
      creditCard: this.formBuilder.group({}),
    });

    luv2ShopFormService
      .getCountries()
      .subscribe((data) => (this.countries = data));

    if (!environment.stripePublishableKey) {
      throw new Error("Stripe publishable key is not set in environment!");
    }
    this.stripe = await loadStripe(environment.stripePublishableKey);
    if (this.stripe) {
      this.setupStripePaymentForm();
    }
  }

  checkDisplayError(): void {
    if (!this.displayError) {
      throw new Error("Cannot find card-errors element");
    }
  }

  setupStripePaymentForm(): void {
    if (!this.stripe) return;

    const elements = this.stripe.elements();
    this.cardElement = elements.create("card", { hidePostalCode: true });

    this.cardElement.mount("#card-element");

    
    this.cardElement.on("change", (event: StripeCardElementChangeEvent) => {
      if (!this.displayError) {
        throw new Error("Cannot find card-errors element");
      }
      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }
    });
  }

  reviewCartDetails(): void {
    cartService.totalQuantity.subscribe((qty) => (this.totalQuantity = qty));
    cartService.totalPrice.subscribe((price) => (this.totalPrice = price));
  }

  copyShippingAddressToBillingAddress(event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.checkoutFormGroup.controls.billingAddress.setValue(
        this.checkoutFormGroup.controls.shippingAddress.value
      );
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }
  }

  getStates(formGroupName: string): void {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    if (!formGroup) {
      console.warn(`Form group "${formGroupName}" not found.`);
      return;
    }

    const country = formGroup.value.country;

    if (!country) {
      console.warn(`Country not selected for "${formGroupName}".`);
      return;
    }

    const countryCode = country.code;

    luv2ShopFormService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === "shippingAddress") {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }

      formGroup.get("state")?.setValue(data[0]);
    });
  }

  onSubmit(): void {
    if (
      this.checkoutFormGroup.invalid ||
      !this.displayError ||
      this.displayError.textContent !== ""
    ) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    const order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = cartService.cartItems;
    const orderItems = cartItems.map((item) => new OrderItem(item));

    const purchase = new Purchase();
    purchase.customer = this.checkoutFormGroup.controls["customer"].value;
    purchase.shippingAddress = {
      ...this.checkoutFormGroup.controls["shippingAddress"].value,
    };
    purchase.billingAddress = {
      ...this.checkoutFormGroup.controls["billingAddress"].value,
    };

    function resolveNameOrString(value: NameOrString): string | NameOrString {
      if (value && typeof value === "object" && "name" in value) {
        return value.name;
      }
      return value ?? "";
    }

    purchase.shippingAddress.state = resolveNameOrString(
      purchase.shippingAddress.state
    ) as string;
    purchase.shippingAddress.country = resolveNameOrString(
      purchase.shippingAddress.country
    ) as string;

    purchase.billingAddress.state = resolveNameOrString(
      purchase.billingAddress.state
    ) as string;
    purchase.billingAddress.country = resolveNameOrString(
      purchase.billingAddress.country
    ) as string;

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    this.isDisabled = true;

    checkoutService
      .createPaymentIntent(this.paymentInfo)
      .subscribe((paymentIntentResponse) => {
        if (!paymentIntentResponse) {
          alert("Error creating payment intent");
          this.isDisabled = false;
          return;
        }
       
        this.stripe
          ?.confirmCardPayment(
            paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.checkoutFormGroup.get(
                      "billingAddress.country"
                    )?.value.code,
                  },
                },
              },
            },
            { handleActions: false }
          )
          .then((result) => {
            if (result.error) {
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled = false;
            } else {
              checkoutService.placeOrder(purchase).subscribe({
                next: (response) => {
                  if (!response) {
                    alert("Error placing order");
                    this.isDisabled = false;
                    return;
                  }
                  alert(
                    `Your order has been received.\nOrder tracking number: ${response.order.orderTrackingNumber}`
                  );
                  this.resetCart();
                  this.isDisabled = false;
                },
                error: (err) => {
                  alert(`There was an error: ${err.message}`);
                  this.isDisabled = false;
                },
              });
            }
          });
      });
  }

  resetCart() {
    cartService.cartItems = [];
    cartService.totalPrice.next(0);
    cartService.totalQuantity.next(0);
    cartService.persistCartItems();

    this.checkoutFormGroup.reset();
    this.router.navigateByUrl("/products");
  }

  // Getters за по-лесен достъп до формата
  get firstName() {
    return this.checkoutFormGroup.get("customer.firstName");
  }
  get lastName() {
    return this.checkoutFormGroup.get("customer.lastName");
  }
  get email() {
    return this.checkoutFormGroup.get("customer.email");
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get("shippingAddress.street");
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get("shippingAddress.city");
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get("shippingAddress.state");
  }
  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get("shippingAddress.zipCode");
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get("shippingAddress.country");
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get("billingAddress.street");
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get("billingAddress.city");
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get("billingAddress.state");
  }
  get billingAddressZipCode() {
    return this.checkoutFormGroup.get("billingAddress.zipCode");
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get("billingAddress.country");
  }
}
