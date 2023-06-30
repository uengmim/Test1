import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService, } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { Service, SelectType, CSpart, tdlnrCode } from './app.service';
import { formatDate } from '@angular/common';
import ArrayStore from 'devextreme/data/array_store';
import { AppInfoService, AuthService } from '../../../shared/services';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CodeInfoType, ParameterDictionary, TableCodeInfo } from '../../../shared/app.utilitys';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ZSDEPSOBilldueModel, ZSDS5003Model, ZSDS5004Model } from '../../../shared/dataModel/MFSAP/ZsdEpSoBilldueProxy';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { DxDataGridComponent, DxTextBoxComponent } from 'devextreme-angular';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { Workbook } from 'exceljs';
import { confirm, alert } from "devextreme/ui/dialog";
import saveAs from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Title } from '@angular/platform-browser';
import { ZSDT7110Model } from '../../../shared/dataModel/MLOGP/Zsdt7110';

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
  @ViewChild('statusEntery', { static: false }) statusEntery!: CommonPossibleEntryComponent;
  @ViewChild('maEntery', { static: false }) maEntery!: CommonPossibleEntryComponent;
  @ViewChild('matnrEntery', { static: false }) matnrEntery!: CommonPossibleEntryComponent;
  @ViewChild('baesongText', { static: false }) baesongText!: DxTextBoxComponent;
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;
  @ViewChild('dataGrid', { static: false }) dataGrid!: DxDataGridComponent;
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
  kunweCode: TableCodeInfo;
  statusCode: TableCodeInfo;
  maCode: TableCodeInfo;
  matnrCode: TableCodeInfo;

  tdlnrCode: TableCodeInfo;

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

  tdlnrList: tdlnrCode[] = [];
  
  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService,
    private appConfig: AppConfigService, private authService: AuthService, private titleService: Title) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | 검수/미검수 현황";
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

    this.tdlnrCode = appConfig.tableCode("운송업체");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunweCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.statusCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),

      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnrCode),
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    this.getCodeNm();

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
    if (this.loadePeCount >= 4) {

      this.loadePeCount = 0;
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

    //var headCondi = new ZSDS5003Model("", "", this.startDate, this.endDate, this.selectTypeValue, this.statusValue, this.maValue, this.matnrValue, "", this.baesongValue, this.selectCSpart, "");
    var headCondi = new ZSDS5003Model(this.authService.getUser().data.userId, this.kunweValue, this.startDate, this.endDate, this.selectTypeValue, this.statusValue, this.maValue, this.matnrValue, "", this.baesongValue, this.selectCSpart, "");
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

  async multiTeansactionPrint(e: any) {
    var selectData = this.dataGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    } else if (selectData.length > 4) {
      alert("한번에 라인은 4행까지 선택가능합니다.</br>5행 이상은 별도로 선택해서 출력가능합니다.", "알림");
      return;
    }

    var ivbelns = "";
    var checkError = "";
    var ztext = "";

    for (var row of selectData) {
      ivbelns = ivbelns.concat(row.VBELN, "|");
      if (row.ZCARNO !== selectData[0].ZCARNO) {
        checkError = "같은 차량끼리만 합적할 수 있습니다.";
        break;
      }

      if (row.LGORT !== selectData[0].LGORT) {
        checkError = "같은 출발지끼리만 합적할 수 있습니다.";
        break;
      }

      if (row.KUNAG !== selectData[0].KUNAG) {
        checkError = "같은 판매처끼지만 합적할 수 있습니다.";
        break;
      }

      if (row.KUNWE !== selectData[0].KUNWE) {
        checkError = "같은 납품처끼리만 합적할 수 있습니다.";
        break;
      }

      if (row.LIFNR !== selectData[0].LIFNR) {
        checkError = "같은 1차운송사끼리만 합적할 수 있습니다.";
        break;
      }

      if (row.LIFNR2 !== selectData[0].LIFNR2) {
        checkError = "같은 2차운송사끼리만 합적할 수 있습니다.";
        break;
      }

      ztext = ztext.concat(selectData[0].ZTEXT_OR, " /");
    }

    if (checkError !== "") {
      alert(checkError, "알림");
      return;
    }

    ivbelns = ivbelns.substr(0, ivbelns.length - 1);

    if(ztext !== "")
      ztext = ztext.substr(0, ztext.length - 1);

    var txtCount = 0;
    if (ztext.length > 70) {
      txtCount = 70;
      ztext = ztext.substr(0, txtCount);
      ztext = ztext.concat("...");
    } else {
      txtCount = ztext.length;
      ztext = ztext.substr(0, txtCount);
    }

    var ADDR1 = "";

    var result7110Model = await this.dataService.SelectModelData<ZSDT7110Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7110ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND LGORT = '${selectData[0].LGORT}' `, "", QueryCacheType.None);

    if (result7110Model.length > 0)
      ADDR1 = result7110Model[0].ZADDR1;

    var tdlnrText = "";

    var tdlnr1Text = this.tdlnrList.find(item => item.LIFNR === selectData[0].LIFNR2);
    if (tdlnr1Text !== undefined)
      tdlnrText = tdlnr1Text.NAME1;

    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "itddatFrom": selectData[0].WADAT_IST,
      "itddatTo": selectData[0].WADAT_IST,
      "ivbeln": selectData[0].VBELN,
      /*      "vbelnvl": "",*/
      "mandt": this.appConfig.mandt,
      //"ivstel": selectData[0].VSTEL,
      "zcarno": selectData[0].ZCARNO,
      "inco1": selectData[0].INCO1,
      "bezei": selectData[0].INCO1_N,
      "lgort": selectData[0].LGORT,
      "zlgort": selectData[0].LGORT,
      "lgobe": selectData[0].LGORT_N,
      "zlgobe": selectData[0].LGORT_N,
      "zaddr1": ADDR1,
      "zname": selectData[0].KUNWE_N,
      "z3Parvw": selectData[0].LIFNR,
      "z4Parvw": selectData[0].LIFNR2,
      "z3Parvwnm": "",
      "z4Parvwnm": tdlnrText,
      //"z3Parvwbunum": "",
      //"z4Parvwbunum": "",
      //"namhaebunum": "",
      //"zvkaus": selectData[0].ZVKAUS,
      //"zvkausnm": "",
      "ivbelns": ivbelns,
      "wadat": selectData[0].WADAT_IST,
      "zphone": selectData[0].ZPHONE,
      "zdriver": selectData[0].ZDRIVER,
      "street": selectData[0].KUNWE_ADRC,
      "telf1": selectData[0].KUNWE_TELF1,
      "ztext": ztext
    };

    setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction5", params) });
  }


  //거래명세서
  async TeansactionPrint(e: any) {
    var selectData = this.dataGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }

    if (selectData[0].VSTEL !== "9999") {
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "itddatFrom": selectData[0].WADAT_IST,
        "itddatTo": selectData[0].WADAT_IST,
        "ivbeln": selectData[0].VBELN,
        /*      "vbelnvl": "",*/
        "mandt": this.appConfig.mandt,
/*        "ivstel": selectData[0].VSTEL*/
      };
      if (selectData[0].LGORT === "3000" || selectData[0].LGORT === "3200")
        setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction2", params) });
      else
        setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction3", params) });
    } else {
      //임가공 명세서
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "mandt": this.appConfig.mandt,
        "ivbeln": selectData[0].VBELN,
        "iposnr": selectData[0].POSNR
      };

      setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction4", params) });
    }

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
      component: this.dataGrid.instance,
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

  async getCodeNm() {
    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.tdlnrCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(tdlnrCode);
    this.tdlnrList = resultModel;
  }
}
