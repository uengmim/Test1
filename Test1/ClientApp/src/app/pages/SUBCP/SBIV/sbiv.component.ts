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
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';
import { AuthService } from '../../../shared/services';

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


  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private appConfig: AppConfigService, private authService: AuthService) {
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
  LoadData(e: any) {
    this.dataGrid.instance.refresh();
  }

  //조회 RFC
  public async dataLoad(dataService: ImateDataService) {
    var lgort = ""

    var result = await this.dataService.SelectModelData<ZCMT0020Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND SPRAS = '3' AND ZMODULE = 'MM' AND ZCLASS = 'MM430' AND ZCM_CODE1 = '${this.authService.getUser().data.deptId}'`, "", QueryCacheType.None);

    if (result.length > 0) {
      lgort = result[0].ZCMF06_CH;
    }
    
    var zmm3120: ZMMS3120Model[] = [];
    var zmm3140: ZMMS3140Model[] = [];

    // 플랜트(1000)는 필수 이고 I_KZNUL = 'X'를 그리고 아래와 같이 LGORT에 해당업체별 저장위치, SOBKZ = 'O' , PARTNER = 세기 BP 코드(302512) 로 재고조회 함수를 호출

    zmm3140.push(new ZMMS3140Model(lgort, "", "O", "0000302512", "", "", "", "", "", ""));
    var zmc = new ZMMCURRStockModel("X", "1000", zmm3120, zmm3140);
    var model: ZMMCURRStockModel[] = [zmc];

    var resultModel = await this.dataService.RefcCallUsingModel<ZMMCURRStockModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMCURRStockModelList", model, QueryCacheType.None);
    this.forestData = new ArrayStore(
      {
        key: ["MAKTX", "PARTNER"],
        data: resultModel[0].ET_LIST
      });
  }


}
