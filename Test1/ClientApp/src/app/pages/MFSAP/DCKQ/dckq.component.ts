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
import { Service, Data, PriorityEntity, Absence, Inquiry } from './app.service';
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

/*물류기지 CHECK LIST 현황 Component*/


@Component({
  templateUrl: 'dckq.component.html',
  providers: [ImateDataService, Service]
})

export class DCKQComponent {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  //정보
  simpleProducts: string[];
  dataSource: any;
  data: Data[];
  inquiry!: any;
  priorityEntities: PriorityEntity[];
  absence: any;
  priorities: string[];
  collapsed: any;
  orderInfo: any;

  //조회버튼
  searchButtonOptions: any;

  //리프레쉬버튼
  refreshButtonOptions: any;

  //백버튼옵션
  backButtonOption: any;

  //닫기버튼
  closeButtonOptions: any;

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

  //필터
  customOperations!: Array<any>;
  saleAmountHeaderFilter: any;
  popupPosition: any;

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //상세팝업 오픈
  popupVisible = false;

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | 물류기지 CHECK LIST 현황";
    this.data = service.getData();
    this.inquiry = service.getInquiry();

    this.priorities = [
      '양호',
      '불량',
    ];
    this.priorityEntities = service.getPriorityEntities();

    this.absence = [
      '있음',
      '없음',
    ];
    this.absence = service.getAbsence();

    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;
    let modelTest01 = this;

    this.simpleProducts = service.getSimpleProducts();

    const that = this;
    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
    //닫기버튼
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      }
    }
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

  orderDBClick(e: any) {
    this.popupVisible = !this.popupVisible;
  }

}
