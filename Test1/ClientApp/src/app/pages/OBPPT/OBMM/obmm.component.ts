/*
 * 회원정보 수정
 */
import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Output } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import {
  DxDataGridComponent, DxTextBoxComponent, DxTagBoxModule, DxFormModule, DxFormComponent, DxTagBoxComponent
} from 'devextreme-angular';
import { AttachFileInfo, CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZMMT8100Model } from '../../../shared/dataModel/OBPPT/Zmmt8100';
import { ZMMT8110Model } from '../../../shared/dataModel/OBPPT/Zmmt8110';
import ArrayStore from 'devextreme/data/array_store';
import { formatDate } from '@angular/common';
import { NbpAgentservice, DeviceInfo } from '../../../shared/services/nbp.agent.service'
import notify from 'devextreme/ui/notify';
import { async } from 'rxjs';
import { deepCopy } from '../../../shared/imate/utility/object-copy';
import { alert, confirm } from "devextreme/ui/dialog";
import { BapiretcModel, ZMMBPCU1Model, ZMMS0040Model } from '../../../shared/dataModel/OBPPT/ZmmBpCu1';
import { OfficeXPUtility } from '../../../shared/officeXp.utility';
import { AttachFileComponent } from '../../../shared/components/attach-file/attach-file.component';
import { SHA256 } from 'crypto-js';
import { DxiItemComponent } from 'devextreme-angular/ui/nested';

const sendRequest = function (value: any) {
  const invalidEmail = 'test@dx-email.com';
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value !== invalidEmail);
    }, 1000);
  });
};

@Component({
  templateUrl: './obmm.component.html',
  providers: [ImateDataService],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})



export class OBMMComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) form!: DxFormComponent;
  @ViewChild('#gcContractList', { static: false }) gcContractList!: DxDataGridComponent;
  @ViewChild('masterform', { static: false }) masterform!: DxFormComponent;
  @ViewChild('categoryEntery', { static: false }) categoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('announcementEntery', { static: false }) announcementEntery!: CommonPossibleEntryComponent;
  @ViewChild('businessClassEntery', { static: false }) businessClassEntery!: CommonPossibleEntryComponent;
  @ViewChild('accountClassEntery', { static: false }) accountClassEntery!: CommonPossibleEntryComponent;
  @ViewChild('questionCodeEntery', { static: false }) questionCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('IDText', { static: false }) IDText!: DxTextBoxComponent;
  @ViewChild('countryEntery', { static: false }) countryEntery!: CommonPossibleEntryComponent;
  @ViewChild('bizpmtagbox', { static: false }) bizpmtagbox!: DxTagBoxComponent;
  @ViewChild('AttachFile', { static: false }) AttachFile!: AttachFileComponent;
  @ViewChild('loginText', { static: false }) loginText: DxiItemComponent;

  //clearselectvalue
  callbacks = [];

  /**
 * 선택한 코드의 전체 키 값
 */
  @Output()
  selectedCodes: string[] = [];
  products: any;
  displayExpr: string;
  gridColumns: any = ['그룹코드', '그룹명', '코드', '코드명'];
  countryCode: TableCodeInfo;
  categoryCode: CommonCodeInfo;
  announcementCode: CommonCodeInfo;
  businessClassCode: CommonCodeInfo;
  accountClassCode: CommonCodeInfo;
  questionCode: CommonCodeInfo;

  selectedLike: string;
  localappConfig: AppConfigService;
  selectedValue: string;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //첨부닫기
  closeButtonOptions: any;
  //로딩
  loadPanelOption: any;
  register: any;
  //국가 파서블엔트리 값
  countryValue: string | null = null;
  categoryValue: string | null = null;
  announcementValue: string | null = null;
  businessClassValue: string | null = null;
  accountClassValue: string | null = null;
  questionCodeValue: string | null = null;
  key: any;

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
  //--------------------------------------------------------------------


  //국가 파서블 엔트리 유효성 체크
  countryAdapter =
    {
      getValue: () => {
        return this.countryValue;
      },
      applyValidationResults: (e: any) => {
        this.countryEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };
  //사업자구분 파서블 엔트리 유효성 체크
  businessAdapter =
    {
      getValue: () => {
        return this.businessClassValue;
      },
      applyValidationResults: (e: any) => {
        this.businessClassEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };
  //거래처구분 파서블 엔트리 유효성 체크
  accountAdapter =
    {
      getValue: () => {
        return this.accountClassValue;
      },
      applyValidationResults: (e: any) => {
        this.accountClassEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };
  //질문 파서블 엔트리 유효성 체크
  questionAdapter =
    {
      getValue: () => {

        return this.questionCodeValue;

      },
      applyValidationResults: (e: any) => {
        this.questionCodeEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };
  //dataSource: any;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  //데이터 저장 버튼
  saveButtonOptions: any;
  //회원가입
  //취급업종

  //취급업종
  categorydataSource: any;

  //팝업모드
  popupMode = 'Add';
  //팝업 초기 설정
  comPopupVisible = false;
  //팝업 저장버튼
  applyPopupButton: any;
  //multiseletbox
  gridDataSource: any;
  rolegridBoxValue: string[] = [];
  statusgridBoxValue: string[] = [];

  //사용여부
  roleGridBoxOpened: boolean;
  statusGridBoxOpened: boolean;

  collapsed = false;
  rowCount1: number;
  rowCount2: number;

  _dataService: ImateDataService;

  dataSource: any;

  formData: any = {};

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  //로딩
  loading = false;

  deviceInfo: any;
  casResult: any;
  //이메일 룰
  emailPattern: any = /^[^0-9]+$/;

  idValue: string;

  selectItems: string[] = [];
  //버튼 제한
  isDisabled: boolean = false;

  //그리드 수정제한
  isEditing: boolean = true;

  private orginCatagory: any = [];

  nowMacid: string;

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

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private nbpAgetService: NbpAgentservice, private appInfo: AppInfoService, http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 회원정보 수정";
    var userInfo = authService.getUser();
    /*
    if ("admin" == "admin")
      this.loginText.editorOptions = { disabled: false };
    */
    //possible-entry
    this.roleGridBoxOpened = false;
    this.statusGridBoxOpened = false;
    this.displayExpr = "";
    this.localappConfig = appConfig;
    this.selectedValue = "Z100";
    this.selectedLike = "A%";
    this.idValue = authService.getUser().data?.userId;

    this.offceXPUtility = new OfficeXPUtility(http, appConfig);
    
    setTimeout(async (that: OBMMComponent) => {
      //mac 가져오기
      let deviceInfo = await that.nbpAgetService.getDeviceInfo();
      that.register.MACID = deviceInfo?.mac;
      that.nowMacid = deviceInfo?.mac;
    }, 0, this);
    
    let me = this;
    this.loadingVisible = true;

    this.rowCount1 = 0;
    this.rowCount2 = 0;
    //회원가입 폼 데이터
    //this.zmmt8100 = new ZMMT8100Model(this.appConfig.mandt, "", "", "", "Q", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", new Date, new Date, new Date, new Date, "", "", new Date, "", new Date, "", new Date, "", "", "", "", this.appConfig.interfaceId, new Date, "", this.appConfig.interfaceId, new Date, "", DIMModelStatus.UnChanged);
    //취급업종 폼 데이터
    //this.zmmt8110 = new ZMMT8110Model(this.appConfig.mandt, "", "", this.appConfig.interfaceId, new Date, "", this.appConfig.interfaceId, new Date, "", DIMModelStatus.UnChanged);

    this.register = new ZMMT8100Model(this.appConfig.mandt, null, "", "", "Q", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      "", "", "1", "1", "KR", "", "", new Date(), new Date(), new Date(), new Date(), "", "", new Date(), "", "", "", "", "", "","", "", this.appConfig.interfaceId, new Date(), "", this.appConfig.interfaceId, new Date(), "", DIMModelStatus.UnChanged);

    this._dataService = dataService;
    this.imInfo = imInfo;
    let modelTest = this;
    //국가 테이블 코드
    this.countryCode = appConfig.tableCode("국가")
    //취급 업종 코드
    this.categoryCode = appConfig.commonCode("취급업종");
    //공고 유형 코드
    this.announcementCode = appConfig.commonCode("공고유형");
    //사업자구분 코드
    this.businessClassCode = appConfig.commonCode("사업자구분");
    //거래처구분 코드
    this.accountClassCode = appConfig.commonCode("거래처구분");
    //질문 코드
    this.questionCode = appConfig.commonCode("질문코드");


    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.countryCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.categoryCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.announcementCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.businessClassCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.accountClassCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.questionCode),
    ];
    PossibleEntryDataStoreManager.setDataStore("obmm", codeInfos, appConfig, dataService);


    const that = this;


    this.dataLoad(this.imInfo, this.dataService);


    //저장버튼
    this.saveButtonOptions = {
      text: "저장",
      useSubmitBehavior: true,
      onClick: async (e: any) => {

        var DataResult = await dataService.SelectModelData<ZMMT8100Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND UPPER(MACID) = UPPER('${this.register.MACID}') AND LOGID <> '${this.register.LOGID}'`, "", QueryCacheType.None);

        if (DataResult.length > 0) {
          alert("이미 다른ID에 등록된 컴퓨터입니다.", "알림")
          return;
        }


        let result = e.validationGroup.validate();
        let formresult = this.masterform.instance.validate();
        if (!formresult.isValid || !result.isValid) {
          alert("필수값을 입력하여 주십시오.", "알림");
          return;
        }
        if (this.selectItems.length == 0) {
          alert("한 개 이상의 취급업종을 선택하여 주십시오.", "알림");
          return;
        }
        
        if (await confirm("저장하시겠습니까?", "알림")) {
          this.dataInsert(this);
        }

        
      },

    };

    //조회버튼
    this.searchButtonOptions = {
      text: "조회",

      onClick: async () => {
        this.loadingVisible = true;
        this.dataLoad(this.imInfo, this.dataService);
        //this.masterform.instance._refresh();
        this.loadingVisible = false;
      },
    };
    //삭제버튼
    this.deleteButtonOptions = {
      text: "삭제",

      onClick: async () => {
        if (this.register.APPST == "Q") {
          if (await confirm("삭제하시겠습니까?", "알림")) {
            this.dataDelete(this.key, this.dataService, this);
          }
        } else {
          alert("등록요청인 회원정보만 삭제가 가능합니다.", "알림");
          return;
        }

      },
    };

    this.closeButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.takePopupVisible = false;
      }
    }

  }

  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */
  onDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 4)
      this.loadingVisible = false;

  }
  /**
* 화면 종료
* */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore("obmm");
  }

  // 첨부파일
  fileUploadPopup() {
    this.takePopupVisible = true;
  }

  //국가 코드 값 변경
  onCountryCodeValueChanged(e: any) {
    this.register.COUNTRY = e.selectedValue

    return;
  }
  //취급업종 코드 값 변경
  onCategoryCodeValueChanged(e: any) {
    return;
  }
  //공고유형 코드 값 변경
  onAnnouncementCodeValueChanged(e: any) {

  }
  //사업자구분 코드 값 변경
  onBusinessClassCodeValueChanged(e: any) {
    this.register.BIZTY = e.selectedValue

    return;
  }
  //거래처구분 코드 값 변경
  onAccountClassCodeValueChanged(e: any) {
    this.register.LIFTY = e.selectedValue

    return;
  }
  //질문코드 코드 값 변경
  onQuestionCodeCodeValueChanged(e: any) {
    this.register.QSTION = e.selectedValue

    return;
  }

  //사업자 구분 값 변경
  onBiztyValueChanged(e: any) {
    this.register.BIZTY = e.value[0]
  }
  //사용여부 값 변경
  onEVAYNValueChanged(e: any) {
    this.register.EVAYN = e.value[0]
  }
  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {
    this.register = {};
    this.selectItems = [];

    this.businessClassValue = "";
    this.accountClassValue = "";
    this.countryValue = "";
    this.questionCodeValue = "";
    //Main Data Form 데이터 조회
    var userDataResult = await dataService.SelectModelData<ZMMT8100Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND LOGID = '${this.idValue}'`, "", QueryCacheType.None);

    if (userDataResult.length == 0) {
      alert(" 조회하시는 회원 ID가 없습니다.", "알림")
    } else {
      console.log(userDataResult);
      this.register = Object.assign(userDataResult[0], { BIZUPJ: "", LOGPW_CHK: userDataResult[0].LOGPW });

      this.register.LIFNR = parseInt(this.register.LIFNR);
      this.register.MACID = this.nowMacid;
      //Sub Data Form 데이터 조회
      var Zmmt8110result = await dataService.SelectModelData<ZMMT8110Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8110ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND BIZNO = '${userDataResult[0].BIZNO}'`, "", QueryCacheType.None);

      //루프 돌면서 값 받아오기
      Zmmt8110result.forEach((array: ZMMT8110Model) => {
        this.selectItems.push(array.BIZUPJ);
        this.register.BIZUPJ = this.bizpmtagbox.value.join();
      })


      //파서블엔트리 값 조회
      this.businessClassValue = userDataResult[0].BIZTY;
      this.accountClassValue = userDataResult[0].LIFTY;
      this.countryValue = userDataResult[0].COUNTRY;
      this.questionCodeValue = userDataResult[0].QSTION;
      
      //조회일경우 문서 번호를 셋팅
      this.uploadDocumentNo = `MM${userDataResult[0].BIZNO}`;
      console.log(this.uploadDocumentNo);
      this.offceXPUtility.getOffiXpAttachFileInfo(`MM${userDataResult[0].BIZNO}`).then((fileInfos) => {
        this.attachFiles = fileInfos
      });
    }


  }
  //데이터 삭제
  public async dataDelete(key: any, dataService: ImateDataService, thisObj: OBMMComponent) {
    try {


      //var DeleteData = new ZMMT8100Model(key, key, key.LIFNR, key.NAME1, key.APPST, key.LOGID, key.LOGPW, key.MACID, key.INTIP, key.J_1KFREPRE, key.ADDHQ, key.HOUSE_NO,
      //  key.SEARCHTERM1, key.J_1KFTIND, key.J_1KFTBUS, key.POSTL_COD1, key.BIZPM, key.LICNO, key.OFFNM, key.TELF1, key.TELF2, key.FAX, key.E_MAIL, key.BRANCH,
      //  key.BIZTY, key.LIFTY, key.COUNTRY, key.QSTION, key.ANSWER, key.REQDT, key.IUPDT, key.INVDT, key.CREDT, key.CREGD, key.EVAYN, key.LSTDT, key.LSTID, key.STODT,
      //  key.STOID, key.DUEDT, key.ZWELS, key.ZTERM, key.KALSK, key.REMARK, key.ERNAM, key.ERDAT, key.ERZET, key.AENAM, key.AEDAT, key.AEZET, DIMModelStatus.Delete); 

      thisObj.register.ModelStatus = DIMModelStatus.Delete;
      /* 날짜형식 null처리 */
      thisObj.register.REQDT = thisObj.register.REQDT ?? new Date("0001-01-01");
      thisObj.register.IUPDT = thisObj.register.IUPDT ?? new Date("0001-01-01");
      thisObj.register.INVDT = thisObj.register.INVDT ?? new Date("0001-01-01");
      thisObj.register.LSTDT = thisObj.register.LSTDT ?? new Date("0001-01-01");
      thisObj.register.CREDT = thisObj.register.CREDT ?? new Date("0001-01-01");

      var modelList: ZMMT8100Model[] = [thisObj.register];
      this.rowCount1 = await this.dataService.ModifyModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", modelList);

      var selectResult = await dataService.SelectModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND BIZNO = '${thisObj.register.BIZNO}'`, "", QueryCacheType.None);

      if (selectResult.length > 0) {
        alert("삭제되지 않았습니다.", "알림");
      } else {
        alert("회원ID가 삭제되었습니다.", "알림");
        this.register = new ZMMT8100Model(this.appConfig.mandt, "", "", "", "Q", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
          "", "", "", "", "", "", "", new Date, new Date, new Date, new Date, "", "", new Date, "", "",  "", "", "", "", "", "", this.appConfig.interfaceId,
          new Date, "", this.appConfig.interfaceId, new Date, "", DIMModelStatus.UnChanged);

        thisObj.businessClassEntery.ClearSelectedValue();
        thisObj.businessClassEntery.ClearDataSource();

        thisObj.accountClassEntery.ClearSelectedValue();
        thisObj.accountClassEntery.ClearDataSource();

        thisObj.questionCodeEntery.ClearSelectedValue();
        thisObj.questionCodeEntery.ClearDataSource();

        thisObj.countryEntery.ClearSelectedValue();
        thisObj.countryEntery.ClearDataSource();

        thisObj.bizpmtagbox.instance.reset();

      }

    }
    catch (error) {
      alert("error", "알림");
    }
  }
  //  데이터 삽입
  public async dataInsert(thisObj: OBMMComponent) {
    try {
      let now = new Date();
      let minDate = new Date("0001-01-01");
      let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");

      var maininsertData = Object.assign({}, thisObj.register) as ZMMT8100Model;

      var sendModel = new ZMMS0040Model(maininsertData.LIFNR.toString().padStart(10, '0'), "", "", "", maininsertData.COUNTRY, maininsertData.NAME1, "",  maininsertData.ADDHQ, maininsertData.POSTL_COD1, "", "", "", ""
        , maininsertData.ADDHQ, maininsertData.HOUSE_NO, maininsertData.TELF1, maininsertData.TELF2, maininsertData.FAX, maininsertData.E_MAIL, maininsertData.LIFNR.toString().padStart(10,'0'), "", ""
        , "", "", "", maininsertData.J_1KFTBUS, maininsertData.J_1KFTIND, maininsertData.J_1KFREPRE, "", "", "", "", "", "", "", "", "", "", "", "", "");
      var bpModel = new BapiretcModel("", "", "", "", "", "", "", "", "", "", "", "");
      var zmmBpModel = new ZMMBPCU1Model(bpModel, "", sendModel, "X", []);

      maininsertData.LIFNR = maininsertData.LIFNR.toString().padStart(10, '0');
      if (maininsertData.LOGPW.length < 60) {
        maininsertData.LOGPW = SHA256(maininsertData.LOGPW).toString();
      }
      maininsertData.REQDT = maininsertData.REQDT??now;
      maininsertData.IUPDT = maininsertData.IUPDT??now;
      maininsertData.INVDT = maininsertData.INVDT??now;
      maininsertData.CREDT = maininsertData.CREDT??minDate;
      maininsertData.LSTDT = maininsertData.LSTDT??minDate;
      maininsertData.ERDAT = maininsertData.ERDAT??now;
      maininsertData.ERZET = maininsertData.ERZET ?? nowTime;

      maininsertData.AEDAT = now;
      maininsertData.AEZET = nowTime;
      maininsertData.AENAM = this.appConfig.interfaceId;

      maininsertData.ModelStatus = DIMModelStatus.Modify;

      var mainmodelList: ZMMT8100Model[] = [maininsertData];

      var select1: boolean = false;
      var select2: boolean = false;

      var subDeletemodelList: ZMMT8110Model[] = []; 
      var submodelList: ZMMT8110Model[] = [];
      for (let org of thisObj.orginCatagory) {
        let orgData = org as ZCMT0020Model;
        subDeletemodelList.push(new ZMMT8110Model(this.appConfig.mandt, this.register.BIZNO, orgData.ZCM_CODE1, this.appConfig.interfaceId, now, nowTime, this.appConfig.interfaceId, now, nowTime, DIMModelStatus.Delete));
      }

      this.bizpmtagbox.value.forEach((value: any) => {
        if (value == 1) 
          select1 = true;

        if (value == 3)
          select2 = true;

        submodelList.push(new ZMMT8110Model(this.appConfig.mandt, this.register.BIZNO, value, this.appConfig.interfaceId, now, nowTime, this.appConfig.interfaceId, now, nowTime, DIMModelStatus.Add));
      });


      maininsertData.EVAYN = select1 || select2 ? "X" : ""
       
      var result = await this.dataService.RefcCallUsingModel<ZMMBPCU1Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBPCU1ModelList", [zmmBpModel], QueryCacheType.None);

      if (result[0].ES_RETURN.TYPE == "S") {
        this.rowCount1 = await this._dataService.ModifyModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", mainmodelList);

        var delete10Model = await this._dataService.ModifyModelData<ZMMT8110Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8110ModelList", subDeletemodelList);

        this.rowCount2 = await this._dataService.ModifyModelData<ZMMT8110Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8110ModelList", submodelList);


        // 파일첨부 저장 같이 넣어주기
        this.AttachFile.upload();


        alert("회원 정보가 수정되었습니다.", "알림");


        this.dataLoad(this.imInfo, this.dataService);
      } else {
        alert(`수정 중 오류가 발생하였습니다. 담당자에게 문의하세요. <br>SAP오류 메세지 : ${result[0].ES_RETURN.MESSAGE}`, "알림");
      }
    }
    catch (error) {
      alert("error", "알림");
    }
  }
  //비밀번호 확인
  passwordComparison = () => this.form.instance.option('formData').LOGPW;
  //이메일 확인
  asyncValidation(params: any) {
    return sendRequest(params.value);
  }
  BIZTYonGridBoxOptionChanged(e: any) {
    if (e.name === 'value') {
      this.roleGridBoxOpened = false;
      this.ref.detectChanges();
    }
  }

  EVAYNonGridBoxOptionChanged(e: any) {
    if (e.name === 'value') {
      this.statusGridBoxOpened = false;
      this.ref.detectChanges();
    }
  }

  onTagValueChanged(e: any) {

    Object.assign(this.register, { BIZUPJ: e.selectedValue });

  }
  async ngOnInit() {

    //취급업종

    let categorydataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obmm", this.appConfig, this.categoryCode);

    let resultModel = categorydataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

    let me = this;
    this.categorydataSource = new ArrayStore({
      data: resultModel,
      onLoaded: function (result) {
        // Your code goes here
        me.orginCatagory = deepCopy(result)
      }
    });
  }
}
