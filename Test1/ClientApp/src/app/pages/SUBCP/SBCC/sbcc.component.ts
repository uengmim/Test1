import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { formatDate } from '@angular/common';
import {  ZMMS0270Model, ZMMSCCMPSubulModel } from '../../../shared/dataModel/OWHP/ZmmSccmpSubulProxy';
import { QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data } from '../SBSC/app.service';
import { CodeInfoType, TableCodeInfo, ThemeManager } from '../../../shared/app.utilitys';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import ArrayStore from 'devextreme/data/array_store';
import { AuthService } from '../../../shared/services';
import { ZMMS9900Model } from '../../../shared/dataModel/MCDIP/ZmmOilBlGrinfo';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';

/**
 *
 *임가공 구성품 수불현황 component
 * */


@Component({
  templateUrl: 'sbcc.component.html',
  providers: [ImateDataService, Service]
})

export class SBCCComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  @ViewChild('CodeEntery', { static: false }) CodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('maktEntery', { static: false }) maktEntery!: CommonPossibleEntryComponent;
  @ViewChild('paymentGrid', { static: false }) paymentGrid!: DxDataGridComponent;


  dataSource: any;

  //구성품수불현황리스트
  supplyData: any;

  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;

  //데이터 조회 버튼
  searchButtonOptions: any;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //파서블엔트리
  maktCode: TableCodeInfo;

  //제품명엔트리 값
  maktxValue: any;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;

  //날짜 조회
  startDate: any;
  endDate: any;

  selectedItemKeys: any[] = [];

  private loadePeCount: number = 0;

  lifnrCode: TableCodeInfo;
  maktxCode: TableCodeInfo;

  lifnrValue: string | null = null;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  deptId: string = "";
  login: string = "";
  btnVisible: boolean = false;

  /**
* 데이터 스토어 키
* */
  dataStoreKey: string = "sbcc";

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private appConfig: AppConfigService,
    private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " |임가공 구성품 수불현황";
    //this._dataService = dataService;


    //date
    this.endDate = formatDate(this.now.setDate(this.now.getDate()), "yyyy-MM-dd", "en-US");
    this.startDate = new Date();
    this.startDate = formatDate(this.now.setDate(this.now.getDate() - 7), "yyyy-MM-dd", "en-US");

    this.maktxCode = appConfig.tableCode("임가공제품명");
    this.lifnrCode = appConfig.tableCode("구매업체");

    this.maktxValue = "";

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maktxCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lifnrCode),

    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);


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

    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.dataLoad(this.dataService);
        this.paymentGrid.instance.clearFilter();
      },
    };
  }

  //조회 RFC
  public async dataLoad(dataService: ImateDataService) {
    var zmms9900Model: ZMMS9900Model = new ZMMS9900Model("", "");
    var zmms0270Model: ZMMS0270Model[] = [];
    //this.maktxValue = this.maktEntery.selectedValue;
    var zmccModel = new ZMMSCCMPSubulModel(zmms9900Model, this.lifnrValue, this.maktxValue, this.startDate, this.endDate, "1000", []);

    var zmsccdList: ZMMSCCMPSubulModel[] = [zmccModel];

    var resultModel = await this.dataService.RefcCallUsingModel<ZMMSCCMPSubulModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMSCCMPSubulModelList", zmsccdList, QueryCacheType.None);

    this.supplyData = new ArrayStore(
      {
        key: ["MATKL", "MATNR", "MAKTX", "MEINS"],
        data: resultModel[0].ET_DATA
      });
  }

  selectionChanged(data: any) {
    this.selectedItemKeys = data.currentSelectedRowKeys;
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
