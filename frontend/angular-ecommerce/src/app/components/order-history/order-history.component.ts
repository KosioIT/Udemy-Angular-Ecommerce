import { Component, inject, OnInit } from '@angular/core';
import { OrderHistory } from '../../common/order-history';
import { OrderHistoryService } from '../../services/order-history.service';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

const orderHistoryService = inject(OrderHistoryService);

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
})
export class OrderHistoryComponent implements OnInit {

  orderHistoryList: OrderHistory[] = [];
  storage: Storage = sessionStorage;

  constructor() { }

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  handleOrderHistory() {

    const emailString = this.storage.getItem("userEmail");
    const theEmail = emailString ? JSON.parse(emailString) : "";

    orderHistoryService.getOrderHistory(theEmail).subscribe(
      data => {
        this.orderHistoryList = data._embedded.orders;
      }
    );
  }

}
