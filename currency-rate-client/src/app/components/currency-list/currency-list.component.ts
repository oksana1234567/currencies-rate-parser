import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../../services/currency.service';
import { MatTableDataSource } from '@angular/material/table';
import { CURRENCY_SYMBOLS } from '../../config/currency.config';
import { NotificationService } from '../../services/notification.service';
import { CurrencyRate } from '../../types/currency.interface';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.css'],
})
export class CurrencyListComponent implements OnInit {
  displayedColumns: string[] = ['currency', 'name', 'rate'];
  dataSource = new MatTableDataSource<any>();
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  filterValue: string[] = [];
  selectedBasedCurrency = 'UAH';
  isLoading = false;
  currencySymbols = CURRENCY_SYMBOLS;

  constructor(
    private currencyService: CurrencyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCurrencyRates();
  }

  loadCurrencyRates() {
    this.isLoading = true;
    this.currencyService
      .getCurrencyRates(
        this.selectedBasedCurrency,
        this.currentPage,
        this.pageSize,
        this.filterValue
      )
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
    this.loadCurrencyRates();
  }

  handlePage(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadCurrencyRates();
  }
}
