import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Output, Input } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { Observable, Subscription } from 'rxjs';
import { CasResult, NbpAgentservice } from '../../../shared/services/nbp.agent.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { DxDataGridComponent, DxDateBoxComponent, DxFormComponent, DxNumberBoxComponent} from 'devextreme-angular';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { formatDate } from '@angular/common';
import { DxiItemComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';
import { Router } from '@angular/router';
import { alert, confirm } from "devextreme/ui/dialog";
import { Service, Data } from '../MGWI/app.service';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import dxDateBox from 'devextreme/ui/date_box';
import { ZMMFROMGWGrirModel, ZMMS9900Model, ZMMS0210Model } from '../../../shared/dataModel/MLOGP/ZmmFromGwGrir';
import { ZMMT3050Model } from '../../../shared/dataModel/MLOGP/Zmmt3050';




/**
 *
 * 정문 공차/중량계근I/F component
 * */


@Component({
  templateUrl: 'mgwi.component.html',
  providers: [ImateDataService, Service]
})

export class MGWIComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('datebox', { static: false }) datebox!: DxDateBoxComponent;
  @ViewChild(DxFormComponent, { static: false }) form!: DxFormComponent;
  @ViewChild('numberbox', { static: false }) numberbox!: DxNumberBoxComponent;
  @ViewChild('testBox', { static: false }) testBox!: DxiItemComponent;
  //메인 데이터
  mainData: any;

  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

                                                               /* 폼 데이터 */
  //입고 저장
  weightEnterRegister: any;
  weightOutRegister: any;
  weightStatementOutput: any;
  // 폼데이터
  weightStartData: any = {};

                                                               /* 계근 */
  //무게 정보
  weight: number = 0;
  //상태 Observer
  private casObserver$: Observable<CasResult[]> | null = null;
  //상태 구독
  private casSubscription$: Subscription | null = null;

                                                               /* 날짜 */
  //날짜 조회
  startDate: any;
  endDate: any;
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

                                                               /* 줄 선택 */
  //delete
  selectedItemKeys: any[] = [];
  selectedRowIndex = -1;
  selectGridData: any;
                                                               /* 메인 화면 */
  //필터
  customOperations!: Array<any>;
  saleAmountHeaderFilter: any;
  popupPosition: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //버튼 이벤트
  inProgress: boolean;
  buttonText = '수동 등록';
  zmms0210: ZMMS0210Model;
  //클릭 금지
  disable: any;
  /**
* 생성자
* @param appConfig 앱 수정 정보
* @param nbpAgetService nbpAgent Service
* @param authService 사용자 인증 서버스
*/
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService,  private nbpAgetService: NbpAgentservice, service: Service, private appInfo: AppInfoService, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 정문 공차/중량계근I/F";
    //this._dataService = dataService;
    this.zmms0210 = new ZMMS0210Model("", new Date(), "", "", "", "", "", "", "", 0, "", "", "", "", "", "", DIMModelStatus.Add);
                                                               //--------------------중량 측정-------------------//
    //중량 계근
    //if (this.casSubscription$ !== undefined && this.casSubscription$ !== null)
    //  return;

    //계근 중량 가리기
    this.inProgress = true;
    this.disable = true;
    setInterval(this.now, 1000);
                                                               //--------------------데이터 디폴트-------------------//

    //데이터디폴트
    this.weightStartData.ZGW_DATE = new Date();
    this.weightStartData.ZGW_TIME = new Date();
    this.weightStartData.ZGW_ATGEW = 0;
    this.weightStartData.GEWEI = "MT";
    this.weightStartData.STATUS = "계근 입력 상태";

                                                               //--------------------버튼이벤트-------------------//
    //전표 출력 버튼
    this.weightStatementOutput = {
      text: '전표 출력',
      useSubmitBehavior: true,
      onClick: async (e: any) => {
        if (await confirm("출력하시겠습니까 ?", "알림")) {
          //출력이벤트
        }
      },
    };

    //입고 저장 버튼
    this.weightEnterRegister = {
      text: '입고 저장',
      useSubmitBehavior: true,
      onClick: async (e: any) => {
        if (await confirm("입고 저장하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          let result = e.validationGroup.validate();

          if (!result.isValid) {
            alert("필수값을 입력하여 주십시오.", "알림");
          } else {
              this.datainsert(this)
              alert("입고 저장이 되었습니다.", "알림");
            }
          
          this.loadingVisible = false;

        }
        this.dataLoad(this.dataService, this);
      },

    };

    //출고 저장 버튼
    this.weightOutRegister = {
      text: '출고 저장',
      useSubmitBehavior: true,
      onClick: async (e: any) => {
        if (await confirm("출고 저장하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          let result = e.validationGroup.validate();

          if (!result.isValid) {
            alert("필수값을 입력하여 주십시오.", "알림");
          } else {
              this.datainsert(this)
              alert("출고 저장이 되었습니다.", "알림");
          }
          this.loadingVisible = false;

        }
        this.dataLoad(this.dataService, this);
      },
    };
    this.dataLoad(this.dataService, this);

  }

                                                               //--------------------데이터 로드-------------------//
  //데이터로드
  public async dataLoad(dataService: ImateDataService, thisObj:MGWIComponent) {
    var userInfo = this.authService.getUser().data;
    Object.assign(this.weightStartData, { ZGW_PER1: userInfo?.userName, ZGW_PER2: userInfo?.userName });
    var resultModel = await dataService.SelectModelData<ZMMT3050Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3050ModelList", [],
      `MANDT = '${thisObj.appConfig.mandt}' AND ZGW_GUBUN = 'G'`, "", QueryCacheType.None);

    this.mainData = new ArrayStore(
      {
        key: ["ZGW_SEQ"],
        data: resultModel
      });

    return resultModel;
  }
  // 데이터 저장
  public async datainsert(thisObj: MGWIComponent) {
    try {
      let now = new Date();
      let nowTime = formatDate(new Date(), 'HH:mm:ss', "en-US");

      var zmms9900Model = new ZMMS9900Model("", "");

      var zmms0210Model: ZMMS0210Model[] = [];

      zmms0210Model.push(new ZMMS0210Model("G", thisObj.weightStartData.ZGW_DATE, formatDate(thisObj.weightStartData.ZGW_TIME, 'HH:mm:ss', "en-US"), thisObj.weightStartData.ZCARNO, thisObj.weightStartData.ZDRIVER, thisObj.weightStartData.ZGW_MATNR,
        thisObj.weightStartData.ZGW_MAKTX, thisObj.weightStartData.ZGW_LIFNR, thisObj.weightStartData.ZGW_NAME1, thisObj.weightStartData.ZGW_ATGEW, thisObj.weightStartData.GEWEI, thisObj.weightStartData.ZGW_PER1, thisObj.weightStartData.ZGW_PER2, "", "", "", DIMModelStatus.Add));

      var zmmfromgwgrirModel = new ZMMFROMGWGrirModel(zmms9900Model, zmms0210Model);
      var modelList: ZMMFROMGWGrirModel[] = [zmmfromgwgrirModel];

      var insertModel = await this.dataService.RefcCallUsingModel<ZMMFROMGWGrirModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMFROMGWGrirModelList", modelList, QueryCacheType.None);

      return insertModel[0];
    }
    catch (error: any) {
      alert(error, " 오류");
      return null;
    }

  }
                                                               //--------------------메인-------------------//
  //조회 클릭
  public refreshDataGrid(e: Object) {
    this.dataLoad(this.dataService, this);
    this.now = new Date();
    this.weightStartData.ZGW_TIME = new Date();
  }
  //수동등록 클릭
  manualRegis = (e:any) => {
    setTimeout(() => {

      if (this.inProgress) {
        this.testBox.editorOptions = { disabled: false };
        this.buttonText = '계근 등록';
        this.weightStartData.STATUS = "수동 입력 상태";
      } else {
        this.testBox.editorOptions = { disabled: true };
        this.buttonText = '수동 등록';
        this.weightStartData.STATUS = "계근 입력 상태";
      }
      this.inProgress = !this.inProgress;
    });
    this.form.instance.repaint();
  }

  //삭제 클릭
  deleteRecords() {
    this.selectedItemKeys.forEach((key: any) => {
      this.mainData.remove(key);
    });
    this.dataGrid.instance.refresh();
  }


  //선택이벤트
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }


                                                               //--------------------무게-------------------//

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
            thisObj.weightStartData.ZGW_ATGEW = casResult.weight * 1000;
          else
            thisObj.weightStartData.ZGW_ATGEW = casResult.weight;
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
  /**
 * COM PORT 닫기
 * @param e
 */
  async closeComClick(e: any) {
    this.stopMonitoring()
    let result = await this.nbpAgetService.casClose();
    if (result !== "ok")
      alert(result!,"알림");
  }
  /**
   * COM PORT 열기
   * @param e
   */
  async openComClick(e: any) {
    this.runMonitoring();
    this.loadingVisible = true;
    let result = await this.nbpAgetService.casOpen();
    if (result !== "ok")
      alert(result!, "알림");
    this.loadingVisible = false;
  }
  //무게 바뀔때
  handleValueChange(e: any) {
    setTimeout(() => {
      this.weightStartData.GEWEI = e.value;
      return;
    });
  }
}
