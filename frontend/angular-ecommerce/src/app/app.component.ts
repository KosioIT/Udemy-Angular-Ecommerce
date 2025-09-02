import { Component } from '@angular/core';
import { ProductCategoryMenuComponent } from './components/product-category-menu/product-category-menu.component';
import { SearchComponent } from './components/search/search.component';
import { LoginStatusComponent } from './components/login-status/login-status.component';
import {CartStatusComponent} from "./components/cart-status/cart-status.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    ProductCategoryMenuComponent,
    SearchComponent,
    LoginStatusComponent,
    CartStatusComponent,
    RouterModule
  ]
})
export class AppComponent {
  title = 'angular-ecommerce';
}
