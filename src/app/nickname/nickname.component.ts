import {Component, OnDestroy, OnInit} from '@angular/core';
import {NicknameModel} from "./model/nickname.model";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {NicknameService} from "./service/nickname-service";
import {map, Observable, startWith, Subscription} from "rxjs";
import {LojistaService} from "../lojistas/service/lojista-service";
import {LojistaModel} from "../lojistas/model/lojista.model";
import {SellerService} from "../sellers/service/seller-service";
import {SellerModel} from "../sellers/model/seller.model";
import {Sorter} from "../helper/sorter";

@Component({
  selector: 'app-nickname',
  templateUrl: './nickname.component.html',
  styleUrls: ['./nickname.component.css']
})
export class NicknameComponent implements OnInit, OnDestroy {

  loading = false;
  success = false;
  error = false;

  subscription: Subscription[] = [];

  filteredLojistas: Observable<LojistaModel[]> | undefined;
  filteredEditLojistas: Observable<LojistaModel[]> | undefined;

  filteredVendedores: Observable<SellerModel[]> | undefined;
  filteredEditVendedores: Observable<SellerModel[]> | undefined;

  lojistas: LojistaModel[] = [];
  nicknames: NicknameModel[] = [];
  sellers: SellerModel[] = [];

  filteredNickList: NicknameModel[] = [];
  filteredLojistaList: NicknameModel[] = [];
  filteredVendedorList: NicknameModel[] = [];

  panelOpenState = false;

  formEdit = this.fb.group({
    editNickname: new FormControl(null, null),
    editVendedor: new FormControl(null, null),
    editLojista: new FormControl(null, null)
  });

  form = this.fb.group({
    filterNick: new FormControl(null, null),
    filterLojista: new FormControl(null, null),
    filterVendedor: new FormControl(null, null),
    nickname: new FormControl(null, [Validators.required]),
    lojista: new FormControl(null, [Validators.required]),
    vendedor: new FormControl(null, [Validators.required])
  });

  constructor(private service: NicknameService, private fb: FormBuilder,
              private lojistaService: LojistaService, private vendedorService: SellerService) {
  }

  ngOnInit(): void {
    this.findAll();
  }

  private _filterLojista(value: string): LojistaModel[] {
    const filterValue = value.toLowerCase();

    return this.lojistas.filter(option => option.lojista.toLowerCase().includes(filterValue));
  }

  private _filterSeller(value: string): SellerModel[] {
    const filterValue = value?.toLowerCase();

    return this.sellers.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  findAllSellers(): void {
    this.subscription.push(this.vendedorService.findAllSellers().subscribe(sell => {
      this.sellers = sell.sort(Sorter.dynamycSort("name"));
    }));
  }

  findAllLojistas(): void {
    if (this.lojistas.length === 0 && this.sellers.length === 0) {
      this.subscription.push(this.lojistaService.findAllLojista().subscribe(loj => {
        this.lojistas = loj.sort(Sorter.dynamycSort("lojista"));
      }));
      this.findAllSellers();
    }
    this.filteredLojistas = this.form.get('lojista')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLojista(value)),
    );

    this.filteredVendedores = this.form.get('vendedor')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSeller(value)),
    );
  }

  findAllLojistasEdit(): void {
    if (this.lojistas.length === 0 && this.sellers.length === 0) {
      this.subscription.push(this.lojistaService.findAllLojista().subscribe(loj => {
        this.lojistas = loj.sort(Sorter.dynamycSort("lojista"));
      }));
      this.findAllSellers();
    }

    this.filteredEditLojistas = this.formEdit.get('editLojista')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLojista(value)),
    );

    this.filteredEditVendedores = this.formEdit.get('editVendedor')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSeller(value)),
    );
  }

  findAll(): void {
    this.subscription.push(this.service.findAllNicknames().subscribe(response => {
      this.nicknames = response.sort(Sorter.dynamycSort("nickname"));
    }));
  }

  cadastrarNickname(): void {
    if (this.form.get('nickname')?.value !== null && this.form.get('lojista')?.value !== null
      && this.form.get('vendedor')?.value !== null) {
      this.subscription.push(this.service.createNickname(this.form.get('nickname')?.value.toLowerCase(),
        this.form.get('vendedor')?.value.toLowerCase(), this.form.get('lojista')?.value.toLowerCase())
        .subscribe(() => {
          this.form.reset();
        }));
      const nick: NicknameModel = {
        nickname: this.form.get('nickname')?.value,
        customerBy: this.form.get('vendedor')?.value.toLowerCase(),
        lojista: this.form.get('lojista')?.value.toLowerCase()
      }
      this.nicknames.push(nick);
      this.nicknames.sort(Sorter.dynamycSort("nickname"));
    }
  }

  editarNickname(nicknameEdit: string | undefined): void {
    if (this.formEdit.get('editNickname')?.value !== null || this.formEdit.get('editVendedor')?.value !== null
      || this.formEdit.get('editLojista')?.value !== null) {
      this.subscription.push(this.service.editNickname(nicknameEdit?.toLowerCase(), this.formEdit.get('editNickname')?.value?.toLowerCase(),
        this.formEdit.get('editVendedor')?.value?.toLowerCase(), this.formEdit.get('editLojista')?.value?.toLowerCase())
        .subscribe(() => {
          this.formEdit.reset();
        }));
      this.findAll();
    }
  }

  gerarRelatorio(): void {
    this.loading = true;
    this.subscription.push(this.service.gerarRelatorio().subscribe(() => {
        this.success = true;
        this.loading = false;
      },
      error => {
        console.log(error);
        this.loading = false;
        this.error = true;
      }));
  }

  deleteNickname(nickname: string | undefined): void {
    this.subscription.push(this.service.deleteNickname(nickname).subscribe(() => {
    }));
    const arr = this.nicknames.filter(s => s.nickname !== nickname);
    this.nicknames = arr;
  }

  filterNickList(): NicknameModel[] {
    this.filteredNickList = this.nicknames.filter(nick => nick.nickname?.match(this.form.get('filterNick')?.value));

    this.filteredVendedorList = [];
    this.filteredLojistaList = [];
    this.form.get('filterVendedor')?.reset();
    this.form.get('filterLojista')?.reset();

    return this.filteredNickList;
  }

  filterVendedorList(): NicknameModel[] {
    this.filteredVendedorList = this.nicknames.filter(nick => nick.customerBy?.match(this.form.get('filterVendedor')?.value));

    this.filteredLojistaList = [];
    this.filteredNickList = [];
    this.form.get('filterNick')?.reset();
    this.form.get('filterLojista')?.reset();

    return this.filteredVendedorList;
  }

  filterLojistaList(): NicknameModel[] {
    this.filteredLojistaList = this.nicknames.filter(nick => nick.lojista?.match(this.form.get('filterLojista')?.value));

    this.filteredVendedorList = [];
    this.filteredNickList = [];
    this.form.get('filterNick')?.reset();
    this.form.get('filterVendedor')?.reset();

    return this.filteredLojistaList;
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subs => subs.unsubscribe());
  }

  validateEditForm(): string {
    if (this.formEdit.get('editNickname')?.value == null && this.formEdit.get('editVendedor')?.value == null
      && this.formEdit.get('editLojista')?.value == null) {
      return 'div-button opacity';
    } else {
      return 'div-button';
    }
  }

  closeSuccess(): void {
    this.success = false;
  }

  closeError(): void {
    this.error = false;
  }
}
