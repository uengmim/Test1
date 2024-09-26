/*
 * 회원가입 요청
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
import { Service } from './app.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import {
  DxDataGridComponent, DxTextBoxComponent, DxTagBoxModule, DxFormModule, DxFormComponent, DxTagBoxComponent, DxCheckBoxComponent, DxValidationGroupComponent } from 'devextreme-angular';
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
import { alert, confirm } from "devextreme/ui/dialog";
import dxValidator from 'devextreme/ui/validator';
import { DxiItemComponent, DxiValidationRuleComponent } from 'devextreme-angular/ui/nested';
import { OfficeXPUtility } from '../../../shared/officeXp.utility';
import { AttachFileComponent } from '../../../shared/components/attach-file/attach-file.component';
import { LFA1BpModel } from '../../../shared/dataModel/OBPPT/Lfa1Bp';
import { SHA256 } from 'crypto-js';

const sendRequest = function (value: any) {
  const invalidEmail = 'test@dx-email.com';
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value !== invalidEmail);
    }, 1000);
  });
};

@Component({
  templateUrl: './obmr.component.html',
  styleUrls: ['./obmr.component.scss'],
  providers: [ImateDataService, Service],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})



export class OBMRComponent  {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) form!: DxFormComponent;
  @ViewChild('#gcContractList', { static: false }) gcContractList!: DxDataGridComponent;
  @ViewChild('masterform', { static: false }) masterform!: DxFormComponent;
  @ViewChild('categoryEntery', { static: false }) categoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('announcementEntery', { static: false }) announcementEntery!: CommonPossibleEntryComponent;
  @ViewChild('businessClassEntery', { static: false }) businessClassEntery!: CommonPossibleEntryComponent;
  @ViewChild('accountClassEntery', { static: false }) accountClassEntery!: CommonPossibleEntryComponent;
  @ViewChild('questionCodeEntery', { static: false }) questionCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('AttachFile', { static: false }) AttachFile!: AttachFileComponent;

  @ViewChild('countryEntery', { static: false }) countryEntery!: CommonPossibleEntryComponent;
  @ViewChild('bizpmtagbox', { static: false }) bizpmtagbox!: DxTagBoxComponent;
  @ViewChild('chkgbox1', { static: false }) chkgbox1!: DxCheckBoxComponent;;
  @ViewChild('chkgbox2', { static: false }) chkgbox2!: DxCheckBoxComponent;;
  @ViewChild('valueRule', { static: false }) valueRule!: DxiValidationRuleComponent;

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
  //팝업 닫기
  compopupcloseButtonOptions: any;
  closeButtonOptions: any;

  //국가 파서블엔트리 값
  countryValue: string | null = null;
  categoryValue: string | null = null;
  announcementValue: string | null = null;
  businessClassValue: string | null = null;
  accountClassValue: string | null = null;
  questionCodeValue: string | null = null;


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


  //이메일 룰
  emailPattern: any = /^[^0-9]+$/;
  


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
  register: any;
  //취급업종
  categorydataSource: any;
  BSDuplication: any;
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
  //텍스트박스 데이터
  firstText: string;
  secondText: string;

  //버튼 제한
  isDisabled: boolean = false;

  //그리드 수정제한
  isEditing: boolean = true;

  // 중복아이디값 체크
  dupId: string = "";

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

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private nbpAgetService: NbpAgentservice, private appInfo: AppInfoService,
    service: Service, private ref: ChangeDetectorRef, private imInfo: ImateInfo, private authService: AuthService, private httpClient: HttpClient) {
    appInfo.title = AppInfoService.APP_TITLE + " | 회원가입 요청";

    this.loadingVisible = true;

    //possible-entry
    this.roleGridBoxOpened = false;
    this.statusGridBoxOpened = false;

    this.displayExpr = "";
    this.localappConfig = appConfig;
    this.selectedValue = "Z100";
    this.selectedLike = "A%";
    //텍스트박스 데이터
    this.firstText = service.getContent("first");
    this.secondText = service.getContent("second");

    this.accountClassValue = "1";
    this.businessClassValue = "1";
    this.countryValue = "KR";

    

    //첨부파일

    this.offceXPUtility = new OfficeXPUtility(httpClient, appConfig);

    this.rowCount1 = 0;
    this.rowCount2 = 0;
    //회원가입 폼 데이터
    this.register = new ZMMT8100Model(this.appConfig.mandt, "", "", "", "Q", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      "", "", "1", "1", "KR", "", "", new Date(), new Date(), new Date(), new Date(), "", "", new Date(), "", "", "", "", "", "", "KRW", "", this.appConfig.interfaceId, new Date(), "", this.appConfig.interfaceId, new Date(), "", DIMModelStatus.UnChanged);

    setTimeout(async (that: OBMRComponent) => {
      //mac 가져오기
      let deviceInfo = await that.nbpAgetService.getDeviceInfo();
      that.register.MACID = deviceInfo?.mac;
    }, 0, this);

    //회원가입 폼 데이터
    //this.register = new ZMMT8110Model(this.appConfig.mandt, "", "", "", new Date, "", "", new Date,"", DIMModelStatus.UnChanged);

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
    PossibleEntryDataStoreManager.setDataStore("obmr", codeInfos, appConfig, dataService);


    const that = this;


    //저장버튼
    this.saveButtonOptions = {
      text: "회원가입 요청",
      disabled: true,
      type: 'success',
      useSubmitBehavior: true,
      onClick: async (e: any) => {

        var chk1 = this.chkgbox1.value;
        var chk2 = this.chkgbox2.value;
        let result = e.validationGroup.validate();
        let formresult = this.masterform.instance.validate();
        var bsresult = await this.bsDataLoad(this.imInfo, this.dataService, this);
        var bpresult = await this.bpDataLoad(this.imInfo, this.dataService, this);

        var DataResult = await dataService.SelectModelData<ZMMT8100Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
          `MANDT = '${this.appConfig.mandt}' AND UPPER(MACID) = UPPER('${this.register.MACID}') `, "", QueryCacheType.None);

        if (DataResult.length > 0) {
          alert("이미 다른ID에 등록된 컴퓨터입니다.", "알림");
          return;
        }


        //필수값을 입력 안했을 때
        if (!formresult.isValid || !result.isValid) {
          alert("필수값을 입력하여 주십시오.", "알림");
          return;

        }
        if (bsresult.length > 0) {
          alert("중복된 사업자 번호가 있습니다.", "알림");
          return;
        }
        if (bpresult.length > 0) {
          alert("중복된 사업자 번호가 있습니다.", "알림");
          return;
        }

        if (this.dupId != this.register.LOGID) {
          alert("아이디 중복체크가 필요합니다.", "알림");
          return;
        }

        //필수값을 입력 했을 때
        else {
          //동의를 눌렀으면
          if (chk1 && chk2) {
            if (await confirm("회원가입 요청하시겠습니까?", "알림")) {
                this.uploadDocumentNo = "MM" + this.register.BIZNO;
                this.dataInsert(this);
                this.form.instance.getButton("applyBtn")?.option("disabled", true);
            }
          } else {
            alert("동의를 눌러주세요.", "알림");

          }
        }
      },
    };
    //적용 버튼
    this.applyPopupButton = {
      text: "등록",
      onClick: (e: any) => {

        that.comPopupVisible = false;

      }
    }
    //팝업닫기버튼
    this.compopupcloseButtonOptions = {
      icon: 'close',
      onClick(e: any) {
        that.comPopupVisible = false;
      },
    };
    this.closeButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.takePopupVisible = false;
      }
    }

  }
  async ngOnInit() {

    //취급업종

    let categorydataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obmr", this.appConfig, this.categoryCode);

    let resultModel = categorydataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

    this.categorydataSource = new ArrayStore({
      data: resultModel,
    });
  }
  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */
  async onDataLoaded(e: any) {
    this.loadePeCount++;
    console.log(this.loadePeCount);
    if (this.loadePeCount >= 4) {
      setTimeout(() => { this.loadingVisible = false }, 2000);
    }
  }
  /**
* 화면 종료
* */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore("obmr");
  }

  //아이디중복 검사
  async Duplication() {
    if (this.register.LOGID == "") {
      alert("아이디를 입력하세요.", "알림");
      return;
    }

    var result = await this.dataLoad(this.imInfo, this.dataService, this);
    if (result.length > 0) {
      alert("중복된 아이디가 있습니다.", "알림");
      this.form.instance.getButton("applyBtn")?.option("disabled", true);
    } else {
      alert("사용 가능한 아이디입니다.", "알림")
      this.form.instance.getButton("applyBtn")?.option("disabled", false);
    }
    this.dupId = this.register.LOGID;
  }

  //팝업이벤트
  showPopup(popupMode: any, data: any): void {
    this.formData = {};

    this.formData = data;
    this.popupMode = popupMode;
    this.comPopupVisible = true;
  }
  //국가 코드 값 변경
  onCountryCodeValueChanged(e: any) {
    this.register.COUNTRY = e.selectedValue

    return;
  }
  //취급업종 코드 값 변경
  onCategoryCodeValueChanged(e: any) {
    this.register.BIZUPJ = e.selectedValue

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
  // 사용자 ID 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: OBMRComponent) {

    var resultIdModel = await dataService.SelectModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND LOGID = '${thisObj.register.LOGID}' AND MANDT = '${thisObj.appConfig.mandt}'`, "", QueryCacheType.None);
    
    return resultIdModel;
  }
  // 사업자번호 데이터 로드
  public async bsDataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: OBMRComponent) {

    var resultBsModel = await dataService.SelectModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND BIZNO = '${thisObj.register.BIZNO}' AND MANDT = '${thisObj.appConfig.mandt}'`, "", QueryCacheType.None);

    return resultBsModel;
  }
  // 사업자번호 데이터 로드(BP)
  public async bpDataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: OBMRComponent) {

    var resultBpModel = await dataService.SelectModelData<LFA1BpModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.LFA1BpList", [thisObj.appConfig.mandt, thisObj.register.BIZNO],
      "", "", QueryCacheType.None);

    return resultBpModel;
  }
  //  데이터 삽입
  public async dataInsert(thisObj: OBMRComponent) {
    try {
      let now = new Date();
      let minDate = new Date("0001-01-01");
      let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");
      var maininsertData = Object.assign({}, thisObj.register) as ZMMT8100Model;
      var subinsertData = thisObj.register as ZMMT8110Model;
      //등록 요청 일자
      maininsertData.REQDT = now;
      //정보 수정 일자
      maininsertData.IUPDT = now;
      //개인 정보 동의일
      maininsertData.INVDT = now;
      //신용 평가 기간
      maininsertData.CREDT = minDate;
      //최종 승인 일자
      maininsertData.LSTDT = minDate;
      //레코드 생성일
      maininsertData.ERDAT = now;
      //입력시간
      maininsertData.AEZET = nowTime;
      //최종 변경 시간
      maininsertData.ERZET = nowTime;

      //비밀번호해싱
      maininsertData.LOGPW = SHA256(maininsertData.LOGPW).toString();


      maininsertData.ModelStatus = DIMModelStatus.Add;

      var mainmodelList: ZMMT8100Model[] = [maininsertData];
 
      var select1: boolean = false;
      var select2: boolean = false;

      var submodelList: ZMMT8110Model[] = [];
      this.bizpmtagbox.value.forEach((value: any) => {
        if (value === 1)
          select1 = true;

        if (value === 3)
          select2 = true;

        submodelList.push(new ZMMT8110Model(this.appConfig.mandt, this.register.BIZNO, value, this.appConfig.interfaceId, now, nowTime, this.appConfig.interfaceId, now, nowTime, DIMModelStatus.Add));
      });

      subinsertData.ModelStatus = DIMModelStatus.Add;

      maininsertData.EVAYN = select1 || select2 ? "X" : ""

      this.rowCount1 = await thisObj.dataService.ModifyModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", mainmodelList);

      this.rowCount2 = await thisObj.dataService.ModifyModelData<ZMMT8110Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8110ModelList", submodelList);


      // 파일첨부 저장 같이 넣어주기
      this.AttachFile.upload();


      alert("회원가입 요청이 완료되었습니다.", "알림");
    }
    catch (error) {
      alert("error", "알림");
      console.log(error);
    }
  }
  //비밀번호 확인
  passwordComparison = () => this.form.instance.option('formData').LOGPW;
  //이메일 확인
  asyncValidation(params:any) {
    return sendRequest(params.value);
  }
  BIZTYonGridBoxOptionChanged(e:any) {
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

  // 첨부파일
  fileUploadPopup() {
    this.takePopupVisible = true;
  }
}
