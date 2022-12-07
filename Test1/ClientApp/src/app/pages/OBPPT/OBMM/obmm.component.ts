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
import { Service, Role, Category } from './app.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import {
  DxDataGridComponent, DxTextBoxComponent, DxTagBoxModule, DxFormModule, DxFormComponent, DxTagBoxComponent
} from 'devextreme-angular';
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
import { deepCopy } from '../../../shared/imate/utility/object-copy';

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
  providers: [ImateDataService, Service],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})



export class OBMMComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) form!: DxFormComponent;
  @ViewChild('#gcContractList', { static: false }) gcContractList!: DxDataGridComponent;

  @ViewChild('categoryEntery', { static: false }) categoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('announcementEntery', { static: false }) announcementEntery!: CommonPossibleEntryComponent;
  @ViewChild('businessClassEntery', { static: false }) businessClassEntery!: CommonPossibleEntryComponent;
  @ViewChild('accountClassEntery', { static: false }) accountClassEntery!: CommonPossibleEntryComponent;
  @ViewChild('questionCodeEntery', { static: false }) questionCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('IDText', { static: false }) IDText!: DxTextBoxComponent;
  @ViewChild('countryEntery', { static: false }) countryEntery!: TablePossibleEntryComponent;
  @ViewChild('bizpmtagbox', { static: false }) bizpmtagbox!: DxTagBoxComponent;
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
  //로딩
  loadPanelOption: any;

  //국가 파서블엔트리 값
  countryValue: string | null = null;
  categoryValue: string | null = null;
  announcementValue: string | null = null;
  businessClassValue: string | null = null;
  accountClassValue: string | null = null;
  questionCodeValue: string | null = null;
  key: any;
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
  zmmt8100: ZMMT8100Model;
  //취급업종
  zmmt8110: ZMMT8110Model;

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
  //이메일 룰
  emailPattern: any = /^[^0-9]+$/;


  selectItems: string[] = [];
  //버튼 제한
  isDisabled: boolean = false;

  //그리드 수정제한
  isEditing: boolean = true;

  private orginCatagory: any = [];

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

    let me = this;
    //취급업종
    this.categorydataSource = new ArrayStore({
      data: service.getcategory(),
      key: 'Id',
      onLoaded: function (result) {
        // Your code goes here
        me.orginCatagory = deepCopy(result)
      }
    });

    this.rowCount1 = 0;
    this.rowCount2 = 0;
    //회원가입 폼 데이터
    this.zmmt8100 = new ZMMT8100Model(this.appConfig.mandt, "", "", "", "Q", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", new Date, new Date, new Date, new Date, "", "", new Date, "", new Date, "", new Date, "", "", "", "", this.appConfig.interfaceId, new Date, "", this.appConfig.interfaceId, new Date, "", DIMModelStatus.UnChanged);
    //취급업종 폼 데이터
    this.zmmt8110 = new ZMMT8110Model(this.appConfig.mandt, "", "", this.appConfig.interfaceId, new Date, "", this.appConfig.interfaceId, new Date, "", DIMModelStatus.UnChanged);



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
      onClick: (e: any) => {

        this.dataInsert(this)

        let result = e.validationGroup.validate();
        if (!result.isValid) {
          alert("필수값을 입력하여 주십시오.");
        }
        else {
          alert("회원 정보가 수정되었습니다.");
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
    //조회버튼
    this.searchButtonOptions = {
      text: "조회",

      onClick: async () => {
        this.loadPanelOption = { enabled: true };
        this.dataLoad(this.imInfo, this.dataService, this);

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


  deleteRecords() {
    if (confirm("삭제하시겠습니까?"))
      this.dataDelete(this.key, this.dataService, this);
  }


  //국가 코드 값 변경
  onCountryCodeValueChanged(e: any) {
    this.zmmt8100.COUNTRY = e.selectedValue

    return;
  }
  //취급업종 코드 값 변경
  onCategoryCodeValueChanged(e: any) {
    this.zmmt8110.BIZUPJ = e.selectedValue

    return;
  }
  //공고유형 코드 값 변경
  onAnnouncementCodeValueChanged(e: any) {

  }
  //사업자구분 코드 값 변경
  onBusinessClassCodeValueChanged(e: any) {
    this.zmmt8100.BIZTY = e.selectedValue

    return;
  }
  //거래처구분 코드 값 변경
  onAccountClassCodeValueChanged(e: any) {
    this.zmmt8100.LIFTY = e.selectedValue

    return;
  }
  //질문코드 코드 값 변경
  onQuestionCodeCodeValueChanged(e: any) {
    this.zmmt8100.QSTION = e.selectedValue

    return;
  }

  //사업자 구분 값 변경
  onBiztyValueChanged(e: any) {
    this.zmmt8100.BIZTY = e.value[0]
  }
  //사용여부 값 변경
  onEVAYNValueChanged(e: any) {
    this.zmmt8100.EVAYN = e.value[0]
  }
  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: OBMMComponent) {
    //Main Data Form 데이터 조회
    var Zmmt8100result = await dataService.SelectModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
      `LOGID = '${thisObj.IDText.value}'`, "", QueryCacheType.None);

    if (Zmmt8100result.length == 0) {
      alert(" 조회하시는 회원 ID가 없습니다.")
    } else {
      thisObj.zmmt8100 = Zmmt8100result[0];
      //파서블엔트리 값 조회
      this.businessClassValue = Zmmt8100result[0].BIZTY;
      this.accountClassValue = Zmmt8100result[0].LIFTY;
      this.countryValue = Zmmt8100result[0].COUNTRY;
      this.questionCodeValue = Zmmt8100result[0].QSTION;

      //Sub Data Form 데이터 조회
      var Zmmt8110result = await dataService.SelectModelData<ZMMT8110Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8110ModelList", [],
        `BIZNO = '${thisObj.zmmt8100.BIZNO}'`, "", QueryCacheType.None);

      thisObj.zmmt8110 = Zmmt8110result[0];
      //루프 돌면서 값 받아오기
      Zmmt8110result.forEach((array: ZMMT8110Model) => {
        this.selectItems.push(array.BIZUPJ);
      })
    }

    

  }
  //데이터 삭제
  public async dataDelete(key: any, dataService: ImateDataService, thisObj: OBMMComponent) {
    try {


      //var DeleteData = new ZMMT8100Model(key, key, key.LIFNR, key.NAME1, key.APPST, key.LOGID, key.LOGPW, key.MACID, key.INTIP, key.J_1KFREPRE, key.ADDHQ, key.HOUSE_NO,
      //  key.SEARCHTERM1, key.J_1KFTIND, key.J_1KFTBUS, key.POSTL_COD1, key.BIZPM, key.LICNO, key.OFFNM, key.TELF1, key.TELF2, key.FAX, key.E_MAIL, key.BRANCH,
      //  key.BIZTY, key.LIFTY, key.COUNTRY, key.QSTION, key.ANSWER, key.REQDT, key.IUPDT, key.INVDT, key.CREDT, key.CREGD, key.EVAYN, key.LSTDT, key.LSTID, key.STODT,
      //  key.STOID, key.DUEDT, key.ZWELS, key.ZTERM, key.KALSK, key.REMARK, key.ERNAM, key.ERDAT, key.ERZET, key.AENAM, key.AEDAT, key.AEZET, DIMModelStatus.Delete);

      thisObj.zmmt8100.ModelStatus = DIMModelStatus.Delete;  
      var modelList: ZMMT8100Model[] = [thisObj.zmmt8100];
      this.rowCount1 = await this.dataService.ModifyModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", modelList);

      var selectResult = await dataService.SelectModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
        `BIZNO = '${thisObj.zmmt8100.BIZNO}'`, "", QueryCacheType.None);

      if (selectResult.length > 0 ) {
        alert("삭제되지 않았습니다.");
      } else {
        alert("회원ID가 삭제되었습니다.");
        this.zmmt8100 = new ZMMT8100Model(this.appConfig.mandt, "", "", "", "Q", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
          "", "", "", "", "", "", "", new Date, new Date, new Date, new Date, "", "", new Date, "", new Date, "", new Date, "", "", "", "", this.appConfig.interfaceId,
          new Date, "", this.appConfig.interfaceId, new Date, "", DIMModelStatus.UnChanged);
        thisObj.accountClassEntery.ClearSelectedValue();
        thisObj.accountClassEntery.ClearDataSource();

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
      alert(error);
    }
  }
  //  데이터 삽입
  public async dataInsert(thisObj: OBMMComponent) {
    try {
      let now = new Date();
      let minDate = new Date("0001-01-01");
      let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");

      var maininsertData = thisObj.zmmt8100 as ZMMT8100Model;

      maininsertData.REQDT = now;
      maininsertData.IUPDT = now;
      maininsertData.INVDT = now;
      maininsertData.ERDAT = now;
      maininsertData.AEZET = nowTime;
      maininsertData.ERZET = nowTime;
      maininsertData.CREDT = minDate;
      maininsertData.LSTDT = minDate;
      maininsertData.DUEDT = minDate;

      maininsertData.ModelStatus = DIMModelStatus.Modify;

      var mainmodelList: ZMMT8100Model[] = [maininsertData];

      var select1: boolean = false;
      var select2: boolean = false;

      var submodelList: ZMMT8110Model[] = [];
      for (let org of thisObj.orginCatagory) {
        let orgData = org as Category;
        submodelList.push(new ZMMT8110Model("600", this.zmmt8100.BIZNO, orgData.Id, this.appConfig.interfaceId, now, nowTime, this.appConfig.interfaceId, now, nowTime, DIMModelStatus.Add));
      }

      this.bizpmtagbox.value.forEach((value: any) => {
        if (value === 1)
          select1 = true;

        if (value === 3)
          select2 = true;

        submodelList.push(new ZMMT8110Model("600", this.zmmt8100.BIZNO, value, this.appConfig.interfaceId, now, nowTime, this.appConfig.interfaceId, now, nowTime, DIMModelStatus.Add));
      });


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
    this.zmmt8110.BIZUPJ = e.value;

  }
}
