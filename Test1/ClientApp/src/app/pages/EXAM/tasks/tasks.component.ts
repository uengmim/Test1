import { Component, OnDestroy, ViewChild } from '@angular/core';
import 'devextreme/data/odata/store';
import { Observable, Subscription } from 'rxjs';
import { ArrayCodeInfo, AttachFileInfo, CommonCodeInfo, ParameterDictionary, TableCodeInfo, TableColumnInfo, ThemeManager } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEnteryDataInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { CasResult, NbpAgentservice } from '../../../shared/services/nbp.agent.service';
/*import { List, Enumerable } from 'linqts'*/
import { deepCopy } from '../../../shared/imate/utility/object-copy';
import { QueryDataType, QueryMessage, QueryParameter, QueryRunMethod, TransactionId } from '../../../shared/imate/imateCommon';
import { VocCodeInfo } from '../../../shared/dataModel/QMSIF/VocCodeInfo';
import { VocPersonnfo } from '../../../shared/dataModel/QMSIF/VocPersonInfo';
import { VocInfData } from '../../../shared/dataModel/QMSIF/VocInfData';
import { formatDate } from '@angular/common';
import { QmsInfResult } from '../../../shared/dataModel/QMSIF/QmsInfResult';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { debug } from 'console';
import { AttachFileComponent } from '../../../shared/components/attach-file/attach-file.component';
import { OfficeXPUtility } from '../../../shared/officeXp.utility';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: 'tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnDestroy {
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;
  @ViewChild('AttachFile', { static: false }) AttachFile!: AttachFileComponent;
  @ViewChild('cm001Entery', { static: false }) cm001Entery!: CommonPossibleEntryComponent;
  @ViewChild('dynamicEntery', { static: false }) dynamicEntery!: CommonPossibleEntryComponent;
  @ViewChild('sd007Entery', { static: false }) sd007Entery!: CommonPossibleEntryComponent;
  @ViewChild('maraEntery', { static: false }) maraEntery!: TablePossibleEntryComponent;
  @ViewChild('manureQtyUnitEntery', { static: false }) manureQtyUnitEntery!: CommonPossibleEntryComponent;
  @ViewChild('inChargesCodeEntery', { static: false }) inChargesCodeEntery!: CommonPossibleEntryComponent;


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

  //--------------------------------------------------------------------
  dataSource: any;
  priority: any[];

  /**
   * 첨부 편집 모드
   * */
  editingMode: boolean = true;

  /**
   * 생성자
   * @param appConfig 앱 수정 정보
   * @param nbpAgetService nbpAgent Service
   * @param authService 사용자 인증 서버스
   */
  constructor(private appConfig: AppConfigService,
              private nbpAgetService: NbpAgentservice, private authService: AuthService,
              private dataService: ImateDataService, private httpClient: HttpClient) {

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
    this.loadingVisible = false;

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

    this.offceXPUtility = new OfficeXPUtility(httpClient, appConfig);
    this.offceXPUtility.getOffiXpAttachFileInfo("M202301161930").then((fileInfos) => {
      this.attachFiles = fileInfos
    });

    //신규일경우 임시로 업로드 번호를 매긴다.
    //this.uploadDocumentNo = TransactionId();

    //조회일경우 문서 번호를 셋팅
    this.uploadDocumentNo = "M202301161930";

    //this.attachFiles.push(new AttachFileInfo("0a3a99df-6a55-2b40-05e7-8e7b1a9a6add", "202104_위임결재기준_ISTN.pdf"));
    //this.attachFiles.push(new AttachFileInfo("2b35e6ad-7b88-e48e-7134-4b8314bbacaf", "장비및지적재산권목록.xlsx"));
    //this.attachFiles.push(new AttachFileInfo("de606104-6d6e-2953-2ed3-b1fa192c3f5a", "유니브아이엠씨_통합광고상품소개서_22년5월.pdf"));

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

      //console.info(resultModel);

      //let lst = new List(resultModel);
      //let lstClone= new List(deepCopy(resultModel));

      //let orderedModes1 = lst.OrderBy(m => m.ZCMF01_CH).ToArray();
      //let orderedModes2 = lstClone.OrderByDescending(m => m.ZCMF01_CH).ToArray();
      
      //console.info(orderedModes1);
      //console.info(orderedModes2);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createQueryMessage(this.appConfig, this.cm001Code, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      //console.info(resultModel);
    }

    setTimeout(() => { this.loadingVisible = false });
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
    console.log("onCm001ValueChanged Event 발생");

    this.cm001Entery.SetEventBocking();
    console.log("onCm001ValueChanged Event Set Blcocking");

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

    this.cm001Entery.ClearEventBlocking();
    console.log("onCm001ValueChanged Event Clear Blcocking");

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

  //---------------------------------------------------

  //시비량 선택
  selManureQtyUnit: string | null = null;
  manureQtyAdapter =
    {
      getValue: () => {
        return this.selManureQtyUnit;
      },
      applyValidationResults: (e: any) => {
        this.manureQtyUnitEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };


  //담당자 선택
  selInChargePerson: string | null = null;
  inChargePersonAdapter =
    {
      getValue: () => {
        return this.selInChargePerson;
      },
      applyValidationResults: (e: any) => {
        this.inChargesCodeEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };


  /**
   * QMS VOC 기본 코드
   * @param e
   */
  async getVocBaseCode(e: any) {

    //VOC 기초 코드 정보를 가져 온다.
    let vocBaseCodeQuery = new QueryMessage(QueryRunMethod.Alone, "vocBaseCode", "#func", "NBPDataModels@NAMHE.CustomFunction.QmsVocBaseCodeInterface", [], []);
    var resultSet = await this.dataService.dbSelectToDataSet([vocBaseCodeQuery])

    //사업장
    var site = resultSet.getDataObject("site", VocCodeInfo);
    //사업부
    var bunit = resultSet.getDataObject("bunit", VocCodeInfo);
    //생산공장
    var factory = resultSet.getDataObject("factory", VocCodeInfo);
    //고객 유형
    var cystmerType = resultSet.getDataObject("cystmerType", VocCodeInfo);
    //지역
    var area = resultSet.getDataObject("area", VocCodeInfo);
    //지역국내
    var domestic = resultSet.getDataObject("domestic", VocCodeInfo);
    //지역해외
    var oversea = resultSet.getDataObject("oversea", VocCodeInfo);
    //재배형태
    var culytivateType = resultSet.getDataObject("culytivateType", VocCodeInfo);
    //제품군
    var productGroup = resultSet.getDataObject("productGroup", VocCodeInfo);
    //민원종류
    var vocType = resultSet.getDataObject("vocType", VocCodeInfo);
    //민원원인
    var vocCause = resultSet.getDataObject("vocCause", VocCodeInfo);
    //불량수량단위
    var rejectQtyUnit = resultSet.getDataObject("rejectQtyUnit", VocCodeInfo);

    //시비량단위
    var manureQtyUnit = resultSet.getDataObject("manureQtyUnit", VocCodeInfo);
    //담당자
    var InCharges = resultSet.getDataObject("inCharge", VocPersonnfo);

    //배열 코드정보를 만든다.
    let manureQtyUnitCode = new ArrayCodeInfo("시비량단위", ["code"], manureQtyUnit,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명") ]);
    //파서블 엔터리의 코드 정보를 변경 한다.
    this.manureQtyUnitEntery.ChangeCodeInfo(manureQtyUnitCode, "code", "%codenm%(%code%)");

    //배열 코드정보를 만든다.
    let inChargesCode = new ArrayCodeInfo("담당자", ["id"], InCharges,
      [new TableColumnInfo("plant", "플렌트"), new TableColumnInfo("id", "ID"), new TableColumnInfo("name", "이름"), new TableColumnInfo("buseonm", "부서")]);
     //파서블 엔터리의 코드 정보를 변경 한다.
    this.inChargesCodeEntery.ChangeCodeInfo(inChargesCode, "id", "%name% / %buseonm% (%id%)");
  }

  /**
 * QMS VOC 기본 코드
 * @param e
 */
  async getVocDataSave(e: any) {

    //QMS 요구 일자 포멧
    let now = formatDate(new Date(), "yyyy.MM.dd", "en-US");

    let vocData = new VocInfData("1000", "COM_001", "테스크 고객1", "COM_001", "D", "COM_001", "상세 지역1", "COM_001", "R06MOAA-008",
      "농업용 염화가리", 3, "ETC", "기타단위1", "COM_001", "PU50", "20628", now, "LOT12345", now, now,
      "COM_001", "COM_001", "작물1", 100, "1", "", 12, "COM_001", "22345", "조치내용1", "특기사항1", null);

    let vocDataStr = JSON.stringify([vocData]);
    let queryParam = new QueryParameter("vocdata", QueryDataType.String, vocDataStr, "", "", "", "");

    //VOC 기초 코드 정보를 가져 온다.
    let vocDataSaveQuery = new QueryMessage(QueryRunMethod.Alone, "vocBaseCode", "#func", "NBPDataModels@NAMHE.CustomFunction.QmsVocDataInterface", [], [queryParam]);
    var resultSet = await this.dataService.dbSelectToDataSet([vocDataSaveQuery]);
    let result = resultSet.getDataObject("result", QmsInfResult);

    console.log(result);
  }

  async onOpenReport(e: any) {
    let now = new Date();
    let toStr = formatDate(now.setDate(now.getDate() - 5), "yyyy-MM-dd", "en-US");
    let nowStr = formatDate(now, "yyyy-MM-dd", "en-US");
    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "izgwDate": nowStr,
      "izgwGubun": "G",
      "izgwSeq": "004",
      "mandt": this.appConfig.mandt
    };

    setTimeout(() => { this.reportViewer.OpenReport("TestReport", params) });
  }

  async onPrintReport(e: any) {
    let now = new Date();
    let toStr = formatDate(now.setDate(now.getDate() - 5), "yyyy-MM-dd", "en-US");
    let fromStr = formatDate(now, "yyyy-MM-dd", "en-US");
    let params: ParameterDictionary =
    {
      "dbTitle": this.appConfig.dbTitle,
      "startDate": fromStr,
      "endDate": toStr
    };

    //프린터
    this.reportViewer.printReport("TestReport", params);
  }

  /**
   * 문서 번호 변경
   * */
  onChangeDocNo(e: any) {
    //등록한 문서 번호를 변경 한다.
    let newDocNo = `M${formatDate(new Date(), "yyyyMMddHHmm", "en-US")}`;
    this.AttachFile.changeDocumentNo(newDocNo);
  }

  /**
   * 문서 번호의 첨부 전체 삭제
   * */
  onDeleteDocNo(e: any) {
    //문서번호를 지정 하지 않으면 현재 문서번호의 첨부문서 전체를 삭제 한다.
    this.AttachFile.deleteDocument(null);
  }
  /**
   * 파일 업로드
   * */
  onUploadFile(e: any) {
    console.log("UPLOAD BEFORE: " + this.AttachFile.uploadFileExists); //업로드할 첨부파일 있으면 True 아니면 False

    this.AttachFile.upload();

  }

  /**
   * 업로드 파일 변경
   * */
  attachFileChanged(e: any) {
    //debugger;
    console.info(e);
  }

  /**
   * 업로드 완료(useButtons 에서만 발생)
   * */
  uploadComplete(e: any) {
    console.info(e);
    console.log("UPLOAD AFTER: " + this.AttachFile.uploadFileExists); //업로드할 첨부파일 있으면 True 아니면 False
  }
}
