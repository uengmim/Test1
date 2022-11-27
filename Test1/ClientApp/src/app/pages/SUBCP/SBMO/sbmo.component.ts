import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { formatDate } from '@angular/common';
import { ZMMCURRStockModel, ZMMS3120Model, ZMMS3140Model } from '../../../shared/dataModel/OWHP/ZmmCurrStockProxy';
import { QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data } from '../SBIV/app.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import ArrayStore from 'devextreme/data/array_store';

/**
 *
 *생산지시확인 component
 * */


@Component({
  templateUrl: 'sbmo.component.html',
  providers: [ImateDataService, Service]
})

export class SBMOComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  dataSource: any;

  //재고현황리스트
  forestData: any;
  //구성부품확인리스트
  componentsList: any;

  //생산지시데이터
  productData: any;

  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;

  //데이터 조회 버튼
  searchButtonOptions: any;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;




  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  popupMode = 'Add';
  customOperations!: Array<any>;


  //현재날짜
  now: Date = new Date();
  startDate: any;
  endDate: any;


  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private appConfig: AppConfigService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 생산지시확인";
    //this._dataService = dataService;

    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
  }

}
