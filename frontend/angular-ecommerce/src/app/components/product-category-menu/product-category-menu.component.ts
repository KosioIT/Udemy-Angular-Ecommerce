import { Component, inject, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ProductCategory } from "../../common/product-category";
import { ProductService } from "../../services/product.service";
import { CommonModule } from "@angular/common";

const productService = inject(ProductService);

@Component({
  selector: "app-product-category-menu",
  templateUrl: "./product-category-menu.component.html",
  styleUrls: ["./product-category-menu.component.css"],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class ProductCategoryMenuComponent implements OnInit {
  productCategories!: ProductCategory[];

  constructor() {}

  ngOnInit() {
    this.listProductCategories();
  }

  listProductCategories() {
    productService.getProductCategories().subscribe((data) => {
      console.log("Product Categories=" + JSON.stringify(data));
      this.productCategories = data;
    });
  }
}
