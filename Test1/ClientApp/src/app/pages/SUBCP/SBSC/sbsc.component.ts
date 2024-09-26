import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { formatDate } from '@angular/common';
import { ZMMS0260Model, ZMMSCPRDSubulModel} from '../../../shared/dataModel/OWHP/ZmmScprdSubulProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data } from '../SBSC/app.service';
import { CodeInfoType, CommonCodeInfo, TableCodeInfo, ThemeManager } from '../../../shared/app.utilitys';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import ArrayStore from 'devextreme/data/array_store';
import { AuthService } from '../../../shared/services';
import { ZMMS9900Model } from '../../../shared/dataModel/MCDIP/ZmmOilBlGrinfo';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { Router } from '@angular/router';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';

/**
 *
 *임가공품 수불현황 component
 * */


@Component({
  templateUrl: 'sbsc.component.html',
  providers: [ImateDataService, Service]
})

export class SBSCComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  @ViewChild('lgortOutCodeDynamic', { static: false }) lgortOutCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('manufacturGrid', { static: false }) manufacturGrid!: DxDataGridComponent;
  @ViewChild('CodeEntery', { static: false }) CodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('maktEntery', { static: false }) maktEntery!: CommonPossibleEntryComponent;


  dataSource: any;

  //수불현황리스트
  statusData: any;

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

  //날짜 조회
  startDate: any;
  endDate: any;

  selectedItemKeys: any[] = [];
  rolid: string[] = [];


 //제품명엔트리 값
  matnrValue: any;
  customerValue: any;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //파서블엔트리
  maktCode: TableCodeInfo;
  lifnrCode: TableCodeInfo;

  lifnrValue: string | null = null;

  private loadePeCount: number = 0;

  btnVisible: boolean = false;

  deptId: string = "";
  login: string = "";

  /**
* 데이터 스토어 키
* */
  dataStoreKey: string = "sbsc";
    bizadmin: string;

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private appConfig: AppConfigService, private iminfo: ImateInfo, private router: Router, private authService: AuthService) {

    appInfo.title = AppInfoService.APP_TITLE + " |임가공품 수불현황" ;
    //this._dataService = dataService;


    //로그인 사용자 정보
    let usrInfo = authService.getUser().data;

    this.deptId = usrInfo.deptId.padStart(10, '0');

    this.login = usrInfo.role[0];

    if (this.login != "admin") {

      this.lifnrValue = this.deptId;
      this.dataLoad(this.dataService);

    } else {

      this.lifnrValue = this.deptId;
      this.dataLoad(this.dataService);
      this.btnVisible = !this.btnVisible;
    }

    this.maktCode = appConfig.tableCode("제품코드");
    this.lifnrCode = appConfig.tableCode("구매업체");

    this.matnrValue = "";
    this.customerValue = "";

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maktCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lifnrCode),

    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);


    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.dataLoad(this.dataService);
        this.manufacturGrid.instance.clearFilter();

      },
    };
  }

  //조회 RFC
  public async dataLoad(dataService: ImateDataService) {
    var lgort = ""

    var result = await this.dataService.SelectModelData<ZCMT0020Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND SPRAS = '3' AND ZMODULE = 'MM' AND ZCLASS = 'MM430' AND ZCM_CODE1 = '${this.authService.getUser().data.deptId}'`, "", QueryCacheType.None);

    if (result.length > 0) {
      lgort = result[0].ZCMF06_CH;
      }

    var zmms9900Model: ZMMS9900Model = new ZMMS9900Model("", "");
    var zmms0260Model: ZMMS0260Model[] = [];
    var zmModel = new ZMMSCPRDSubulModel(zmms9900Model, lgort, this.lifnrValue, this.matnrValue, this.now, "1000", []);

    var zmmprdList: ZMMSCPRDSubulModel[] = [zmModel];
    var resultModel = await this.dataService.RefcCallUsingModel<ZMMSCPRDSubulModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMSCPRDSubulModelList", zmmprdList, QueryCacheType.None);

    this.statusData = new ArrayStore(
      {
        key: ["MATKL", "MATNR", "MAKTX", "MEINS"],
        data: resultModel[0].ET_DATA
      });
  }

  selectionChanged(data: any) {
    this.selectedItemKeys = data.currentSelectedRowKeys;
  }

  movePage(e: any) {
    this.router.navigate(['sbcc']);
  }

  onPEDataLoaded(e: any) {
    this.loadePeCount++;
  }

  onCodeChanged(e: any) {
    this.dataLoad(this.dataService);
  }

  public clearEntery() {
    this.CodeEntery.ClearSelectedValue();
    this.maktEntery.ClearSelectedValue();
  }
}
