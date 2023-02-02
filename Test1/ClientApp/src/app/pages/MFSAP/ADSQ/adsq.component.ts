import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService, } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { Service, Employee, Product } from './app.service';
import { formatDate } from '@angular/common';
import ArrayStore from 'devextreme/data/array_store';
import { AppInfoService } from '../../../shared/services';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CodeInfoType, TableCodeInfo } from '../../../shared/app.utilitys';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ZSDEPSOBilldueModel, ZSDS5003Model, ZSDS5004Model } from '../../../shared/dataModel/MFSAP/ZsdEpSoBilldueProxy';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*검수/미검수 현황 Component*/


@Component({
  templateUrl: 'adsq.component.html',
  providers: [ImateDataService, Service]
})

export class ADSQComponent {
  @ViewChild('kunweCodeDynamic', { static: false }) kunweCodeDynamic!: CommonPossibleEntryComponent;

  simpleProducts: string[];
  dataSource: any;
  dataList: ZSDS5004Model[] = [];
  /**
   * 데이터 스토어 키
   * */
  dataStoreKey: string = "adsq";

  /**
   * 로딩된 PeCount
   * */
  private loadePeCount: number = 0;
  
  data: any;
  backButtonOption: any;
  searchButtonOptions: any;
  //insert,modify,delete 
  rowCount: number;
  _dataService: ImateDataService;
  _imInfo: ImateInfo;
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
  customOperations!: Array<any>;
  saleAmountHeaderFilter: any;
  popupPosition: any;
  columns: any;

  collapsed: any;

  //파서블엔트리
  kunweCode: TableCodeInfo

  //파서블엔트리 선택값
  kunweValue: string | null = "";

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  
  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService, private appConfig: AppConfigService) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | 검수/미검수 현황";

    let thisObj = this;

    //데이터 로딩 패널 보이기
    this.loadingVisible = true;

    this.endDate = formatDate(this.now.setDate(this.now.getDate()), "yyyy-MM-dd", "en-US");
    this.startDate = new Date();
    this.startDate = formatDate(this.now.setDate(this.now.getDate() - 7), "yyyy-MM-dd", "en-US");

    this.kunweCode = appConfig.tableCode("RFC_비료고객정보");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunweCode)
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    //insert,modify,delete 
    this._dataService = dataService;
    this._imInfo = imInfo;
    this.rowCount = 0;

    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadingVisible = true;
        var result = await this.dataLoad(this._imInfo, this._dataService, this.appConfig)

        this.dataSource = new ArrayStore(
          {
            key: ["NH_BUY_NO", "VKBUR_N", "KUNAG_N", "AGENT_N"],
            data: result
          });

        this.loadingVisible = false;
      },
    };

  }

  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  /**
   * 파서블 엔트리 데이터 로딩 완료
   * @param e
   */
  async onPEDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 1) {
      var result = await this.dataLoad(this._imInfo, this._dataService, this.appConfig)

      this.dataSource = new ArrayStore(
        {
          key: ["VKBUR_N", "KUNAG_N", "NH_BUY_NO"],
          data: result
        });

      this.loadingVisible = false;
    }
      

    //if (e.component.popupTitle === "화물차종")
    //  this.truckTypeCodeDynamic.SetDataFilter(["DOMVALUE_L", "startswith", "A"]);
  }

  //데이터 조회
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, appConfig: AppConfigService) {
    var headCondi = new ZSDS5003Model("admin", this.kunweValue, this.startDate, this.endDate, "B", "", "", "", "", "", "");
    var condiModel = new ZSDEPSOBilldueModel("", "", headCondi, []);

    var condiModelList = [condiModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDEPSOBilldueModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOBilldueModelList", condiModelList, QueryCacheType.None);
    this.dataList = result[0].E_RETURN;
    return this.dataList;
  }

  onKunweCodeValueChanged(e: any) {

  }

}
