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
import { AttachFileInfo, CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZMMBIDMstModel, ZMMS8030Model, ZMMS9000Model, RSISSRangeModel } from '../../../shared/dataModel/OBPPT/ZmmBidMst';
import { ZMMT8360Model } from '../../../shared/dataModel/OBPPT/Zmmt8360';
import { ZMMT8370Model } from '../../../shared/dataModel/OBPPT/Zmmt8370';
import { ZMMT8320Model } from '../../../shared/dataModel/OBPPT/Zmmt8320';
import { ZMMT8500Model } from '../../../shared/dataModel/OBPPT/Zmmt8500';
import { ZMMT8300Model } from '../../../shared/dataModel/OBPPT/Zmmt8300';

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
import { OfficeXPUtility } from '../../../shared/officeXp.utility';
import { AttachFileComponent } from '../../../shared/components/attach-file/attach-file.component';

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
  @ViewChild('chkgbox1', { static: false }) chkgbox1!: DxCheckBoxComponent;
  @ViewChild('AttachFile', { static: false }) AttachFile!: AttachFileComponent;

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
  selectANDTHData: any;
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

  //--------------------------------------------------------------------

  /**
   * 첨부 파일들
   * */
  attachFiles: AttachFileInfo[] = [];

  /**
   * 업로드 문서 번호
   * */
  uploadDocumentNo: string;

  /**
   * OffcieXP 유틸리티
   * */
  offceXPUtility: OfficeXPUtility;

  /*
   *첨부파일 팝업
   */
  takePopupVisible: boolean = false;


  closeFileButtonOptions: any;


  editingMode: boolean = false;

  //--------------------------------------------------------------------

  noText: string = "조회된 공고가 없습니다.";

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
  firstText: string;
  secondText: string;

  RFQSEQdata: string = "";
  _dataService: ImateDataService;
  dataSource: any;
  zmmt8500!: ZMMT8500Model;
  formData: any = {};
  estimateDeleteSelectedData: any;

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

    //첨부파일

    this.offceXPUtility = new OfficeXPUtility(http, appConfig);


    this.PrgstatusCodeValue = "2";

    var userInfo = this.authService.getUser().data;
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 40), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    //텍스트박스 데이터
    this.firstText = service.getContent("first");
    this.secondText = service.getContent("second");
    this.biznoValue = userInfo?.pin ?? "";
    this.cpNameValue = userInfo?.deptName ?? "";
    this.displayExpr = "";
    this.localappConfig = appConfig;

    let test = this;

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
    this.closeFileButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.takePopupVisible = !this.takePopupVisible;
      },
    };


    //상세내용 엑셀 버튼
    this.exportSelectedData = {
      text: '엑셀 다운',
      onClick(e: any, thisObj: OBBDComponent) {
        that.estimateDataGrid.export.enabled = true;
        //that.estimateDataGrid.export.fileName = 'Report';
        //that.estimateDataGrid.instance.exportToExcel(false);
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
        var value1 = this.chkgbox1.value;
        var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
        let userInfo = this.authService.getUser().data;
        var lifnr = userInfo?.deptId ?? "";
        var result8300Model = await this.dataService.SelectModelData<ZMMT8300Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8300ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);
        var result8320Model = await this.dataService.SelectModelData<ZMMT8320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8320ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND LIFNR  = '${lifnr}'AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);
        var result8500Model = await this.dataService.SelectModelData<ZMMT8500Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8500ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND LIFNR  = '${lifnr}'AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);
        var biddingData = result8500Model;
        var data8300 = result8300Model;
        let nowDate = formatDate(new Date(), "yyyyMMdd", "en-US")
        let nowTime = formatDate(new Date(), "HHmmss", "en-US")
        let qradthDate = formatDate(data8300[0].QTADTH, "yyyyMMdd", "en-US")
        let qradttDate = data8300[0].QTADTT.replace(/:/g, '');

          if (await confirm("입찰신청하시겠습니까?", "알림")) {
            if (result8300Model[0].ANLOC == "" || result8300Model[0].ANDTT == "") {


              this.loadingVisible = true;

              if ((this.biddingDetailFormData.INSAMT == "" || this.biddingDetailFormData.INSAMT == 0 || this.biddingDetailFormData.INSAMT == "0") && this.biddingDetailFormData.INSTY != "4") {
                alert("보증금액을 입력해주세요.", "알림");
                return;
              }
              else if (this.biddingDetailFormData.INSTY == "") {
                alert("보증방법을 입력해주세요.", "알림");
                return;
              } else {
                  if (this.biddingDetailFormData.INSTY == "2") {
                    if (this.biddingDetailFormData.INSCMY == null || this.biddingDetailFormData.INSCMY == "") {
                      alert("이행보증증권일 시 보증 회사를 입력해주세요.", "알림");
                      return;
                    } else {
                      if (value == true && value1 == true) {

                        if ((parseInt(qradthDate) > parseInt(nowDate)) || ((parseInt(qradthDate) == parseInt(nowDate)) && (parseInt(qradttDate) > parseInt(nowTime)))) {
                          if (biddingData.length > 0) {
                            this.dataModify(this)
                            this.AttachFile.upload();
                            alert("수정 되었습니다.", "알림");
                          } else {
                            this.datainsert(this)
                            this.AttachFile.upload();
                            alert("입찰신청이 되었습니다.", "알림");
                          }

                        } else {
                        alert("입찰 신청이 마감된 공고입니다.", "알림");
                        return;
                      }
                      } else {
                        alert("동의를 눌러주세요.", "알림");
                        return;
                      }
                    }
                  }
                  else if (this.biddingDetailFormData.INSTY == "4") {
                    if (this.biddingDetailFormData.PASSY == null || this.biddingDetailFormData.PASSY == "") {
                      alert("면제일 시 납부면제 사유를 입력해주세요.", "알림");
                      return;
                    } else {
                      if (value == true && value1 == true) {
                        if ((parseInt(qradthDate) > parseInt(nowDate)) || ((parseInt(qradthDate) == parseInt(nowDate)) && (parseInt(qradttDate) > parseInt(nowTime)))) {
                          if (biddingData.length > 0) {
                            this.dataModify(this);
                            this.AttachFile.upload();
                            alert("수정 되었습니다.", "알림");
                          } else {
                            this.datainsert(this);
                            this.AttachFile.upload();
                            alert("입찰신청이 되었습니다.", "알림");
                          }
                      } else {
                        alert("입찰 마감된 공고입니다.", "알림");
                        return;
                        }
                      } else {
                        alert("동의를 눌러주세요.", "알림");
                        return;
                      }
                    }

                  } else {
                    if (value == true && value1 == true) {
                      if ((parseInt(qradthDate) > parseInt(nowDate)) || ((parseInt(qradthDate) == parseInt(nowDate)) && (parseInt(qradttDate) > parseInt(nowTime)))) {
                        if (biddingData.length > 0) {
                          this.dataModify(this);
                          this.AttachFile.upload();
                          alert("수정 되었습니다.", "알림");
                        } else {
                          this.datainsert(this);
                          this.AttachFile.upload();
                          alert("입찰신청이 되었습니다.", "알림");
                        }
                      } else {
                        alert("입찰 신청이 마감된 공고입니다.", "알림");
                        return;
                      }
                    } else {
                      alert("동의를 눌러주세요.", "알림");
                      return;
                    }
                  }
              }
            }
            else {
              if (result8320Model[0].ANCHK == "") {
                alert("현장설명회 미 참석으로 입찰 진행이 불가합니다.", "알림");
              } else { 
                if ((this.biddingDetailFormData.INSAMT == "" || this.biddingDetailFormData.INSAMT == 0 || this.biddingDetailFormData.INSAMT == "0") && this.biddingDetailFormData.INSTY != "4") {
                alert("보증금액을 입력해주세요.", "알림");
                return;
              }
              else if (this.biddingDetailFormData.INSTY == "") {
                alert("보증방법을 입력해주세요.", "알림");
                return;
              } else {
                  if (this.biddingDetailFormData.INSTY == "2") {

                    if (this.biddingDetailFormData.INSCMY == null || this.biddingDetailFormData.INSCMY == "") {
                      alert("이행보증증권일 시 보증 회사를 입력해주세요.", "알림");
                    } else {
                      if (value == true && value1 == true) {

                        if ((parseInt(qradthDate) > parseInt(nowDate)) || ((parseInt(qradthDate) == parseInt(nowDate)) && (parseInt(qradttDate) > parseInt(nowTime)))) {
                          if (biddingData.length > 0) {
                            this.dataModify(this);
                            this.AttachFile.upload();
                            alert("수정 되었습니다.", "알림");
                          } else {
                            this.datainsert(this);
                            this.AttachFile.upload();
                            alert("입찰신청이 되었습니다.", "알림");
                          }
                        } else {
                          alert("입찰 신청이 마감된 공고입니다.", "알림");
                          return;
                        }
                      } else {
                        alert("동의를 눌러주세요.", "알림");
                        return;
                      }
                    }
                  } else if (this.biddingDetailFormData.INSTY == "4") {
                    if (this.biddingDetailFormData.PASSY == null || this.biddingDetailFormData.PASSY == "") {
                      alert("면제일 시 납부면제 사유를 입력해주세요.", "알림");
                    } else {
                      if (value == true && value1 == true) {

                        if ((parseInt(qradthDate) > parseInt(nowDate)) || ((parseInt(qradthDate) == parseInt(nowDate)) && (parseInt(qradttDate) > parseInt(nowTime)))) {
                          if (biddingData.length > 0) {
                            this.dataModify(this);
                            this.AttachFile.upload();
                            alert("수정 되었습니다.", "알림");
                          } else {
                            this.datainsert(this);
                            this.AttachFile.upload();
                            alert("입찰신청이 되었습니다.", "알림");
                          }
                        } else {
                          alert("입찰 신청이 마감된 공고입니다.", "알림");
                          return;
                        }
                      } else {
                        alert("동의를 눌러주세요.", "알림");
                        return;
                      }
                    }

                  } else {
                    if (value == true && value1 == true) {

                      if ((parseInt(qradthDate) > parseInt(nowDate)) || ((parseInt(qradthDate) == parseInt(nowDate)) && (parseInt(qradttDate) > parseInt(nowTime)))) {
                        if (biddingData.length > 0) {
                          this.dataModify(this);
                          this.AttachFile.upload();
                          alert("수정 되었습니다.", "알림");
                        } else {
                          this.datainsert(this);
                          this.AttachFile.upload();
                          alert("입찰신청이 되었습니다.", "알림");
                        }
                      } else {
                        alert("입찰 신청이 마감된 공고입니다.", "알림");
                        return;
                      }
                    } else {
                      alert("동의를 눌러주세요.", "알림");
                      return;
                    }
                  }

              }

            }
            

          }
          this.loadingVisible = false;
        }

      },

    }
    //견적팝업 삭제 버튼
    this.estimateDeleteSelectedData = {
      text: '삭제',
      onClick: async (e: any) => {
        if (await confirm("삭제하시겠습니까?", "알림")) {
          await this.dataDelete(this.dataService, this);
        }

      },
    };
    //견적팝업 엑셀 버튼
    this.estimateexportSelectedData = {
      text: '엑셀 다운',
      onClick(e: any, thisObj: OBBDComponent) {
        that.biddingDataGrid.export.enabled = true;
        //that.biddingDataGrid.export.fileName = 'Report';
        //that.biddingDataGrid.instance.exportToExcel(false);
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
    let userInfo = this.authService.getUser().data;
    var LIFNR = userInfo?.deptId ?? "";
    var zmms9000Model = new ZMMS9000Model("", "");
    //진행상태가 2번이어야지만 가능
    var zmmbidmstModel = new ZMMBIDMstModel(zmms9000Model, this.startDate, this.endDate, this.PrgstatusEntry.selectedValue ?? "", LIFNR, [], []);

    var modelList: ZMMBIDMstModel[] = [zmmbidmstModel];

    this.loadingVisible = true;
    var resultModel = await dataService.RefcCallUsingModel<ZMMBIDMstModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDMstModelList", modelList, QueryCacheType.None);
    this.loadingVisible = false;


    if (resultModel[0].ES_RESULT.TYPE !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].ES_RESULT.MESSAGE}`, "알림");
      return [];
    }


    this.PrgstatusEntry.possbleDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");
    this.PrgstatusEntry.popupDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");

    return resultModel[0].ET_DATA;

  }

  // 상세 데이터 로드
  public async detaildataLoad(parent: OBBDComponent, BIDNO: string) {

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
  public async formdataLoad(dataService: ImateDataService, thisObj: OBBDComponent) {
    var bidno = thisObj.estimateFormData.BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;

    var lifnr = userInfo?.deptId ?? "";
    var result8360Model = await dataService.SelectModelData<ZMMT8360Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "", QueryCacheType.None);

    return result8360Model;

  }

  // 상세 8370 견적 로드
  public async datagridLoad(dataService: ImateDataService, thisObj: OBBDComponent) {


    var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;
    var lifnr = userInfo?.deptId ?? "";

    var result8370Model = await dataService.SelectModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND  BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "", QueryCacheType.None);

    return result8370Model;

  }

  // 8500 견적 로드
  public async biddingdataLoad(dataService: ImateDataService, thisObj: OBBDComponent) {

    var bidno = thisObj.detailFormData.BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;
    var lifnr = userInfo?.deptId ?? "";

    var result8500Model = await dataService.SelectModelData<ZMMT8500Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "", QueryCacheType.None);

    return result8500Model;

  }

  // 입찰 8370 견적 로드
  public async biddingdatagridLoad(dataService: ImateDataService, thisObj: OBBDComponent) {


    var bidno = thisObj.detailFormData.BIDNO.padStart(15, '0');
    let userInfo = this.authService.getUser().data;
    var lifnr = userInfo?.deptId ?? "";

    var resultModel = await dataService.SelectModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR =  '${lifnr}'`, "", QueryCacheType.None);

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
      let nowTime = formatDate(new Date(), 'HH:mm:ss', "en-US");
      let minDate = new Date("0001-01-01");
      let minTime = formatDate(new Date("0001-01-01"), 'HHmmss', "en-US");

      var waers = userInfo?.baseCurrecy ?? "";
      var insertData = thisObj.biddingDetailFormData as ZMMT8500Model;
      var maininsertData = new ZMMT8500Model(this.appConfig.mandt,  bidno, lifnr, bizno, "보증금율 : 견적총액(VAT포함)의 5%", insertData.INSAMT /100, waers, insertData.INSTY, insertData.INSCMY,
        insertData.PASSY, now, nowTime, "", "", minDate, minTime, this.attachFiles.length > 0 ? "X" : "", this.attachFiles.length > 0 ? "X" : "",this.appConfig.interfaceId, now, nowTime, this.appConfig.interfaceId, now, nowTime, DIMModelStatus.Add);
      insertData.ModelStatus = DIMModelStatus.Add;

      var modelList: ZMMT8500Model[] = [maininsertData];

      this.rowCount = await this.dataService.ModifyModelData<ZMMT8500Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8500ModelList", modelList);
    }
    catch (error) {
      alert("error", "알림");
    }
  }
  // 데이터 저장
  public async dataModify(thisObj: OBBDComponent) {
    try {
      let userInfo = this.authService.getUser().data;

      var lifnr = userInfo?.deptId ?? "";
      var bidno = thisObj.detailFormData.BIDNO.padStart(15, '0');
      var bizno = userInfo?.pin ?? ""
      let now = new Date();
      let nowTime = formatDate(new Date(), 'HH:mm:ss', "en-US");
      let minDate = new Date("0001-01-01");
      let minTime = formatDate(new Date("0001-01-01"), 'HHmmss', "en-US");

      var waers = userInfo?.baseCurrecy ?? "";
      var insertData = thisObj.biddingDetailFormData as ZMMT8500Model;

      var maininsertData = new ZMMT8500Model(this.appConfig.mandt, bidno, lifnr, bizno, "보증금율 : 견적총액(VAT포함)의 5%", insertData.INSAMT / 100, waers, insertData.INSTY, insertData.INSCMY,
        insertData.PASSY, now, nowTime, "", "", minDate, minTime, this.attachFiles.length > 0 ? "X" : "", this.attachFiles.length > 0 ? "X" : "", this.appConfig.interfaceId, now, nowTime, this.appConfig.interfaceId, now, nowTime, DIMModelStatus.Modify);
      insertData.ModelStatus = DIMModelStatus.Add;

      var modelList: ZMMT8500Model[] = [maininsertData];

      this.rowCount = await this.dataService.ModifyModelData<ZMMT8500Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8500ModelList", modelList);
    }
    catch (error) {
      alert("error", "알림");
    }
  }
  //데이터 삭제
  public async dataDelete(dataService: ImateDataService, thisObj: OBBDComponent) {
    let userInfo = this.authService.getUser().data;

    var bidno = thisObj.detailFormData.BIDNO.padStart(15, '0');
    var lifnr = userInfo?.deptId ?? "";

    //해당 공고의 마지막 견적을 선택
    var select8500Result = await dataService.SelectModelData<ZMMT8500Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8500ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}'`, "", QueryCacheType.None);


    if (select8500Result.length == 0) {
      alert("삭제할 데이터가 없습니다.", "알림");
    } else {
      // 견적결과가 빈값이 아니라면 , 삭제 X
      if (select8500Result[0].BIDRST !== "") {
        alert("신청결과가 나온 것은 삭제할 수 없습니다.", "알림");
      }
      //견적 결과가 빈값이면 , 삭제
      else {
        if (select8500Result[0].ZAPPDTH == null) {
          select8500Result[0].ZAPPDTH = new Date("0001-01-01");
          this.zmmt8500 = select8500Result[0];
          this.zmmt8500.ModelStatus = DIMModelStatus.Delete;
          alert("삭제되었습니다.", "알림");
          this.statuspopupVisible = false;

        }

      }
    }
    var model8500List: ZMMT8500Model[] = [thisObj.zmmt8500];

    this.rowCount = await this.dataService.ModifyModelData<ZMMT8500Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8500ModelList", model8500List);


    this.biddingDetailFormData.resetValues();

  }

  //zmmt8320 업체
  public async userdetaildata(dataService: ImateDataService, thisObj: OBBDComponent) {

    let userInfo = this.authService.getUser().data;

    var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
    var lifnr = userInfo?.deptId ?? ""
    var bizno = userInfo?.pin ?? ""

    var companyData = await dataService.SelectModelData<ZMMT8320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8320ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND BIDNO = '${bidno}' AND LIFNR = '${lifnr}' AND BIZNO ='${bizno}' `, "", QueryCacheType.None);

    return companyData[0];
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


        if (this.estimateFormData.RFQPYN == "") {
          Object.assign(this.estimateFormData, { RFQPYN: "없음" });
        } else {
          Object.assign(this.estimateFormData, { RFQPYN: "있음" });
        }

        var lifnr = userInfo.deptId ?? "";
        var bizno = userInfo.pin ?? "";
        //조회용 파일 첨부 팝업 띄우기
        this.editingMode = false;
        this.attachFiles = [];
        this.uploadDocumentNo = `MM${this.estimateFormData.BIDNO.padStart(15, '0')}${bizno.padStart(10, '0') }`;
        this.offceXPUtility.getOffiXpAttachFileInfo(`MM${this.estimateFormData.BIDNO.padStart(15, '0')}${bizno.padStart(10, '0')}`).then((fileInfos) => {
          this.attachFiles = fileInfos
        });
        console.log(this.uploadDocumentNo);

        if (result8360Model.length > 0) {
          //디테일 데이터
          //상세내용 8360 파트
          this.estimateDetailFormData = Object.assign({
            GRETD: result8360Model[0].GRETD, PAYTY: result8360Model[0].PAYTY, RFQSEQ: result8360Model[0].RFQSEQ,
            RFQCST: result8360Model[0].RFQCST, RFQVAT: result8360Model[0].RFQVAT, RFQAMT: result8360Model[0].RFQAMT
          });
          result8370Model.forEach((array: any) => {
            var resultData = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO && obj.BANFN == array.BANFN);

            if (resultData != undefined) {
              Object.assign(array, {
                MATNR: resultData.MATNR, MATNRT: resultData.MATNRT, MENGE: resultData.MENGE,
                MEINS: resultData.MEINS, MATNR_LONG: resultData.MATNR_LONG, KMATN_SPEC: resultData.KMATN_SPEC
              });
            }
          });
          this.estpopupData = new ArrayStore(
            {
              key: ["BIDNO", "BANFN", "BNFPO"], 
              data: result8370Model
            });
          this.estimateDataGrid.instance.getScrollable().scrollTo(0);

        }
        else if (result8360Model.length == 0) {

          this.estpopupData = new ArrayStore(
            {
              key: ["BIDNO", "BANFN", "BNFPO"],
              data: resultModel[0].ET_DATA
            });
          this.estimateDataGrid.instance.getScrollable().scrollTo(0);

        }

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

  //입찰
  Bidding: any = async (thisObj: OBBDComponent) => {
    this.selectedItemKeys.forEach(async (key: any) => {
      this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();
      this.detailFormData = this.selectGridData[0];
      this.detailFormData = Object.assign(this.detailFormData, { BIZNO: userInfo?.pin, NAME1: userInfo?.deptName });
      if (this.detailFormData.RFQPYN == "") {
        Object.assign(this.detailFormData, { RFQPYN: "없음" });
      } else {
        Object.assign(this.detailFormData, { RFQPYN: "있음" });
      }
      var userInfo = this.authService.getUser().data;

      var lifnr = userInfo.deptId ?? "";
      //조회용 파일 첨부 팝업 띄우기
      this.editingMode = true;
      this.attachFiles = [];
      this.uploadDocumentNo = `MM${this.detailFormData.BIDNO.padStart(15, '0')}${lifnr.padStart(10, '0')}`;
      this.offceXPUtility.getOffiXpAttachFileInfo(`MM${this.detailFormData.BIDNO.padStart(15, '0')}${lifnr.padStart(10, '0')}`).then((fileInfos) => {
        this.attachFiles = fileInfos
      });

      this.chkgbox.value = false;
      this.chkgbox1.value = false;
    var company = await this.userdetaildata(this.dataService, this);
    var bidno = this.selectedItemKeys[0].BIDNO.padStart(15, '0');
    var lifnr = userInfo?.deptId ?? ""
    //8300데이터 가져오기
    var result8300Model = await this.dataService.SelectModelData<ZMMT8300Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8300ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND BIDNO  = '${bidno}' `, "", QueryCacheType.None);
    var resultData8360Model = await this.dataService.SelectModelData<ZMMT8360Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND BIDNO  = '${bidno}'AND LIFNR =  '${lifnr}' `, "RFQSEQ DESC", QueryCacheType.None);
    var result8500Model = await this.dataService.SelectModelData<ZMMT8500Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8500ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND BIDNO  = '${bidno}'AND LIFNR =  '${lifnr}' `, "", QueryCacheType.None);
    var data8300 = result8300Model;
    var data8500 = result8500Model;
    //현재날짜 문자열 변환
    let nowDate = formatDate(new Date(), "yyyyMMdd", "en-US")
    //현재시간 문자열 변환 
    let nowTime = formatDate(new Date(), "HHmmss", "en-US")
    //입찰신청마감날짜 문자열 변환
    let qradthDate = formatDate(data8300[0].QTADTH, "yyyyMMdd", "en-US")
    //입찰신청마감시간 : 제거
    let qradttDate = data8300[0].QTADTT.replace(/:/g, '');



    //입찰신청마감 날짜가 현재 날짜보다 남았을 때
      if (resultData8360Model.length > 0) {
        var rfqamtData = resultData8360Model[0].RFQAMT;
        Object.assign(this.biddingDetailFormData, { RFQAMT: rfqamtData });
      if (resultData8360Model[0].RFQRST !== "I") {
        alert("견적 제출 결과가 '부적격'임으로 입찰 진행이 불가능합니다.", "알림");

      } else {

        if (data8300[0].QTADTT == "00:00:00" || data8300[0].QTADTH == null || data8300[0].QTADTT == undefined) {
          alert("입찰 신청 대상 공고가 아닙니다.", "알림");
        } else {
          if ((parseInt(qradthDate) > parseInt(nowDate)) || ((parseInt(qradthDate) == parseInt(nowDate)) && (parseInt(qradttDate) > parseInt(nowTime))) ) {
            //입찰신청마감 시간이 현재 시간보다 남았을 때

              this.selectedItemKeys.forEach(async (key: any) => {

                this.selectANDTHData = this.statusDataGrid.instance.getSelectedRowsData();

                var buydata = this.selectANDTHData[0];
                //메인데이터의 현장참석일자가 없을 때 입찰신청 가능
                if (buydata.ANDTH == null || buydata.ANDTH == "") {
                  this.statuspopupVisible = true;

                  this.loadingVisible = true;



                  var userInfo = this.authService.getUser().data;

                  this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

                  this.detailFormData = this.selectGridData[0];

                  Object.assign(this.detailFormData, { BIZNO: userInfo?.pin, NAME1: userInfo?.deptName, WAERS: userInfo?.baseCurrecy });
                  if (data8300[0].RFQPYN == "") {
                    Object.assign(this.detailFormData, { RFQPYN: "없음" });
                  } else {
                    Object.assign(this.detailFormData, { RFQPYN: "있음" });
                  }
                  if (data8500.length > 0) {
                    Object.assign(this.biddingDetailFormData, { INSAMT: data8500[0].INSAMT, INSCMY: data8500[0].INSCMY, PASSY: data8500[0].PASSY });
                    this.AssuranceValue = data8500[0].INSTY

                  } else {
                    Object.assign(this.biddingDetailFormData, { INSAMT: "", INSTY: "", INSCMY: "", PASSY: "" });

                  }
                  this.biddingdataLoad(this.dataService, this);

                  var result8370Model = await this.datagridLoad(this.dataService, this);
                  var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);


                  //디테일 데이터
                  result8370Model.forEach((array: any) => {
                    var resultData = resultModel[0].ET_DATA.find(obj => obj.BNFPO == array.BNFPO && obj.BANFN == array.BANFN);

                    if (resultData != undefined) {
                      Object.assign(array, {
                        MATNR: resultData.MATNR, MATNRT: resultData.MATNRT, MENGE: resultData.MENGE,
                        MEINS: resultData.MEINS, MATNR_LONG: resultData.MATNR_LONG, KMATN_SPEC: resultData.KMATN_SPEC
                      });
                    }
                  });

                  this.estpopupData = new ArrayStore(
                    {
                      key: ["BIDNO"],
                      data: result8370Model
                    });
                  this.estimateDataGrid.instance.getScrollable().scrollTo(0);


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

                }
                //메인데이터의 현장참석일자가 있을 때는
                else {
                  //참여업체의 현장설명회 참여여부가 X일때 입찰 신청 가능
                  if (company.ANCHK == "X") {
                    this.statuspopupVisible = true;
                    this.selectedItemKeys.forEach(async (key: any) => {

                      this.loadingVisible = true;


                      var userInfo = this.authService.getUser().data;

                      this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

                      this.detailFormData = this.selectGridData[0];

                      Object.assign(this.detailFormData, { BIZNO: userInfo?.pin, NAME1: userInfo?.deptName, WAERS: userInfo?.baseCurrecy });
                      if (data8300[0].RFQPYN == "") {
                        Object.assign(this.detailFormData, { RFQPYN: "없음" });
                      } else {
                        Object.assign(this.detailFormData, { RFQPYN: "있음" });
                      }
                      if (data8500.length > 0) {
                        Object.assign(this.biddingDetailFormData, { INSAMT: data8500[0].INSAMT, INSCMY: data8500[0].INSCMY, PASSY: data8500[0].PASSY });
                        this.AssuranceValue = data8500[0].INSTY
                      } else {
                        Object.assign(this.biddingDetailFormData, { INSAMT: "", INSTY: "", INSCMY: "", PASSY: "" });

                      }
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
                      this.estimateDataGrid.instance.getScrollable().scrollTo(0);


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
                  }
                  //참석하지 않았을떄 입찰신청 불가능
                  else {
                    this.statuspopupVisible = false;
                    alert(`\t\t\t\t\t\t부적격.\t<br> 현상설명회 불참`, "알림");
                  }
                }
              });

          } else {
            alert("입찰 신청이 마감된 공고입니다.", "알림");
          }
        }
      }
    } else {
        alert("견적 결과가 없는 공고입니다.", "알림");

      }
    });
    this.AssuranceEntery.ClearSelectedValue();
    this.biddingDetailFormData = { INSTXT: "", INSAMT: "",  INSTY: "", INSCMY: "", PASSY: "" };
  }
  //회원가입 버튼 페이지 이동 이벤트
  movePage(e: any) {
    this.router.navigate(['obmr']);
  }
  //자료첨부
  test() {

  }
  //선택
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

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
  //조회날짜필터조건
  selectDate(data: any) {
    this.statusDataGrid.instance.filter(['QTADTH', '>', data.value]);
  }
  //파서블엔트리
  async onPrgstatusDataLoaded(e: any) {
    this.loadePeCount++;

    this.PrgstatusEntry.possbleDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");
    this.PrgstatusEntry.popupDataGridComm.instance.columnOption("ZSORT_KEY", "sortOrder", "asc");
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

  // 첨부파일
  fileUploadPopup() {
    this.takePopupVisible = true;
  }
}
