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
import { Service, Role, Category } from './app.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import {
  DxDataGridComponent, DxTextBoxComponent, DxTagBoxModule, DxFormModule, DxFormComponent, DxTagBoxComponent } from 'devextreme-angular';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
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

  @ViewChild('categoryEntery', { static: false }) categoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('announcementEntery', { static: false }) announcementEntery!: CommonPossibleEntryComponent;
  @ViewChild('businessClassEntery', { static: false }) businessClassEntery!: CommonPossibleEntryComponent;
  @ViewChild('accountClassEntery', { static: false }) accountClassEntery!: CommonPossibleEntryComponent;
  @ViewChild('questionCodeEntery', { static: false }) questionCodeEntery!: CommonPossibleEntryComponent;

  @ViewChild('countryEntery', { static: false }) countryEntery!: TablePossibleEntryComponent;
  @ViewChild('bizpmtagbox', { static: false }) bizpmtagbox!: DxTagBoxComponent;

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

  //국가 파서블엔트리 값
  countryValue: string | null = null;
  categoryValue: string | null = null;
  announcementValue: string | null = null;
  businessClassValue: string | null = null;
  accountClassValue: string | null = null;
  questionCodeValue: string | null = null;


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

  //사업자구분
  roles: Role[];
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

  //버튼 제한
  isDisabled: boolean = false;

  //그리드 수정제한
  isEditing: boolean = true;

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

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private nbpAgetService: NbpAgentservice, private appInfo: AppInfoService, service: Service, http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 회원가입 요청";
    //possible-entry
    this.roleGridBoxOpened = false;
    this.statusGridBoxOpened = false;

    this.displayExpr = "";
    this.localappConfig = appConfig;
    this.selectedValue = "Z100";
    this.selectedLike = "A%";


    //사업자구분
    this.roles = service.getRoles();
    //취급업종
    this.categorydataSource = new ArrayStore({
      data: service.getcategory(),
      key: 'Id',
    });
    this.rowCount1 = 0;
    this.rowCount2 = 0;
    //회원가입 폼 데이터
    this.register = new ZMMT8100Model(this.appConfig.mandt, "", "", "", "Q", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", new Date, new Date, new Date, new Date, "", "", new Date, "", new Date, "", new Date, "", "", "", "", this.appConfig.interfaceId, new Date, "", this.appConfig.interfaceId, new Date, "", DIMModelStatus.UnChanged);

    setTimeout(async (that:OBMRComponent) => {
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
      text: "저장",
      disabled: true,
      type: 'success',
      useSubmitBehavior: true,
      onClick: (e: any) => {

        this.dataInsert(this)

        let result = e.validationGroup.validate();
        if (!result.isValid) {
          alert("필수값을 입력하여 주십시오.");
        }
        else {
          alert("회원가입이 되었습니다.");
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
  }

  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */
  async onBIZTYEDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obmr", this.appConfig, this.businessClassCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.businessClassCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

    }
  }
  async onLIFTYDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obmr", this.appConfig, this.accountClassCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.accountClassCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

    }
  }
  async onQSTIONDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obmr", this.appConfig, this.questionCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.questionCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

    }
  }

  /**
* 화면 종료
* */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore("obmr");
  }

  //중복 검사
  async Duplication() {
    var result = await this.dataLoad(this.imInfo, this.dataService, this);
    console.log(result);

    if (result.length > 0) {
      alert("중복된 아이디가 있습니다.");
      this.form.instance.getButton("applyBtn")?.option("disabled", true);
    } else {
      alert("사용 가능한 아이디입니다.")
      this.form.instance.getButton("applyBtn")?.option("disabled", false);

    }
  }


  //팝업이벤트
  showPopup(popupMode: any, data: any): void {
    this.formData = {};
    console.log(data);
    console.log(this.formData);

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
  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: OBMRComponent) {

    var resultModel = await dataService.SelectModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
      `LOGID = '${thisObj.register.LOGID}'`, "", QueryCacheType.None);

    return resultModel;
  }

  //  데이터 삽입
  public async dataInsert(thisObj: OBMRComponent) {
    try {
      let now = new Date();
      let minDate = new Date("0001-01-01");
      let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");

      var maininsertData = thisObj.register as ZMMT8100Model;
      var subinsertData = thisObj.register as ZMMT8110Model;

      maininsertData.REQDT = now;
      maininsertData.IUPDT = now;
      maininsertData.INVDT = now;
      maininsertData.ERDAT = now;
      maininsertData.AEZET = nowTime;
      maininsertData.ERZET = nowTime;
      maininsertData.CREDT = minDate;
      maininsertData.LSTDT = minDate;
      maininsertData.DUEDT = minDate;

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

        submodelList.push(new ZMMT8110Model("600", this.register.BIZNO, value, this.appConfig.interfaceId, now, nowTime, this.appConfig.interfaceId, now, nowTime, DIMModelStatus.Add));
      });

      subinsertData.ModelStatus = DIMModelStatus.Add;

      maininsertData.EVAYN = select1 || select2 ? "X" : ""

      this.rowCount1 = await this._dataService.ModifyModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", mainmodelList);
      this.rowCount2 = await this._dataService.ModifyModelData<ZMMT8110Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8110ModelList", submodelList);

    }
    catch (error) {
      alert(error);
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
}
