import { NgModule, Component, enableProdMode, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ZXNSCRFCResultModel } from '../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../shared/imate/imateCommon';
import { Service, Employee, Product, Option } from '../SecondaryCarrier/app.service';
import { formatDate } from '@angular/common';
import ArrayStore from 'devextreme/data/array_store';
import {
  DxDataGridComponent,
  DxRangeSelectorModule,
  DxDropDownBoxModule,
  DxBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxTemplateModule,
  DxFormModule,
  DxToolbarModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxListModule,
  DxButtonModule,
  DxNumberBoxModule,

} from 'devextreme-angular';


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  templateUrl: 'SecondaryCarrier.component.html',
  providers: [ImateDataService, Service],

})

export class SecondaryCarrierComponent {
  @ViewChild(DxDataGridComponent, { static: false })
   dataGrid!: DxDataGridComponent;
  simpleProducts: string[];
  dataSource: Employee[];
  products: Product[];
  options: Option[];
  data: any;
  backButtonOption: any;
  //multiseletbox
  gridDataSource: any;
  gridBoxValue: string[] = [];
  //insert,modify,delete 
  rowCount: number;
  _dataService: ImateDataService;
  //date box
  now: Date = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  startDate: any;
  endDate: any;
  saveButtonOptions: any;
  refreshButtonOptions: any;
  addButtonOptions: any;
  deleteButtonOptions: any;
  startEditAction = 'click';
  selectTextOnEditStart = true;
  addDetailButtonOptions: any;
 

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo) {
    // dropdownbox
    this.dataSource = service.getEmployees();
   
    //multiseletbox
    this.gridDataSource = this.makeAsyncDataSource(http, 'roles.json');

    this.options = service.getOption();

    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;
    let modelTest01 = this;
    

    this.products = service.getProducts();
    this.simpleProducts = service.getSimpleProducts();
    this.data = new ArrayStore({
      data: this.products,
      key: 'A',
    });



  }

  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }

  addDataGrid(e: any) {
    this.dataGrid.instance.addRow();
  }

  saveDataGrid(e: any) {
    this.dataGrid.instance.saveEditData();
  }

  deleteDataGrid(e: any) {
    this.dataGrid.instance.deleteRow(1);
  }



  //multiseletbox
  makeAsyncDataSource(http: any, jsonFile: any) {
    return new CustomStore({
      loadMode: 'raw',
      key: 'A',
      load() {
        return lastValueFrom(http.get(`data/${jsonFile}`));
      },
    });
  }

  //Data refresh
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }





}



