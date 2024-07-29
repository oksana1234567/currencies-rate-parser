import { Component, inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';

import { CurrencyService } from '../../services/currency.service';
import { NotificationService } from '../../services/notification.service';

import { CurrencyRate } from '../../types/currency.interface';
import { CurrencySymbols } from '../../enum/currency.enum';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.css'],
})
export class CurrencyListComponent implements OnInit {
  displayedColumns: string[] = ['currency', 'name', 'rate'];
  dataSource = new MatTableDataSource<CurrencyRate>();
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  filterValue: string[] = [];
  selectedBasedCurrency = CurrencySymbols.UAH;
  isLoading = false;
  currencySymbols = Object.values(CurrencySymbols);
  private currencyService = inject(CurrencyService);
  private notificationService = inject(NotificationService);
  constructor() {}

  ngOnInit(): void {
    this.loadCurrencyRates();
  }

  loadCurrencyRates() {
    this.isLoading = true;
    this.currencyService
      .getCurrencyRates({
        fromCurrency: this.selectedBasedCurrency,
        page: this.currentPage,
        limit: this.pageSize,
        filter: this.filterValue,
      })
      .subscribe(
        (response) => {
          if (response.data.length === 0) {
            this.notificationService.show(
              'No data available. Please try again later.'
            );
          }
          this.dataSource.data = response.data.filter(
            (currency: CurrencyRate) =>
              currency.toCurrency.symbol !== this.selectedBasedCurrency
          );
          this.totalItems = response.total;
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  applyFilter() {
    this.currentPage = 1;
    this.loadCurrencyRates();
  }

  handlePage(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadCurrencyRates();
  }
}
