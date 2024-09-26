import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Output, Input } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
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
import { Service, Data } from '../OGWI/app.service';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import dxDateBox from 'devextreme/ui/date_box';
import { ZMMFROMGWGrirModel, ZMMS9900Model, ZMMS0210Model } from '../../../shared/dataModel/MLOGP/ZmmFromGwGrir';
import { ZMMT3050Model } from '../../../shared/dataModel/MLOGP/Zmmt3050';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import notify from 'devextreme/ui/notify';
import { ZMMT3051Model } from '../../../shared/dataModel/MLOGP/Zmmt3051';




/**
 *
 * 정문 입고 공차/중량계근I/F component
 * */


@Component({
  templateUrl: 'ogwi.component.html',
  styleUrls: ['./ogwi.component.scss'],
  providers: [ImateDataService, Service]
})

export class OGWIComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('datebox', { static: false }) datebox!: DxDateBoxComponent;
  @ViewChild(DxFormComponent, { static: false }) form!: DxFormComponent;
  @ViewChild('numberbox', { static: false }) numberbox!: DxNumberBoxComponent;
  @ViewChild('testBox', { static: false }) testBox!: DxiItemComponent;
  @ViewChild('masterform', { static: false }) masterform!: DxFormComponent;
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;
  @ViewChild('maindataGrid', { static: false }) maindataGrid!: DxDataGridComponent;
  @ViewChild('carDataGrid', { static: false }) carDataGrid!: DxDataGridComponent;
  @ViewChild('orderDataGrid', { static: false }) orderDataGrid!: DxDataGridComponent;
  @ViewChild('carDataCodeEntery', { static: false }) carDataCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('gwLifnrCodeEntery', { static: false }) gwLifnrCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('gwMatnrCodeEntery', { static: false }) gwMatnrCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('testCodeEntery', { static: false }) testCodeEntery!: DxiItemComponent;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "ogwi";
  showDataLoadingPanel = false;
  //메인 데이터
  mainData: any;
  /* Entry  선언 */
  //차량번호
  carDataCode: TableCodeInfo;
  carDataValue!: string | null;

  //제품명
  gwMatnrCode: CommonCodeInfo
  gwMatnrValue!: string | null;

  //업체명
  gwLifnrCode: CommonCodeInfo
  gwLifnrValue!: string | null;

  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  /* 폼 데이터 */
  //입고 저장
  weightEnterRegister: any;
  weightOutRegister: any;
  weightStatementOutput: any;
  // 폼데이터
  weightStartData: any = {};

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
  endDate: any;
  yesterDate: any;
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  /* 줄 선택 */
  //delete
  selectedItemKeys: any[] = [];
  selectedRowIndex = -1;
  selectGridData: any;
  now1Date: any;                                                  /* 메인 화면 */
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
  zmmt3050: ZMMT3050Model;
  orderData: any;
  //클릭 금지
  disable: any;

  zmmt3051: ZMMT3051Model[];
  carData: any;
  PopupVisible = false;   //화학출하지시팝업
  CloseButtonOptions: any;
  /**
* 생성자
* @param appConfig 앱 수정 정보
* @param nbpAgetService nbpAgent Service
* @param authService 사용자 인증 서버스
*/
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private httpClient: HttpClient, private nbpAgetService: NbpAgentservice, service: Service, private appInfo: AppInfoService, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 정문 입고 공차/중량계근I/F";

    //this._dataService = dataService;
    this.dataLoad(this.dataService, this);
    setTimeout(() => {
      this.carDataLoad(this.dataService, this);
    }, 500);

    //1시간 마다 재시작 자동 재시작
    setInterval(() => {
      try {
        this.resetMonitory();
      }
      catch (err) {
        console.log("재시작 오류:" + err);
      }
    }, 3600000);

    const that = this;
    var now = new Date();
    this.now1Date = formatDate(new Date(), "yyyyMMdd", "en-US")
    this.yesterDate = formatDate(now.setDate(new Date().getDate() - 1), "yyyyMMdd", "en-US");

    this.runMonitoring();
    this.zmms0210 = new ZMMS0210Model("", new Date(), "", "", "", "", "", "", "", 0, "", "", "", "", "", "", "","",DIMModelStatus.Add);
    //--------------------파서블 엔트리-------------------//
    //파서블엔트리
    this.carDataCode = appConfig.tableCode("종합차량");
    this.gwMatnrCode = appConfig.commonCode("정문계근제품");
    this.gwLifnrCode = appConfig.commonCode("정문계근거래처")
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.carDataCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.gwMatnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.gwLifnrCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    this.carDataValue = "";
    this.gwMatnrValue = "";
    this.gwLifnrValue = "";
    //--------------------중량 측정-------------------//
    //중량 계근
    //if (this.casSubscription$ !== undefined && this.casSubscription$ !== null)
    //  return;
    //계근 중량 가리기
    this.inProgress = true;
    this.disable = true;
    //--------------------데이터 디폴트-------------------//

    //데이터디폴트
    this.weightStartData.ZGW_ATGEW = 0;
    this.weightStartData.GEWEI = "KG";
    this.weightStartData.STATUS = "계근 입력 상태";

    //--------------------버튼이벤트-------------------//
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

        //필수값을 입력 안했을 때
        if (this.weightStartData.ZGW_ATGEW == 0 || this.weightStartData.ZGW_ATGEW < 0) {
          alert("계근 중량을 확인하세요.", "알림");
          return;
        }

        if (!formresult.isValid || !result.isValid) {
          alert("저장을 하시려면 <br> 필수값을 입력해주세요.", "알림");
          return;

        } else {
          if (await confirm("저장하시겠습니까?", "알림")) {
            this.loadingVisible = true;
            this.datainsert(this)
            alert("저장이 되었습니다.", "알림");
            this.loadingVisible = false;

            this.carDataCodeEntery.ClearSelectedValue();
            this.gwLifnrCodeEntery.ClearSelectedValue();
            this.gwMatnrCodeEntery.ClearSelectedValue();
            //this.masterform.instance.resetValues();
            //var status = ""
            //if (this.inProgress) {
            //  status = "계근 입력 상태"
            //} else {
            //  status = "수동 입력 상태"

            //}
            //setTimeout(() => {
            //  this.weightStartData = { ZGW_ATGEW: 0, GEWEI: "KG", STATUS: status, ZGW_PER1: userInfo?.userName, ZDRIVER: "", ZGW_NAME1: "", ZGW_MAKTX: "" }
            //});
          }
        }
        this.dataLoad(this.dataService, this);
        this.orderdataLoad(this.dataService, this);

      },

    };

  }

  //--------------------데이터 로드-------------------//
  //데이터로드
  public async dataLoad(dataService: ImateDataService, thisObj: OGWIComponent) {

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
  //이력데이터로드
  public async orderdataLoad(dataService: ImateDataService, thisObj: OGWIComponent) {

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
  public async carDataLoad(dataService: ImateDataService, thisObj: OGWIComponent) {
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
  public async datainsert(thisObj: OGWIComponent) {
    try {
      let now = new Date();
      let nowTime = formatDate(new Date(), 'HH:mm:ss', "en-US");

      var zmms9900Model = new ZMMS9900Model("", "");

      var zmms0210Model: ZMMS0210Model[] = [];
      zmms0210Model.push(new ZMMS0210Model("G", now, nowTime, thisObj.weightStartData.ZCARNO, thisObj.weightStartData.ZDRIVER, thisObj.weightStartData.ZGW_MATNR, thisObj.weightStartData.ZGW_MAKTX ?? "",
        thisObj.weightStartData.ZGW_LIFNR, thisObj.weightStartData.ZGW_NAME1 ?? "", thisObj.weightStartData.ZGW_ATGEW, thisObj.weightStartData.GEWEI, thisObj.weightStartData.ZGW_PER1, thisObj.weightStartData.ZGW_PER2, "", "", "", "", "", "", DIMModelStatus.Add));

      var zmmfromgwgrirModel = new ZMMFROMGWGrirModel(zmms9900Model, zmms0210Model);
      var modelList: ZMMFROMGWGrirModel[] = [zmmfromgwgrirModel];
      var insertModel = await this.dataService.RefcCallUsingModel<ZMMFROMGWGrirModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMFROMGWGrirModelList", modelList, QueryCacheType.None);
      this.dataLoad(this.dataService, this);
      this.orderdataLoad(this.dataService, this);
      this.carDataLoad(this.dataService, this);
      var userInfo = this.authService.getUser().data;

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
      return insertModel[0];
    }
    catch (error: any) {
      alert(error, " 오류");
      return null;
    }

  }
  //--------------------메인-------------------//
  //조회 클릭
  public refreshDataGrid(e: Object) {
    this.dataLoad(this.dataService, this);
    this.orderdataLoad(this.dataService, this);
    this.carDataLoad(this.dataService, this);
    this.now = new Date();
  }
  //수동등록 클릭
  manualRegis = (e: any) => {
    setTimeout(() => {

      if (this.inProgress) {
        this.testBox.editorOptions = { disabled: false };
        this.buttonText = '계근 등록';
        this.weightStartData.STATUS = "수동 입력 상태";
        this.stopMonitoring()
      } else {
        this.testBox.editorOptions = { disabled: true };
        this.buttonText = '수동 등록';
        this.weightStartData.STATUS = "계근 입력 상태";
        this.runMonitoring()
      }
      this.inProgress = !this.inProgress;
    });
    this.form.instance.repaint();
  }

  //반출증 클릭
  takeOutSpecific() {
    let selectData = this.maindataGrid.instance.getSelectedRowsData()[0];
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

  //계량증명서 클릭
  weighingCertificate() {
    let selectData = this.maindataGrid.instance.getSelectedRowsData()[0];
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
    }
  }
  carCheck() {
    this.PopupVisible = true;
    this.orderdataLoad(this.dataService, this);
  }
  //선택이벤트
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }

  /* Entry Data Form에 바인딩 */
  //분할 차량번호 선택이벤트
  onZcarNoCodeValueChanged(e: any) {
    setTimeout(() => {
      this.weightStartData.ZCARNO = e.selectedItem.ZCARNO;
      this.weightStartData.ZDRIVER = e.selectedItem.ZDRIVER;
      return;
    });
  }

  //제품코드 선택이벤트
  onGwMatnrValueChanged(e: any) {
    setTimeout(() => {
      this.weightStartData.ZGW_MATNR = e.selectedItem.ZCM_CODE2;
      this.weightStartData.ZGW_MAKTX = e.selectedItem.ZCMF02_CH;
      return;
    });
  }

  //업체코드 선택이벤트
  onGwLifnrValueChanged(e: any) {
    setTimeout(() => {
      this.weightStartData.ZGW_LIFNR = e.selectedItem.ZCM_CODE2;
      this.weightStartData.ZGW_NAME1 = e.selectedItem.ZCMF02_CH;
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

          else
            thisObj.weightStartData.ZGW_ATGEW = casResult.weight;
          //if (thisObj.weightStartData.ZGW_ATGEW > 43800) {
          //  notify("계근 중량은 43.8톤을 넘을 수 없습니다.", "warning", 500)
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
}
