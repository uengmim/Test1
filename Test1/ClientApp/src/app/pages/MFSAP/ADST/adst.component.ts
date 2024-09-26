import { NgModule, Component, enableProdMode, ViewChild, } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService, } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { Service, Employee, Task, Product, OrderInfo, Management } from '../ADST/app.service';
import notify from "devextreme/ui/notify";
import { formatDate } from '@angular/common';
import {
  DxDataGridComponent,
  DxRangeSelectorModule,
  DxDropDownBoxModule,
  DxBoxModule,
  DxPivotGridModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxSelectBoxModule,
  DxPopupModule,
  DxTextBoxModule,
  DxTemplateModule,
} from 'devextreme-angular';
import { AppInfoService } from '../../../shared/services';



if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*검수자료 진행 현황 Component*/


@Component({
  templateUrl: 'adst.component.html',
  providers: [ImateDataService, Service]
})

export class ADSTComponent {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;
  simpleProducts: string[];
  simpleProducts2: string[];
  simpleProducts3: string[];
  employees: Employee[];
  dataSource: Employee[];
  dataSource2: Task[];
  data: any;
  backButtonOption: any;
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
  refreshButtonOptions: any;
  startEditAction = 'click';
  selectTextOnEditStart = true;
  positionOf!: string;
  collapsed: any;
  orderInfo: any;
  management: any;
  searchButtonOptions: any;
  detailsButtonMouseEnter(id: any) {
    this.positionOf = `#image${id}`;
  }
  currentEmployee: Employee = new Employee();
  popupVisible = false;
  closeButtonOptions: any;

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | 검수자료진행현황";
   
     
    this.dataSource = service.getEmployees();
    this.dataSource2 = service.getTasks();
    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;
    let modelTest01 = this;
    this.simpleProducts = service.getSimpleProducts();
    this.simpleProducts2 = service.getSimpleProducts2();
    this.employees = service.getEmployees();
    this.simpleProducts3 = service.getSimpleProducts3();
    this.orderInfo = service.getOrderInfo();
    this.management = service.getMangement();
    const that = this;
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e:any) {
        that.popupVisible = false;
      },
    };
    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };

  }

  showInfo(employee: any) {
    this.currentEmployee = employee;
    this.popupVisible = true;
  }
  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }

  addDataGrid(e: any) {
    this.dataGrid.instance.addRow();
  }



  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  orderDBClick(e: any) {
    this.popupVisible = !this.popupVisible;
  }

  //Data refresh
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }



}
