import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService, } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { Service, SelectType, CSpart } from './app.service';
import { formatDate } from '@angular/common';
import ArrayStore from 'devextreme/data/array_store';
import { AppInfoService, AuthService } from '../../../shared/services';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CodeInfoType, TableCodeInfo } from '../../../shared/app.utilitys';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ZSDEPSOBilldueModel, ZSDS5003Model, ZSDS5004Model } from '../../../shared/dataModel/MFSAP/ZsdEpSoBilldueProxy';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { DxDataGridComponent, DxTextBoxComponent } from 'devextreme-angular';
import { T001LModel } from '../../../shared/dataModel/MFSAP/t001l';

import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Title } from '@angular/platform-browser';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*검수/미검수 현황 Component*/


@Component({
  templateUrl: 'adsr.component.html',
  providers: [ImateDataService, Service]
})

export class ADSRComponent {
  @ViewChild('kunweCodeDynamic', { static: false }) kunweCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('statusEntery', { static: false }) statusEntery!: CommonPossibleEntryComponent;
  @ViewChild('maEntery', { static: false }) maEntery!: CommonPossibleEntryComponent;
  @ViewChild('matnrEntery', { static: false }) matnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('baesongText', { static: false }) baesongText!: DxTextBoxComponent;
  @ViewChild('lgortInCodeDynamic', { static: false }) lgortInCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('girdData', { static: false }) girdData!: DxDataGridComponent;
  simpleProducts: string[];
  dataSource: any;
  dataList: ZSDS5004Model[] = [];
  /**
   * 데이터 스토어 키
   * */
  dataStoreKey: string = "adsr";
  //파서블엔트리 선택값
  lgortInValue: string | null = "";
  /**
   * 로딩된 PeCount
   * */
  private loadePeCount: number = 0;
  
  data: any;
  backButtonOption: any;
  searchButtonOptions: any;
  excelButtonOptions: any;
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
  baesongValue: string;
  collapsed: any;
  cSpart: CSpart[];
  //파서블엔트리
  lgortInCode: TableCodeInfo;
  kunweCode: TableCodeInfo;
  statusCode: TableCodeInfo;
  maCode: TableCodeInfo;
  matnrCode: TableCodeInfo;
  selectCSpart: string = "";
  //파서블엔트리 선택값
  kunweValue: string | null = "";
  statusValue: string | null = "";
  matnrValue: string | null = "";
  maValue: string | null = "";
  userid: string = "";
  kunweValueA: string | null = "";
  selectType: SelectType[];
  selectTypeValue: string = "A";
  daery: boolean = false;
  empId: string = ""; 
  rolid: string[] = [];
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  //lgort 선택 값
  lgortValue: string | null = "";
  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService,
    private appConfig: AppConfigService, private authService: AuthService, private titleService: Title) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | 검수/미검수 현황-물류기지";
    this.titleService.setTitle(appInfo.title);

    let thisObj = this;

    //검색구분
    this.selectType = service.getSelectType();
    let userInfo = this.authService.getUser().data;
    //this.empId = userInfo?.empId.padStart(10, '0');
    this.rolid = userInfo?.role;
    this.vorgid = userInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = userInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = userInfo.orgOption.torgid.padStart(10, '0');
    this.empId = this.corgid;

    //데이터 로딩 패널 보이기
    this.loadingVisible = true;
    this.cSpart = service.getCSpart();
    this.endDate = formatDate(this.now.setDate(this.now.getDate()), "yyyy-MM-dd", "en-US");
    this.startDate = new Date();
    this.startDate = formatDate(this.now.setDate(this.now.getDate() - 2), "yyyy-MM-dd", "en-US");

    this.kunweCode = appConfig.tableCode("RFC_비료고객정보");
    this.statusCode = appConfig.tableCode("RFC_검수상태");
    this.maCode = appConfig.tableCode("비료제품구분");
    this.matnrCode = appConfig.tableCode("비료제품명");
    this.lgortInCode = appConfig.tableCode("비료창고");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunweCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.statusCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
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
            key: ["NH_BUY_NO", "VKBUR_N", "KUNAG_N", "AGENT_N", "BZTXT", "KUNWE_N"],
            data: result
          });

        this.loadingVisible = false;
      },
    };
    this.excelButtonOptions = {
      text: "엑셀다운로드",
      onClick: async (e: any) => {
        this.onExportingOrderData(e);
      }
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
          key: ["NH_BUY_NO", "VKBUR_N", "KUNAG_N", "AGENT_N", "BZTXT", "KUNWE_N", "VBELN", "VGBEL"],
          data: result
        });

      this.loadingVisible = false;
    }
      

    //if (e.component.popupTitle === "화물차종")
    //  this.truckTypeCodeDynamic.SetDataFilter(["DOMVALUE_L", "startswith", "A"]);
  }

  //데이터 조회
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, appConfig: AppConfigService) {

    let userInfo = this.authService.getUser().data;
    this.userid = userInfo?.userId;
    if (this.userid !== "ADMIN") {
      this.kunweValue = this.empId;
      this.kunweValueA = this.kunweValue;
      this.daery = true;
    }
    else {
      this.daery = false;
    }

    var lgortModel = await this.dataService.SelectModelData<T001LModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.T001LModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND KUNNR = '${this.empId}'`, "", QueryCacheType.None);
    this.lgortValue = lgortModel[0].LGORT;
    var headCondi = new ZSDS5003Model(this.authService.getUser().data.userId, this.kunweValue, this.startDate, this.endDate, this.selectTypeValue, this.statusValue, this.maValue, this.matnrValue, "", this.baesongValue, this.selectCSpart, this.lgortValue);
    var condiModel = new ZSDEPSOBilldueModel("", "", headCondi, []);

    var condiModelList = [condiModel];

    var result = await this.dataService.RefcCallUsingModel<ZSDEPSOBilldueModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOBilldueModelList", condiModelList, QueryCacheType.None);
    this.dataList = result[0].E_RETURN;
    return this.dataList;
  }

  onCSpartValueChanged(e: any) {
    this.selectCSpart = e.value;
    if (this.selectCSpart === "10") {
      this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("비료제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "비료제품구분");
      this.matnrEntery.ChangeCodeInfo(this.appConfig.tableCode("비료제품명"), "MATNR", "%MAKTX%(%MATNR%)", "비료제품명");
      return;
    }
    else if (this.selectCSpart === "20") {
      this.maEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경제품구분"), "MATKL", "%WGBEZ%(%MATKL%)", "비료제품구분");
      this.matnrEntery.ChangeCodeInfo(this.appConfig.tableCode("친환경제품명"), "MATNR", "%MAKTX%(%MATNR%)", "친환경제품명");
      return;
    }
  }
  onKunweCodeValueChanged(e: any) {
    this.kunweValue = e.value;
  }

  onSelectTypeValueChanged(e: any) {
    this.selectTypeValue = e.value;
  }

  onStatusCodeValueChanged(e: any) {
    this.statusValue = e.value;
  }

  onMaCodeValueChanged(e: any) {
    this.maValue = e.value;
  }

  onMatnrCodeValueChanged(e: any) {
    this.matnrValue = e.value;
  }

  /**
   * On Exporting Excel
   * */
  onExportingOrderData(e: any) {
    //e.component.beginUpdate();
    //e.component.columnOption('ID', 'visible', true);
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');
    exportDataGrid({
      component: this.girdData.instance,
      worksheet: worksheet,
      customizeCell: function (options) {
        const excelCell = options.excelCell; 
        excelCell.font = { name: 'Arial', size: 12 };
        excelCell.alignment = { horizontal: 'left' };
      }
    }).then(function () {
      workbook.xlsx.writeBuffer()
        .then(function (buffer: BlobPart) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `검수/미검수 현황_${formatDate(new Date(), "yyyyMMdd", "en-US")}.xlsx`);
        });
    }).then(function () {
      //e.component.columnOption('ID', 'visible', false);
      //e.component.endUpdate();
      return;
    });

    /*e.cancel = true;*/
  }


}
