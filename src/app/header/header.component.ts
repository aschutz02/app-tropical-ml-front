import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {Store} from '@ngrx/store';
import {SharedModalDialogComponent} from "../shared-modal/shared-modal-dialog/shared-modal-dialog.component";
import {AppState} from '../store/app.state';
import {ModalAddItem} from '../store/modal/modal-add-item';
import * as ModalDialogAction from "../store/modal/modal-dialog/modal-dialog.actions";
import {NicknameComponent} from "../nickname/nickname.component";
import {ProductsComponent} from "../products/products.component";
import {SellersComponent} from "../sellers/sellers.component";
import {HeaderService} from "./service/header-service";
import {Subscription} from "rxjs";
import {LojistasComponent} from "../lojistas/lojistas.component";
import {ProductService} from "../products/service/product-service";
import {ProductModel} from "../products/model/product.model";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  subscription: Subscription[] = [];
  products: ProductModel[] = [];

  @Output()
  public loading = new EventEmitter<boolean>();

  @Output()
  public success = new EventEmitter<boolean>();

  @Output()
  public error = new EventEmitter<boolean>();

  constructor(private store: Store<AppState>, private dialog: MatDialog, private service: HeaderService,
              private produtservice: ProductService) { }

  ngOnInit(): void {
    this.produtservice.findAllProducts().subscribe(prods => this.products = prods);
  }

  openModalNicknames(): void {
    this.store.dispatch(ModalDialogAction.changeModal({
      title: 'Nicknames',
      child: new ModalAddItem(NicknameComponent)
    }));
    this.openDialog();
  }

  openModalProducts(): void {
    this.store.dispatch(ModalDialogAction.changeModal({
      title: 'Produtos',
      child: new ModalAddItem(ProductsComponent)
    }));
    this.openDialog();
  }

  openModalSellers(): void {
    this.store.dispatch(ModalDialogAction.changeModal({
      title: 'Vendedores',
      child: new ModalAddItem(SellersComponent)
    }));
    this.openDialog();
  }

  openModalLojistas(): void {
    this.store.dispatch(ModalDialogAction.changeModal({
      title: 'Lojistas',
      child: new ModalAddItem(LojistasComponent)
    }));
    this.openDialog();
  }

  protected openDialog(): void {
    this.dialog.open(SharedModalDialogComponent, { disableClose: true });
  }

  gerarRelatorio(): void {
    this.loading.emit(true);
    this.subscription.push(this.service.gerarRelatorio(this.products).subscribe(() => {
      this.loading.emit(false);
      this.success.emit(true);
    },
      error => {
        console.log(error);
        this.loading.emit(false);
        this.error.emit(true);
    }));
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subs => subs.unsubscribe());
  }
}
