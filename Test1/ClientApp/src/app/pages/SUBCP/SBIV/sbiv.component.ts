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
 *재고현황확인(임가공) component
 * */


@Component({
  templateUrl: 'sbiv.component.html',
  providers: [ImateDataService, Service]
})

export class SBIVComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  dataSource: any;

  //재고현황리스트
  forestData: any;

  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;

  //데이터 조회 버튼
  searchButtonOptions: any;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;


  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private appConfig: AppConfigService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 재고현황확인(임가공)";
    //this._dataService = dataService;

    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };

    this.dataLoad(this.dataService);

  }

  //조회 RFC
  public async dataLoad(dataService: ImateDataService) {
    var zmm3120: ZMMS3120Model[] = [];
    var zmm3140: ZMMS3140Model[] = [];
    zmm3140.push(new ZMMS3140Model("", "", "O", "", "", "", "", "", "", ""));
    var zmc = new ZMMCURRStockModel("", "1000", zmm3120, zmm3140);
    var model: ZMMCURRStockModel[] = [zmc];
    var resultModel = await this.dataService.RefcCallUsingModel<ZMMCURRStockModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMCURRStockModelList", model, QueryCacheType.None);
    this.forestData = new ArrayStore(
      {
        key: ["MAKTX", "PARTNER"],
        data: resultModel[0].ET_LIST
      });
  }

}
