/*
 * 입찰참가신청
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
import { Service } from './app.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import {
  DxDataGridComponent, DxTextBoxComponent, DxTagBoxModule, DxFormModule, DxFormComponent, DxTagBoxComponent, DxButtonComponent, DxCheckBoxComponent
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
import { ZMMT8500Model } from '../../../shared/dataModel/OBPPT/Zmmt8500';
import { EbanModel } from '../../../shared/dataModel/OBPPT/Eban';
import { ZMMTDETAILModel } from '../../../shared/dataModel/OBPPT/ZmmtDetail';

import { formatDate } from '@angular/common';
import { DxiItemComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';
import { Router } from '@angular/router';
import { ZMMBIDDtlModel, ZMMS8020Model } from '../../../shared/dataModel/OBPPT/ZmmBidDtl';
import { ZMMRFQRtnModel, ZMMS8031Model, ZMMS8032Model } from '../../../shared/dataModel/OBPPT/ZmmRfcRtn';
import { alert, confirm } from "devextreme/ui/dialog";

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: './obbd.component.html',
  providers: [ImateDataService, Service],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})



export class OBBDComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) form!: DxFormComponent;
  @ViewChild('popupForm', { static: false }) popupForm!: DxFormComponent;
  @ViewChild('#gcContractList', { static: false }) gcContractList!: DxDataGridComponent;
  @ViewChild('PrgstatusEntry', { static: false }) PrgstatusEntry!: CommonPossibleEntryComponent;
  @ViewChild('ApplyResultEntery', { static: false }) ApplyResultEntery!: CommonPossibleEntryComponent;
  @ViewChild('AssuranceEntery', { static: false }) AssuranceEntery!: CommonPossibleEntryComponent;
  @ViewChild('buttonIem', { static: false }) buttonIem!: DxiItemComponent;
  @ViewChild('categoryEntery', { static: false }) categoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('regulationEntery', { static: false }) regulationEntery!: CommonPossibleEntryComponent;
  @ViewChild('statusDataGrid', { static: false }) statusDataGrid!: DxDataGridComponent;
  @ViewChild('popupDataGrid', { static: false }) popupDataGrid!: DxDataGridComponent;
  @ViewChild('estimateDataGrid', { static: false }) estimateDataGrid!: DxDataGridComponent;
  @ViewChild('biddingDataGrid', { static: false }) biddingDataGrid!: DxDataGridComponent;

  @ViewChild('searchText', { static: false }) searchText!: DxTextBoxComponent;
  @ViewChild('bizpmtagbox', { static: false }) bizpmtagbox!: DxTagBoxComponent;
  @ViewChild('dataItem', { static: false }) dataItem!: DxiItemComponent;
  @ViewChild('chkgbox', { static: false }) chkgbox!: DxCheckBoxComponent;

  callbacks = [];

  biznoValue: string;
  cpNameValue: string;
  //현재날짜
  now: Date = new Date();
  defaultDate: any;
  startDate: any;
  endDate: any;
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
  AssuranceCode: CommonCodeInfo;
  ApplyResultCode: CommonCodeInfo;
  BusinessCategoryCode: TableCodeInfo;

  //구분 value
  PrgstatusCodeValue: string | null = null;
  RegulationValue: string | null = null;
  AssuranceValue: string | null = null;
  ApplyResultValue: string | null = null;

  //취급업종
  categorydataSource: any;

  localappConfig: AppConfigService;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //질문 파서블엔트리 값
  questionCodeValue: string | null = null;

  // 선택값
  selectGridData: ZMMS8030Model[] = [];
  //팝업 선택값
  popupGridData: ZMMS8020Model[] = [];
  //상세폼
  detailFormData: any;
  //견적폼
  estimateFormData: any;
  //견적-디테일폼
  estimateDetailFormData: any;
  //입찰-디테일폼
  biddingDetailFormData!: any;
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
  //보증방법 파서블 엔트리 유효성 체크AssuranceCode
  AssuranceAdapter =
    {
      getValue: () => {
        return this.AssuranceValue;
      },
      applyValidationResults: (e: any) => {
        this.AssuranceEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };
  //신청결과 파서블 엔트리 유효성 체크
  ApplyResultAdapter =
    {
      getValue: () => {
        return this.ApplyResultValue;
      },
      applyValidationResults: (e: any) => {
        this.ApplyResultEntery.validationStatus = e.isValid ? "valid" : "invalid"
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
  //입찰신청 저장 버튼
  biddingpopupsaveButtonOptions: any;
  //견적팝업 엑셀 버튼
  estimateexportSelectedData: any;

  //회원가입
  searchID: any;

  //구매공고현황데이터
  statusData: any;
  //팝업 데이터
  popupData: any;
  //견적팝업 데이터
  estpopupData: any;
  //입찰신청 데이터
  biddingpopupData: any;
  collapsed = false;
  rowCount: number;
  //텍스트박스 데이터
  value: string;

  RFQSEQdata: string = "";
  _dataService: ImateDataService;
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
    service: Service, http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, private router: Router) {
    appInfo.title = AppInfoService.APP_TITLE + " | 입찰참가신청";

    var userInfo = this.authService.getUser().data;
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 90), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    //텍스트박스 데이터
    this.value = service.getContent();
    this.biznoValue = userInfo?.pin ?? "";
    this.cpNameValue = userInfo?.deptName ?? "";
    this.displayExpr = "";
    this.localappConfig = appConfig;

    let test = this;

    this.PrgstatusCodeValue = "A";
    this.RegulationValue = "1";

    if (!(authService.getUser().data?.pin == "" || authService.getUser().data?.pin == null || authService.getUser().data?.pin == undefined)) {
      this.btnVisible = !this.btnVisible;
    }
    //this.popupData8360 = new ZMMT8360Model(this.appConfig.mandt, "", "", "", "", new Date, "", new Date, "", 0, 0, 0, "", "", "", "", "", new Date, "", "", new Date, "", DIMModelStatus.UnChanged)
    //this.popupData8370 = new ZMMT8370Model(this.appConfig.mandt, this.popupData8360.BIDNO, "", "", "", "", 0, "", "", "", "", new Date, "", "", new Date, "",  DIMModelStatus.UnChanged)

    //date
    var now = new Date();
    this.defaultDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    this.rowCount = 0;

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
    //취급업종
    this.categorydataSource = new ArrayStore({
      data: service.getcategory(),
      key: 'Id',
    });
    //질문 코드
    this.PrgstatusCode = appConfig.commonCode("공고진행상태");
    this.BusinessCategoryCode = appConfig.tableCode("취급업종");
    this.RegulationCode = appConfig.commonCode("결재조건");
    this.AssuranceCode = appConfig.commonCode("보증방법");
    this.ApplyResultCode = appConfig.commonCode("신청결과");


    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.PrgstatusCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.BusinessCategoryCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.RegulationCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.AssuranceCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.ApplyResultCode),


    ];
    PossibleEntryDataStoreManager.setDataStore("obbd", codeInfos, appConfig, dataService);


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
    //상세내용 엑셀 버튼
    this.exportSelectedData = {
      text: '엑셀 다운',
      onClick(e: any, thisObj: OBBDComponent) {
        that.estimateDataGrid.export.enabled = true;
        that.estimateDataGrid.export.fileName = 'Report';
        that.estimateDataGrid.instance.exportToExcel(false);
      },
    };
    //팝업 닫기 버튼
    this.popupcloseButtonOptions = {
      text: '닫기',
      onClick(e: any, thisObj: OBBDComponent) {
        that.statuspopupVisible = false;
      },
    };

    //견적팝업 조회 버튼
    this.estimatepopupinquiryButtonOptions = {
      text: '조회',
      onClick: async (e: any) => {
        this.loadingVisible = true;
        this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

        this.estimateFormData = this.selectGridData[0];
        await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);
        this.loadingVisible = false;

      },
    };
    //입찰신청 저장 버튼
    this.biddingpopupsaveButtonOptions = {
      text: '저장',
      useSubmitBehavior: true,
      onClick: async (e: any) => {
        var value = this.chkgbox.value;

        if (await confirm("입찰신청하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          if (this.biddingDetailFormData.INSTXT == "") {
            alert("보증금 내역을 입력해주세요.", "알림");
          }
          else if (this.biddingDetailFormData.INSAMT == "") {
            alert("보증금액을 입력해주세요.", "알림");
            return;
          }
          else if (this.biddingDetailFormData.INSTY == "") {
            alert("보증방법을 입력해주세요.", "알림");
            return;
          }
          else if (this.biddingDetailFormData.INSCMY == "") {
            alert("보증회사을 입력해주세요.", "알림");
            return;
          }
          else if (this.biddingDetailFormData.PASSY == "") {
            alert("납부면제 사유를 입력해주세요.", "알림");
            return;
          } else {
            if (value == true) {

              this.datainsert(this)
              alert("입찰신청이 되었습니다.", "알림");

            } else {
              alert("동의를 눌러주세요.", "알림");

            }

          }
          this.loadingVisible = false;
        }

      },

    }

    //견적팝업 엑셀 버튼
    this.estimateexportSelectedData = {
      text: '엑셀 다운',
      onClick(e: any, thisObj: OBBDComponent) {
        that.biddingDataGrid.export.enabled = true;
        that.biddingDataGrid.export.fileName = 'Report';
        that.biddingDataGrid.instance.exportToExcel(false);
      },
    };
    //견적팝업 닫기 버튼
    this.estimatepopupcloseButtonOptions = {
      text: '닫기',
      onClick(e: any, thisObj: OBBDComponent) {
        that.estimatepopupVisible = false;
      },
    };
  }

  /**
* 화면 종료
* */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore("obbd");
  }

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

    var zmms9000Model = new ZMMS9000Model("", "");
    //진행상태가 2번이어야지만 가능
    var zmmbidmstModel = new ZMMBIDMstModel(zmms9000Model, this.startDate, this.endDate, "2", userdata.LIFNR, [], []);

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
  public async detaildataLoad(parent: OBBDComponent, BIDNO: string) {

    var userdata = await this.userdata(this.dataService);

    var zmms9000Model = new ZMMS9000Model("", "");

    var zmmbiddtlModel = new ZMMBIDDtlModel(zmms9000Model, BIDNO, userdata.LIFNR, "", []);

    var modeldtlList: ZMMBIDDtlModel[] = [zmmbiddtlModel];



    return await parent.dataService.RefcCallUsingModel<ZMMBIDDtlModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDDtlModelList", modeldtlList, QueryCacheType.None);

  }

  // 8360 견적 로드
  public async formdataLoad(dataService: ImateDataService, thisObj: OBBDComponent) {
    var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;
    var lifnr = userInfo?.deptId ?? "";

    var resultModel = await dataService.SelectModelData<ZMMT8360Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "RFQSEQ DESC", QueryCacheType.None);

    return resultModel;

  }

  // 8370 견적 로드
  public async datagridLoad(dataService: ImateDataService, thisObj: OBBDComponent) {


    var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;
    var lifnr = userInfo?.deptId ?? "";

    var resultModel = await dataService.SelectModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
      `BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "", QueryCacheType.None);

    return resultModel;

  }

  // 8500 견적 로드
  public async biddingdataLoad(dataService: ImateDataService, thisObj: OBBDComponent) {

    var bidno = thisObj.detailFormData.BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;
    var lifnr = userInfo?.deptId ?? "";

    var resultModel = await dataService.SelectModelData<ZMMT8500Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "", QueryCacheType.None);

    return resultModel;

  }

  // 8370 견적 로드
  public async biddingdatagridLoad(dataService: ImateDataService, thisObj: OBBDComponent) {


    var bidno = thisObj.detailFormData.BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;
    var lifnr = userInfo?.deptId ?? "";

    var resultModel = await dataService.SelectModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
      `BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "", QueryCacheType.None);

    return resultModel;

  }


  // 데이터 저장
  public async datainsert(thisObj: OBBDComponent) {
    try {
      let userInfo = this.authService.getUser().data;

      var lifnr = userInfo?.deptId ?? "";
      var bidno = thisObj.detailFormData.BIDNO.padStart(15, '0');
      var bizno = userInfo?.pin ?? ""
      let now = new Date();
      let minDate = new Date("0001-01-01");
      let nowTime = formatDate(new Date(), "HHmmss", "en-US");

      var insertData = thisObj.biddingDetailFormData as ZMMT8500Model;

      var maininsertData = new ZMMT8500Model(this.appConfig.mandt, bidno, lifnr, bizno, insertData.INSTXT, insertData.INSAMT, "", insertData.INSTY, insertData.INSCMY,
        insertData.PASSY, minDate, nowTime, "", "", minDate, "", "", this.appConfig.interfaceId, now, nowTime, this.appConfig.interfaceId, now, nowTime, DIMModelStatus.Add);
      insertData.ModelStatus = DIMModelStatus.Add;

      var modelList: ZMMT8500Model[] = [maininsertData];

      this.rowCount = await this.dataService.ModifyModelData<ZMMT8500Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8500ModelList", modelList);
    }
    catch (error) {
      alert("error", "알림");
    }
  }

  async onPrgstatusDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obbd", this.appConfig, this.PrgstatusCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.PrgstatusCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


    }
  }
  async onRegulationDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obbd", this.appConfig, this.RegulationCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.PrgstatusCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


    }
  }
  async onAssuranceDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obbd", this.appConfig, this.AssuranceCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.AssuranceCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


    }
  }
  async onApplyResultDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obbd", this.appConfig, this.ApplyResultCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.ApplyResultCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


    }
  }
  //전체 버튼
  allCategory(thisObj: OBBDComponent) {
    thisObj.bizpmtagbox.instance.reset();
    thisObj.statusDataGrid.instance.clearFilter();

  }
  //결제조건코드 값 변경
  onRegulationCodeValueChanged(e: any) {
    setTimeout(() => {

      this.estimateFormData.PAYTY = e.selectedValue;

    });
  }
  //신청결과코드 값 변경
  onApplyResultCodeValueChanged(e: any) {
    setTimeout(() => {

      this.biddingDetailFormData.BIDRST = e.selectedValue;

      return;
    });
  }
  //보증방법코드 값 변경
  onAssuranceCodeValueChanged(e: any) {
    setTimeout(() => {
      this.biddingDetailFormData.INSTY = e.selectedValue;
      return;
    });
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }


  //상세내용
  DetailData: any = async (thisObj: OBBDComponent) => {
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


        //상세내용 8360 파트
        this.estimateDetailFormData = Object.assign({
          GRETD: result8360Model[0].GRETD, PAYTY: result8360Model[0].PAYTY, RFQSEQ: result8360Model[0].RFQSEQ,
          RFQCST: result8360Model[0].RFQCST, RFQVAT: result8360Model[0].RFQVAT, RFQAMT: result8360Model[0].RFQAMT
        });




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




        this.estpopupData = new ArrayStore(
          {
            key: ["BIDNO"],
            data: result8370Model
          });


        var data: Array<any> = this.estpopupData._array;

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

      this.estimatepopupVisible = !this.estimatepopupVisible;
    } catch (error) {
      alert("error", "알림");
    }

  }


  //zmmt8320 업체
  public async userdetaildata(dataService: ImateDataService, thisObj: OBBDComponent) {

    let userInfo = this.authService.getUser().data;

    var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
    var lifnr = userInfo?.deptId ?? ""
    var bizno = userInfo?.pin ?? ""

    var companyData = await dataService.SelectModelData<ZMMT8320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8320ModelList", [],
      `BIDNO = '${bidno}' AND LIFNR = '${lifnr}' AND BIZNO ='${bizno}' `, "", QueryCacheType.None);

    return companyData[0];
  }

  //입찰
  Bidding: any = async (thisObj: OBBDComponent) => {

    var company = await this.userdetaildata(this.dataService, this);

    //참여업체의 현장설명회 참여여부가 X면 입찰 신청 가능
    if (company.ANCHK == "X") {
      this.statuspopupVisible = true;
      this.selectedItemKeys.forEach(async (key: any) => {

        this.loadingVisible = true;


        var userInfo = this.authService.getUser().data;

        this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

        this.detailFormData = this.selectGridData[0];

        Object.assign(this.detailFormData, { BIZNO: userInfo?.pin, NAME1: userInfo?.deptName });

        this.biddingdataLoad(this.dataService, this);

        var result8370Model = await this.datagridLoad(this.dataService, this);
        var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);


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

        this.estpopupData = new ArrayStore(
          {
            key: ["BIDNO"],
            data: result8370Model
          });


        var data: Array<any> = this.estpopupData._array;

        data.forEach(async (array: any) => {

          var MENGEdata = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO);

          if (MENGEdata != undefined) {
            if (this.detailFormData.BIDRUL == "A") {
              array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
              array.RFQVAT = parseInt(array.RFQCST1) * 0.1
              array.RFQAMT = parseInt(array.RFQCST1) + parseInt(array.RFQVAT)
            }

            else {
              array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
              if (this.detailFormData.VATTY == "OUT") {
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
    } else {
      this.statuspopupVisible = false;
      alert(`\t\t\t\t\t\t부적격.\t<br> 현상설명회 불참`, "알림");

    }
    this.biddingDetailFormData = { INSTXT: "", INSAMT: "",  INSTY: "", INSCMY: "", PASSY: "" };




  }
  //회원가입 버튼 페이지 이동 이벤트
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

  //조회날짜필터조건
  selectDate(data: any) {
    this.statusDataGrid.instance.filter(['RFQDTH', '>', data.value]);
  }

}
