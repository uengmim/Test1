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
import { alert, confirm } from "devextreme/ui/dialog";
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
  templateUrl: './obmi.component.html',
  providers: [ImateDataService],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})



export class OBMIComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) form!: DxFormComponent;
  @ViewChild('#gcContractList', { static: false }) gcContractList!: DxDataGridComponent;
  @ViewChild('questionCodeEntery', { static: false }) questionCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('buttonIem', { static: false }) buttonIem!: DxiItemComponent;
  @ViewChild('masterform', { static: false }) masterform!: DxFormComponent;

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

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private nbpAgetService: NbpAgentservice, private appInfo: AppInfoService, http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 회원정보찾기";

    this.displayExpr = "";
    this.localappConfig = appConfig;

    this.rowCount1 = 0;
    this.rowCount2 = 0;
    //회원가입 폼 데이터
    this.searchID = {};

    this._dataService = dataService;
    this.imInfo = imInfo;

    //질문 코드
    this.questionCode = appConfig.commonCode("질문코드");

    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.questionCode),
    ];
    PossibleEntryDataStoreManager.setDataStore("obmi", codeInfos, appConfig, dataService);


    const that = this;


    //재설정버튼 
    this.saveButtonOptions = {
      text: "재설정",
      type: 'success',
      width:150,
      useSubmitBehavior: true,
      disabled: true,
      onClick: async (e: any) => {
        var result = await this.dataLoad(this.imInfo, this.dataService, this, 'Pw');
        if (result.length == 0 ) {
          alert("해당 아이디의 이메일과 사업자번호를 입력하여 주십시오.", "알림");
          return;
        }
        if (result[0].QSTION != this.searchID.QSTION || result[0].ANSWER != this.searchID.ANSWER) {
          alert("질문과 답변이 일치하지 않습니다.", "알림");
          return;
        }
        if (this.searchID.LOGPW != this.searchID.LOGPW_CHK) {
          alert("비밀번호 확인이 일치하지 않습니다.", "알림");
          return;
        }
        if (await confirm("비밀번호를 변경하시겠습니까?", "알림")) {
          this.dataInsert(this)
          alert("비밀번호가 변경되었습니다.", "알림");
        }

      },
    };
  }

  /**
* 화면 종료
* */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore("obmi");
  }

  //중복 검사
  async SearchIDButton() {

    if (this.searchID.BIZNO == "") {
      alert("사업자번호를 입력해주세요.", "알림");
      return;
    }
    else if (this.searchID.E_MAIL == "") {
      alert("이메일을 입력해주세요.", "알림");
      return;
    }
    var result = await this.dataLoad(this.imInfo, this.dataService, this, 'Id');

    if (result.length > 0) {
      alert(`입력한 정보로 조회된 아이디는 '${result[0].LOGID}' 입니다.`, "알림");
      this.searchID.LOGID = result[0].LOGID;
      this.form.instance.getButton("applyBtn")?.option("disabled", false);
    } else {
      alert("입력한 정보로 조회된 아이디가 없습니다.", "알림")
      this.form.instance.getButton("applyBtn")?.option("disabled", true);
    }

  }

  //질문코드 코드 값 변경
  onQuestionCodeCodeValueChanged(e: any) {
    this.searchID.QSTION = e.selectedValue

    return;
  }


  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, thisObj: OBMIComponent, action : string) {
    if (action == "Id") {
      var where = `MANDT = '${this.appConfig.mandt}' AND BIZNO = '${thisObj.searchID.BIZNO}' AND E_MAIL = '${thisObj.searchID.E_MAIL}'`;
    } else {
      var where = `MANDT = '${this.appConfig.mandt}' AND BIZNO = '${thisObj.searchID.BIZNO}' AND E_MAIL = '${thisObj.searchID.E_MAIL}' AND LOGID = '${thisObj.searchID.LOGID}'`;
    }
    var resultModel = await dataService.SelectModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [], where, "", QueryCacheType.None);

    return resultModel;
  }



  //  데이터 삽입
  public async dataInsert(thisObj: OBMIComponent) {
    try {
      let now = new Date();
      let minDate = new Date("0001-01-01");
      let nowTime = formatDate(new Date(), "HH:mm:ss", "en-US");

      var resultModel = await this.dataService.SelectModelData<ZMMT8100Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND BIZNO= '${thisObj.searchID.BIZNO}' AND LOGID= '${thisObj.searchID.LOGID}' AND E_MAIL= '${thisObj.searchID.E_MAIL}'`, "", QueryCacheType.None);

      var userPW = thisObj.searchID.LOGPW

      var maininsertData = new ZMMT8100Model(this.appConfig.mandt, resultModel[0].BIZNO, resultModel[0].LIFNR, resultModel[0].NAME1, resultModel[0].APPST, resultModel[0].LOGID, SHA256(userPW).toString(),
        resultModel[0].MACID, resultModel[0].INTIP, resultModel[0].J_1KFREPRE, resultModel[0].ADDHQ, resultModel[0].HOUSE_NO, resultModel[0].SEARCHTERM1, resultModel[0].J_1KFTIND, resultModel[0].J_1KFTBUS,
        resultModel[0].POSTL_COD1, resultModel[0].BIZPM, resultModel[0].LICNO, resultModel[0].OFFNM, resultModel[0].TELF1, resultModel[0].TELF2, resultModel[0].FAX, resultModel[0].E_MAIL, resultModel[0].BRANCH,
        resultModel[0].BIZTY, resultModel[0].LIFTY, resultModel[0].COUNTRY, resultModel[0].QSTION, resultModel[0].ANSWER, resultModel[0].REQDT ?? minDate, resultModel[0].IUPDT ?? now, resultModel[0].INVDT ?? minDate, resultModel[0].CREDT ?? minDate,
        resultModel[0].CREGD, resultModel[0].EVAYN, resultModel[0].LSTDT ?? minDate, resultModel[0].LSTID, resultModel[0].STOID, resultModel[0].ZWELS, resultModel[0].ZTERM,
        resultModel[0].KALSK, resultModel[0].REMARK, resultModel[0].WAERS, resultModel[0].APPNO, this.appConfig.interfaceId, new Date(), "", this.appConfig.interfaceId, new Date(), "", DIMModelStatus.UnChanged);

      //레코드 생성일
      maininsertData.ERDAT = now;
      //입력시간
      maininsertData.AEZET = nowTime;
      //최종 변경 시간
      maininsertData.ERZET = nowTime;
      maininsertData.ModelStatus = DIMModelStatus.Modify;

      var mainmodelList: ZMMT8100Model[] = [maininsertData];

      this.rowCount1 = await this._dataService.ModifyModelData<ZMMT8100Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8100ModelList", mainmodelList);
    }
    catch (error) {
      alert("비밀번호 재설정 중 오류가 발생했습니다. 담당자에게 문의해주세요.", "알림");
    }
  }

  async onQSTIONDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obmi", this.appConfig, this.questionCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.questionCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

    }
  }

  //비밀번호 확인
  passwordComparison = () => this.form.instance.option('formData').LOGPW;
  //이메일 확인
  asyncValidation(params: any) {
    return sendRequest(params.value);
  }

}
