import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Output, Input } from '@angular/core';
import 'devextreme/data/odata/store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';

import { Observable, Subscription } from 'rxjs';
import { CasResult, NbpAgentservice } from '../../../shared/services/nbp.agent.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { DxDataGridComponent, DxDateBoxComponent, DxFormComponent, DxNumberBoxComponent } from 'devextreme-angular';
import { CommonCodeInfo, nbpAlret, ParameterDictionary, TableCodeInfo } from '../../../shared/app.utilitys';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { formatDate } from '@angular/common';
import { DxiItemComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';
import { Router } from '@angular/router';
import { alert, confirm } from "devextreme/ui/dialog";
import { Service, Data } from '../PGWI/app.service';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import dxDateBox from 'devextreme/ui/date_box';
import { ZMMFROMGWGrirModel, ZMMS9900Model, ZMMS0210Model } from '../../../shared/dataModel/MLOGP/ZmmFromGwGrir';
import { ZMMT3050Model } from '../../../shared/dataModel/MLOGP/Zmmt3050';
import { ZMMT3051Model } from '../../../shared/dataModel/MLOGP/Zmmt3051';
import { ZSDIFPORTALSAPLELIQSndModel, ZSDS6430Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqSnd';
import { ZSDIFPORTALSAPLE028SndModel, ZSDS6410Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Snd';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import notify from 'devextreme/ui/notify';
import { emitWarning } from 'process';
import { CarList } from '../SHPC/app.service';
import { ZMMT1321Join1320Model } from '../../../shared/dataModel/MLOGP/Zmmt1320Join1321';
import { ZSDIFPORTALSAPLE028RcvModel, ZSDS6420Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Rcv';
import { ZMMT1321Model } from '../../../shared/dataModel/MLOGP/Zmmt1321';




/**
 *
 * 석고 공차/중량계근I/F component
 * */


@Component({
  templateUrl: 'pgwi.component.html',
  styleUrls: ['./pgwi.component.scss'],
  providers: [ImateDataService, Service]
})

export class PGWIComponent {
  @ViewChild('subdataGrid', { static: false }) subdataGrid!: DxDataGridComponent;
  @ViewChild('maindataGrid', { static: false }) maindataGrid!: DxDataGridComponent;
  @ViewChild('carDataGrid', { static: false }) carDataGrid!: DxDataGridComponent;
  @ViewChild('orderDataGrid', { static: false }) orderDataGrid!: DxDataGridComponent;
  @ViewChild('datebox', { static: false }) datebox!: DxDateBoxComponent;
  @ViewChild('weightform', { static: false }) weightform!: DxFormComponent;
  @ViewChild('numberbox', { static: false }) numberbox!: DxNumberBoxComponent;
  @ViewChild('testBox', { static: false }) testBox!: DxiItemComponent;
  @ViewChild('masterform', { static: false }) masterform!: DxFormComponent;
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;

  /**
* 데이터 스토어 키
* */
  dataStoreKey: string = "pgwi";
  showDataLoadingPanel = false;
  orderData: any;
  /* Entry  선언 */
  //차량번호
  carDataCode: TableCodeInfo;
  carDataValue!: string | null;

  //메인 데이터
  mainData: any;
  subData: any;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  //남우진흥 거래명세서 로딩 창
  saveLoadingVisible: boolean = false;

  /* 폼 데이터 */
  //입고 저장
  weightEnterRegister: any;
  weightOutRegister: any;
  weightStatementOutput: any;
  // 폼데이터
  weightStartData: any = {};
  weightData: any = {};

  /* 계근 */
  //무게 정보
  weight: number = 0;
  //상태 Observer
  private casObserver$: Observable<CasResult[]> | null = null;
  //상태 구독
  private casSubscription$: Subscription | null = null;

  /* 날짜 */
  //날짜 조회
  startDate: any;
  nowDate: any;
  now1Date: any;
  yesterDate: any;
  endDate: any;
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);


  /* 줄 선택 */
  //delete
  selectedItemKeys: any[] = [];
  selectedRowIndex = -1;
  selectGridData: any;

  //주문선택키
  selectedSOItemKeys: any[] = [];

  CarNmList: CarList[] = [];

  /* 메인 화면 */
  //필터
  customOperations!: Array<any>;
  saleAmountHeaderFilter: any;
  popupPosition: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //버튼 이벤트
  inProgress: boolean;
  buttonText = '수동 등록';
  zmms0210: ZMMS0210Model;
  orderGridData: ZSDS6430Model[] = [];
  order028GridData: ZSDS6410Model[] = [];
  zmmt3050: ZMMT3050Model;
  zmmt3051: ZMMT3051Model[];
  carData: any;
  PopupVisible = false;   //화학출하지시팝업
  CloseButtonOptions: any;
  //클릭 금지
  disable: any;
  /**
* 생성자
* @param appConfig 앱 수정 정보
* @param nbpAgetService nbpAgent Service
* @param authService 사용자 인증 서버스
*/
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private nbpAgetService: NbpAgentservice, private httpClient: HttpClient, service: Service, private appInfo: AppInfoService, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 정문 출고 공차/중량계근I/F";
    //this._dataService = dataService;
    var now = new Date();
    this.runMonitoring();
    this.startDate = formatDate(now.setDate(new Date().getDate() - 30), "yyyy-MM-dd", "en-US");
    this.nowDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.now1Date = formatDate(new Date(), "yyyyMMdd", "en-US")
    var now = new Date();
    this.yesterDate = formatDate(now.setDate(new Date().getDate() - 1), "yyyyMMdd", "en-US");

    this.dataLoad(this.dataService, this);
    setTimeout(() => {
      this.carDataLoad(this.dataService, this);
    }, 500);

    //1시간 마다 재시작 자동 재시작
    setInterval(() => {
      try {
        console.log("전자저울 모니터링 재시작");
        this.resetMonitory();
      }
      catch (err) {
        console.log("재시작 오류:" + err);
      }
    }, 3600000);


    const that = this;

    this.zmms0210 = new ZMMS0210Model("", new Date(), "", "", "", "", "", "", "", 0, "", "", "", "", "", "","","", DIMModelStatus.Add);
    //--------------------파서블 엔트리-------------------//
    //파서블엔트리
    this.carDataCode = appConfig.tableCode("종합차량");
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.carDataCode),

    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    this.carDataValue = "";
    //계근 중량 가리기

    this.inProgress = true;
    this.disable = true;

    //차량데이터 가져오기
    this.getCarNm();

    this.weightStartData.ZGW_ATGEW = 0;
    this.weightStartData.GEWEI = "KG";
    this.weightData.STATUS = "계근 입력 상태";

    this.disable = true;
    //--------------------팝업이벤트-------------------//
    //유류팝업닫기버튼
    this.CloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.PopupVisible = false;
      }
    }
    //입고 저장 버튼
    this.weightEnterRegister = {
      text: '저장',
      useSubmitBehavior: true,
      onClick: async (e: any) => {
        let result = e.validationGroup.validate();
        let formresult = this.masterform.instance.validate();
        var userInfo = this.authService.getUser().data;

        if (this.weightStartData.ZGW_ATGEW == 0 || this.weightStartData.ZGW_ATGEW < 0) {
          alert("계근 중량을 확인하세요.", "알림");
          return;
        }
        //필수값을 입력 안했을 때
        if (!formresult.isValid || !result.isValid) {
          alert("저장을 하시려면 <br> 필수값을 입력해주세요.", "알림");
          return;

        } else {
          if (await confirm("저장하시겠습니까?", "알림")) {
            this.loadingVisible = true;
            this.datainsert(this)
            alert("저장이 되었습니다.", "알림");
            this.masterform.instance.resetValues();
            var status = ""
            if (this.inProgress) {
              status = "계근 입력 상태"
            } else {
              status = "수동 입력 상태"

            }
            setTimeout(() => {
              this.weightStartData = { ZGW_ATGEW: 0, GEWEI: "KG", STATUS: status, ZGW_PER1: userInfo?.userName }
            });
            this.loadingVisible = false;

          }
        }
        this.dataLoad(this.dataService, this);
        this.orderdataLoad(this.dataService, this);
        this.carDataLoad(this.dataService, this);

      },

    };

  }

  //--------------------데이터로드-------------------//
  //데이터로드
  public async dataLoad(dataService: ImateDataService, thisObj: PGWIComponent) {
    var date = formatDate(this.now, "yyyyMMdd", "en-US")
    var userInfo = this.authService.getUser().data;
    Object.assign(this.weightStartData, { ZGW_PER1: userInfo?.userName, ZGW_PER2: userInfo?.userName });
    var resultModel = await dataService.SelectModelData<ZMMT3050Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3050ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND ZGW_GUBUN = 'G' AND ZGW_DATE = ${date}`, "", QueryCacheType.None);
    if (resultModel.length > 0) {
      resultModel.forEach(async (array: any) => {
        if (array.ZGW_GRIR_GUBUN == "GR") {
          array.ZGW_GRIR_GUBUN = "입고"
        } else {
          array.ZGW_GRIR_GUBUN = "출고"

        }
      });
    }
    this.mainData = new ArrayStore(
      {
        key: ["ZGW_DATE", "ZGW_SEQ"],
        data: resultModel,
        //onLoaded: function () {
        //  this.selectedRows = { ZGW_DATE: resultModel[0].ZGW_DATE, ZGW_SEQ: resultModel[0].ZGW_SEQ };
        //}
      });
    this.maindataGrid.instance.getScrollable().scrollTo(0);

    return resultModel;
  }

  //서브데이터로드
  public async subdataLoad() {
    this.subData = [];
    var now = new Date();
    var nowDate = formatDate(new Date(), "yyyyMMdd", "en-US")
    //this.carDataValue ?? ""
    this.loadingVisible = true;
    var zsds6430: ZSDS6430Model[] = [];
    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", "", "", "", new Date("0001-01-01"), new Date("0001-01-01"), "", "", "", "X", "", "", this.carDataValue ?? "", "", "30", zsds6430, this.startDate, this.nowDate);
    if (this.carDataValue == undefined || this.carDataValue == "" || this.carDataValue == null) {
      return;
    }
    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);
    this.orderGridData = resultModel[0].IT_DATA;

    var whereCondi = " AND B.ZSHIP_STATUS = '30'";

    var imOrderList = await this.dataService.SelectModelData<ZMMT1321Join1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321Join1320CustomList",
      [this.appConfig.mandt, this.appConfig.plant, this.carDataValue ?? "", whereCondi],
      "", "A.VBELN, B.POSNR", QueryCacheType.None);

    imOrderList.forEach(async (row: ZMMT1321Join1320Model) => {
      this.orderGridData.push(new ZSDS6430Model(row.VBELN, row.POSNR == "" ? "000000" : row.POSNR, "", "", "", "", "", "", row.SC_R_DATE_R, row.IDNRK, row.MAKTX,
        row.SC_R_MENGE, row.SC_L_MENGE, row.MEINS, "9999", row.SC_S_MENGE, row.SC_G_MENGE, row.SC_G_DATE, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "",
        "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2, row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO,
        row.SC_S_DATE, 0, "", "", "", "", "", "", "", "", row.BLAND_F_NM, "", "", row.BLAND_T_NM));
    })

    this.loadingVisible = false;


    //this.loadingVisible = true;
    //var zsdsList: ZSDS6410Model[] = [];
    //var snd028model = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "", "", now, now,"", "", "", "", "", "","", zsdsList);
    //var modelList: ZSDIFPORTALSAPLE028SndModel[] = [snd028model];
    //var resultsOilModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", modelList, QueryCacheType.None);
    //this.order028GridData = resultsOilModel[0].IT_DATA;
    //this.loadingVisible = false;

    //resultsOilModel[0].IT_DATA.forEach(async (row: ZSDS6410Model) => {
    //  this.orderGridData.push(new ZSDS6430Model(row.VBELN, row.POSNR, row.ZSEQUENCY, row.KZPOD, row.VGBEL, row.VGPOS, row.INCO1, row.VSBED, row.TDDAT, row.MATNR, row.ARKTX,
    //    row.ZMENGE1, row.ZMENGE2, row.VRKME, row.VSTEL, row.ZMENGE4, row.ZMENGE3, row.WADAT_IST, row.BRGEW, row.GEWEI, row.LGORT, row.ZLGORT, row.KUNNR, row.NAME1, row.CITY,
    //    row.STREET, row.TELF1, row.MOBILENO, row.KUNAG, row.NAME1_AG, row.SPART, row.WERKS, row.LFART, row.Z3PARVW, row.Z4PARVW, row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, row.ZDRIVER1,
    //    row.ZPHONE, row.ZPHONE1, row.ZVKAUS, row.ZUNLOAD, row.ZSHIPSTATUS, row.ZSHIPMENT_DATE, row.ZCONFIRM_CUT, "", row.ZTEXT, "", ""));
    //});

    this.loadingVisible = true;
    this.subData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: this.orderGridData
      });
    this.subdataGrid.instance.getScrollable().scrollTo(0);

    this.loadingVisible = false;
  }

  //이력데이터로드
  public async orderdataLoad(dataService: ImateDataService, thisObj: PGWIComponent) {


    var result3051Model = await dataService.SelectModelData<ZMMT3051Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3051ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND ZGW_DATE = ${this.now1Date}`, "ZGW_TIME DESC", QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["ZGW_DATE", "ZGW_TIME"],
        data: result3051Model
      });
    this.orderDataGrid.instance.getScrollable().scrollTo(0);
  }
  //이력데이터로드
  public async carDataLoad(dataService: ImateDataService, thisObj: PGWIComponent) {
    var resultNewData = await dataService.SelectModelData<ZMMT3051Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3051ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND ZGW_DATE >= ${this.yesterDate} AND ZGW_DATE <= ${this.now1Date}`, "ZGW_DATE DESC, ZGW_TIME DESC", QueryCacheType.None);

    var pushData = [];

    resultNewData.forEach(async (obj: ZMMT3051Model) => {
      this.zmmt3051 = resultNewData.filter(item => item.ZCARNO == obj.ZCARNO)
      if (this.zmmt3051.length % 2 == 1) {
        if (pushData.findIndex(arraay => arraay.ZCARNO == obj.ZCARNO) < 0) {
          pushData.push(obj);
        }
      }
    })

    this.carData = new ArrayStore(
      {
        key: ["ZGW_DATE", "ZGW_TIME"],
        data: pushData
      });
    this.carDataGrid.instance.getScrollable().scrollTo(0);
  }
  // 데이터 저장
  public async datainsert(thisObj: PGWIComponent) {
    try {
      let now = new Date();
      let nowTime = formatDate(new Date(), 'HH:mm:ss', "en-US");
      var selectedData = [];
      var carSelectedData = [];

      selectedData = this.subdataGrid.instance.getSelectedRowsData();
      //carSelectedData = this.carDataGrid.instance.getSelectedRowsData();

      var vgbel = "";
      var shipment = "";
      var vbeln = "";
      var matnr = "";
      var lifnr = "";
      var posnr = "";
      var zmms9900Model = new ZMMS9900Model("", "");

      var zmms0210Model: ZMMS0210Model[] = [];

      if (selectedData.length > 0) {
        vgbel = selectedData[0].VGBEL
      }
      //else {
      //  vgbel = carSelectedData[0].ZGW_ORDNO
      //}
      if (selectedData.length > 0) {
        shipment = selectedData[0].ZSHIPMENT_NO
      }
      //else {
      //  shipment = carSelectedData[0].ZGW_SHIPNO

      //}
      if (selectedData.length > 0) {
        vbeln = selectedData[0].VBELN;
      }

      if (selectedData.length > 0) {
        posnr = selectedData[0].POSNR;
      }

      //else {
      //  vbeln = carSelectedData[0].ZGW_DONO;
      //}
      if (selectedData.length > 0) {
        matnr = selectedData[0].MATNR;
      }
      if (selectedData.length > 0) {
        lifnr = selectedData[0].KUNNR;
      }
      zmms0210Model.push(new ZMMS0210Model("G", now, nowTime, thisObj.weightStartData.ZCARNO, thisObj.weightStartData.ZDRIVER, thisObj.weightStartData.ZGW_MATNR,
        thisObj.weightStartData.ZGW_MAKTX ?? "", thisObj.weightStartData.ZGW_LIFNR, thisObj.weightStartData.ZGW_NAME1 ?? "", thisObj.weightStartData.ZGW_ATGEW,
        thisObj.weightStartData.GEWEI, thisObj.weightStartData.ZGW_PER1, thisObj.weightStartData.ZGW_PER2, vgbel, shipment, vbeln, matnr, lifnr, posnr, DIMModelStatus.Add));

      var zmmfromgwgrirModel = new ZMMFROMGWGrirModel(zmms9900Model, zmms0210Model);
      var modelList: ZMMFROMGWGrirModel[] = [zmmfromgwgrirModel];

      var insertModel = await this.dataService.RefcCallUsingModel<ZMMFROMGWGrirModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMFROMGWGrirModelList", modelList, QueryCacheType.None);
      this.dataLoad(this.dataService, this);
      this.orderdataLoad(this.dataService, this);
      this.carDataLoad(this.dataService, this);
      this.subdataLoad();
      return insertModel[0];

    }
    catch (error: any) {
      alert("저장이 실패했습니다.", " 오류");
      return null;
    }

  }
  //--------------------메인-------------------//
  //조회 클릭
  public refreshDataGrid(e: Object) {
    this.dataLoad(this.dataService, this);
    this.orderdataLoad(this.dataService, this);
    this.carDataLoad(this.dataService, this);

    if (this.carDataValue !== "")
      this.subdataLoad();

    this.now = new Date();
    this.weightStartData.ZGW_GI_TIME = new Date();

  }
  carCheck() {
    this.PopupVisible = true;
    this.orderdataLoad(this.dataService, this);
  }
  //수동등록 클릭
  manualRegis = (e: any) => {
    setTimeout(() => {

      if (this.inProgress) {
        this.testBox.editorOptions = { disabled: false };
        this.buttonText = '계근 등록';
        this.weightData.STATUS = "수동 입력 상태";
        this.stopMonitoring()
      } else {
        this.testBox.editorOptions = { disabled: true };
        this.buttonText = '수동 등록';
        this.weightData.STATUS = "계근 입력 상태";
        this.runMonitoring()
      }
      this.inProgress = !this.inProgress;
    });
    this.weightform.instance.repaint();
  }
  //반출증 클릭
  takeOutSpecific() {
    let selectData = this.maindataGrid.instance.getSelectedRowsData()[0];
    /*let selectData = this.orderGrid.instance.getSelectedRowsData()[0];*/
    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "mandt": this.appConfig.mandt,
      "izgwGubun": "G",
      "izgwSeq": selectData.ZGW_SEQ,
      "izgwDate": selectData.ZGW_DATE
    };

    setTimeout(() => { this.reportViewer.printReport("Discharge", params) });
  }

  //남우진흥거래명세서 클릭
  async printNamwooGI() {
    this.saveLoadingVisible = true;
    let selectData = this.maindataGrid.instance.getSelectedRowsData()[0];

    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }

    //var result = await this.datainsert(this);
    //if (result === null)
    //  return;
    var sVBELN = selectData.ZGW_DONO;
    var sVSTEL = "";
    var sPOSNR = selectData.POSNR;
    var imOrderList: ZMMT1321Join1320Model[] = []
    if (selectData.ZGW_DONO.toString().substring(0, 2) !== "00")
      sVSTEL = "9999";

    if (selectData.ZGW_DONO === "") {
      await alert("출고정보가 없는 계근정보입니다.", "알림");
      this.saveLoadingVisible = false;
      return;
    }

      //var realCarno = "";
      //var realCarData = this.CarNmList.find(item => item.ZCARNO.includes(selectData.ZCARNO));
      //if (realCarData === undefined)
      //  realCarno = selectData.ZCARNO;
      //else
      //  realCarno = realCarData.ZCARNO;

      //this.loadingVisible = true;
      //var zsds6430: ZSDS6430Model[] = [];
      //var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", "", "", "", new Date("0001-01-01"), new Date("0001-01-01"), "", "", "", "", "", "", realCarno, "", "", zsds6430, this.startDate, this.nowDate);
      //var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];
      //var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);
      //if (resultModel[0].IT_DATA.length === 0) {

      //  var whereCondi = "";

      //  //일반주문 없을경우 임가공 정보 찾기
      //  imOrderList = await this.dataService.SelectModelData<ZMMT1321Join1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321Join1320CustomList",
      //    [this.appConfig.mandt, this.appConfig.plant, this.now1Date, realCarno, whereCondi],
      //    "", "A.VBELN", QueryCacheType.None);

      //  if (imOrderList.length === 0) {
      //    await alert("선택한 차량에 해당하는 출고정보가 없습니다.", "알림");
      //    this.loadingVisible = false;
      //    return;
      //  } else {
      //    sVBELN = imOrderList[0].VBELN;
      //    sPOSNR = imOrderList[0].POSNR;
      //    sVSTEL = "9999";
      //  }

      //} else {
      //  sVBELN = resultModel[0].IT_DATA[0].VBELN;
      //  sVSTEL = resultModel[0].IT_DATA[0].VSTEL;
      //  sPOSNR = "000010";
      //}


    /*this.saveLoadingVisible = false;*/

    if (sVSTEL === "9999") {
      var whereCondi = ` AND A.VBELN = '${selectData.ZGW_DONO}' AND B.POSNR = '${sPOSNR}' AND B.ZSHIP_STATUS = '30'`;
      imOrderList = await this.dataService.SelectModelData<ZMMT1321Join1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321Join1320CustomList",
        [this.appConfig.mandt, this.appConfig.plant, selectData.ZCARNO ?? "", whereCondi],
        "", "A.VBELN, B.POSNR", QueryCacheType.None);

      if (imOrderList.length > 0) {
        sVBELN = imOrderList[0].VBELN;
        sPOSNR = imOrderList[0].POSNR;

        var zmmt1321List: ZMMT1321Model[] = [];
        zmmt1321List.push(new ZMMT1321Model(this.appConfig.mandt, imOrderList[0].VBELN, imOrderList[0].POSNR, imOrderList[0].WERKS, imOrderList[0].LIFNR,
          imOrderList[0].IDNRK, imOrderList[0].LGORT, imOrderList[0].BWART
          , imOrderList[0].MEINS, imOrderList[0].SC_R_MENGE, imOrderList[0].SC_R_DATE_R, imOrderList[0].INCO1, imOrderList[0].TDLNR1, imOrderList[0].TDLNR2,
          imOrderList[0].ZCARTYPE, imOrderList[0].ZCARNO, imOrderList[0].ZDRIVER, imOrderList[0].ZPHONE
          , "40", imOrderList[0].ZSHIPMENT_NO, imOrderList[0].BLAND_F, imOrderList[0].BLAND_F_NM, imOrderList[0].BLAND_T, imOrderList[0].BLAND_T_NM,
          imOrderList[0].SC_S_MENGE, imOrderList[0].SC_S_DATE ?? new Date("0001-01-01")
          , selectData.ZGW_ATGEW / 1000, selectData.ZGW_DATE, "000000", imOrderList[0].ZPOST_RUN_MESSAGE, 0, new Date("0001-01-01"), "000000", "", imOrderList[0].MBLNR,
          imOrderList[0].MJAHR, imOrderList[0].MBLNR_C, imOrderList[0].MJAHR_C
          , imOrderList[0].WAERS, imOrderList[0].NETPR, imOrderList[0].DMBTR, imOrderList[0].BUKRS, imOrderList[0].BELNR, imOrderList[0].GJAHR,
          imOrderList[0].BUDAT ?? new Date("0001-01-01"), imOrderList[0].UNIQUEID, imOrderList[0].ERNAM
          , imOrderList[0].ERDAT, imOrderList[0].ERZET, this.appConfig.interfaceId, new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), "", "",
          DIMModelStatus.Modify))

        var rowCount = await this.dataService.ModifyModelData<ZMMT1321Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321ModelList", zmmt1321List);
      }
    } else {
      var zsds6410: ZSDS6410Model[] = [];
      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "", "", new Date("0001-01-01"), new Date("0001-01-01"), sVBELN, "", "", "X", "", "", "", "", "30", zsds6410, new Date("0001-01-01"), new Date("0001-01-01"));
      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);
      if (resultModel[0].IT_DATA.length > 0) {
        var zsds6420Model = new ZSDS6420Model(resultModel[0].IT_DATA[0].VBELN, resultModel[0].IT_DATA[0].POSNR, resultModel[0].IT_DATA[0].ZSEQUENCY,
          resultModel[0].IT_DATA[0].VRKME, resultModel[0].IT_DATA[0].ZMENGE4,
          selectData.ZGW_ATGEW / 1000, selectData.ZGW_DATE, resultModel[0].IT_DATA[0].Z3PARVW, resultModel[0].IT_DATA[0].Z4PARVW,
          resultModel[0].IT_DATA[0].ZCARTYPE, resultModel[0].IT_DATA[0].ZCARNO, resultModel[0].IT_DATA[0].ZDRIVER, resultModel[0].IT_DATA[0].ZDRIVER1,
          resultModel[0].IT_DATA[0].ZPHONE, resultModel[0].IT_DATA[0].ZPHONE1, resultModel[0].IT_DATA[0].ZVKAUS, resultModel[0].IT_DATA[0].ZUNLOAD, "40",
          resultModel[0].IT_DATA[0].ZSHIPMENT_NO, resultModel[0].IT_DATA[0].ZSHIPMENT_DATE, resultModel[0].IT_DATA[0].ZPALLTP, resultModel[0].IT_DATA[0].ZPALLETQTY,
          resultModel[0].IT_DATA[0].ZCONFIRM_CUT, resultModel[0].IT_DATA[0].ZTEXT, resultModel[0].IT_DATA[0].MTY, resultModel[0].IT_DATA[0].MSG);

        var zsds6420List: ZSDS6420Model[] = [zsds6420Model];
        var zsdModel = new ZSDIFPORTALSAPLE028RcvModel("", "", zsds6420List);
        var zsdList: ZSDIFPORTALSAPLE028RcvModel[] = [zsdModel];


        var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028RcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028RcvModelList", zsdList, QueryCacheType.None);
      }
    }

    this.saveLoadingVisible = false;

    if (sVSTEL === "9999") {
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "mandt": this.appConfig.mandt,
        "ivbeln": sVBELN,
        "iposnr": sPOSNR
      };

      setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction4", params) });
    } else {
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "itddatFrom": selectData.ZGW_DATE,
        "itddatTo": selectData.ZGW_DATE,
        "ivbeln": sVBELN,
        "mandt": this.appConfig.mandt,
        "ivstel": "8888"
      };

      setTimeout(() => { this.reportViewer.printReport("specificationOnTransaction2", params) });
    }

    
  }

  //계량증명서 클릭
  weighingCertificate() {
    let selectData = this.maindataGrid.instance.getSelectedRowsData()[0];
    /*let selectData = this.orderGrid.instance.getSelectedRowsData()[0];*/
    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "mandt": this.appConfig.mandt,
      "izgwGubun": "G",
      "izgwSeq": selectData.ZGW_SEQ,
      "izgwDate": selectData.ZGW_DATE
    };

    if (selectData.ZGW_MATNR == 103 || selectData.ZGW_MAKTX == "불화규산") {
      setTimeout(() => { this.reportViewer.printReport("Discharge_ver2", params) });

    } else {
      setTimeout(() => { this.reportViewer.printReport("WeighingCertificate", params) });
    }  }

  //sub 데이터 그리드 선택이벤트
  selectionChanged(e: any) {
    setTimeout(() => {
      const rowData = e.selectedRowsData[0];

      if (rowData) {
        this.weightStartData.ZCARNO = rowData.ZCARNO;
        this.weightStartData.ZDRIVER = rowData.ZDRIVER;
        this.weightStartData.ZGW_MAKTX = rowData.ARKTX;
        this.weightStartData.ZGW_NAME1 = rowData.NAME1;
        //주문선택 키 
        this.selectedSOItemKeys = e.currentSelectedRowKeys;
      }
    }, 100);

  }
  //선택이벤트
  carSelectionChanged(e: any) {
    setTimeout(() => {
      const rowData = e.selectedRowsData[0];
      if (rowData) {
        this.weightStartData.ZCARNO = rowData.ZCARNO;
        this.weightStartData.ZDRIVER = rowData.ZDRIVER;
        this.weightStartData.ZGW_MAKTX = rowData.ZGW_MAKTX;
        this.weightStartData.ZGW_NAME1 = rowData.ZGW_NAME1;
      }
    });
  }
  //main 데이터 그리드 선택이벤트
  mainselectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }

  /* Entry Data Form에 바인딩 */
  //분할 차량번호 선택이벤트
  onZcarNoCodeValueChanged(e: any) {
    setTimeout(() => {
      this.subdataLoad();
      return;
    });
  }
  //--------------------무게-------------------//

  /**
 * 모니터링 Reset
 * */
  resetMonitory() {
    try {
      this.stopMonitoring();
      this.runMonitoring();
    }
    catch (err) {
      console.error('오류 발생(모니터링 시작): ' + err);
      throw err;
    }
  }

  /**
* RUN MONITOR
**/
  runMonitoring() {
    if (this.casSubscription$ !== undefined && this.casSubscription$ !== null)
      return;

    var thisObj = this;
    //모니터링 시작
    this.casObserver$ = this.nbpAgetService.startCasResultPubulish(500);


    this.casSubscription$ = this.casObserver$.subscribe({
      next(info) {
        if (info.length > 0) {
          var casResult = info[info.length - 1];
          if (casResult.unit == "t")
            thisObj.weightStartData.ZGW_ATGEW = casResult.weight * 1000;
          //if (thisObj.weightStartData.ZGW_ATGEW > 43800) {
          //  notify("계근 중량은 43.8톤을 넘을 수 없습니다.", "warning", 500)
          //  this.closeComClick(event);
          //}
          else
            thisObj.weightStartData.ZGW_ATGEW = casResult.weight;
          //if (thisObj.weightStartData.ZGW_ATGEW > 43800) {
          //  notify("계근 중량은 43.8톤을 넘을 수 없습니다.", "warning", 500)
          //  this.closeComClick(event);
          //}
        }
      },
      error(err) {
        console.log(err);

        nbpAlret("전자저울 자료 앍는중 오류가 발생하여 전자저울 모니터링을 재시작 합니다.", "전자저울 오류");
        try {
          this.resetMonitory()
        }
        catch (err) {
          nbpAlret("전자저울 모니터링을 재시작에 실패했습니다.<br/>프로그램을 종료후 다시 시작 하여 주십시오.", "전자저울 오류");
        }
      },
      complete() { console.log('종료'); }
    });
  }
  //검수출고수량 변경 이벤트
  onZmenge3keyDown(e: any) {
    setTimeout(() => {
      if (this.weightStartData.ZGW_ATGEW > 43800) {
        notify("계근 중량은 43.8톤을 넘을 수 없습니다.", "warning", 3000)
      }
    });
  }
  /**
 * STOP MONITOR
 * */
  stopMonitoring() {
    if (this.casSubscription$ === undefined || this.casSubscription$ === null)
      return;

    this.nbpAgetService.stopCasResultPubulish();

    this.casSubscription$ = null;
    this.casObserver$ = null;
  }
  /**
 * COM PORT 닫기
 * @param e
 */
  /**
 * 모니러링 중지 
 * @param e
 */
  stopMonitorClick(e: any) {
    this.stopMonitoring()
  }
  /**
   * 모니터링 시작 
   * @param e
   */
  startMonitorClick(e: any) {
    this.runMonitoring();
  }
  async closeComClick(e: any) {
    this.stopMonitoring()
    let result = await this.nbpAgetService.casClose();
    if (result !== "ok")
      alert(result!, "알림");
  }
  /**
   * COM PORT 열기
   * @param e
   */
  async openComClick(e: any) {
    this.runMonitoring();
    this.loadingVisible = true;
    let result = await this.nbpAgetService.casOpen();
    if (result !== "ok")
      alert(result!, "알림");
    this.loadingVisible = false;
  }
  //무게 바뀔때
  handleValueChange(e: any) {
    setTimeout(() => {
      this.weightStartData.GEWEI = e.value;
      return;
    });
  }

  //차량정보 찾기
  async getCarNm() {
    let chemCarSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.carDataCode);
    this.CarNmList = chemCarSet?.tables["CODES"].getDataObject(CarList);
  }
}
