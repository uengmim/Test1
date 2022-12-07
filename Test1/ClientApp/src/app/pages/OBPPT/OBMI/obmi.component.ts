/*
 * 회원정보찾기
 */
import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Output } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Role, Category } from './app.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import {
  DxDataGridComponent, DxTextBoxComponent, DxTagBoxModule, DxFormModule, DxFormComponent, DxTagBoxComponent, DxButtonComponent
} from 'devextreme-angular';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZMMT8100Model } from '../../../shared/dataModel/OBPPT/Zmmt8100';
import { formatDate } from '@angular/common';
import { NbpAgentservice, DeviceInfo } from '../../../shared/services/nbp.agent.service'
import notify from 'devextreme/ui/notify';
import { async } from 'rxjs';
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
  templateUrl: './obmi.component.html',
  providers: [ImateDataService, Service],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})



export class OBMIComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) form!: DxFormComponent;
  @ViewChild('#gcContractList', { static: false }) gcContractList!: DxDataGridComponent;
  @ViewChild('questionCodeEntery', { static: false }) questionCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('buttonIem', { static: false }) buttonIem!: DxiItemComponent;

  callbacks = [];

  /**
 * 선택한 코드의 전체 키 값
 */
  @Output()
  selectedCodes: string[] = [];
  products: any;
  displayExpr: string;
  gridColumns: any = ['그룹코드', '그룹명', '코드', '코드명'];
  questionCode: CommonCodeInfo;

  localappConfig: AppConfigService;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //질문 파서블엔트리 값
  questionCodeValue: string | null = null;

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
  searchID: any;


  collapsed = false;
  rowCount1: number;
  rowCount2: number;

  _dataService: ImateDataService;

  dataSource: any;

  formData: any = {};

  //로딩
  loading = false;

  //버튼 제한
  isDisabled: boolean = false;

  //그리드 수정제한
  isEditing: boolean = true;


  kuk: boolean = true;

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
    appInfo.title = AppInfoService.APP_TITLE + " | 회원정보찾기";

    this.displayExpr = "";
    this.localappConfig = appConfig;

    this.rowCount1 = 0;
    this.rowCount2 = 0;
    //회원가입 폼 데이터
    this.searchID = new ZMMT8100Model(this.appConfig.mandt, "", "", "", "Q", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", new Date, new Date, new Date, new Date, "", "", new Date, "", new Date, "", new Date, "", "", "", "", this.appConfig.interfaceId, new Date, "", this.appConfig.interfaceId, new Date, "", DIMModelStatus.UnChanged);

    this._dataService = dataService;
    this.imInfo = imInfo;

    //질문 코드
    this.questionCode = appConfig.commonCode("질문코드");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.questionCode),
    ];
    PossibleEntryDataStoreManager.setDataStore("obmr", codeInfos, appConfig, dataService);


    const that = this;


    //재설정버튼
    this.saveButtonOptions = {
      text: "재설정",
      type: 'success',
      useSubmitBehavior: true,
      disabled: true,
      onClick: (e: any) => {

        this.dataInsert(this)
        alert("비밀번호가 변경되었습니다.");

      },
    };
  }

  /**
* 화면 종료
* */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore("obmr");
  }

  //중복 검사
  async SearchIDButton() {

    var result = await this.dataLoad(this.imInfo, this.dataService, this);

    if (result.length > 0) {
      alert("변경하실 비밀번호를 입력해주세요.");
      this.form.instance.getButton("applyBtn")?.option("disabled", false);
    } else {
      alert("입력하신 정보가 다릅니다.")
      this.form.instance.getButton("applyBtn")?.option("disabled", true);
    }

  }

  //질문코드 코드 값 변경
  onQuestionCodeCodeValueChanged(e: any) {
    this.searchID.QSTION = e.selectedValue

    return;
  }


  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: OBMIComponent) {

    var resultModel = await dataService.SelectModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
      `BIZNO = '${thisObj.searchID.BIZNO}'
       AND LOGID = '${thisObj.searchID.LOGID}'
       AND E_MAIL = '${thisObj.searchID.E_MAIL}'
       AND QSTION = '${thisObj.searchID.QSTION}'
       AND ANSWER = '${thisObj.searchID.ANSWER}' `, "", QueryCacheType.None);

    return resultModel;
  }



  //  데이터 삽입
  public async dataInsert(thisObj: OBMIComponent) {
    try {
      let now = new Date();
      let minDate = new Date("0001-01-01");
      let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");

      var maininsertData = thisObj.searchID as ZMMT8100Model;

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

      maininsertData.EVAYN = select1 || select2 ? "X" : ""

      this.rowCount1 = await this._dataService.ModifyModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", mainmodelList);

    }
    catch (error) {
      alert(error);
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

  //비밀번호 확인
  passwordComparison = () => this.form.instance.option('formData').LOGPW;
  //이메일 확인
  asyncValidation(params: any) {
    return sendRequest(params.value);
  }

}
