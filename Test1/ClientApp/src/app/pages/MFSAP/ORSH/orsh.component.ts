import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService, } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { Service, Employee, State, State2, State3, State4, State5, State6, State7, OrderInfo } from './app.service';
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
} from 'devextreme-angular';
import { AppInfoService } from '../../../shared/services';


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*주민등록분 출고등록 Component*/


@Component({
  templateUrl: 'orsh.component.html',
  providers: [ImateDataService, Service]
})

export class ORSHComponent {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;
  states: string[];
  states2!: State2[];
  states3!: State3[];
  states4!: State4[];
  states5!: State5[];
  states6!: State6[];
  states7!: State7[];
  employees: Employee[];
  orderInfo: any;
  dataSource: Employee[];
  //조회버튼
  searchButtonOptions: any;
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
  saveButtonOptions: any;
  closeButtonOptions: any;
  popupVisible = false;
  collapsed: any;

  //multiseletbox
  gridDataSource: any;
  gridBoxValue1: string[] = [];
  gridBoxValue2: string[] = [];
  gridBoxValue3: string[] = [];
  gridBoxValue4: string[] = [];
  gridBoxValue5: string[] = [];
  gridBoxValue6: string[] = [];
  gridBoxValue7: string[] = [];
  gridBoxValue8: string[] = [];
  gridBoxValue9: string[] = [];
  gridBoxValue10: string[] = [];
  formEmployee!: Employee;
  popupPosition: any;
  customOperations!: Array<any>;
  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | 주민등록분 출고등록";
    this.employees = service.getEmployees();
    this.orderInfo = service.getOrderInfo();
    this.dataSource = service.getEmployees();

    const that = this;
    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;
    let modelTest01 = this;

    this.states = service.getStates();
    this.states2 = service.getStates2();
    this.states3 = service.getStates3();
    this.states4 = service.getStates4();
    this.states5 = service.getStates5();
    this.states6 = service.getStates6();
    this.states7 = service.getStates7();

    this.saveButtonOptions = {
      text: 'Save',
      onClick: () => {

        this.employees.push(this.formEmployee);
        that.popupVisible = false;
      }
    };

      this.closeButtonOptions = {
        text: 'Close',
        onClick(e: any) {
          that.popupVisible = false;
        }
    }
    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
    };
    


  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }

  addDataGrid(e: any) {
    this.dataGrid.instance.addRow();
  }


  saveDataGrid(e: any) {
    this.dataGrid.instance.saveEditData();
  }



  //Data refresh
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
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
}
