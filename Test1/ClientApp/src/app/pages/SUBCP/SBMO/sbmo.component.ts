import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { formatDate } from '@angular/common';
import { ZMMT1310Model } from '../../../shared/dataModel/OWHP/Zmmt1310Proxy';
import { ZMMT1311Model } from '../../../shared/dataModel/OWHP/Zmmt1311Proxy';
import { ZMMT1311GroupByModel } from '../../../shared/dataModel/OWHP/Zmmt1311GroupByProxy';
import { ZMMT1330Model } from '../../../shared/dataModel/OWHP/Zmmt1330Proxy';
import { ZMMT1331Model } from '../../../shared/dataModel/OWHP/Zmmt1331Proxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data } from '../SBIV/app.service';
import { confirm, alert } from "devextreme/ui/dialog";
import { CommonCodeInfo, TableCodeInfo, ThemeManager } from '../../../shared/app.utilitys';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import ArrayStore from 'devextreme/data/array_store';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import { NavigationExtras, Router } from '@angular/router';
import { parseDate } from 'devextreme/localization';
import { AuthService } from '../../../shared/services';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { async } from 'rxjs';
import { GIRequestList } from './app.service';
import { groupBy } from 'rxjs';
import { ZMMT1320MaxKeyModel } from '../../../shared/dataModel/OWHP/Zmmt1320MaxKeyProxy';
import { ZMMT1331GroupByModel } from '../../../shared/dataModel/OWHP/Zmmt1331GroupByProxy';
import { ZMMT1311Join1331Model } from '../../../shared/dataModel/OWHP/ZMMT1311Join1331Model';
import { debug } from 'console';

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
  @ViewChild('productGrid', { static: false }) productGrid!: DxoGridComponent;
  @ViewChild('faultypartGrid', { static: false }) faultypartGrid!: DxoGridComponent;
  @ViewChild('registGrid', { static: false }) registGrid!: DxDataGridComponent;
  @ViewChild('companyGrid', { static: false }) companyGrid!: DxDataGridComponent;
  @ViewChild('CodeEntery', { static: false }) CodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('popupDataGrid', { static: false }) popupDataGrid!: DxDataGridComponent;

  dataSource: any;

  //주문,접수자
  registerInfo: any;

  //재고현황리스트
  forestData: any;

  //구성부품확인리스트
  componentsList: any;

  //생산지시데이터
  ProductData: any;

  //구성부품리스트
  PartsList: any;
  update: any;

  //생산결과등록 및 입고요청
  ReceivingList: any;

  //생산결과등록 및 입고요청
  CompanyList: any;

  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;

  //데이터 조회 버튼
  searchButtonOptions: any;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //form
  ReceptionistData: any;

  //버튼 제한
  chDisabled: boolean = true;
  saDisabled: boolean = true;
  selectedItemKeys: any[] = [];

  //버튼
  popupcloseButtonOptions: any;
  resultpopupcloseButtonOptions: any;
  formancepopupcloseButtonOptions: any;
  strationpopupcloseButtonOptions: any;

  dateEditOption: any;

  //자재불출요청
  GIRequestButtonOptions: any;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  popupMode = 'Add';
  customOperations!: Array<any>;

  //팝업
  formData: any = {};
  popupVisible = false;
  resultpopupVisible = false;
  formancepopupVisible = false;


  //줄 선택
  selectedProductDataRowIndex = -1;
  selectedProductDataItemKeys: any[] = [];
  registSelectKey: any[] = [];


  //30테이블 포커스
  //focusedRowKey = 3;

  //현재날짜
  now: Date = new Date();
  startDate: any;
  endDate: any;
  autoNavigateToFocusedRow = true;
  //date box
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  rowCount: number;
  PRD_STATUS!: number;
  //팝업 데이터 버퍼
  saveData: ZMMT1311Join1331Model[] = [];

  //팝업 데이터 
  popupData: any;

  //진행상태엔트리 값
  codeValue: any;

  //제품명엔트리 값
  matnrValue: any;

  //생산지시그리드 편집여부
  girdEditing: boolean;

  //생산지시 버튼여부
  btnVisible: boolean;
  mtnVisible: boolean;

  //상단 수량 값
  piMengeValue: any;
  gMengeValue: any;

  //생산량,요청량 Editing
  editingPI!: boolean;
  editingG!: boolean;

  private loadePeCount: number = 0;

  maktCode: TableCodeInfo;
  customerCode: CommonCodeInfo;
  ProgressCode: CommonCodeInfo;

  giRequestList: GIRequestList[] = [];
  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "sbmo";
  selectData: any;

  //비교용 데이터
  searchData: ZMMT1330Model[] = [];

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private appConfig: AppConfigService, private iminfo: ImateInfo, private router: Router, private authService: AuthService) {

    appInfo.title = AppInfoService.APP_TITLE + " | 생산지시확인";
    //this._dataService = dataService;

    this.maktCode = appConfig.tableCode("제품코드");
    this.customerCode = appConfig.commonCode("임가공취급업종");
    this.ProgressCode = appConfig.commonCode("생산진행상태");
    this.update = "false";
    this.codeValue = "";
    this.matnrValue = "";
    this.girdEditing = false;
    this.btnVisible = false;
    this.mtnVisible = false;
    this.editingPI = false;
    this.editingG = false;
    this.PRD_STATUS = 10;
    this.ReceivingList = new ArrayStore(
      {
        key: ["SEQ"],
        data: []
      });

    var userInfo = this.authService.getUser().data;

    if (userInfo?.deptId != "") {
      this.ReceptionistData = { PRD_P_ACPT_DATE: new Date(), PRD_P_ACPT_NAME: userInfo?.userName, LIFNR: userInfo?.deptId };
    } else {
      //var userInfo = this.authService.getUser().data;
      this.ReceptionistData = { PRD_P_ACPT_DATE: new Date(), PRD_P_ACPT_NAME: "홍길동", LIFNR: "0000302512" };
    }
    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maktCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.customerCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.ProgressCode),

    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    //팝업닫기버튼
    this.popupcloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.popupVisible = false;
      },
    };

    //팝업닫기버튼
    this.resultpopupcloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.resultpopupVisible = false;

      },
    };

    //팝업닫기버튼
    this.formancepopupcloseButtonOptions = {
      text: '닫기',
      onClick: async () => {
        that.formancepopupVisible = false;
      },
    };

    //팝업닫기버튼
    this.strationpopupcloseButtonOptions = {
      text: '등록',
      onClick: async () => {
        this.CompanyList._array.forEach((array: any) => {
          var index = this.saveData.findIndex(obj => obj.MANDT == array.MANDT && obj.EBELN == array.EBELN && obj.EBELP == array.EBELP && obj.SEQ == array.SEQ && obj.RSPOS == array.RSPOS);

          if (index >= 0) {
            Object.assign(this.saveData[index], { BDMNG_P: array.BDMNG_P });
          } else {
            this.saveData.push(array);
          }
        });
        that.formancepopupVisible = false;
      },
    };

    this.GIRequestButtonOptions = {
      text: '자재불출요청',
      onClick: async () => {
        var result: ZMMT1311GroupByModel[] = await this.popupdataMultiLoad(iminfo, dataService, this, true);

      }
    }

    //date
    var now = new Date();
    this.startDate = formatDate(new Date().setDate(new Date().getDate() - 30), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date().setDate(new Date().getDate() + 30), "yyyy-MM-dd", "en-US")
    const that = this;
    let test = this;
    this.rowCount = 0;

    this.dataLoad(this.iminfo, this.dataService, this);
  }

  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: SBMOComponent) {
    //var resultModel = await dataService.SelectModelData<ZMMT1310Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1310ModelList", [],
    //  `MANDT = '${this.appConfig.mandt}' AND MATNR LIKE '%${this.matnrValue == null ? "" : this.matnrValue}' AND PRD_STATUS LIKE '%${this.codeValue == null ? "" : this.codeValue}' AND (PRD_P_DATE_RFR BETWEEN '${this.startDate.replace(/-/gi, '')}' AND '${this.endDate.replace(/-/gi, '')}' OR PRD_P_DATE_RTO BETWEEN '${this.startDate.replace(/-/gi, '')}' AND '${this.endDate.replace(/-/gi, '')}')`,
    //  "EBELN , EBELP ", QueryCacheType.None);

    var resultModel = await dataService.SelectModelData<ZMMT1310Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1310CustomList",
      [thisObj.appConfig.mandt, thisObj.matnrValue == null ? "" : thisObj.matnrValue, this.codeValue == null ? "" : thisObj.codeValue, thisObj.startDate.replace(/-/gi, ''),
        thisObj.endDate.replace(/-/gi, ''), thisObj.startDate.replace(/-/gi, ''), thisObj.endDate.replace(/-/gi, ''), '3', 'MM', 'MM840', (thisObj.authService.getUser().data.deptId ?? "").padStart(10, '0')], "", "A.EBELN , A.EBELP ", QueryCacheType.None);

    this.ProductData = new ArrayStore(
      {
        key: ["EBELN", "EBELP"],
        data: resultModel
      });

    return resultModel;

  }

  onPEDataLoaded(e: any) {
    this.loadePeCount++;

    console.info(`DATA LOAD COUNT: ${this.loadePeCount}`);
    if (this.loadePeCount >= 15) {
      //패널 없애는 로직 추가

    }
  }

  movePage(e: any) {
    var selectData: ZMMT1310Model[] = this.productGrid.instance.getSelectedRowsData();

    //납품완료 상태확인
    var findData = selectData.findIndex(array => array.ELIKZ === "X");
    if (findData >= 0) {
      alert("이미 PO종료된건 입니다 .", "알림");
      return;
    }

    var sEBELN = "";

    sEBELN = "("
    selectData.forEach(async (row: ZMMT1310Model) => {
      sEBELN = sEBELN.concat("'", row.EBELN, row.EBELP, "', ");
    });

    sEBELN = sEBELN.slice(0, -2);

    sEBELN = sEBELN.concat(")");


    var queryParams = { LIFNR: this.ReceptionistData.LIFNR, NAME: this.ReceptionistData.PRD_P_ACPT_NAME, FLAG: "sbmo" };

    this.router.navigate(['sbmr'], { queryParams: queryParams });
  }

  // 구성부품 데이터 로드
  public async popupdataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: SBMOComponent, multiCondi: boolean) {

    var selectData: ZMMT1310Model[] = this.productGrid.instance.getSelectedRowsData();

    var resultModel = await dataService.SelectModelData<ZMMT1311Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1311ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND EBELN = '${selectData[0].EBELN}' AND EBELP = ${selectData[0].EBELP}`, "", QueryCacheType.None);


    return resultModel;
  }

  // 구성부품 데이터 다중 로드
  public async popupdataMultiLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: SBMOComponent, multiCondi: boolean) {

    var selectData: ZMMT1310Model[] = this.productGrid.instance.getSelectedRowsData();

    var sEBELN = "";

    sEBELN = "("
    selectData.forEach(async (row: ZMMT1310Model) => {
      sEBELN = sEBELN.concat("'", row.EBELN, row.EBELP, "', ");
    });

    sEBELN = sEBELN.slice(0, -2);

    sEBELN = sEBELN.concat(")");

    var max_vbeln = await dataService.SelectModelData<ZMMT1320MaxKeyModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320MaxKeyList", [thisObj.appConfig.mandt], "", "", QueryCacheType.None);


    var resultModel = await dataService.SelectModelData<ZMMT1311GroupByModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1311GroupByList", [thisObj.appConfig.mandt, sEBELN],
      "", "", QueryCacheType.None);


    return resultModel;
  }

  //생산지시
  public async dataInsert(thisObj: SBMOComponent) {
    let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");
    var selectData: Array<any> = this.productGrid.instance.getSelectedRowsData();

    //납품완료 상태확인
    var findData = selectData.findIndex(array => array.ELIKZ === "X");
    if (findData >= 0) {
      alert("이미 PO종료된건 입니다 .", "알림");
      return;
    }

    var findData = selectData.findIndex(array => array.PRD_STATUS != "00");

    if (findData >= 0) {
      alert("선택된 데이터 중 이미 지시 접수된 데이터가 존재합니다", "알림");
    }
    else {

      if (await confirm("생산지시 접수를 진행하겠습니까?", "알림")) {
        var zmmt1310List: ZMMT1310Model[] = [];
        var checkFlag = false;
        selectData.forEach((array: any) => {
          zmmt1310List.push(new ZMMT1310Model(array.MANDT, array.EBELN, array.EBELP, array.LIFNR, array.MATNR, array.TXZ01, array.MEINS, "10",
            array.PRD_P_MENGE, array.PRD_P_MENGE_MT, array.PRD_P_DATE, array.PRD_P_NAME, array.PRD_P_DEPT_NAME, array.PRD_P_DATE_RFR,
            array.PRD_P_DATE_RTO, array.PRD_TYPE, array.PRD_TEXT, this.ReceptionistData.PRD_P_ACPT_DATE, this.ReceptionistData.PRD_P_ACPT_NAME, array.PRD_PI_MENGE,
            array.PRD_PI_MENGE_MT, array.PRD_PI_DATE ?? new Date("0001-01-01"), array.PRD_G_MENGE, array.PRD_G_DATE ?? new Date("0001-01-01"), array.PRD_G_NAME, array.PRD_A_MENGE,
            array.PRD_A_MENGE_MT, array.PRD_A_DATE ?? new Date("0001-01-01"), array.PRD_A_NAME, array.MBLNR, array.MJAHR, array.ZEILE, array.MBLNR_C,
            array.MJAHR_C, array.ZEILE_C, array.ERNAM, array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify));
        });

        var rowCount1 = await this.dataService.ModifyModelData<ZMMT1310Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1310ModelList", zmmt1310List);
        this.dataLoad(this.iminfo, this.dataService, this);
        alert("생신지시접수가되었습니다", "알림");
      }
    }
  }
  
  //생산지시 취소
  public async cancelData(e:any) {
    let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");
    var selectData: Array<any> = this.productGrid.instance.getSelectedRowsData();

    //납품완료 상태확인
    var findData = selectData.findIndex(array => array.ELIKZ === "X");
    if (findData >= 0) {
      alert("이미 PO종료된건 입니다 .", "알림");
      return;
    }

    var findData = selectData.findIndex(array => array.PRD_STATUS != "10");

    if (findData >= 0) {
      alert("선택된 데이터 중 접수상태가 아닌 데이터가 존재합니다", "알림");
    }
    else {

      if (await confirm("생산지시 접수를 취소를 진행하겠습니까?", "알림")) {
        var zmmt1310List: ZMMT1310Model[] = [];
        var checkFlag = false;
        selectData.forEach((array: any) => {
          zmmt1310List.push(new ZMMT1310Model(array.MANDT, array.EBELN, array.EBELP, array.LIFNR, array.MATNR, array.TXZ01, array.MEINS, "00",
            array.PRD_P_MENGE, array.PRD_P_MENGE_MT, array.PRD_P_DATE, array.PRD_P_NAME, array.PRD_P_DEPT_NAME, array.PRD_P_DATE_RFR,
            array.PRD_P_DATE_RTO, array.PRD_TYPE, array.PRD_TEXT, new Date("0001-01-01"), "", array.PRD_PI_MENGE,
            array.PRD_PI_MENGE_MT, array.PRD_PI_DATE ?? new Date("0001-01-01"), array.PRD_G_MENGE, array.PRD_G_DATE ?? new Date("0001-01-01"), array.PRD_G_NAME, array.PRD_A_MENGE,
            array.PRD_A_MENGE_MT, array.PRD_A_DATE ?? new Date("0001-01-01"), array.PRD_A_NAME, array.MBLNR, array.MJAHR, array.ZEILE, array.MBLNR_C,
            array.MJAHR_C, array.ZEILE_C, array.ERNAM, array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify));
        });

        var rowCount1 = await this.dataService.ModifyModelData<ZMMT1310Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1310ModelList", zmmt1310List);
        this.dataLoad(this.iminfo, this.dataService, this);
        alert("생신지시 접수취소가 완료되었습니다", "알림");
      }
    }
  }

  //생산지시종료
  public async termiList() {
    let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");

    if (await confirm("생산지시를 종료하시겠습니까 ? ", "알림")) {

      var selectData = this.productGrid.instance.getSelectedRowsData();
      var zmmt1310List: ZMMT1310Model[] = [];
      if (selectData[0].PRD_STATUS == "20") {
        selectData.forEach((array: any) => {
          zmmt1310List.push(new ZMMT1310Model(array.MANDT, array.EBELN, array.EBELP, array.LIFNR, array.MATNR, array.TXZ01, array.MEINS, "30",
            array.PRD_P_MENGE, array.PRD_P_MENGE_MT, array.PRD_P_DATE, array.PRD_P_NAME, array.PRD_P_DEPT_NAME, array.PRD_P_DATE_RFR,
            array.PRD_P_DATE_RTO, array.PRD_TYPE, array.PRD_TEXT, array.PRD_P_ACPT_DATE, array.PRD_P_ACPT_NAME, array.PRD_PI_MENGE,
            array.PRD_PI_MENGE_MT, array.PRD_PI_DATE ?? new Date("0001-01-01"), array.PRD_G_MENGE, array.PRD_G_DATE ?? new Date("0001-01-01"), array.PRD_G_NAME, array.PRD_A_MENGE,
            array.PRD_A_MENGE_MT, array.PRD_A_DATE ?? new Date("0001-01-01"), array.PRD_A_NAME, array.MBLNR, array.MJAHR, array.ZEILE, array.MBLNR_C,
            array.MJAHR_C, array.ZEILE_C, array.ERNAM, array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify));
        });


        var rowCount1 = await this.dataService.ModifyModelData<ZMMT1310Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1310ModelList", zmmt1310List);

        this.dataLoad(this.iminfo, this.dataService, this);
        alert("종료되었습니다", "알림")
      } else if (selectData[0].PRD_STATUS == "30") {
        alert("이미 종료처리 되었습니다.", "알림");
      } else {
        alert("선행작업 후 종료가 가능합니다.", "알림");
      }
    }
  }

  modifyData(e: any) {
    this.dataInsert(this);
  }

  //팝업이벤트
  showPopup(popupMode: any, data: any): void {
    this.formData = {};

    this.formData = data;
    this.popupMode = popupMode;
    this.popupVisible = true;
  }

  //팝업이벤트2
  async resultPopup(popupMode: any, data: any): Promise<void> {

    this.registGrid.instance.clearFilter();
    this.registGrid.instance.clearSorting();

    var selectData: ZMMT1310Model[] = this.productGrid.instance.getSelectedRowsData();

    //납품완료 상태확인
    /*var findData = selectData.findIndex(array => array.ELIKZ === "X");
    if (findData >= 0) {
      alert("이미 납품완료된 건은 지시할수 없습니다.", "알림");
      return;
    }*/

    if (selectData.length > 1) {
      alert("생산결과등록은 단일 행 선택 후 가능합니다.", "알림");
    } else if (selectData[0].PRD_STATUS == "00") {
      alert("생산지시 접수 후 생산결과등록이 가능합니다.", "알림");
    }
    else {

      if (selectData[0].PRD_STATUS == "30") {
        this.girdEditing = false;
        this.btnVisible = false;
        this.mtnVisible = true;
      } else {
        this.girdEditing = true;
        this.btnVisible = true;
        this.mtnVisible = false;
      }

      this.formData = {};

      this.formData = data;

      var resultModel = await this.datainsert(this);
      this.loadingVisible = false;

      var gridResult = [];

      var index = 0;

      if (resultModel.length > 0) {

        var a = resultModel.map(object => { return parseInt(object.SEQ); });
        index = Math.max(...a);
      }

      this.dateEditOption = { showClearButton: true, min: formatDate(selectData[0].PRD_P_ACPT_DATE, "yyyy-MM-dd", "en-US") };

      if (selectData[0].PRD_STATUS === "10" || selectData[0].PRD_STATUS === "20") {
        var data = this.productGrid.instance.getSelectedRowsData()[0];
        gridResult.push(Object.assign(new ZMMT1330Model(this.appConfig.mandt, data.EBELN, data.EBELP, (index + 1).toString().padStart(3, '0'),
          this.authService.getUser().data?.deptId ?? "", data.MATNR, data.TXZ01, data.MEINS, 0, 0, new Date(), 0,
          new Date("0001-01-01"), "", 0, 0, null, "", "",
          "", "", "", "", "", "", new Date("0001-01-01"), "000000", "", new Date("0001-01-01"), "000000", DIMModelStatus.Add), { FLAG: "I", DATA_DATE: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'), PRD_G_DATE: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'), PRD_G_NAME: this.ReceptionistData.PRD_P_ACPT_NAME  }));
        this.registSelectKey = [{ SEQ: (index + 1).toString().padStart(3, '0') }];
      }
      resultModel.forEach((array: any) => {
        if (array.PRD_PI_DATE != null) {
          array.DATA_DATE = array.PRD_PI_DATE;
        } else if (array.PRD_G_DATE != null) {
          array.DATA_DATE = array.PRD_G_DATE;
        }

        gridResult.push(array);
      });

      this.ReceivingList = new ArrayStore(
        {
          key: ["SEQ"],
          data: gridResult
        });
      //this.addrow();
      this.saveData = [];

      this.popupMode = popupMode;
      this.resultpopupVisible = true;
    }
  }
  //팝업이벤트3
  formancepopup(popupMode: any, data: any): void {
    this.formData = {};

    this.formData = data;
    this.popupMode = popupMode;
    this.formancepopupVisible = true;
  }

  //메인 더블클릭시 팝업
  dblClick(e: any) {
    if (parseInt(e.data.PRD_G_MENGE) > 0) {
      this.companyGrid.instance.clearFilter();
      this.companyGrid.instance.clearSorting();

      this.formancepopupVisible = !this.formancepopupVisible;
      this.dataLoad2(this.iminfo, this.dataService, this, e.data);
    } else {
      //alert("입고요청량이 없어 업체투입실적을 볼 수 없습니다","알림")
    }
  }


  //구성부품 팝업
  troRow: any = async (e: any) => {

    var selectData = this.productGrid.instance.getSelectedRowsData();
    //var selectData: Array<any> = this.productGrid.instance.getSelectedRowsData();

    //납품완료 상태확인
    /*var findData = selectData.findIndex(array => array.ELIKZ === "X");
    if (findData >= 0) {
      alert("이미 납품완료된 건은 지시할수 없습니다.", "알림");
      return;
    }*/

    if (selectData.length > 1) {
      alert("구성부품확인은 단일 행 선택 후 가능합니다.", "알림");
    } else {
      this.showPopup('Add', {}); //change undefined to {}
      this.loadingVisible = true;
      var resultModel = await this.popupdataLoad(this.iminfo, this.dataService, this, false);
      this.loadingVisible = false;
      this.PartsList = new ArrayStore(
        {
          key: ["RSPOS", "MATNR"],
          data: resultModel
        });

      this.popupData = this.productGrid.instance.getSelectedRowsData();
    }
  }

  //생산결과등록 및 입고요청 팝업
  requestRow: any = async (e: any) => {

    this.resultPopup('Add', {}); //change undefined to {}
    this.loadingVisible = true;
    var selectData = this.productGrid.instance.getSelectedRowsData();
    //var selectData: Array<any> = this.productGrid.instance.getSelectedRowsData();

    //납품완료 상태확인
    /*var findData = selectData.findIndex(array => array.ELIKZ === "X");
    if (findData > 0) {
      alert("이미 납품완료된 건은 지시할수 없습니다.", "알림");
      return;
    }*/

    if (selectData[0].PRD_STATUS === "10" || selectData[0].PRD_STATUS === "20") {
      this.editingPI = true;
      this.editingG = true;
      this.saDisabled = false;
    } else if (selectData[0].ELIKZ === "X") {
      this.editingPI = false;
      this.editingG = false;
      this.saDisabled = true;
    }
  }


  //클릭 키
  /*selectionProductDataChanged(data: any) {
    this.selectedProductDataRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedProductDataItemKeys = data.currentSelectedRowKeys;
  }*/

  //조회조건
  dateCheck(e: any) {
    var staDate = new Date(this.startDate);
    var endDate = new Date(this.endDate);

    if (staDate > endDate) {
      alert("생산종료일이 시작일보다 작습니다.", "알림");

      this.ProductData = new ArrayStore(
        {
          key: ["EBELN", "EBELP"],
          data: []
        });

    } else {
      var diffDay = Math.floor(Math.abs((staDate.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000)));

      if (diffDay > 60) {
        alert("조회기간을 최대 60일로 설정해주세요.", "알림");
      } else {
        this.dataLoad(this.iminfo, this.dataService, this);
      }
    }
  }

  //생산결과등록 및 입고요청 조회
  public async datainsert(thisObj: SBMOComponent) {
    var piMsum = 0;
    var gMsum = 0;
    var selectData = this.productGrid.instance.getSelectedRowsData();
    this.popupData = this.productGrid.instance.getSelectedRowsData();


    var insertModel = await thisObj.dataService.SelectModelData<ZMMT1330Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1330ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND EBELN = '${selectData[0].EBELN}' AND EBELP = ${selectData[0].EBELP}`, "SEQ DESC", QueryCacheType.None);

    insertModel.forEach(async (array: any) => {
      piMsum = piMsum + parseInt(array.PRD_PI_MENGE);
      gMsum = gMsum + parseInt(array.PRD_G_MENGE);

    });

    this.piMengeValue = piMsum;
    this.gMengeValue = gMsum;
    this.searchData = JSON.parse(JSON.stringify(insertModel));
    return insertModel;
  }

  //생산결과등록 및 입고요청 조회버튼
  resultList: any = async () => {
    this.loadingVisible = true;
    var resultModel = await this.datainsert(this);
    this.loadingVisible = false;

    resultModel.forEach((array: any) => {
      if (array.PRD_PI_DATE != null) {
        array.DATA_DATE = array.PRD_PI_DATE;
      } else if (array.PRD_G_DATE != null) {
        array.DATA_DATE = array.PRD_G_DATE;
      }
    });

    this.ReceivingList = new ArrayStore(
      {
        key: ["SEQ"],
        data: resultModel
      });

    this.saveData = [];

    this.registGrid.instance.clearSelection();
  }
  onEditorPreparing(e: any) {
    var piMsum = 0;
    var gMsum = 0;
    var data: Array<any> = this.ReceivingList._array;
    // 마지막생산일자구하기 + 30모델만들어주기
    data.forEach(async (array: any) => {
      piMsum = piMsum + parseInt(array.PRD_PI_MENGE);
      gMsum = gMsum + parseInt(array.PRD_G_MENGE);
    });

    this.piMengeValue = piMsum;
    this.gMengeValue = gMsum;
  }
  focusChange(e: any) {

    this.registSelectKey = [{ SEQ: e.data.SEQ }];
  }
  onEditorPrepared(e: any) {
    /* 검증필요
    if (e.dataField == "PRD_G_MENGE" || e.dataField == "PRD_PI_MENGE") {
      if (e.row.data.PRD_A_MENGE > 0) {
        this.registGrid.instance.columnOption("PRD_PI_MENGE", "allowEditing", false);
        this.registGrid.instance.columnOption("PRD_G_MENGE", "allowEditing", false);
        return;
        console.log("막아줘");
      }
      console.log("안막아줘");
      this.registGrid.instance.columnOption("PRD_PI_MENGE", "allowEditing", true);
      this.registGrid.instance.columnOption("PRD_G_MENGE", "allowEditing", true);
      
    }
    */
  }

  rowUpdate(e: any) {
    if (e.data.FLAG == undefined) {
      Object.assign(e.data, { FLAG: "U" });
    }
  }

  rowUpdating(e: any) {
   

    if (e.newData.PRD_G_MENGE !== undefined) {
      var sum = 0;
      var findIndex = this.ReceivingList._array.findIndex(obj => obj.SEQ = e.key.SEQ);

      this.ReceivingList._array.forEach((array: any, index: number) => {
        if (findIndex == index)
          sum = sum + e.newData.PRD_G_MENGE;
        else 
          sum = sum + array.PRD_G_MENGE;
      });
      if (this.productGrid.instance.getSelectedRowsData()[0].PRD_P_MENGE < sum) {
        alert("입고요청의 합은 생산지시량 보다 많을 수 없습니다.", "알림");
        e.newData.PRD_G_MENGE = e.oldData.PRD_G_MENGE;
        return;
      }

      if (e.oldData.FLAG !== "I")
        if (e.newData.PRD_G_MENGE !== 0)
          if (e.oldData.PRD_A_MENGE === 0)
            if (e.oldData.PRD_A_DATE === null)
              if (e.oldData.PRD_A_NAME === "")
                if (e.newData.PRD_G_MENGE !== e.oldData.PRD_G_MENGE) {
                 // alert("투입실적 수정 후 저장하세요.", "알림")
                }
    }
  }
  /*
  row31Update(e: any) {
    var index = this.saveData.findIndex(obj => obj.MANDT == e.data.MANDT && obj.EBELN == e.data.EBELN && obj.EBELP == e.data.EBELP && obj.SEQ == e.data.SEQ && obj.RSPOS == e.data.RSPOS);

    if (index >= 0) {
      Object.assign(this.saveData[index], { BDMNG_P: e.data.BDMNG_P });
    } else {
      if (e.data.FLAG == "") {
        this.saveData.push(Object.assign(e.data, { FLAG: "I" }));
      } else {
        this.saveData.push(Object.assign(e.data, { FLAG: "U" }));
      }
    }
  }
  */
  // 부품실적 데이터 로드
  public async dataLoad2(iminfo: ImateInfo, dataService: ImateDataService, thisObj: SBMOComponent, data: any) {
    var selectData = data;

    var findDataList = this.saveData.filter(array => array.MANDT == data.MANDT && array.EBELN == data.EBELN && array.EBELP == data.EBELP && array.SEQ == data.SEQ);
    if (findDataList.length > 0) {
      this.CompanyList = new ArrayStore(
        {
          data: findDataList
        });
    }
    else {

      var resultModel = await dataService.SelectModelData<ZMMT1311Join1331Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1311Join1331List", [thisObj.appConfig.mandt, data.EBELN, data.EBELP, data.SEQ], "", "", QueryCacheType.None);

      resultModel.forEach((array: any) => {
        array = Object.assign(array, { SEQ: selectData.SEQ });
      });

      this.CompanyList = new ArrayStore(
        {
          data: resultModel
        });


      resultModel.forEach(array => {
        var index = this.saveData.findIndex(obj => obj.MANDT == array.MANDT && obj.EBELN == array.EBELN && obj.EBELP == array.EBELP && obj.SEQ == array.SEQ && obj.RSPOS == array.RSPOS);

        if (index < 0) {
          if (array.FLAG == "") {
            this.saveData.push(Object.assign(array, { FLAG: "I" }));
          } else {
            this.saveData.push(Object.assign(array, { FLAG: "U" }));
          }
        }
      });
    }
  }


  //저장버튼
  storageList: any = async (thisObj: SBMOComponent) => {

    //저장하려는 데이터의 생산량 또는 입고요청량 체크
    this.registGrid.instance.closeEditCell();
    var select30Model = this.registGrid.instance.getSelectedRowsData()[0];

    /*공백 (null일경우 체크)*/
    if (select30Model.PRD_G_MENGE == null) {
      select30Model.PRD_G_MENGE = 0;
    }
    if (select30Model.PRD_PI_MENGE == null) {
      select30Model.PRD_PI_MENGE = 0;
    }
    this.saveData.forEach(array => {
      if (array.BDMNG_P == null) {
        array.BDMNG_P = 0;
      }
    });

    var select30ModelCnt = this.registGrid.instance.getSelectedRowsData().length;
    var oldData = this.searchData.find(obj => obj.SEQ == select30Model.SEQ);

    if (select30ModelCnt == 0) {
      alert("선택된 생산결과가 없습니다.", "알림");
      return;
    }
    //입력된 값이 없으면 return, 존재하면 run
    
    if (select30Model.FLAG == "I" && select30Model.PRD_PI_MENGE === 0 && select30Model.PRD_G_MENGE === 0) {
      alert("생산량 또는 입고요청량을 입력해주세요.", "알림");
      return;
    }
    if (select30Model.PRD_A_MENGE ?? 0 > 0) {
      alert("이미 입고되어 수정이 불가능합니다.", "알림");
      return;
    }
    else if (select30Model.PRD_A_DATE != null) {
      alert("이미 입고되어 수정이 불가능합니다.", "알림");
      return;
    }
    else if (select30Model.PRD_A_NAME !== "") {
      alert("이미 입고되어 수정이 불가능합니다.", "알림");
      return;
    }
    
    if (parseInt(select30Model.PRD_G_MENGE) > 0) {

      if (select30Model.FLAG == "I" || oldData.PRD_G_MENGE != parseInt(select30Model.PRD_G_MENGE)) {
        var index = this.saveData.findIndex(obj => obj.MANDT == select30Model.MANDT && obj.EBELN == select30Model.EBELN && obj.EBELP == select30Model.EBELP && obj.SEQ == select30Model.SEQ);
        if (index < 0) {
          alert("구성부품 투입실적 입력 후 저장하세요.", "알림");
          return;
        }
      }
    }
    if (parseInt(select30Model.PRD_G_MENGE) > 0) {
      if (select30Model.FLAG == "I" || oldData.PRD_G_MENGE != parseInt(select30Model.PRD_G_MENGE)) {
        var indexCnt = this.saveData.findIndex(obj => obj.MANDT == select30Model.MANDT && obj.EBELN == select30Model.EBELN && obj.EBELP == select30Model.EBELP && obj.SEQ == select30Model.SEQ && obj.BDMNG_P == 0);
        if (indexCnt >= 0) {
          alert("구성부품 투입실적 수량이 0인 데이터가 존재합니다. 수량 입력 후 저장하세요.", "알림");
          return;
        }
      }
    }


    let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");
    //this.stordatainsert();
    //this.stordatainsert2();
    //생산량, 입고요청량 더하기
    var piMsum = 0;
    var gMsum = 0;
    var lastDate = new Date("0001-01-01"); //생산일자
    var lastDate2 = new Date("0001-01-01"); //요청일자
    let formatDate12 = new Date("0001-01-01");
    var result31Model: Array<any> = []; //저장하려는 데이터의 31모델list

    var valuCheck = false;
    var value31Check = false;

    result31Model = await this.dataService.SelectModelData<ZMMT1331Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1331ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND EBELN = '${select30Model.EBELN}' AND EBELP = '${select30Model.EBELP}' AND SEQ = '${this.registGrid.instance.getSelectedRowsData()[0].SEQ}'`, "", QueryCacheType.None);

    var alertMsg = "저장하시겠습니까 ? ";
    // 입고요청량이 0으로 Update 될 경우 투입실적 문구추가
    if (select30Model.FLAG == "U" && select30Model.PRD_G_MENGE === 0) {
      if (result31Model.length > 0) {
        //투입실적 삭제되는데 저장할 경우 false, 저장안할경우 true
        alertMsg = alertMsg + "<br><br>입고요청량이 0이면 구성부품 투입실적도 삭제됩니다.";
      }
    }
    if (await confirm(alertMsg, "알림")) {
      //var today = parseDate(new Date().toISOString(), 'yyyyMMdd')
      var zmmt1310List: ZMMT1310Model[] = [];
      var zmmt1330List: ZMMT1330Model[] = [];
      var zmmt1330DeleteList: ZMMT1330Model[] = [];
      var zmmt1331List: ZMMT1331Model[] = [];
      var zmmt1331DeleteList: ZMMT1331Model[] = [];


      var array = this.productGrid.instance.getSelectedRowsData()[0];

      var data: Array<any> = this.ReceivingList._array;
      // 마지막생산일자구하기 + 30모델만들어주기
      data.forEach(async (array: any) => {

        piMsum = piMsum + parseInt(array.PRD_PI_MENGE);
        gMsum = gMsum + parseInt(array.PRD_G_MENGE);
        var nowDate = new Date((array.DATA_DATE ?? "0001-01-01").substring(0, 10));
        if (array.PRD_PI_MENGE > 0) {
          if (lastDate < nowDate) {
            lastDate = nowDate
          }
        }
        if (array.PRD_G_MENGE > 0) {
          if (lastDate2 < nowDate) {
            lastDate2 = nowDate
          }
        }
      });

      if (select30Model.FLAG != "I") {
        //2023.01.17 전무님 요청 로직변경 (업데이트여도 삭제 후 신규Insert로직 적용)
        zmmt1330DeleteList.push(new ZMMT1330Model(this.appConfig.mandt, select30Model.EBELN, select30Model.EBELP, select30Model.SEQ, select30Model.LIFNR, select30Model.MATNR, select30Model.TXZ01, select30Model.MEINS, select30Model.PRD_PI_MENGE,
          select30Model.PRD_PI_MENGE_MT, select30Model.PRD_PI_MENGE == 0 ? formatDate12 : select30Model.DATA_DATE, select30Model.PRD_G_MENGE,
          select30Model.PRD_G_MENGE == 0 ? formatDate12 : select30Model.DATA_DATE, select30Model.PRD_G_NAME, select30Model.PRD_A_MENGE, select30Model.PRD_A_MENGE_MT, select30Model.PRD_A_DATE ?? new Date("0001-01-01"), select30Model.PRD_A_NAME, select30Model.MBLNR,
          select30Model.MJAHR, select30Model.ZEILE, select30Model.MBLNR_C, select30Model.MJAHR_C, select30Model.ZEILE_C, select30Model.ERNAM == "" ? this.appConfig.interfaceId : select30Model.ERNAM, select30Model.ERDAT ?? new Date(), select30Model.ERZET == "" ? nowTime : select30Model.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Delete));

        /*Update인경우 입고요청량이 0 으로 업데이트 될때 투입실적 삭제되는 로직 추가
          -> 2023.01.17 전무님요청, 무조건 삭제 후 다시인서트 (0일 경우제외), 즉 일단 무조건 삭제로직 들어감*/

        result31Model.forEach((array: any) => {
          array.ModelStatus = DIMModelStatus.Delete;
          zmmt1331DeleteList.push(array);
        });

        var delete30Model = await this.dataService.ModifyModelData<ZMMT1330Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1330ModelList", zmmt1330DeleteList);
        var delete31Model = await this.dataService.ModifyModelData<ZMMT1331Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1331ModelList", zmmt1331DeleteList);
      }

      //10모델 만들어주기
      zmmt1310List.push(new ZMMT1310Model(array.MANDT, array.EBELN, array.EBELP, array.LIFNR, array.MATNR, array.TXZ01, array.MEINS, "20",
        array.PRD_P_MENGE, array.PRD_P_MENGE_MT, array.PRD_P_DATE, array.PRD_P_NAME, array.PRD_P_DEPT_NAME, array.PRD_P_DATE_RFR,
        array.PRD_P_DATE_RTO, array.PRD_TYPE, array.PRD_TEXT, array.PRD_P_ACPT_DATE, array.PRD_P_ACPT_NAME, piMsum,
        array.PRD_PI_MENGE_MT, piMsum === 0 ? formatDate12 : lastDate, gMsum, gMsum === 0 ? formatDate12 : lastDate2, array.PRD_P_NAME, array.PRD_A_MENGE,
        array.PRD_A_MENGE_MT, array.PRD_A_DATE ?? new Date("0001-01-01"), array.PRD_A_NAME, array.MBLNR, array.MJAHR, array.ZEILE, array.MBLNR_C,
        array.MJAHR_C, array.ZEILE_C, array.ERNAM, array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify));

      if (select30Model.PRD_PI_MENGE !== 0 || select30Model.PRD_G_MENGE !== 0) {

        //30모델
        if (select30Model.FLAG != "I") {
          zmmt1330List.push(new ZMMT1330Model(this.appConfig.mandt, select30Model.EBELN, select30Model.EBELP, select30Model.SEQ, select30Model.LIFNR, select30Model.MATNR, select30Model.TXZ01, select30Model.MEINS, select30Model.PRD_PI_MENGE??0,
            select30Model.PRD_PI_MENGE_MT, select30Model.PRD_PI_MENGE == 0 ? formatDate12 : select30Model.DATA_DATE, select30Model.PRD_G_MENGE,
            array.PRD_G_MENGE == 0 ? formatDate12 : select30Model.DATA_DATE, select30Model.PRD_G_NAME, select30Model.PRD_A_MENGE, select30Model.PRD_A_MENGE_MT, select30Model.PRD_A_DATE ?? new Date("0001-01-01"), select30Model.PRD_A_NAME, select30Model.MBLNR,
            select30Model.MJAHR, select30Model.ZEILE, select30Model.MBLNR_C, select30Model.MJAHR_C, select30Model.ZEILE_C, this.appConfig.interfaceId, new Date(), nowTime, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Add));
        }
        else {

          zmmt1330List.push(new ZMMT1330Model(this.appConfig.mandt, select30Model.EBELN, select30Model.EBELP, select30Model.SEQ, select30Model.LIFNR, select30Model.MATNR, select30Model.TXZ01, select30Model.MEINS, select30Model.PRD_PI_MENGE??0,
            select30Model.PRD_PI_MENGE_MT, select30Model.PRD_PI_MENGE == 0 ? formatDate12 : select30Model.DATA_DATE, select30Model.PRD_G_MENGE,
            select30Model.PRD_G_MENGE == 0 ? formatDate12 : select30Model.DATA_DATE, select30Model.PRD_G_NAME, select30Model.PRD_A_MENGE, select30Model.PRD_A_MENGE_MT, select30Model.PRD_A_DATE ?? new Date("0001-01-01"), select30Model.PRD_A_NAME, select30Model.MBLNR,
            select30Model.MJAHR, select30Model.ZEILE, select30Model.MBLNR_C, select30Model.MJAHR_C, select30Model.ZEILE_C, select30Model.ERNAM == "" ? this.appConfig.interfaceId : select30Model.ERNAM, select30Model.ERDAT ?? new Date(), select30Model.ERZET == "" ? nowTime : select30Model.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Add));
        }


        /*버퍼에 저장된 데이터 전부 저장 X, 선택된 데이터의 투입실적 입력 및 입고요청량 체크*/
        if (select30Model.PRD_G_MENGE !== 0) {
          //31 모델만들어주기
          var findDataList = this.saveData.filter(array => array.MANDT == select30Model.MANDT && array.EBELN == select30Model.EBELN && array.EBELP == select30Model.EBELP && array.SEQ == select30Model.SEQ);
          findDataList.forEach((array: any) => {
            zmmt1331List.push(new ZMMT1331Model(array.MANDT, array.EBELN, array.EBELP, array.SEQ, array.RSPOS, array.MATNR, array.MAKTX, array.MEINS, array.BDMNG,
              array.BDMNG_P, array.BDMNG_A, array.MENGE, this.appConfig.interfaceId, new Date(), nowTime, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Add));
          });
        }

        var Insert30Model = await this.dataService.ModifyModelData<ZMMT1330Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1330ModelList", zmmt1330List);

        if (zmmt1331List.length > 0)
          var Insert31Model = await this.dataService.ModifyModelData<ZMMT1331Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1331ModelList", zmmt1331List);

      } 

      var sumModel = await this.dataService.SelectModelData<ZMMT1331GroupByModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1331GroupByList", [this.appConfig.mandt, array.EBELN, array.EBELP],
        "", "", QueryCacheType.None);

      var result11Model = await this.dataService.SelectModelData<ZMMT1311Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1311ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND EBELN = '${array.EBELN}' AND EBELP = ${array.EBELP}`, "", QueryCacheType.None);

      var zmmt1311List: ZMMT1311Model[] = []

      result11Model.forEach((array: any) => {
        var mappingData = sumModel.find(obj => obj.RSPOS == array.RSPOS && obj.MATNR == array.MATNR);

        if (mappingData != undefined) {
          zmmt1311List.push(new ZMMT1311Model(array.MANDT, array.EBELN, array.EBELP, array.RSPOS, array.MATNR, array.MAKTX, array.MEINS, array.BDMNG,
            mappingData.SUM_BDMNG_P, array.BDMNG_A, array.MENGE, array.RSNUM, array.ERNAM, array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify))
        } else {
          zmmt1311List.push(new ZMMT1311Model(array.MANDT, array.EBELN, array.EBELP, array.RSPOS, array.MATNR, array.MAKTX, array.MEINS, array.BDMNG,
            0, array.BDMNG_A, array.MENGE, array.RSNUM, array.ERNAM, array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify))
        }
      });

      var Modeify10Model = await this.dataService.ModifyModelData<ZMMT1310Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1310ModelList", zmmt1310List);
      var resultCount2 = await this.dataService.ModifyModelData<ZMMT1311Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1311ModelList", zmmt1311List);


      var newData = await this.dataLoad(this.iminfo, this.dataService, this);

      //팝업재조회 
      var gridData = await this.datainsert(this);

      gridData.forEach((array: any) => {
        if (array.PRD_PI_DATE != null) {
          array.DATA_DATE = array.PRD_PI_DATE;
        } else if (array.PRD_G_DATE != null) {
          array.DATA_DATE = array.PRD_G_DATE;
        }

      });

      this.ReceivingList = new ArrayStore(
        {
          key: ["SEQ"],
          data: gridData
        }); 

      this.registGrid.instance.clearSelection();

      this.saveData = [];

      var selectKey = this.productGrid.instance.getSelectedRowsData()[0];
      var findData = newData.find(obj => obj.EBELN == selectKey.EBELN );
      this.popupData = [findData];

      alert("저장되었습니다.", "알림");

    }
  }

  //생산결과등록 및 입고요청(신규버튼)
  async addrow() {
    var data: Array<any> = this.ReceivingList._array;

    var mappingData = data.find(obj => obj.FLAG == "I");

    if (mappingData != undefined) {
      alert("이미 입력중인 신규데이터가 존재합니다.", "알림")
    } else {

      var index = 0;

      if (data.length > 0) {

        var a = data.map(object => { return parseInt(object.SEQ); });
        index = Math.max(...a);
      }

      data.unshift(Object.assign(new ZMMT1330Model(this.appConfig.mandt, this.productGrid.instance.getSelectedRowsData()[0].EBELN, this.productGrid.instance.getSelectedRowsData()[0].EBELP, (index + 1).toString().padStart(3, '0'),
        this.authService.getUser().data?.deptId ?? "", this.productGrid.instance.getSelectedRowsData()[0].MATNR, this.productGrid.instance.getSelectedRowsData()[0].TXZ01, this.productGrid.instance.getSelectedRowsData()[0].MEINS, 0, 0, new Date(), 0,
        new Date("0001-01-01"), "", 0, 0, null, "", "",
        "", "", "", "", "", "", new Date("0001-01-01"), "000000", "", new Date("0001-01-01"), "000000", DIMModelStatus.Add), { FLAG: "I", DATA_DATE: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'), PRD_G_DATE: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'), PRD_G_NAME: "세기명" }));

      this.ReceivingList = new ArrayStore(
        {
          key: ["SEQ"],
          data: data
        });
      this.registSelectKey = [{ SEQ: (index + 1).toString().padStart(3, '0') }];
    }
  }

  //생산결과등록 및 입고요청(수정버튼)
  /*async modiList() {
    let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");

    if (await confirm("수정하시겠습니까 ? ", "알림")) {


      var zmmt1310List: ZMMT1310Model[] = [];


      var array = this.productGrid.instance.getSelectedRowsData()[0];

      zmmt1310List.push(new ZMMT1310Model(array.MANDT, array.EBELN, array.EBELP, array.LIFNR, array.MATNR, array.TXZ01, array.MEINS, "00",
        array.PRD_P_MENGE, array.PRD_P_MENGE_MT, array.PRD_P_DATE, array.PRD_P_NAME, array.PRD_P_DEPT_NAME, array.PRD_P_DATE_RFR,
        array.PRD_P_DATE_RTO, array.PRD_TYPE, array.PRD_TEXT, array.PRD_P_ACPT_DATE, array.PRD_P_ACPT_NAME, array.PRD_PI_MENGE,
        array.PRD_PI_MENGE_MT, array.PRD_PI_DATE ?? new Date("0001-01-01"), array.PRD_G_MENGE, array.PRD_G_DATE ?? new Date("0001-01-01"), array.PRD_G_NAME, array.PRD_A_MENGE,
        array.PRD_A_MENGE_MT, array.PRD_A_DATE ?? new Date("0001-01-01"), array.PRD_A_NAME, array.MBLNR, array.MJAHR, array.ZEILE, array.MBLNR_C,
        array.MJAHR_C, array.ZEILE_C, array.ERNAM, array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify));

      var rowCount1 = await this.dataService.ModifyModelData<ZMMT1310Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1310ModelList", zmmt1310List);
    }

    this.dataLoad(this.iminfo, this.dataService, this);


  }*/

  //생산결과등록 및 입고요청(삭제버튼)
  async deleteList() {
    let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");

    var select30Model = this.registGrid.instance.getSelectedRowsData()[0];
    var select30ModelCnt = this.registGrid.instance.getSelectedRowsData().length;

    if (select30ModelCnt == 0) {
      alert("삭제하려는 생산결과를 선택해주세요.", "알림")
      return;
    }
    if (select30Model.PRD_A_MENGE ?? 0 > 0) {
      alert("이미 입고되어 삭제가 불가능합니다.", "알림");
      return;
    }
    if (select30Model.PRD_A_DATE != null) {
      alert("이미 입고되어 삭제가 불가능합니다.", "알림");
      return;
    }
    if (select30Model.PRD_A_NAME !== "") {
      alert("이미 입고되어 삭제가 불가능합니다.", "알림");
      return;
    }

    if (await confirm("삭제하시겠습니까 ? ", "알림")) {
      var zmmt1330List: ZMMT1330Model[] = [];
      zmmt1330List.push(new ZMMT1330Model(this.appConfig.mandt, select30Model.EBELN, select30Model.EBELP, select30Model.SEQ, select30Model.LIFNR, select30Model.MATNR, select30Model.TXZ01, select30Model.MEINS, select30Model.PRD_PI_MENGE,
        select30Model.PRD_PI_MENGE_MT, new Date("0001-01-01"), 0, new Date("0001-01-01"),
        select30Model.PRD_G_NAME, select30Model.PRD_A_MENGE, select30Model.PRD_A_MENGE_MT, select30Model.PRD_A_DATE ?? new Date("0001-01-01"), select30Model.PRD_A_NAME, select30Model.MBLNR,
        select30Model.MJAHR, select30Model.ZEILE, select30Model.MBLNR_C, select30Model.MJAHR_C, select30Model.ZEILE_C, select30Model.ERNAM, select30Model.ERDAT ?? new Date("0001-01-01"), select30Model.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Delete));

      var rowCount1 = await this.dataService.ModifyModelData<ZMMT1330Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1330ModelList", zmmt1330List);


      this.loadingVisible = true;
      var resultModel = await this.datainsert(this);
      this.loadingVisible = false;

      resultModel.forEach((array: any) => {
        if (array.PRD_PI_DATE != null) {
          array.DATA_DATE = array.PRD_PI_DATE;
        } else if (array.PRD_G_DATE != null) {
          array.DATA_DATE = array.PRD_G_DATE;
        }

      });

      this.ReceivingList = new ArrayStore(
        {
          key: ["SEQ"],
          data: resultModel
        });

      //삭제 후 생산량,입고요청량 업데이트
      var zmmt1310List: ZMMT1310Model[] = [];

      var piMsum = 0;
      var gMsum = 0;
      var lastDate = new Date("0001-01-01"); //생산일자
      var lastDate2 = new Date("0001-01-01"); //요청일자

      let formatDate12 = new Date("0001-01-01");

      resultModel.forEach(async (array: any) => {
        piMsum = piMsum + parseInt(array.PRD_PI_MENGE);
        gMsum = gMsum + parseInt(array.PRD_G_MENGE);
        var nowDate = new Date((array.DATA_DATE ?? "0001-01-01").substring(0, 10));
        if (array.PRD_PI_MENGE > 0) {
          if (lastDate < nowDate) {
            lastDate = nowDate
          }
        }
        if (array.PRD_G_MENGE > 0) {
          if (lastDate2 < nowDate) {
            lastDate2 = nowDate
          }
        }
      });
      var array = this.productGrid.instance.getSelectedRowsData()[0];

      zmmt1310List.push(new ZMMT1310Model(array.MANDT, array.EBELN, array.EBELP, array.LIFNR, array.MATNR, array.TXZ01, array.MEINS, resultModel.length>0 ? "20" : "10",
        array.PRD_P_MENGE, array.PRD_P_MENGE_MT, array.PRD_P_DATE, array.PRD_P_NAME, array.PRD_P_DEPT_NAME, array.PRD_P_DATE_RFR,
        array.PRD_P_DATE_RTO, array.PRD_TYPE, array.PRD_TEXT, array.PRD_P_ACPT_DATE, array.PRD_P_ACPT_NAME, piMsum,
        array.PRD_PI_MENGE_MT, piMsum === 0 ? formatDate12 : lastDate, gMsum, gMsum === 0 ? formatDate12 : lastDate2, "세기", array.PRD_A_MENGE,
        array.PRD_A_MENGE_MT, array.PRD_A_DATE ?? new Date("0001-01-01"), array.PRD_A_NAME, array.MBLNR, array.MJAHR, array.ZEILE, array.MBLNR_C,
        array.MJAHR_C, array.ZEILE_C, array.ERNAM, array.ERDAT ?? new Date("0001-01-01"), array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify));

      var rowCount1 = await this.dataService.ModifyModelData<ZMMT1310Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1310ModelList", zmmt1310List);

      //31지우기

      var result31Model = await this.dataService.SelectModelData<ZMMT1331Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1331ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND EBELN = '${array.EBELN}' AND EBELP = '${array.EBELP}' AND SEQ = '${this.registGrid.instance.getSelectedRowsData()[0].SEQ}'`, "", QueryCacheType.None);

      if (result31Model.length > 0) {
        result31Model.forEach((array: any) => {
          array.ModelStatus = DIMModelStatus.Delete;
        });


        var resultCount = await this.dataService.ModifyModelData<ZMMT1331Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1331ModelList", result31Model);


        var sumModel = await this.dataService.SelectModelData<ZMMT1331GroupByModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1331GroupByList", [this.appConfig.mandt, array.EBELN, array.EBELP],
          "", "", QueryCacheType.None);

        var result11Model = await this.dataService.SelectModelData<ZMMT1311Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1311ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND EBELN = '${array.EBELN}' AND EBELP = ${array.EBELP}`, "", QueryCacheType.None);

        var zmmt1311List: ZMMT1311Model[] = []

        result11Model.forEach((array: any) => { 
          var mappingData = sumModel.find(obj => obj.RSPOS == array.RSPOS && obj.MATNR == array.MATNR);

          if (mappingData != undefined) {
            zmmt1311List.push(new ZMMT1311Model(array.MANDT, array.EBELN, array.EBELP, array.RSPOS, array.MATNR, array.MAKTX, array.MEINS, array.BDMNG,
              mappingData.SUM_BDMNG_P, array.BDMNG_A, array.MENGE, array.RSNUM, array.ERNAM, array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify))
          }
          else {
            zmmt1311List.push(new ZMMT1311Model(array.MANDT, array.EBELN, array.EBELP, array.RSPOS, array.MATNR, array.MAKTX, array.MEINS, array.BDMNG,
              0, array.BDMNG_A, array.MENGE, array.RSNUM, array.ERNAM, array.ERDAT, array.ERZET, this.appConfig.interfaceId, new Date(), nowTime, DIMModelStatus.Modify))
          }
        });
        var resultCount2 = await this.dataService.ModifyModelData<ZMMT1311Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1311ModelList", zmmt1311List);

      }

      var newData = await this.dataLoad(this.iminfo, this.dataService, this);

      this.saveData = [];

      var selectKey = this.productGrid.instance.getSelectedRowsData()[0];
      var findData = newData.find(obj => obj.EBELN == selectKey.EBELN);
      this.popupData = [findData];

      alert("삭제되었습니다.", "알림");
    }
  }

  selectionChanged(data: any) {
    this.selectedItemKeys = data.currentSelectedRowKeys;
    if (this.productGrid.instance.getSelectedRowsData().length > 0) {
      this.chDisabled = false;
    } else {
      this.chDisabled = true;
    }
    /*//납품완료 상태확인
    var selectData: Array<any> = this.productGrid.instance.getSelectedRowsData();
  
    var findData = selectData.findIndex(array => array.PRD_STATUS === "30");
    if (findData > 0) {
      alert("이미 납품완료된 건은 지시할수 없습니다.", "알림");
      this.chDisabled = true;
      return;
    } else {
      this.chDisabled = false;
    }*/
  }
  insertPopup(e: any) {
    var select30ModelCnt = this.registGrid.instance.getSelectedRowsData().length;
    var select30Model = this.registGrid.instance.getSelectedRowsData()[0];

    this.registGrid.instance.closeEditCell();

    if (select30ModelCnt == 0) {
      alert("생산결과를 선택해주세요.", "알림")
      return;
    }
    if (parseInt(select30Model.PRD_G_MENGE) > 0) {
      this.companyGrid.instance.clearFilter();
      this.companyGrid.instance.clearSorting();

      this.formancepopupVisible = !this.formancepopupVisible;
      this.dataLoad2(this.iminfo, this.dataService, this, select30Model);
    } else {

      alert("입고요청량이 0 입니다.", "알림");
      return;
    }
  }

  onCodeChanged(e: any) {
    this.dataLoad(this.iminfo, this.dataService, this);
  }

  onApply() {

    this.CompanyList._array.forEach((array: any) => {
      var index = this.saveData.findIndex(obj => obj.MANDT == array.MANDT && obj.EBELN == array.EBELN && obj.EBELP == array.EBELP && obj.SEQ == array.SEQ && obj.RSPOS == array.RSPOS);

      if (index >= 0) {
        Object.assign(this.saveData[index], { BDMNG_P: array.BDMNG_P });
      } else {
        if (array.FLAG == "") {
          this.saveData.push(array);
        } else {
          this.saveData.push(Object.assign(array, { FLAG: "U" }));
        }
      }
    });
    /*
      if (array.FLAG == "") {
        var index = this.saveData.findIndex(obj => obj.MANDT == array.MANDT && obj.EBELN == array.EBELN && obj.EBELP == array.EBELP && obj.SEQ == array.SEQ && obj.RSPOS == array.RSPOS);
  
        if (index < 0) {
          this.saveData.push(array);
        }
      }
    });*/
  }
} 
