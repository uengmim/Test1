import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { formatDate } from '@angular/common';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data } from '../VIOQ/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZMMT3051Model } from '../../../shared/dataModel/MLOGP/Zmmt3051';
import ArrayStore from 'devextreme/data/array_store';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';

/**
 *
 *차량 입출문 현황 component
 * */


@Component({
  templateUrl: 'vioq.component.html',
  providers: [ImateDataService, Service]
})

export class VIOQComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  orderData: any;




  //날짜 조회
  now: Date = new Date();
  startDate: any;
  endDate: any;

  //date box
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);


  //필터
  loadPanelOption: any;
  customOperations!: Array<any>;
  collapsed: any;
  popupPosition: any;
  saleAmountHeaderFilter: any;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 차량 입출문 현황";


    //조회날짜 초기값
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 30), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    this.dataLoad(this.dataService, this);
  }
  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  //조회버튼
  searchButton(e: any) {
    this.dataLoad(this.dataService, this);
  }


  //데이터로드
  public async dataLoad(dataService: ImateDataService, thisObj: VIOQComponent) {
    var userInfo = this.authService.getUser().data;
    var resultModel = await dataService.SelectModelData<ZMMT3051Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3051ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' `, "", QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["ZGW_TIME"],
        data: resultModel
      });

    return resultModel;
  }
}
