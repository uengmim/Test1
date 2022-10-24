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
import { Service, OrderInfo, Product, PriorityEntity,  } from './app.service';
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

/*물류기지 CHECK LIST 등록 Component*/


@Component({
  templateUrl: 'dckr.component.html',
  providers: [ImateDataService, Service]
})

export class DCKRComponent {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;
  simpleProducts: string[];
  dataSource: OrderInfo[];
  orderinfos!: OrderInfo[];
  orderInfo: any;
  Info: any;
  data: any;
  backButtonOption: any;
  //조회버튼
  searchButtonOptions: any;
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
  popupVisible = false;
  closeButtonOptions: any;
  priorities: string[];
  priorityEntities: PriorityEntity[];
  collapsed: any;
  //데이터 추가 버튼
  addButtonOptions: any;

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | 물류기지 CHECK LIST 등록";
    this.dataSource = service.getOrderInfo();
    this.orderInfo = service.getOrderInfo()
    const that = this;
    this.priorities = [
      '양호',
      '불량',
    ];
    this.priorityEntities = service.getPriorityEntities();

    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;
    let modelTest01 = this;

    this.simpleProducts = service.getSimpleProducts();

    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };

    //추가버튼
    this.addButtonOptions =
    {
      icon: 'add',
      onClick: async () => {
        this.dataGrid.instance.addRow();
      },
    };
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      },
    };
  }

  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }

  addDataGrid(e: any) {
    this.dataGrid.instance.addRow();
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
