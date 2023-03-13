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
  DxDataGridComponent, DxTextBoxComponent, DxTagBoxModule, DxFormModule, DxFormComponent, DxTagBoxComponent, DxButtonComponent, DxSelectBoxComponent, DxPopoverComponent
} from 'devextreme-angular';
import { AttachFileInfo, CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
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
import { Seq } from './app.service';
import { OfficeXPUtility } from '../../../shared/officeXp.utility';
import { AttachFileComponent } from '../../../shared/components/attach-file/attach-file.component';
import { ZMMBIDTextModel } from '../../../shared/dataModel/OBPPT/ZmmBidText';

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
  @ViewChild('resultEntery', { static: false }) resultEntery!: CommonPossibleEntryComponent;

  @ViewChild('buttonIem', { static: false }) buttonIem!: DxiItemComponent;
  @ViewChild('categoryEntery', { static: false }) categoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('regulationEntery', { static: false }) regulationEntery!: CommonPossibleEntryComponent;
  @ViewChild('statusDataGrid', { static: false }) statusDataGrid!: DxDataGridComponent;
  @ViewChild('popupDataGrid', { static: false }) popupDataGrid!: DxDataGridComponent;
  @ViewChild('estimateDataGrid', { static: false }) estimateDataGrid!: DxDataGridComponent;
  @ViewChild('searchText', { static: false }) searchText!: DxTextBoxComponent;
  @ViewChild('bizpmtagbox', { static: false }) bizpmtagbox!: DxTagBoxComponent;
  @ViewChild('selectbox', { static: false }) selectbox!: DxSelectBoxComponent;
  @ViewChild('dataItem', { static: false }) dataItem!: DxiItemComponent;
  @ViewChild('PrgstatusCodeItem', { static: false }) PrgstatusCodeItem!: DxiItemComponent;
  @ViewChild('AttachFile', { static: false }) AttachFile!: AttachFileComponent;
  @ViewChild(DxPopoverComponent) popover !: DxPopoverComponent;
  @ViewChild('popoverList', { static: false }) popoverList!: DxPopoverComponent;
  @ViewChild('popoverDetail', { static: false }) popoverDetail!: DxPopoverComponent;
  @ViewChild('popoverEst', { static: false }) popoverEst!: DxPopoverComponent;

  callbacks = [];




  //현재날짜
  now: Date = new Date();
  startDate: any;
  endDate: any;
  nowgretdDate: any;
  now1gretdDate: any;
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
  ResultCode: CommonCodeInfo;

  BusinessCategoryCode: TableCodeInfo;
  categoryCode: CommonCodeInfo;

  editingMode: boolean = false;
  editingModeTwo: boolean = false;

  //구분 value
  PrgstatusCodeValue: string | null = null;
  RegulationValue: string | null = null;
  ResultValue: string | null = null;

  //취급업종
  categorydataSource: any;

  localappConfig: AppConfigService;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  popuploadingVisible: boolean = false;

  //질문 파서블엔트리 값
  questionCodeValue: string | null = null;

  // 선택값
  selectGridData: ZMMS8030Model[] = [];
  // 선택값
  estselectGridData: ZMMT8370Model[] = [];
  listselectGridData: ZMMT8370Model[] = [];
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
  listSearchpopupVisible = false;

  noText: string = "조회된 공고가 없습니다.";
  target: any;
  //--------------------------------------------------------------------

  /**
   * 첨부 파일들
   * */
  attachFiles: AttachFileInfo[] = [];
  attachFilesTwo: AttachFileInfo[] = [];

  /**
   * 업로드 문서 번호
   * */
  uploadDocumentNo: string;
  uploadDocumentNoTwo: string;

  /**
   * OffcieXP 유틸리티
   * */
  offceXPUtility: OfficeXPUtility;

  /*
   *첨부파일 팝업
   */
  takePopupVisible: boolean = false;
  takePopupVisibleTwo: boolean = false;
  //--------------------------------------------------------------------



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
  closeButtonOptions: any;
  closeButtonOptionsTwo: any;
  //팝업 조회 버튼
  popupinquiryButtonOptions: any;
  //팝업 엑셀 버튼
  exportSelectedData: any;
  seqSelect: string;

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
  //검색데이터
  searchFormData: any;
  listSearchSelectedData: any;
  listSearchCloseButtonOptions: any;
  listSearchFormData: any;
  listSearchDetailFormData: any;
  listSearchDataSource: any;
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
  selectList: Seq[] = [];

  //버튼 제한
  isDisabled: boolean = false;

  //그리드 수정제한
  isEditing: boolean = true;

  //
  Longtext: string;

  //줄 선택
  selectedRowIndex = -1;
  selectedItemKeys: any[] = [];
  estselectedRowIndex = -1;
  estselectedItemKeys: any[] = [];
  tableresultModel: any;
  listSearchSaveButtonOptions: any;
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

    this.loadingVisible = true;
    this.offceXPUtility = new OfficeXPUtility(http, appConfig);

    this.displayExpr = "";
    this.localappConfig = appConfig;

    let test = this;

    this.PrgstatusCodeValue = "1";
    //this.RegulationValue = "1";

    if (!(authService.getUser().data?.deptId == "guest")) {
      this.btnVisible = !this.btnVisible;
    }
    this.zmmt8360 = new ZMMT8360Model(this.appConfig.mandt, "", "", "", "", new Date, "", new Date, "", 0, 0, 0, "", "", "", "", "", new Date, "", "", new Date, "", DIMModelStatus.UnChanged);

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 40), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.nowgretdDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.now1gretdDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

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
    this.ResultCode = appConfig.commonCode("견적결과");

    //취급 업종 코드
    this.categoryCode = appConfig.commonCode("취급업종");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.PrgstatusCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.BusinessCategoryCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.RegulationCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.categoryCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.ResultCode),


    ];
    PossibleEntryDataStoreManager.setDataStore("obpi", codeInfos, appConfig, dataService);


    const that = this;
    /*this.getCodeInfo();*/
    this.closeButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.takePopupVisible = false;
      }
    }
    this.closeButtonOptionsTwo = {
      text: '닫기',
      onClick(e: any) {
        that.takePopupVisibleTwo = false;
      }
    }
    //팝업 조회 버튼
    this.popupinquiryButtonOptions = {
      text: '조회',
      onClick: async (e: any) => {
        this.loadingVisible = true;

        this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

        this.detailFormData = this.selectGridData[0];

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

    //팝업 닫기 버튼
    this.listSearchCloseButtonOptions = {
      text: '닫기',
      onClick(e: any, thisObj: OBPIComponent) {
        that.listSearchpopupVisible = false;
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
          `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}'`, "RFQSEQ DESC", QueryCacheType.None);

        this.estimateDetailFormData = select8360Result;
        //8370
        var select8370Result = await dataService.SelectModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
          `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}' AND RFQSEQ = '${select8360Result[0].RFQSEQ}'`, "RFQSEQ DESC", QueryCacheType.None);
        this.estpopupData = new ArrayStore(
          {
            key: ["BIDNO"],
            data: select8370Result
          });
        this.estimateDataGrid.instance.getScrollable().scrollTo(0);

        this.loadingVisible = false;

      },
    };
    //견적팝업 저장 버튼
    this.estimatepopupsaveButtonOptions = {
      text: '제출',
      onClick: async (e: any, thisObj: OBPIComponent) => {


        var makeYn = false;
        var estmakeYn = false;
        var rfqcstData = false;
        var rfqamtData = false;
        var rfqvatData = false;
        var gretdData = false;
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

        if (this.nowgretdDate == "" || this.nowgretdDate == null || this.nowgretdDate == undefined) {
          gretdData = true;
        }
        if (gretdData) {
          alert(`납품 가능 일자가 입력되지 않았습니다.`, "알림");
          return;
        }

        if (this.RegulationValue == null) {
          alert("결재조건을 필수로 입력하십시오.", "알림");
          return;
        }
        let nowDDDate = formatDate(new Date(this.nowgretdDate), "yyyyMMdd", "en-US")

        let dlvdtDate = formatDate(data8300[0].DLVDT, "yyyyMMdd", "en-US")


        if (parseInt(dlvdtDate) < parseInt(nowDDDate)) {
          alert("납기일자 이후에는 납품이 불가능합니다.", "알림");
          return;
        }
        //단가가 빈값이면 alert
        this.estpopupData._array.forEach((array: any) => {
          if (array.CONPR == 0 || array.CONPR == null || array.CONPR == "") {
            estmakeYn = true;
            return;
          }
        });
        if (estmakeYn) {
          alert(`단가를 필수로 입력해주세요.`, "알림");
          return;
        }

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
            return
          }

        }
        if (Number.isNaN(checkData.RFQCST) || checkData.RFQCST == 0) {
          rfqcstData = true;
        }
        if (rfqcstData) {
          alert(`견적 공급가가 계산되지 않았습니다.`, "알림");
          return;
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
        if (await confirm("저장하시겠습니까?", "알림")) {
          this.popuploadingVisible = true;
          if (!makeYn && !estmakeYn && !rfqamtData && !rfqvatData) {
            if (parseInt(rfqdthDate) > parseInt(nowDate)) {
              var resultModel = await this.datainsert(this);
              if (resultModel?.ES_RESULT.TYPE !== "S") {
                alert(`견적 제출에 실패하였습니다.<br>오류메세지: ${resultModel?.ES_RESULT.MESSAGE}`, "알림");
              } else {
                // 파일첨부 저장 같이 넣어주기
                this.AttachFile.upload();
                alert(`견적 제출이 완료되었습니다.`, "알림");
              }
            }
            else if (parseInt(rfqdthDate) == parseInt(nowDate)) {
              if (parseInt(rfqdttDate) > parseInt(nowTime)) {
                var resultModel = await this.datainsert(this);
                if (resultModel?.ES_RESULT.TYPE !== "S") {
                  alert(`견적 제출에 실패하였습니다.<br>오류메세지: ${resultModel?.ES_RESULT.MESSAGE}`, "알림");
                } else {

                  // 파일첨부 저장 같이 넣어주기
                  this.AttachFile.upload();
                  alert(`견적 제출이 완료되었습니다.`, "알림");
                }
              } else {
                alert("견적 마감된 공고입니다.", "알림");
              }
            } else {
              alert("견적 마감된 공고입니다.", "알림");
            }
          }


        }
        this.estimatepopupVisible = false;
        this.dataLoad(this.imInfo, this.dataService);
        this.statusDataGrid.instance.refresh();
        this.popuploadingVisible = false;
      },

    }


    //견적내역저장 버튼
    this.listSearchSaveButtonOptions = {
      text: '저장',
      onClick: async (e: any, thisObj: OBPIComponent) => {
        var selectData = this.statusDataGrid.instance.getSelectedRowsData()[0];
        var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
        let userInfo = this.authService.getUser().data;
        var lifnr = userInfo?.deptId ?? "";

        this.seqSelect = selectData.RFQSEQ.padStart(3, '0');;
        var select8360Result = await this.dataService.SelectModelData<ZMMT8360Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}'`, "RFQSEQ DESC", QueryCacheType.None);
        if (this.listSearchDetailFormData.RFQSEQ !== select8360Result[0].RFQSEQ) {
          alert("이전 차수는 수정할 수 없습니다.", "알림");
          return;
        }
        else {

          var makeYn = false;
          var estmakeYn = false;
          var rfqcstData = false;
          var rfqamtData = false;
          var rfqvatData = false;
          var gretdData = false;
          var checkData = this.listSearchDetailFormData
          var result8300Model = await this.dataService.SelectModelData<ZMMT8300Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8300ModelList", [],
            `MANDT = '${this.appConfig.mandt}' AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);
          var data8300 = result8300Model;
          let nowDate = formatDate(new Date(), "yyyyMMdd", "en-US")
          let nowTime = formatDate(new Date(), "HHmmss", "en-US")
          let rfqdthDate = formatDate(data8300[0].RFQDTH, "yyyyMMdd", "en-US")
          let rfqdttDate = data8300[0].RFQDTT.replace(/:/g, '');

          if (select8360Result[0].RFQRST == "") {
            if (this.now1gretdDate == "" || this.now1gretdDate == null || this.now1gretdDate == undefined) {
              gretdData = true;
            }
            if (gretdData) {
              alert("납품 가능 일자가 입력되지 않았습니다.", "알림");
              return;
            }

            if (this.RegulationValue == null) {
              alert("결재조건을 필수로 입력하십시오.", "알림");
              return;
            }
            let nowDDDate = formatDate(new Date(this.nowgretdDate), "yyyyMMdd", "en-US")

            let dlvdtDate = formatDate(data8300[0].DLVDT, "yyyyMMdd", "en-US")


            if (parseInt(dlvdtDate) < parseInt(nowDDDate)) {
              alert("납기일자 이후에는 납품이 불가능합니다.", "알림");
              return;
            }

            //단가가 빈값이면 alert
            this.listSearchDataSource._array.forEach((array: any) => {
              if (array.RFQCST == "" || array.RFQCST == null || array.RFQCST == 0) {
                estmakeYn = true;
                return;
              }
            });
            if (estmakeYn) {
              alert(`단가를 필수로 입력해주세요.`, "알림");
            }
            //메이커 여부가 X일때
            if (this.listSearchFormData.MAKERYN == "X") {
              this.listSearchDataSource._array.forEach((array: any) => {
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
            this.listSearchDataSource._array.forEach((array: any) => {
              if (array.RFQCST == "" || array.RFQCST == null || array.RFQCST == 0 || array.RFQCST == "") {
                estmakeYn = true;
                return;
              }
            });
            if (estmakeYn) {
              alert(`단가를 필수로 입력해주세요.`, "알림");
            }
            if (Number.isNaN(checkData.RFQCST1) || checkData.RFQCST1 == 0) {
              rfqcstData = true;
            }
            if (rfqcstData) {
              alert(`견적 공급가가 계산되지 않았습니다.`, "알림");
              return;
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
            if (await confirm("수정하시겠습니까?", "알림")) {

              if (!makeYn && !estmakeYn && !rfqcstData && !rfqamtData && !rfqvatData) {
                if (parseInt(rfqdthDate) > parseInt(nowDate)) {
                  var resultModel = await this.dataUpdateInsert(this);
                  if (resultModel?.ES_RESULT.TYPE !== "S") {
                    alert(`견적 수정에 실패하였습니다.<vr>오류 메시지: ${resultModel?.ES_RESULT.MESSAGE}`, "알림");
                  } else {
                    this.AttachFile.upload();
                    alert(`견적 내용이 수정되었습니다.`, "알림");
                  }
                }
                else if (parseInt(rfqdthDate) == parseInt(nowDate)) {
                  if (parseInt(rfqdttDate) > parseInt(nowTime)) {
                    var resultModel = await this.dataUpdateInsert(this);
                    if (resultModel?.ES_RESULT.TYPE !== "S") {
                      alert(`견적 수정에 실패하였습니다.<vr>오류 메시지: ${resultModel?.ES_RESULT.MESSAGE}`, "알림");
                    } else {
                      this.AttachFile.upload();
                      alert(`견적 내용이 수정되었습니다.`, "알림");
                    }
                  } else {
                    alert("견적 마감된 공고입니다.", "알림");
                  }
                } else {
                  alert("견적 마감된 공고입니다.", "알림");
                }
              }

              this.statusDataGrid.instance.refresh();

              this.dataLoad(this.imInfo, this.dataService);

            }
          }
          else {
            alert("견적 결과가 나온 공고는 수정할 수 없습니다.", "알림");
          }

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
        var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
        let userInfo = this.authService.getUser().data;
        var lifnr = userInfo?.deptId ?? "";
        var select8360Result = await this.dataService.SelectModelData<ZMMT8360Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}'`, "RFQSEQ DESC", QueryCacheType.None);
        if (this.listSearchDetailFormData.RFQSEQ !== select8360Result[0].RFQSEQ) {
          alert("이전 차수는 삭제할 수 없습니다.", "알림");
          return;
        } {
          if (await confirm("삭제하시겠습니까?", "알림")) {
            await this.dataDelete(this.dataService, this);
          }
        }
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
    var resultModel = await dataService.RefcCallUsingModel<ZMMT8320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8320ModelList", modelList, QueryCacheType.None);
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

    var resultModel = await dataService.RefcCallUsingModel<ZMMBIDMstModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDMstModelList", modelList, QueryCacheType.None);


    if (resultModel[0].ES_RESULT.TYPE !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].ES_RESULT.MESSAGE}`, "알림");
      return [];
    }


    this.PrgstatusEntry.possbleDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");
    this.PrgstatusEntry.popupDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");

    return resultModel[0].ET_DATA;

  }

  // 상세 데이터 로드
  public async detaildataLoad(parent: OBPIComponent, BIDNO: string) {

    var userdata = await this.userdata(this.dataService);

    var zmms9000Model = new ZMMS9000Model("", "");

    var zmmbiddtlModel = new ZMMBIDDtlModel(zmms9000Model, BIDNO, userdata.LIFNR, "", []);

    var modeldtlList: ZMMBIDDtlModel[] = [zmmbiddtlModel];


    var result = await parent.dataService.RefcCallUsingModel<ZMMBIDDtlModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDDtlModelList", modeldtlList, QueryCacheType.None);

    result[0].ET_DATA.forEach(array => {
      if (array.MATNR_LONG == "") {
        array.MATNR_LONG = array.MATNRT;
      }
    });

    return result;

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
      var gretdDate = formatDate(this.nowgretdDate, "yyyyMMdd", "en-US")

      var lifnr = userInfo?.deptId ?? "";

      var zmms8031Model = new ZMMS8031Model("I", thisObj.estimateFormData.BIDNO, lifnr, thisObj.estimateDetailFormData.RFQSEQ, thisObj.estimateFormData.BIZNO, gretdDate,
        thisObj.estimateDetailFormData.PAYTY, thisObj.estimateDetailFormData.RFQCST, thisObj.estimateDetailFormData.RFQVAT, thisObj.estimateDetailFormData.RFQAMT,
        "", DIMModelStatus.Add);

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

  // 견적 내용 저장
  public async dataUpdateInsert(thisObj: OBPIComponent) {
    try {
      var zmms9000Model = new ZMMS9000Model("", "");
      let now = new Date().toISOString().substring(0, 10).replace(/-/g, '');
      let nowTime = formatDate(new Date(), "HHmmss", "en-US");
      var userInfo = thisObj.authService.getUser().data;
      var gretdDate = formatDate(this.now1gretdDate, "yyyyMMdd", "en-US")

      var lifnr = userInfo?.deptId ?? "";

      var zmms8031Model = new ZMMS8031Model("U", thisObj.listSearchFormData.BIDNO, lifnr, thisObj.listSearchDetailFormData.RFQSEQ, thisObj.listSearchFormData.BIZNO, gretdDate,
        thisObj.listSearchDetailFormData.PAYTY, thisObj.listSearchDetailFormData.RFQCST, thisObj.listSearchDetailFormData.RFQVAT, thisObj.listSearchDetailFormData.RFQAMT,
        this.attachFiles.length > 0 ? "X" : "", DIMModelStatus.Modify);

      this.listselectGridData = this.listSearchDataSource._array;

      var zmms8032ModelList: ZMMS8032Model[] = [];
      this.listselectGridData.forEach(async (array: any) => {


        zmms8032ModelList.push(new ZMMS8032Model(array.BANFN, array.BNFPO, array.RFQCST, array.MAKER, array.REMARK, DIMModelStatus.Modify));

      });


      var zmmrgqrtnModel = new ZMMRFQRtnModel(zmms9000Model, zmms8031Model, zmms8032ModelList);

      var modelList: ZMMRFQRtnModel[] = [zmmrgqrtnModel];

      var modifyModel = await this.dataService.RefcCallUsingModel<ZMMRFQRtnModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMRFQRtnModelList", modelList, QueryCacheType.None);

      return modifyModel[0];
    }
    catch (error: any) {
      alert(error, " 오류");
      return null;
    }

  }

  //견적내역 조회 
  public async listSearchDataLoad(dataService: ImateDataService, thisObj: OBPIComponent) {

    var bidno = thisObj.estimateFormData.BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;

    var lifnr = userInfo?.deptId ?? "";

    var rfqseq = "";
    var listSearch8360Model = await dataService.SelectModelData<ZMMT8360Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR =  '${lifnr}' AND RFQSEQ =  '${rfqseq}'`, "", QueryCacheType.None);

    return listSearch8360Model;
  }
  //데이터 삭제
  public async dataDelete(dataService: ImateDataService, thisObj: OBPIComponent) {
    let userInfo = this.authService.getUser().data;

    var bidno = thisObj.listSearchFormData.BIDNO.padStart(15, '0');
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
    //첨부파일 같이 삭제
    console.log("seq : " + select8360Result[0].RFQSEQ);
    if (select8360Result[0].RFQSEQ == "001") {
      this.AttachFile.deleteDocument(null);
      var result = this.offceXPUtility.deleteDocument(this.uploadDocumentNo);
      console.log(result);
    }
    this.listSearchpopupVisible = false;
  }

  //데이터 삭제
  public async listDataDelete(dataService: ImateDataService, thisObj: OBPIComponent) {
    let userInfo = this.authService.getUser().data;

    var bidno = thisObj.listSearchFormData.BIDNO.padStart(15, '0');
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
      }
    }
    var model8360List: ZMMT8360Model[] = [thisObj.zmmt8360];

    this.rowCount1 = await this.dataService.ModifyModelData<ZMMT8360Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", model8360List);
    this.rowCount2 = await this.dataService.ModifyModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", this.zmmt8370);

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

  //결제조건코드 값 변경
  onResultCodeValueChanged(e: any) {

    setTimeout(() => {
      this.listSearchDetailFormData.RFQRST = e.selectedValue
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
  DLVDTCheck: any = async (e: any) => {
    var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
    setTimeout(async () => {

      if (e.value == null || e.value == "") { }
      else {
        //8300데이터 가져오기
        var result8300Model = await this.dataService.SelectModelData<ZMMT8300Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8300ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);

        var data8300 = result8300Model;
        let nowDate = formatDate(new Date(e.value), "yyyyMMdd", "en-US")

        let dlvdtDate = formatDate(data8300[0].DLVDT, "yyyyMMdd", "en-US")


        if (parseInt(dlvdtDate) < parseInt(nowDate)) {
          alert("납기일자 이후에는 납품이 불가능합니다.", "알림");
          return;
        }
      }
    });
  }

  //상세내용
  DetailData: any = async (thisObj: OBPIComponent) => {
    try {
      this.popuploadingVisible = true;
      this.selectedItemKeys.forEach(async (key: any) => {
        var userInfo = this.authService.getUser().data;
        var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
        var lifnr = userInfo?.deptId ?? "";
        this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

        if (this.selectGridData[0].RFQPYN == "") {
          Object.assign(this.selectGridData[0], { RFQPYNM: "없음" });
        } else {
          Object.assign(this.selectGridData[0], { RFQPYNM: "있음" });
        }

        this.estimateFormData = this.selectGridData[0];

        //조회용 파일 첨부 팝업 띄우기
        this.editingMode = false;
        this.attachFiles = [];
        this.uploadDocumentNo = `MM${this.estimateFormData.BIDNO.padStart(15, '0')}`;
        this.offceXPUtility.getOffiXpAttachFileInfo(`MM${this.estimateFormData.BIDNO.padStart(15, '0')}`).then((fileInfos) => {
          this.attachFiles = fileInfos
        });

        //사업자등록번호, 회사명
        this.estimateFormData = Object.assign(this.estimateFormData, { BIZNO: userInfo?.pin, NAME1: userInfo?.deptName });
        var result8360Model = await this.dataService.SelectModelData<ZMMT8360Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}'`, "RFQSEQ DESC", QueryCacheType.None);

        if (result8360Model.length > 0) {
          //디테일 데이터
          var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);

          var result8370Model = await this.dataService.SelectModelData<ZMMT8370Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
            `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}'  AND RFQSEQ = '${result8360Model[0].RFQSEQ}'`, "RFQSEQ DESC", QueryCacheType.None);
          result8370Model.forEach((array: any) => {
            var resultData = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO && obj.BANFN == array.BANFN);


            if (resultData != undefined) {
              Object.assign(array, {
                MATNR: resultData.MATNR, MATNRT: resultData.MATNRT, MENGE: resultData.MENGE,
                MEINS: resultData.MEINS, MATNR_LONG: resultData.MATNR_LONG, KMATN_SPEC: resultData.KMATN_SPEC
              });
            }
          });
          this.popupData = new ArrayStore(
            {
              key: ["BIDNO", "BANFN", "BNFPO"],
              data: result8370Model
            });
          this.estimateDataGrid.instance.getScrollable().scrollTo(0);
          this.popuploadingVisible = false;
        }

        else if (result8360Model.length == 0) {
          var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);
          var result8370Model = await this.dataService.SelectModelData<ZMMT8370Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
            `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}' `, "RFQSEQ DESC", QueryCacheType.None);
          result8370Model.forEach((array: any) => {
            var resultData = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO && obj.BANFN == array.BANFN);


            if (resultData != undefined) {
              Object.assign(array, {
                MATNR: resultData.MATNR, MATNRT: resultData.MATNRT, MENGE: resultData.MENGE,
                MEINS: resultData.MEINS, MATNR_LONG: resultData.MATNR_LONG, KMATN_SPEC: resultData.KMATN_SPEC
              });
            }
          });
          this.popupData = new ArrayStore(
            {
              key: ["BIDNO", "BANFN", "BNFPO"],
              data: resultModel[0].ET_DATA
            });
          this.estimateDataGrid.instance.getScrollable().scrollTo(0);

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


        });

      });

      this.statuspopupVisible = !this.statuspopupVisible;


      setTimeout(() => {
        this.popuploadingVisible = false;
      }, 10000);

    } catch (error) {
      alert("오류가 발생했습니다.", "알림");
    }

  }
  //견적제출
  Duplication: any = async (thisObj: OBPIComponent) => {


    this.selectedItemKeys.forEach(async (key: any) => {
      this.popuploadingVisible = true;
      this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();
      var userData = this.authService.getUser().data;

      this.editingMode = true;
      this.attachFiles = [];
      this.uploadDocumentNo = `MM${this.selectGridData[0].BIDNO.padStart(15, '0')}${(userData?.pin ?? "").padStart(10, '0')}`;
      this.offceXPUtility.getOffiXpAttachFileInfo(`MM${this.selectGridData[0].BIDNO.padStart(15, '0')}${(userData?.pin ?? "").padStart(10, '0')}`).then((fileInfos) => {
        this.attachFiles = fileInfos
      });
      if (this.attachFiles.length > 0)
        Object.assign(this.selectGridData[0], { RFQPYNM: "있음" });
      else
        Object.assign(this.selectGridData[0], { RFQPYNM: "없음" });


      this.estimateFormData = this.selectGridData[0];

      Object.assign(this.estimateDetailFormData, { RFQCST: "", RFQVAT: "", RFQAMT: "" });



      //조회용 파일 첨부 팝업 띄우기
      this.editingModeTwo = false;
      this.attachFilesTwo = [];
      this.uploadDocumentNoTwo = `MM${this.estimateFormData.BIDNO.padStart(15, '0')}`;
      this.offceXPUtility.getOffiXpAttachFileInfo(`MM${this.estimateFormData.BIDNO.padStart(15, '0')}`).then((fileInfos) => {
        this.attachFilesTwo = fileInfos
      });

      var checkFlag = false;

      let userInfo = this.authService.getUser().data;
      var lifnr = userInfo?.deptId ?? "";
      var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
      this.nowgretdDate = "";
      //8300데이터 가져오기
      var result8300Model = await this.dataService.SelectModelData<ZMMT8300Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8300ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);
      //8320데이터 가져오기
      var result8320Model = await this.dataService.SelectModelData<ZMMT8320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8320ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND LIFNR  = '${lifnr}'AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);
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


      if (parseInt(rfqdthDate) > parseInt(nowDate)) {
        this.selectedItemKeys.forEach(async (key: any) => {


          var userInfo = this.authService.getUser().data;

          this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

          this.estimateFormData = this.selectGridData[0];

          Object.assign(this.estimateFormData, { BIZNO: userInfo?.pin, NAME1: userInfo?.deptName });

          var result8360Model = await this.formdataLoad(this.dataService, this);
          if (result8360Model.length > 0) {
            if (result8360Model[result8360Model.length - 1].RFQRST == "C" && this.selectGridData[0].BIDST == "5") {
              checkFlag = true;

              this.estimateDetailFormData = result8360Model[result8360Model.length - 1];

              this.estimateDetailFormData.RFQSEQ = (parseInt(result8360Model[result8360Model.length - 1].RFQSEQ) + 1).toString().padStart(3, '0');

              this.RegulationValue = result8360Model[result8360Model.length - 1].PAYTY;
              Object.assign(this.estimateDetailFormData, { RFQCST: "", RFQVAT: "", RFQAMT: "" });

            } else {
              checkFlag = false;

            }
          } else {

            checkFlag = true;

            this.estimateDetailFormData.RFQSEQ = "001";
            this.RegulationValue = "1";
          }
          if (checkFlag) {
            if (data8300[0].ANLOC != "" && data8300[0].ANDTH != null) {
              if (result8320Model.length == 0) {
                alert("현장설명회 미 참석으로 견적 제출이 불가합니다.", "알림");
                return;
              }
              else {
                if (result8320Model[0].ANCHK != "X") {
                  alert("현장설명회 미 참석으로 견적 제출이 불가합니다.", "알림");
                  return;
                }
              }
            }

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
                  MEINS: resultData.MEINS, CONPR: resultData.CONPR, MAKER: resultData.MAKER, REMARK: resultData.REMARK,
                  MATNR_LONG: resultData.MATNR_LONG, KMATN_SPEC: resultData.KMATN_SPEC

                });
              }
            });

            resultModel[0].ET_DATA.forEach((array: any) => {
              Object.assign(array, { RFQCST: 0, RFQVAT: 0, RFQAMT: 0 });
            });

            this.estpopupData = new ArrayStore(
              {
                key: ["BIDNO", "BANFN", "BNFPO"],
                data: resultModel[0].ET_DATA
              });
            this.estimateDataGrid.instance.getScrollable().scrollTo(0);

          }
          else {
            alert("견적결과가 재견적일 경우에만 견적제출이 가능합니다.\t<br> ( 견적 수정 및 삭제는 견적 내역에서 가능합니다. )", "알림");
          }


        });
      }

      else if (parseInt(rfqdthDate) == parseInt(nowDate)) {
        //견적마감 시간이 현재 시간보다 남았을 때
        if (parseInt(rfqdttDate) > parseInt(nowTime)) {
          this.selectedItemKeys.forEach(async (key: any) => {


            var userInfo = this.authService.getUser().data;

            this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

            this.estimateFormData = this.selectGridData[0];

            Object.assign(this.estimateFormData, { BIZNO: userInfo?.pin, NAME1: userInfo?.deptName });

            if (this.estimateFormData.MAKERYN != "X") {
              this.estimateDataGrid.instance.columnOption("MAKER", "allowEditing", false);
            } else {
              this.estimateDataGrid.instance.columnOption("MAKER", "allowEditing", true);
            }

            var result8360Model = await this.formdataLoad(this.dataService, this);

            if (result8360Model.length > 0) {
              if (result8360Model[result8360Model.length - 1].RFQRST == "C" && this.selectGridData[0].BIDST == "5") {
                checkFlag = true;

                this.estimateDetailFormData = result8360Model[result8360Model.length - 1];

                this.estimateDetailFormData.RFQSEQ = (parseInt(result8360Model[result8360Model.length - 1].RFQSEQ) + 1).toString().padStart(3, '0');

                this.RegulationValue = result8360Model[result8360Model.length - 1].PAYTY;
                Object.assign(this.estimateDetailFormData, { RFQCST: "", RFQVAT: "", RFQAMT: "" });

              } else {
                checkFlag = false;

              }
            } else {
              checkFlag = true;

              this.estimateDetailFormData.RFQSEQ = "001";
              this.RegulationValue = "1";
            }
            if (checkFlag) {
              if (data8300[0].ANLOC != "" && data8300[0].ANDTH != null) {

                if (result8320Model.length == 0) {
                  alert("현장설명회 미 참석으로 견적 제출이 불가합니다.", "알림");
                  return;
                }
                else {
                  if (result8320Model[0].ANCHK != "X") {
                    alert("현장설명회 미 참석으로 견적 제출이 불가합니다.", "알림");
                    return;
                  }
                }
              }
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
                    MEINS: resultData.MEINS, CONPR: resultData.CONPR, MAKER: resultData.MAKER, REMARK: resultData.REMARK,
                    MATNR_LONG: resultData.MATNR_LONG, KMATN_SPEC: resultData.KMATN_SPEC

                  });
                }
              });

              resultModel[0].ET_DATA.forEach((array: any) => {
                Object.assign(array, { RFQCST: 0, RFQVAT: 0, RFQAMT: 0 });
              });

              this.estpopupData = new ArrayStore(
                {
                  key: ["BIDNO", "BANFN", "BNFPO"],
                  data: resultModel[0].ET_DATA
                });
              this.estimateDataGrid.instance.getScrollable().scrollTo(0);

            }
            else {
              alert("견적결과가 재견적일 경우에만 견적제출이 가능합니다.\t<br> ( 견적 수정 및 삭제는 견적 내역에서 가능합니다. )", "알림");
            }
          });
        } else {
          alert("견적 제출 마감 시간 경과되었습니다.<br> 공고 상세 내용을 참조해주세요", "알림");
        }
      }
      else {
        alert("견적 제출 마감 시간 경과되었습니다.<br> 공고 상세 내용을 참조해주세요", "알림");
      }
    });

    this.popuploadingVisible = false;
  }



  ListSearch: any = async (thisObj: OBPIComponent) => {

    this.popuploadingVisible = true;

    var userData = this.authService.getUser().data;
    var selectData = this.statusDataGrid.instance.getSelectedRowsData()[0];

    var bidno = selectData.BIDNO.padStart(15, '0');
    var lifnr = (userData?.deptId ?? "").padStart(10, '0');

    var bizNo = (userData?.pin ?? "").padStart(10, '0');

    //조회용 파일 첨부 팝업 띄우기
    this.editingMode = true;
    this.attachFiles = [];
    this.uploadDocumentNo = `MM${bidno}${bizNo}`;
    this.offceXPUtility.getOffiXpAttachFileInfo(`MM${bidno}${bizNo}`).then((fileInfos) => {
      this.attachFiles = fileInfos
    });

    //조회용 파일 첨부 팝업 띄우기
    this.editingModeTwo = false;
    this.attachFilesTwo = [];
    this.uploadDocumentNoTwo = `MM${bidno}`;
    this.offceXPUtility.getOffiXpAttachFileInfo(`MM${bidno}`).then((fileInfos) => {
      this.attachFilesTwo = fileInfos
      Object.assign(selectData, { RFQPYNM: "있음" });
    });

    this.regulationEntery.ClearSelectedValue();
    this.resultEntery.ClearSelectedValue();


    this.listSearchFormData = selectData;

    this.listSearchFormData.BIZNO = userData?.pin ?? "";
    this.listSearchFormData.NAME1 = userData?.deptName ?? "";

    this.selectList = [];
    for (var i = 1; i <= parseInt(selectData.RFQSEQ ?? 0); i++) {
      var seq = i.toString().padStart(3, '0');
      this.selectList.push(new Seq(seq, "[차수] " + seq));
    }
    this.seqSelect = selectData.RFQSEQ.padStart(3, '0');;


    this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

    this.listSearchFormData = this.selectGridData[0];
    this.listSearchFormData = Object.assign(this.listSearchFormData, { BIZNO: userData?.pin, NAME1: userData?.deptName });

    var result8370Model = await this.datagridLoad(this.dataService, this);
    var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);


    var select8360Result = await this.dataService.SelectModelData<ZMMT8360Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}'`, "RFQSEQ DESC", QueryCacheType.None);

    if (select8360Result.length > 0) {
      this.nowgretdDate = select8360Result[0].GRETD
      this.ResultValue = select8360Result[0].RFQRST
      this.listSearchDetailFormData = select8360Result[0];
      this.listSearchDetailFormData = Object.assign(this.listSearchDetailFormData, {
        GRETD: select8360Result[0].GRETD, PAYTY: select8360Result[0].PAYTY, RFQSEQ: select8360Result[0].RFQSEQ,
        RFQCST: select8360Result[0].RFQCST, RFQVAT: select8360Result[0].RFQVAT, RFQAMT: select8360Result[0].RFQAMT
      });

      //8370
      var result8370Model = await this.dataService.SelectModelData<ZMMT8370Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}' AND RFQSEQ = '${select8360Result[0].RFQSEQ}'`, "RFQSEQ DESC", QueryCacheType.None);
      result8370Model.forEach((array: any) => {
        var resultData = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO && obj.BANFN == array.BANFN);

        if (resultData != undefined) {
          Object.assign(array, {
            MATNR: resultData.MATNR, MATNRT: resultData.MATNRT, MENGE: resultData.MENGE,
            MEINS: resultData.MEINS, MATNR_LONG: resultData.MATNR_LONG, KMATN_SPEC: resultData.KMATN_SPEC
          });
        }
      });
      this.RegulationValue = "1";
      this.listSearchDataSource = new ArrayStore(
        {
          key: ["BIDNO", "BANFN", "BNFPO"],
          data: result8370Model
        });
      this.estimateDataGrid.instance.getScrollable().scrollTo(0);

      var data: Array<any> = this.listSearchDataSource._array;
      data.forEach(async (array: any) => {

        var MENGEdata = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO);

        if (MENGEdata != undefined) {
          if (this.listSearchFormData.BIDRUL == "A") {
            array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
            array.RFQVAT = parseInt(array.RFQCST1) * 0.1
            array.RFQAMT = parseInt(array.RFQCST1) + parseInt(array.RFQVAT)
          }

          else {
            array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
            if (this.listSearchFormData.VATTY == "OUT") {
              array.RFQVAT = parseInt(array.RFQCST1) * 0.1
            } else {
              array.RFQVAT = "0"
            }
            array.RFQAMT = parseInt(array.RFQCST1) + parseInt(array.RFQVAT)
          }
        }
        this.loadingVisible = false;

      });
      this.listSearchpopupVisible = !this.listSearchpopupVisible;


    } else {
      alert("견적 내역이 없습니다.", "알림");

    }
    this.popuploadingVisible = false;

  }


  movePage(e: any) {
    this.router.navigate(['obmr']);
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

    var row = e.data;
    if (this.estimateFormData.BIDRUL == "A") {
      if (row.CONPR == 0 || row.CONPR == undefined || Number.isNaN(row.CONPR)) {
        row.CONPR = 0
      }
      row.RFQCST = parseInt(row.MENGE) * parseInt(row.CONPR);
      row.RFQVAT = parseInt(row.RFQCST) * 0.1
      row.RFQAMT = parseInt(row.RFQCST) + parseInt(row.RFQVAT)
    } else {
      if (row.CONPR == 0 || row.CONPR == undefined || Number.isNaN(row.CONPR)) {
        row.CONPR = 0
      }
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




  async seqChange(e: any) {

    this.regulationEntery.ClearSelectedValue();
    this.resultEntery.ClearSelectedValue();

    var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);
    var userData = this.authService.getUser().data;
    var seq = this.seqSelect;
    var bidno = this.listSearchFormData.BIDNO.padStart(15, '0');
    var lifnr = userData?.deptId ?? "";
    var select8360Result = await this.dataService.SelectModelData<ZMMT8360Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}'  AND RFQSEQ = '${seq}' `, "", QueryCacheType.None);
    this.listSearchDetailFormData = select8360Result[0];
    this.now1gretdDate = select8360Result[0].GRETD;
    this.ResultValue = select8360Result[0].RFQRST

    var result8370Model = await this.dataService.SelectModelData<ZMMT8370Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}' AND RFQSEQ = '${select8360Result[0].RFQSEQ}' AND RFQSEQ = '${seq}'`, "RFQSEQ DESC", QueryCacheType.None);
    result8370Model.forEach((array: any) => {
      var resultData = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO && obj.BANFN == array.BANFN);

      if (resultData != undefined) {
        Object.assign(array, {
          MATNR: resultData.MATNR, MATNRT: resultData.MATNRT, MENGE: resultData.MENGE,
          MEINS: resultData.MEINS, MATNR_LONG: resultData.MATNR_LONG, KMATN_SPEC: resultData.KMATN_SPEC
        });
      }
    });
    this.RegulationValue = "1";
    this.listSearchDataSource = new ArrayStore(
      {
        key: ["BIDNO", "BANFN", "BNFPO"],
        data: result8370Model
      });

    var data: Array<any> = this.listSearchDataSource._array;
    data.forEach(async (array: any) => {

      var MENGEdata = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO);

      if (MENGEdata != undefined) {
        if (this.listSearchFormData.BIDRUL == "A") {
          array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
          array.RFQVAT = parseInt(array.RFQCST1) * 0.1
          array.RFQAMT = parseInt(array.RFQCST1) + parseInt(array.RFQVAT)
        }

        else {
          array.RFQCST1 = parseInt(array.MENGE) * parseInt(array.RFQCST);
          if (this.listSearchFormData.VATTY == "OUT") {
            array.RFQVAT = parseInt(array.RFQCST1) * 0.1
          } else {
            array.RFQVAT = "0"
          }
          array.RFQAMT = parseInt(array.RFQCST1) + parseInt(array.RFQVAT)
        }
      }
    });
  }
  listSearchRowUpdate(e: any) {
    var row = e.data;
    if (this.listSearchFormData.BIDRUL == "A") {
      if (row.RFQCST == 0 || row.RFQCST == undefined || Number.isNaN(row.RFQCST)) {
        row.RFQCST = 0
      }
      row.RFQCST1 = parseInt(row.MENGE) * parseInt(row.RFQCST);
      row.RFQVAT = parseInt(row.RFQCST1) * 0.1
      row.RFQAMT = parseInt(row.RFQCST1) + parseInt(row.RFQVAT)
    } else {
      if (row.RFQCST == 0 || row.RFQCST == undefined || Number.isNaN(row.RFQCST)) {
        row.RFQCST = 0
      }
      row.RFQCST = parseInt(row.MENGE) * parseInt(row.RFQCST);
      if (this.estimateFormData.VATTY == "OUT") {
        //견적 부가세 = 견적 공급가 * 0.1
        row.RFQVAT = parseInt(row.RFQCST1) * 0.1
        // 부가세가 IN이면
      } else {
        // 견적 부가세 = 0
        row.RFQVAT = "0"
      }
      row.RFQAMT = parseInt(row.RFQCST1) + parseInt(row.RFQVAT)

    }
    //데이터 그리드 총액 더하기
    var rfgcst1: number = 0;
    var rfgvat1: number = 0;
    var rfgamt1: number = 0;

    var data: Array<any> = this.listSearchDataSource._array;

    data.forEach(async (array: any) => {
      rfgcst1 = rfgcst1 + parseInt(array.RFQCST1);
      rfgvat1 = rfgvat1 + parseInt(array.RFQVAT);
      rfgamt1 = rfgamt1 + parseInt(array.RFQAMT);

    });
    Object.assign(this.listSearchDetailFormData, { RFQCST: rfgcst1, RFQVAT: rfgvat1, RFQAMT: rfgamt1 });
  }

  async onPrgstatusDataLoaded(e: any) {
    this.loadePeCount++;

    this.PrgstatusEntry.possbleDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");
    this.PrgstatusEntry.popupDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.PrgstatusCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


      //---------------------------------------------------------------------------------
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

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.RegulationCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.RegulationCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


    }
  }
  async onResultDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.ResultCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.ResultCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);


    }
  }

  fileShowPopup() {

    this.takePopupVisible = true;

  }

  fileBidShowPopup() {

    this.takePopupVisibleTwo = true;

  }
  attachFileChanged(e: any) {

    if (this.attachFiles.length > 0) {
      if (this.estimatepopupVisible)
        this.estimateFormData.RFQPYNM = "있음";
      else if (this.listSearchpopupVisible)
        this.listSearchFormData.RFQPYNM = "있음";

    }
    else {
      if (this.estimatepopupVisible)
        this.estimateFormData.RFQPYNM = "없음";
      else if (this.listSearchpopupVisible)
        this.listSearchFormData.RFQPYNM = "없음";
    }
  }

  async onCellHoverChangedDetail(e: any) {
    if (e.rowType == "data" && e.rowIndex >= 0) {
      if (e.column.dataField === "MATNRT") {

        var zmmtTextModel = new ZMMBIDTextModel(new ZMMS9000Model("", ""), e.data.BANFN, e.data.BNFPO, []);
        var modelList: ZMMBIDTextModel[] = [zmmtTextModel];

        var resultModel = await this.dataService.RefcCallUsingModel<ZMMBIDTextModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDTextModelList", modelList, QueryCacheType.None);
        this.Longtext = resultModel[0].ET_DATA[0].TDLINE;
        
        //this.Longtext = e.rowIndex + "테스트";
        if (e.eventType === "mouseover") {
          this.target = e.cellElement;
          this.popoverDetail.instance.show();
        }
        if (e.eventType === "mouseout") {
          this.popoverDetail.instance.hide();
        }
      }
    }
  }
  async onCellHoverChangedList(e: any) {
    if (e.rowType == "data" && e.rowIndex >= 0) {
      if (e.column.dataField === "MATNRT") {
        var zmmtTextModel = new ZMMBIDTextModel(new ZMMS9000Model("", ""), e.data.BANFN, e.data.BNFPO, []);
        var modelList: ZMMBIDTextModel[] = [zmmtTextModel];

        var resultModel = await this.dataService.RefcCallUsingModel<ZMMBIDTextModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDTextModelList", modelList, QueryCacheType.None);
        this.Longtext = resultModel[0].ET_DATA[0].TDLINE;

        //this.Longtext = e.rowIndex + "테스트";
        if (e.eventType === "mouseover") {
          this.target = e.cellElement;
          this.popoverList.instance.show();
        }
        if (e.eventType === "mouseout") {
          this.popoverList.instance.hide();
        }
      }
    }
  }
   async onCellHoverChangedEst(e: any) {
    if (e.rowType == "data" && e.rowIndex >= 0) {
      if (e.column.dataField === "MATNRT") {
        var zmmtTextModel = new ZMMBIDTextModel(new ZMMS9000Model("", ""), e.data.BANFN, e.data.BNFPO, []);
        var modelList: ZMMBIDTextModel[] = [zmmtTextModel];

        var resultModel = await this.dataService.RefcCallUsingModel<ZMMBIDTextModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDTextModelList", modelList, QueryCacheType.None);
        this.Longtext = resultModel[0].ET_DATA[0].TDLINE;
        
        //this.Longtext = e.rowIndex + "테스트";
        if (e.eventType === "mouseover") {
          this.target = e.cellElement;
          this.popoverEst.instance.show();
        }
        if (e.eventType === "mouseout") {
          this.popoverEst.instance.hide();
        }
      }
    }
  }
}
