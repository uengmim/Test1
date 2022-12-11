import { Component, OnDestroy, ViewChild } from '@angular/core';
import 'devextreme/data/odata/store';
import { Observable, Subscription } from 'rxjs';
import { CommonCodeInfo, ParameterDictionary, TableCodeInfo, ThemeManager } from '../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEnteryDataInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../shared/components/possible-entry-datastore';
import { TablePossibleEntryComponent } from '../../shared/components/table-possible-entry/table-possible-entry.component';
import { ZCMT0020Model } from '../../shared/dataModel/common/zcmt0020';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { AuthService } from '../../shared/services';
import { AppConfigService } from '../../shared/services/appconfig.service';
import { CasResult, NbpAgentservice } from '../../shared/services/nbp.agent.service';

@Component({
  templateUrl: 'tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnDestroy {
  @ViewChild('cm001Entery', { static: false }) cm001Entery!: CommonPossibleEntryComponent;
  @ViewChild('dynamicEntery', { static: false }) dynamicEntery!: CommonPossibleEntryComponent;
  @ViewChild('sd007Entery', { static: false }) sd007Entery!: CommonPossibleEntryComponent;
  @ViewChild('maraEntery', { static: false }) maraEntery!: TablePossibleEntryComponent;

  //---------------------------------------------------------------------------
  callbacks = [];

  //cm001 코드 정보
  cm001Code: CommonCodeInfo;
  //cm001 선택 값
  cm001Value: string | null;

  //validation Adapter
  c001Adapter = {
    getValue: () => {
      return this.cm001Value;
    },
    applyValidationResults: (e: any) => {
      this.cm001Entery.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };

  //cm001 선택 값
  dynamicValue: string | null = null;
  //동적 코드 placeholder 텍스트
  dynamicPlaceholderText: string = "";
  dynamicAdapter =
    {
      getValue: () => {
        return this.dynamicValue;
      },
      applyValidationResults: (e: any) => {
        this.dynamicEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //sd004 값정보
  sd007Code: CommonCodeInfo;
  //sd004 필터 : 처음에 자료가 아무것도 안나오게 한다.
  //sd007Filter: any = ["ZCM_CODE2", "=", "#"];
  sd007Filter: any = undefined;

  //자재 코드 값 정보
  maraCode: TableCodeInfo;
  //mara 필터 : 처음에 필터는 자료가 아무것도 안나오게 한다.
  //maraFilter: any = ["MTART", "=", "#"];
  maraFilter: any = null;
  maraValue: string | null;
  maraParameters: ParameterDictionary = {
    "mtart1": "ROH",
    "mtart2": "HALB",
    "mtart3": "FERT",
    "mtart4": "HAWA",
    "mtart5": ""
  };

  maraAdapter =
    {
      getValue: () => {
        return this.maraValue;
      },
      applyValidationResults: (e: any) => {
        this.maraEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;

  //------------------------------------------------------------------

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //------------------------------------------------------------------
  
  //무게
  weight: number = -1;

  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  
  /**
 * 상태 구독
 */
  private casSubscription$: Subscription | null = null;

  /**
 * 상태 Observer
 */
  private casObserver$: Observable<CasResult[]> | null = null;

  /**
   * 로딩된 PeCount
   * */
  private loadePeCount: number = 0;

  //--------------------------------------------------------------------

  dataSource: any;
  priority: any[];

  /**
   * 생성자
   * @param appConfig 앱 수정 정보
   * @param nbpAgetService nbpAgent Service
   * @param authService 사용자 인증 서버스
   */
  constructor(private appConfig: AppConfigService, private nbpAgetService: NbpAgentservice, private authService: AuthService, private dataService: ImateDataService) {
    this.cm001Code = appConfig.commonCode("결재코드");
    this.sd007Code = appConfig.commonCode("주문유형");
    this.maraCode = appConfig.tableCode("아이템코드");

    this.cm001Value = "Z00";
    this.maraValue ="A010110";

    let param1 : ParameterDictionary = {};
    param1["ZCM_CODE1"] = "1000";

    let param2: ParameterDictionary = {};
    param2["ZCM_CODE1"] = "AUART";

    let codeInfos = [
      new PossibleEnteryDataInfo(this.cm001Code),
      new PossibleEnteryDataInfo(this.sd007Code, param2),
      new PossibleEnteryDataInfo(this.maraCode, this.maraParameters),
      new PossibleEnteryCodeInfo(undefined, this.appConfig.commonCode("생산저장창고유형"), param1),
      new PossibleEnteryDataInfo(this.appConfig.commonCode("계약상태")),
    ];

    PossibleEntryDataStoreManager.setDataStore("task", codeInfos, appConfig, dataService);
    //데이터 로딩 패널 보이기
    this.loadingVisible = true;

    let usrInfo = authService.getUser().data;
    console.info(usrInfo);

    console.info();
    this.dataSource = {
      store: {
        type: 'odata',
        key: 'Task_ID',
        url: 'https://js.devexpress.com/Demos/DevAV/odata/Tasks'
      },
      expand: 'ResponsibleEmployee',
      select: [
        'Task_ID',
        'Task_Subject',
        'Task_Start_Date',
        'Task_Due_Date',
        'Task_Status',
        'Task_Priority',
        'Task_Completion',
        'ResponsibleEmployee/Employee_Full_Name'
      ]
    };
    this.priority = [
      { name: 'High', value: 4 },
      { name: 'Urgent', value: 3 },
      { name: 'Normal', value: 2 },
      { name: 'Low', value: 1 }
    ];

    //모니터링을 시작 한다.
    //this.runMonitoring();
  }

  //-------------------------------------------------------------------

  /**
   * 파서블 엔트리 데이터 로딩 완료
   * @param e
   */
  async onPEDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("task", this.appConfig, this.cm001Code);
      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createQueryMessage(this.appConfig, this.cm001Code, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

    }
  }

  /**
   * 화면 종료
   * */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore("task");
  }

  /**
   * CM001 값 변경 처리(this 사용을 위해 회살표 연산자 사용함)
   * @param e 이벤트 인수
   */
  onCm001ValueChanged = (e: any) => {
    if (e.selectedValue.startsWith("A")) {
      //파라미터를 지우고 샛팅 한다.
      this.dynamicEntery.parameters = {};
      this.dynamicEntery.parameters["ZCM_CODE1"] = "1000";
      this.dynamicEntery.ChangeCodeInfo(this.appConfig.commonCode("생산저장창고유형"), "ZCM_CODE2", "%ZCMF03_CH%(%ZCM_CODE2%)", "생산저장창고유형");
      setTimeout(() => {
        this.maraValue = "A010020";
      });
    }
    else {
      this.dynamicEntery.ChangeCodeInfo(this.appConfig.commonCode("계약상태"), "ZCM_CODE1", "%ZCMF01_CH%(%ZCM_CODE1%)", "계약상태");
    }

    this.sd007Entery.ClearSelectedValue();
    //this.maraEntery.ClearSelectedValue();
  }

  /**
   * 동적 파서블 엔트리 값 변경 처리
   * @param e 이벤트 인수
   */
  onDynamicValueChanged = (e: any) => {
    //파서블 엔트로 선택 값에의해 필터 조건을 변경 한다.
    this.sd007Entery.SetDataFilter(["ZCM_CODE2", "=", e.selectedValue]);
    this.maraEntery.ClearSelectedValue();
  }

  /**
   * SD004 데이터 로딩
   * @param e
   */
  onSd004DataLoading(e: any) {
    e.component.parameters = {};
    e.component.parameters["ZCM_CODE1"] = "AUART";
  }

  /**
   * 
   * @param e 이벤트 인수
   */
  onSd004ValueChanged = (e: any) => {
    //operations: "=", "<>", "<", ">", "<=", ">=", "between", "contains", "notcontains", "startswith", "endswith", "anyof", "noneof"
    if (e.selectedValue.startsWith("Z1")) {
      this.maraEntery.SetDataFilter(["MTART", "anyof", ["FERT", "HALB"]]);
    }
    else if (e.selectedValue.startsWith("Z2")) {
      this.maraEntery.SetDataFilter([["MTART", "=", "ROH"], "or", ["MTART", "=", "HALB"]]);
    }
    else if (e.selectedValue.startsWith("Z4")) {
      this.maraEntery.SetDataFilter(null);
    }
  }

  /**
   * 자재코드 값 변경 처리
   * @param e
   */
  onMaraValueChanged = (e: any) => {
    return;
  }

  saveClick(e: any) {
    let result = e.validationGroup.validate();
    if (!result.isValid) {
      alert("필수값을 입력하여 주십시오.");
    }
    else {
      alert("모든 값이 올바로 입력 되었습니다.");
    }
  }
  /**
  * RUN MONITOR
  **/
  runMonitoring() {
    if (this.casSubscription$ !== undefined && this.casSubscription$ !== null)
      return;

    var thisObj = this;
    //모니터링 시작
    this.casObserver$ = this.nbpAgetService.startCasResultPubulish(500);
    this.casSubscription$ = this.casObserver$.subscribe({
      next(info) {
        if (info.length > 0) {
          var casResult = info[info.length - 1];
          if (casResult.unit == "t")
            thisObj.weight = casResult.weight * 1000;
          else
            thisObj.weight = casResult.weight;
        }
      },
      error(err) { console.error('오류 발생: ' + err); },
      complete() { console.log('종료'); }
    });
  }

  /**
   * STOP MONITOR
   * */
  stopMonitoring() {
    if (this.casSubscription$ === undefined || this.casSubscription$ === null)
      return;

    this.nbpAgetService.stopCasResultPubulish();

    this.casSubscription$ = null;
    this.casObserver$ = null;
  }

  //onCodeValueChanged(e: any) {
  //  //alert(e);
  //  return;
  //}

  //-------------------------------------------------
  /**
   * 모니러링 중지 
   * @param e
   */
  stopMonitorClick(e: any) {
    this.stopMonitoring()
  }
  /**
   * 모니터링 시작 
   * @param e
   */
  startMonitorClick(e: any) {
      this.runMonitoring();
  }
  /**
   * COM PORT 닫기
   * @param e
   */
  async closeComClick(e: any) {
    let result = await this.nbpAgetService.casClose();
    if (result !== "ok")
      alert(result);
  }
  /**
   * COM PORT 열기
   * @param e
   */
  async openComClick(e: any) {
    let result = await this.nbpAgetService.casOpen();
    if (result !== "ok")
      alert(result);
  }
}
