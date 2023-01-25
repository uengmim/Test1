/*
 * 구매공고확인
 */
import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Output, Input } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { IUser } from '../../../shared/services/auth.service';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import {
  DxDataGridComponent, DxTextBoxComponent, DxTagBoxModule, DxFormModule, DxFormComponent, DxTagBoxComponent, DxButtonComponent
} from 'devextreme-angular';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZMMBIDMstModel, ZMMS8030Model, ZMMS9000Model, RSISSRangeModel } from '../../../shared/dataModel/OBPPT/ZmmBidMst';
import { ZMMT8360Model } from '../../../shared/dataModel/OBPPT/Zmmt8360';
import { ZMMT8370Model } from '../../../shared/dataModel/OBPPT/Zmmt8370';
import { ZMMT8320Model } from '../../../shared/dataModel/OBPPT/Zmmt8320';
import { EbanModel } from '../../../shared/dataModel/OBPPT/Eban';
import { ZMMTDETAILModel } from '../../../shared/dataModel/OBPPT/ZmmtDetail';
import { alert, confirm } from "devextreme/ui/dialog";
import { formatDate } from '@angular/common';
import { DxiItemComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';
import { Router } from '@angular/router';
import { ZMMBIDDtlModel, ZMMS8020Model } from '../../../shared/dataModel/OBPPT/ZmmBidDtl';
import { ZMMRFQRtnModel, ZMMS8031Model, ZMMS8032Model } from '../../../shared/dataModel/OBPPT/ZmmRfcRtn';
import { ZMMT8300Model } from '../../../shared/dataModel/OBPPT/Zmmt8300';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: './obpi.component.html',
  providers: [ImateDataService],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OBPIComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) form!: DxFormComponent;
  @ViewChild('popupForm', { static: false }) popupForm!: DxFormComponent;
  @ViewChild('#gcContractList', { static: false }) gcContractList!: DxDataGridComponent;
  @ViewChild('PrgstatusEntry', { static: false }) PrgstatusEntry!: CommonPossibleEntryComponent;
  @ViewChild('buttonIem', { static: false }) buttonIem!: DxiItemComponent;
  @ViewChild('categoryEntery', { static: false }) categoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('regulationEntery', { static: false }) regulationEntery!: CommonPossibleEntryComponent;
  @ViewChild('statusDataGrid', { static: false }) statusDataGrid!: DxDataGridComponent;
  @ViewChild('popupDataGrid', { static: false }) popupDataGrid!: DxDataGridComponent;
  @ViewChild('estimateDataGrid', { static: false }) estimateDataGrid!: DxDataGridComponent;
  @ViewChild('searchText', { static: false }) searchText!: DxTextBoxComponent;
  @ViewChild('bizpmtagbox', { static: false }) bizpmtagbox!: DxTagBoxComponent;
  @ViewChild('dataItem', { static: false }) dataItem!: DxiItemComponent;

  callbacks = [];




  //현재날짜
  now: Date = new Date();
  startDate: any;
  endDate: any;
  gretdDat: any;

  /**
 * 선택한 코드의 전체 키 값
 */
  @Output()

  selectedCodes: string[] = [];
  products: any;
  displayExpr: string;
  gridColumns: any = ['그룹명', '코드', '코드명'];
  PrgstatusCode: CommonCodeInfo;
  RegulationCode: CommonCodeInfo;
  BusinessCategoryCode: TableCodeInfo;
  categoryCode: CommonCodeInfo;


  //구분 value
  PrgstatusCodeValue: string | null = null;
  RegulationValue: string | null = null;

  //취급업종
  categorydataSource: any;

  localappConfig: AppConfigService;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //질문 파서블엔트리 값
  questionCodeValue: string | null = null;

  // 선택값
  selectGridData: ZMMS8030Model[] = [];
  // 선택값
  estselectGridData: ZMMT8370Model[] = [];
  //팝업 선택값
  popupGridData: ZMMS8020Model[] = [];
  //상세폼
  detailFormData: any;
  //견적폼
  estimateFormData: any;
  //견적-디테일폼
  estimateDetailFormData: any = {};
  //저장품구매 상세정보 팝업
  statuspopupVisible = false;
  //견적제출 상세정보 팝업
  estimatepopupVisible = false;

  //질문 파서블 엔트리 유효성 체크
  PrgstatusAdapter =
    {
      getValue: () => {
        return this.PrgstatusCodeValue;
      },
      applyValidationResults: (e: any) => {
        this.PrgstatusEntry.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //질문 파서블 엔트리 유효성 체크
  RegulationAdapter =
    {
      getValue: () => {
        return this.RegulationValue;
      },
      applyValidationResults: (e: any) => {
        this.PrgstatusEntry.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };
  //dataSource: any;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  //데이터 저장 버튼
  saveButtonOptions: any;
  //팝업 닫기 버튼
  popupcloseButtonOptions: any;
  //팝업 조회 버튼
  popupinquiryButtonOptions: any;
  //팝업 엑셀 버튼
  exportSelectedData: any;

  //견적팝업 닫기 버튼
  estimatepopupcloseButtonOptions: any;
  //견적팝업 조회 버튼
  estimatepopupinquiryButtonOptions: any;
  //견적팝업 저장 버튼
  estimatepopupsaveButtonOptions: any;
  //견적팝업 엑셀 버튼
  estimateexportSelectedData: any;
  //견적팝업 삭제 버튼
  estimateDeleteSelectedData: any;
  //회원가입
  searchID: any;

  //구매공고현황데이터
  statusData: any;
  //팝업 데이터
  popupData: any;
  //견적팝업 데이터
  estpopupData: any;
  collapsed = false;
  rowCount1: number;
  rowCount2: number;


  RFQSEQdata: string = "";
  _dataService: ImateDataService;
  zmmt8360: ZMMT8360Model;
  zmmt8370!: ZMMT8370Model[];

  dataSource: any;

  formData: any = {};

  //로딩
  loading = false;

  //버튼 제한
  isDisabled: boolean = false;

  //그리드 수정제한
  isEditing: boolean = true;

  //줄 선택
  selectedRowIndex = -1;
  selectedItemKeys: any[] = [];
  estselectedRowIndex = -1;
  estselectedItemKeys: any[] = [];
  tableresultModel: any;

  btnVisible: boolean = false;
  /**
 * 로딩된 PeCount
 * */
  private loadePeCount: number = 0;
  //_dataService: ImateDataService;
  /**
 * 생성자
 * @param appConfig 앱 수정 정보
 * @param nbpAgetService nbpAgent Service
 * @param authService 사용자 인증 서버스
 */

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private appInfo: AppInfoService, private authService: AuthService,
     http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, private router: Router) {
    appInfo.title = AppInfoService.APP_TITLE + " | 구매공고현황";

    this.displayExpr = "";
    this.localappConfig = appConfig;

    let test = this;

    this.PrgstatusCodeValue = "1";
    //this.RegulationValue = "1";

    if (!(authService.getUser().data?.pin == "" || authService.getUser().data?.pin == null || authService.getUser().data?.pin == undefined)) {
      this.btnVisible = !this.btnVisible;
    }
    this.zmmt8360 = new ZMMT8360Model(this.appConfig.mandt, "", "", "", "", new Date, "", new Date, "", 0, 0, 0, "", "", "", "", "", new Date, "", "", new Date, "", DIMModelStatus.UnChanged);

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 90), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    //this.gretdDat = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    this.rowCount1 = 0;
    this.rowCount2 = 0;

    this._dataService = dataService;
    //공고 데이터
    this.statusData = new CustomStore(
      {
        key: ["BIDNO"],
        load: function (loadOptions) {
          return test.dataLoad(imInfo, dataService);
        }
      });



    this.imInfo = imInfo;

    //질문 코드
    this.PrgstatusCode = appConfig.commonCode("공고진행상태");
    this.BusinessCategoryCode = appConfig.tableCode("취급업종");
    this.RegulationCode = appConfig.commonCode("결재조건");
    //취급 업종 코드
    this.categoryCode = appConfig.commonCode("취급업종");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.PrgstatusCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.BusinessCategoryCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.RegulationCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.categoryCode),

    ];
    PossibleEntryDataStoreManager.setDataStore("obpi", codeInfos, appConfig, dataService);


    const that = this;
    /*this.getCodeInfo();*/

    //팝업 조회 버튼
    this.popupinquiryButtonOptions = {
      text: '조회',
      onClick: async (e: any) => {
        this.loadingVisible = true;

        this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

        this.detailFormData = this.selectGridData[0];
        await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);
        this.loadingVisible = false;

      },
    };
    //팝업 엑셀 버튼
    this.exportSelectedData = {
      text: '엑셀 다운',
      onClick(e: any, thisObj: OBPIComponent) {
        that.popupDataGrid.export.enabled = true;
        //that.popupDataGrid.export.fileName = 'Report';
        //that.popupDataGrid.instance.exportToExcel(false);
      },
    };
    //팝업 닫기 버튼
    this.popupcloseButtonOptions = {
      text: '닫기',
      onClick(e: any, thisObj: OBPIComponent) {
        that.statuspopupVisible = false;
      },
    };

    //견적팝업 조회 버튼
    this.estimatepopupinquiryButtonOptions = {
      text: '조회',
      onClick: async (e: any, thisObj: OBPIComponent) => {
        this.loadingVisible = true;
        //mst
        this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();
        this.estimateFormData = this.selectGridData[0];
        //8360
        let userInfo = this.authService.getUser().data;
        var bidno = thisObj.estimateFormData.BIDNO.padStart(15, '0');
        var lifnr = userInfo?.deptId ?? "";
        var select8360Result = await dataService.SelectModelData<ZMMT8360Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
          `BIDNO = '${bidno}' AND LIFNR = '${lifnr}'`, "RFQSEQ DESC", QueryCacheType.None);

        this.estimateDetailFormData = select8360Result;
        //8370
        var select8370Result = await dataService.SelectModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
          `BIDNO = '${bidno}' AND LIFNR = '${lifnr}' AND RFQSEQ = '${select8360Result[0].RFQSEQ}'`, "RFQSEQ DESC", QueryCacheType.None);
        this.estpopupData = new ArrayStore(
          {
            key: ["BIDNO"],
            data: select8370Result
          });
        this.loadingVisible = false;

      },
    };
    //견적팝업 저장 버튼
    this.estimatepopupsaveButtonOptions = {
      text: '저장',
      onClick: async (e: any, thisObj: OBPIComponent) => {

        if (await confirm("저장하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          var makeYn = false;
          var estmakeYn = false;
          var rfqamtData = false;
          var rfqvatData = false;
          var checkData = this.estimateDetailFormData
          var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
          let userInfo = this.authService.getUser().data;
          var lifnr = userInfo?.deptId ?? "";
          var result8300Model = await this.dataService.SelectModelData<ZMMT8300Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8300ModelList", [],
            `MANDT = '${this.appConfig.mandt}' AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);
          var data8300 = result8300Model;
          let nowDate = formatDate(new Date(), "yyyyMMdd", "en-US")
          let nowTime = formatDate(new Date(), "HHmmss", "en-US")
          let rfqdthDate = formatDate(data8300[0].RFQDTH, "yyyyMMdd", "en-US")
          let rfqdttDate = data8300[0].RFQDTT.replace(/:/g, '');
          //메이커 여부가 X일때
          if (this.estimateFormData.MAKERYN == "X") {
            this.estpopupData._array.forEach((array: any) => {
              //8370에서 MAKER가 빈값이면 alert
              if (array.MAKER == "" || array.MAKER == null) {
                makeYn = true;
                return;

              }
            });
            if (makeYn) {
              alert(`메이커를 필수로 입력해주세요.`, "알림");
            }

          }
       
            //단가가 빈값이면 alert
          this.estpopupData._array.forEach((array: any) => {
              if (array.CONPR == "" || array.CONPR == null || array.CONPR == "0") {
                estmakeYn = true;
                return;
              }
            });
          if (estmakeYn) {
              alert(`단가를 필수로 입력해주세요.`, "알림");
          }

          if (Number.isNaN(checkData.RFQVAT) || checkData.RFQVAT == 0) {
            rfqvatData = true;
          }
          if (rfqvatData) {
            alert(`견적 부가세가 계산되지 않았습니다.`, "알림");
            return;
          }

          if (Number.isNaN(checkData.RFQAMT) || checkData.RFQAMT == 0) {
            rfqamtData = true;
          }
          if (rfqamtData) {
            alert(`견적 총액이 계산되지 않았습니다.`, "알림");
            return;
          }

          if (!makeYn && !estmakeYn && !rfqamtData && !rfqvatData) {
            if (parseInt(rfqdthDate) >= parseInt(nowDate)) {
              if (parseInt(rfqdttDate) > parseInt(nowTime)) {
            var resultModel = await this.datainsert(this);
            if (resultModel?.ES_RESULT.TYPE !== "S") {
              alert(`저장을 하지 못했습니다.\n\nSAP 메시지: ${resultModel?.ES_RESULT.MESSAGE}`, "알림");
            } else {
              alert(`저장 하였습니다.\n\nSAP 메시지: ${resultModel.ES_RESULT.MESSAGE}`, "알림");
                }
              } else {
                alert("견적 마감일시가 지난 공고입니다.", "알림");
              }
            } else {
              alert("견적 마감일시가 지난 공고입니다.", "알림");
            }
          }
          


          this.loadingVisible = false;
        }
      },

    }

    //견적팝업 엑셀 버튼
    this.estimateexportSelectedData = {
      text: '엑셀 다운',
      onClick(e: any, thisObj: OBPIComponent) {
        that.estimateDataGrid.export.enabled = true;
        //that.estimateDataGrid.export.fileName = 'Report';
        //that.estimateDataGrid.instance.exportToExcel(false);
      },
    };
    //견적팝업 삭제 버튼
    this.estimateDeleteSelectedData = {
      text: '삭제',
      onClick: async (e: any) => {
        await this.dataDelete(this.dataService, this);
      },
    };
    //견적팝업 닫기 버튼
    this.estimatepopupcloseButtonOptions = {
      text: '닫기',
      onClick(e: any, thisObj: OBPIComponent) {
        that.estimatepopupVisible = false;
      },
    };
  }
  async ngOnInit() {

    //취급업종

    let categorydataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.categoryCode);

    let resultModel = categorydataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

    this.categorydataSource = new ArrayStore({
      data: resultModel,
    });
  }
  /**
* 화면 종료
* */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore("obpi");
  }

  //async getCodeInfo() {

  //  let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.BusinessCategoryCode); //ZCM_CODE1

  //  this.tableresultModel = dataSet?.tables["CODES"].getDataObjectAny();


  //}
  //공고참가업체
  public async userdata(dataService: ImateDataService) {
    let userInfo = this.authService.getUser().data;

    var LIFNR = userInfo?.deptId ?? "";
    var BIZNO = userInfo?.pin ?? "";

    var zmmt8320Model = new ZMMT8320Model(this.appConfig.mandt, "", LIFNR, BIZNO, "", "", new Date(), "", new Date(), "00:00:00", "", new Date(), "00:00:00", DIMModelStatus.UnChanged)
    var modelList: ZMMT8320Model[] = [zmmt8320Model];
    this.loadingVisible = true;
    var resultModel = await dataService.RefcCallUsingModel<ZMMT8320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8320ModelList", modelList, QueryCacheType.None);
    this.loadingVisible = false;
    return resultModel[0];

  }


  //데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {
    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")
    var userdata = await this.userdata(this.dataService);
    let userInfo = this.authService.getUser().data;

    var LIFNR = userInfo?.deptId ?? "";
    var zmms9000Model = new ZMMS9000Model("", "");

    var zmmbidmstModel = new ZMMBIDMstModel(zmms9000Model, this.startDate, this.endDate, this.PrgstatusEntry.selectedValue ?? "", LIFNR, [], []);

    var modelList: ZMMBIDMstModel[] = [zmmbidmstModel];

    this.loadingVisible = true;
    var resultModel = await dataService.RefcCallUsingModel<ZMMBIDMstModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDMstModelList", modelList, QueryCacheType.None);
    this.loadingVisible = false;

    if (resultModel[0].ES_RESULT.TYPE !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].ES_RESULT.MESSAGE}`, "알림");
      return [];
    }
    return resultModel[0].ET_DATA;

  }

  // 상세 데이터 로드
  public async detaildataLoad(parent: OBPIComponent, BIDNO: string) {

    var userdata = await this.userdata(this.dataService);

    var zmms9000Model = new ZMMS9000Model("", "");

    var zmmbiddtlModel = new ZMMBIDDtlModel(zmms9000Model, BIDNO, userdata.LIFNR, "", []);

    var modeldtlList: ZMMBIDDtlModel[] = [zmmbiddtlModel];



    return await parent.dataService.RefcCallUsingModel<ZMMBIDDtlModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDDtlModelList", modeldtlList, QueryCacheType.None);

  }

  // 8360 견적 로드
  public async formdataLoad(dataService: ImateDataService, thisObj: OBPIComponent) {

    var bidno = thisObj.estimateFormData.BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;

    var lifnr = userInfo?.deptId ?? "";
    var result8360Model = await dataService.SelectModelData<ZMMT8360Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "", QueryCacheType.None);

    return result8360Model;

  }

  // 상세 8370 견적 로드
  public async datagridLoad(dataService: ImateDataService, thisObj: OBPIComponent) {


    var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;
    var lifnr = userInfo?.deptId ?? "";

    var resultModel = await dataService.SelectModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND  BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "", QueryCacheType.None);

    return resultModel;

  }


  // 데이터 저장
  public async datainsert(thisObj: OBPIComponent) {
    try {
      var zmms9000Model = new ZMMS9000Model("", "");
      let now = new Date().toISOString().substring(0, 10).replace(/-/g, '');
      let nowTime = formatDate(new Date(), "HHmmss", "en-US");
      var userInfo = thisObj.authService.getUser().data;
      var gretdDate = formatDate(thisObj.estimateDetailFormData.GRETD, "yyyyMMdd", "en-US")

      var lifnr = userInfo?.deptId ?? "";

      var zmms8031Model = new ZMMS8031Model("I", thisObj.estimateFormData.BIDNO, lifnr, thisObj.estimateDetailFormData.RFQSEQ, thisObj.estimateFormData.BIZNO, gretdDate,
        thisObj.estimateDetailFormData.PAYTY, thisObj.estimateDetailFormData.RFQCST, thisObj.estimateDetailFormData.RFQVAT, thisObj.estimateDetailFormData.RFQAMT,
        thisObj.estimateFormData.RFQPYN, DIMModelStatus.Add);

      this.estselectGridData = this.estpopupData._array;

      var zmms8032ModelList: ZMMS8032Model[] = [];
      this.estselectGridData.forEach(async (array: any) => {


        zmms8032ModelList.push(new ZMMS8032Model(array.BANFN, array.BNFPO, array.CONPR, array.MAKER, array.REMARK, DIMModelStatus.Add));

      });


      var zmmrgqrtnModel = new ZMMRFQRtnModel(zmms9000Model, zmms8031Model, zmms8032ModelList);

      var modelList: ZMMRFQRtnModel[] = [zmmrgqrtnModel];

      var insertModel = await this.dataService.RefcCallUsingModel<ZMMRFQRtnModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMRFQRtnModelList", modelList, QueryCacheType.None);

      return insertModel[0];
    }
    catch (error: any) {
      alert(error, " 오류");
      return null;
    }

  }

  //데이터 삭제
  public async dataDelete(dataService: ImateDataService, thisObj: OBPIComponent) {
      let userInfo = this.authService.getUser().data;

      var bidno = thisObj.estimateFormData.BIDNO.padStart(15, '0');
      var lifnr = userInfo?.deptId ?? "";

      //해당 공고의 마지막 견적을 선택
      var select8360Result = await dataService.SelectModelData<ZMMT8360Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
        `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}'`, "RFQSEQ DESC", QueryCacheType.None);


      if (select8360Result.length == 0) {
        alert("삭제할 데이터가 없습니다.", "알림");
      } else {
        // 견적결과가 빈값이 아니라면 , 삭제 X
        if (select8360Result[0].RFQRST !== "") {
          alert("견적결과가 나온 것은 삭제할 수 없습니다.", "알림");
        }
        //견적 결과가 빈값이면 , 삭제
        else {
          this.zmmt8360 = select8360Result[0];
          this.zmmt8360.ModelStatus = DIMModelStatus.Delete;

          var select8370Result = await dataService.SelectModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
            `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}' AND RFQSEQ = '${select8360Result[0].RFQSEQ}'`, "RFQSEQ DESC", QueryCacheType.None);

          this.zmmt8370 = select8370Result;
          this.zmmt8370.forEach((array: any) => {
            array.ModelStatus = DIMModelStatus.Delete;
          })
          alert("견적 제출이 삭제되었습니다.", "알림");
        }
      }
      var model8360List: ZMMT8360Model[] = [thisObj.zmmt8360];

      this.rowCount1 = await this.dataService.ModifyModelData<ZMMT8360Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", model8360List);
      this.rowCount2 = await this.dataService.ModifyModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", this.zmmt8370);


      this.estimateDetailFormData.resetValues();
    

  }


  //전체 버튼
  allCategory(thisObj: OBPIComponent) {
    thisObj.bizpmtagbox.instance.reset();
    thisObj.statusDataGrid.instance.clearFilter();

  }
  //결제조건코드 값 변경
  onRegulationCodeValueChanged(e: any) {

    setTimeout(() => {
      this.estimateDetailFormData.PAYTY = e.selectedValue
    });
  }


  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }
  //날짜 클릭
  dateCheck(e: any) {
    var staDate = new Date(this.startDate);
    var endDate = new Date(this.endDate);

    var diffDay = Math.floor(Math.abs((staDate.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000)));

    if (diffDay > 90) {
      alert("조회기간을 최대 3개월 이내로 설정해주세요.", "알림");
    } else {
      this.dataLoad(this.imInfo, this.dataService);
    }
  }

  //상세내용
  DetailData: any = async (thisObj: OBPIComponent) => {
    try {
      this.selectedItemKeys.forEach(async (key: any) => {

        this.loadingVisible = true;
        var userInfo = this.authService.getUser().data;

        this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

        this.estimateFormData = this.selectGridData[0];
        //사업자등록번호, 회사명
        this.estimateFormData = Object.assign(this.estimateFormData, { BIZNO: userInfo?.pin, NAME1: userInfo?.deptName });
        var result8360Model = await this.formdataLoad(this.dataService, this);
        var result8370Model = await this.datagridLoad(this.dataService, this);
        var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);

        if (result8360Model.length > 0) {
          //디테일 데이터
          result8370Model.forEach((array: any) => {
            var resultData = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO);

            if (resultData != undefined) {
              Object.assign(array, {
                MATNR: resultData.MATNR, MATNRT: resultData.MATNRT, MENGE: resultData.MENGE,
                MEINS: resultData.MEINS
              });
            }
          });
          this.popupData = new ArrayStore(
            {
              key: ["BIDNO", "BANFN", "BNFPO"], 
              data: result8370Model
            });
        }
  
        else if (result8360Model.length == 0) {

          this.popupData = new ArrayStore(
            {
              key: ["BIDNO"],
              data: resultModel[0].ET_DATA
            });
        }

        var data: Array<any> = this.popupData._array;

        data.forEach(async (array: any) => {

          var MENGEdata = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO);

          if (MENGEdata != undefined) {
            if (this.estimateFormData.BIDRUL == "A") {
              array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
              array.RFQVAT = parseInt(array.RFQCST1) * 0.1
              array.RFQAMT = parseInt(array.RFQCST1) + parseInt(array.RFQVAT)
            }

            else {
              array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
              if (this.estimateFormData.VATTY == "OUT") {
                array.RFQVAT = parseInt(array.RFQCST1) * 0.1
              } else {
                array.RFQVAT = "0"
              }
              array.RFQAMT = parseInt(array.RFQCST1) + parseInt(array.RFQVAT)
            }
          }
          this.loadingVisible = false;

        });

      });

      this.statuspopupVisible = !this.statuspopupVisible;
    } catch (error) {
      alert("error", "알림");
    }

  }
  //견적제출
  Duplication: any = async (thisObj: OBPIComponent) => {

    var checkFlag = false;
    var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
    //8300데이터 가져오기
    var result8300Model = await this.dataService.SelectModelData<ZMMT8300Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8300ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);
    var data8300 = result8300Model;
    //현재날짜 문자열 변환
    let nowDate = formatDate(new Date(), "yyyyMMdd", "en-US")
    //현재시간 문자열 변환
    let nowTime = formatDate(new Date(), "HHmmss", "en-US")
    //견적마감날짜 문자열 변환
    let rfqdthDate = formatDate(data8300[0].RFQDTH, "yyyyMMdd", "en-US")
    //견적마감시간 : 제거
    let rfqdttDate = data8300[0].RFQDTT.replace(/:/g, '');
    //견적마감 날짜가 현재 날짜보다 남았을 때
    if (parseInt(rfqdthDate) >= parseInt(nowDate)) {
      //견적마감 시간이 현재 시간보다 남았을 때
      if (parseInt(rfqdttDate) > parseInt(nowTime)) {
    this.selectedItemKeys.forEach(async (key: any) => {


      var userInfo = this.authService.getUser().data;

      this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

      this.estimateFormData = this.selectGridData[0];

      Object.assign(this.estimateFormData, { BIZNO: userInfo?.pin, NAME1: userInfo?.deptName });

      var result8360Model = await this.formdataLoad(this.dataService, this);

      if (result8360Model.length > 0) {
        if (result8360Model[result8360Model.length - 1].RFQRST == "C" && this.selectGridData[0].BIDST == "2") {
          checkFlag = true;

          this.estimateDetailFormData = result8360Model[result8360Model.length - 1];

          this.estimateDetailFormData.RFQSEQ = (parseInt(result8360Model[result8360Model.length - 1].RFQSEQ) + 1).toString().padStart(3, '0');

          this.RegulationValue = result8360Model[result8360Model.length - 1].PAYTY;

        } else {
          checkFlag = false;
        }
      } else {
        checkFlag = true;

        this.estimateDetailFormData.RFQSEQ = "001";
        this.RegulationValue = "1";
      }
      if (checkFlag) {
        this.estimatepopupVisible = !this.estimatepopupVisible;

        this.loadingVisible = true;
        var result8370Model = await this.datagridLoad(this.dataService, this);
        var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);
        this.loadingVisible = false;


        result8370Model.forEach((array: any) => {
          var resultData = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO);

          if (resultData != undefined) {
            Object.assign(array, {
              MATNR: resultData.MATNR, MATNRT: resultData.MATNRT, MENGE: resultData.MENGE,
              MEINS: resultData.MEINS, CONPR: resultData.CONPR, MAKER: resultData.MAKER, REMARK: resultData.REMARK

            });
          }
        });

        resultModel[0].ET_DATA.forEach((array: any) => {
          Object.assign(array, { RFQCST: 0, RFQVAT: 0, RFQAMT: 0 });
        });

        this.estpopupData = new ArrayStore(
          {
            key: ["BIDNO", "BANFN","BNFPO"], 
            data: resultModel[0].ET_DATA
          });
        //this.estpopupData = new ArrayStore(
        //  {
        //    key: ["BIDNO", "RFQSEQ"],
        //    data: result8370Model
        //  });

      }
      else {
        alert("견적결과가 재견적일 경우에만 견적제출이 가능합니다.", "알림");
      }
    });
      } else {
        alert("견적 마감일시가 지난 공고입니다.", "알림");
      }
    } else {
      alert("견적 마감일시가 지난 공고입니다.", "알림");
    }

  }

  movePage(e: any) {
    this.router.navigate(['obmr']);
  }
  //자료첨부
  test() {

  }
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }
  estselectionChanged(data: any) {
    this.estselectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.estselectedItemKeys = data.currentSelectedRowKeys;

  }
  //조회필터조건
  selectStatus(data: any) {
    this.statusDataGrid.instance.filter(["BIZUPJ", "=", data.value]);
    //this.statusDataGrid.instance.option("filterOperation", ["BIZUPJ", "anyof", data.value]);

  }
  rowUpdate(e: any) {
    //this.estselectGridData = this.estimateDataGrid.instance.getSelectedRowsData();
    //this.estpopupData = this.estselectGridData[0];
    var row = e.data;

    if (this.estimateFormData.BIDRUL == "A") {

      row.RFQCST = parseInt(row.MENGE) * parseInt(row.CONPR);
      row.RFQVAT = parseInt(row.RFQCST) * 0.1
      row.RFQAMT = parseInt(row.RFQCST) + parseInt(row.RFQVAT)
    }else {
      row.RFQCST = parseInt(row.MENGE) * parseInt(row.CONPR);
      if (this.estimateFormData.VATTY == "OUT") {
        //견적 부가세 = 견적 공급가 * 0.1
        row.RFQVAT = parseInt(row.RFQCST) * 0.1
        // 부가세가 IN이면
      } else {
        // 견적 부가세 = 0
        row.RFQVAT = "0"
      }
      row.RFQAMT = parseInt(row.RFQCST) + parseInt(row.RFQVAT)

    }
      //데이터 그리드 총액 더하기
      var rfgcst: number = 0;
      var rfgvat: number = 0;
      var rfgamt: number = 0;

      var data: Array<any> = this.estpopupData._array;

      data.forEach(async (array: any) => {
        rfgcst = rfgcst + parseInt(array.RFQCST);
        rfgvat = rfgvat + parseInt(array.RFQVAT);
        rfgamt = rfgamt + parseInt(array.RFQAMT);

      });
    Object.assign(this.estimateDetailFormData, { RFQCST: rfgcst, RFQVAT: rfgvat, RFQAMT: rfgamt });

    


  }


  async onPrgstatusDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.PrgstatusCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.PrgstatusCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

    }
  }
  async onRegulationDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.RegulationCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.PrgstatusCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

    }
  }
}
