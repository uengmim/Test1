/*
 * 구매공고확인
 */
import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Output } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
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
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { ZMMBIDMstModel, ZMMS8030Model, ZMMS9000Model, RSISSRangeModel } from '../../../shared/dataModel/OBPPT/ZmmBidMst';
import { ZMMT8360Model } from '../../../shared/dataModel/OBPPT/Zmmt8360';
import { ZMMT8370Model } from '../../../shared/dataModel/OBPPT/Zmmt8370';
import { EbanModel } from '../../../shared/dataModel/OBPPT/Eban';
import { ZMMTDETAILModel } from '../../../shared/dataModel/OBPPT/ZmmtDetail';

import { formatDate } from '@angular/common';
import { DxiItemComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';
import { Router } from '@angular/router';
import { ZMMBIDDtlModel, ZMMS8020Model } from '../../../shared/dataModel/OBPPT/ZmmBidDtl';
import { ZMMRFQRtnModel, ZMMS8031Model, ZMMS8032Model } from '../../../shared/dataModel/OBPPT/ZmmRfcRtn';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: './obpi.component.html',
  providers: [ImateDataService, Service],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})



export class OBPIComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('popupForm', { static: false }) popupForm!: DxFormComponent;
  @ViewChild('#gcContractList', { static: false }) gcContractList!: DxDataGridComponent;
  @ViewChild('PrgstatusEntry', { static: false }) PrgstatusEntry!: CommonPossibleEntryComponent;
  @ViewChild('buttonIem', { static: false }) buttonIem!: DxiItemComponent;
  @ViewChild('categoryEntery', { static: false }) categoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('regulationEntery', { static: false }) regulationEntery!: CommonPossibleEntryComponent;
  @ViewChild('statusDataGrid', { static: false }) statusDataGrid!: DxDataGridComponent;
  @ViewChild('popupDataGrid', { static: false }) popupDataGrid!: DxDataGridComponent;
  @ViewChild('estimateDataGrid', { static: false }) estimateDataGrid!: DxDataGridComponent;
  @ViewChild('searchText', { static: false }) searchText!: DxTextBoxComponent;
  @ViewChild('bizpmtagbox', { static: false }) bizpmtagbox!: DxTagBoxComponent;
  @ViewChild('dataItem', { static: false }) dataItem!: DxiItemComponent;

  callbacks = [];


  //현재날짜
  now: Date = new Date();
  startDate: any;
  endDate: any;

  /**
 * 선택한 코드의 전체 키 값
 */
  @Output()
  selectedCodes: string[] = [];
  products: any;
  displayExpr: string;
  gridColumns: any = [ '그룹명', '코드', '코드명'];
  PrgstatusCode: CommonCodeInfo;
  RegulationCode: CommonCodeInfo;
  BusinessCategoryCode: TableCodeInfo;


  //구분 value
  PrgstatusCodeValue: string | null = null;
  RegulationValue: string | null = null;

  //취급업종
  categorydataSource: any;

  localappConfig: AppConfigService;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  //질문 파서블엔트리 값
  questionCodeValue: string | null = null;

  // 선택값
  selectGridData: ZMMS8030Model[] = [];
  //팝업 선택값
  popupGridData: ZMMS8020Model[] = [];
  //상세폼
  detailFormData: any;
  //견적폼
  estimateFormData: any;
  //견적-디테일폼
  estimateDetailFormData: any;
  //저장품구매 상세정보 팝업
  statuspopupVisible = false;
  //견적제출 상세정보 팝업
  estimatepopupVisible = false;

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
  //견적팝업 저장 버튼
  estimatepopupsaveButtonOptions: any;
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

  //줄 선택
  selectedRowIndex = -1;
  selectedItemKeys: any[] = [];

  tableresultModel: any;

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

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private appInfo: AppInfoService,
    service: Service, http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, private router: Router) {
    appInfo.title = AppInfoService.APP_TITLE + " | 구매공고현황";

    this.displayExpr = "";
    this.localappConfig = appConfig;

    let test = this;

    this.PrgstatusCodeValue = "1";
    this.RegulationValue = "1";

    //this.popupData8360 = new ZMMT8360Model(this.appConfig.mandt, "", "", "", "", new Date, "", new Date, "", 0, 0, 0, "", "", "", "", "", new Date, "", "", new Date, "", DIMModelStatus.UnChanged)
    //this.popupData8370 = new ZMMT8370Model(this.appConfig.mandt, this.popupData8360.BIDNO, "", "", "", "", 0, "", "", "", "", new Date, "", "", new Date, "",  DIMModelStatus.UnChanged)

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 93), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    this.rowCount1 = 0;
    this.rowCount2 = 0;

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
    //취급업종
    this.categorydataSource = new ArrayStore({
      data: service.getcategory(),
      key: 'Id',
    });
    //질문 코드
    this.PrgstatusCode = appConfig.commonCode("공고진행상태");
    this.BusinessCategoryCode = appConfig.tableCode("취급업종");
    this.RegulationCode = appConfig.commonCode("결재조건");


    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.PrgstatusCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.BusinessCategoryCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.RegulationCode),


    ];
    PossibleEntryDataStoreManager.setDataStore("obpi", codeInfos, appConfig, dataService);


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
    //팝업 엑셀 버튼
    this.exportSelectedData = {
      text: '엑셀 다운',
      onClick(e: any, thisObj: OBPIComponent) {
        that.popupDataGrid.instance.exportToExcel(true);
      },
    };
    //팝업 닫기 버튼
    this.popupcloseButtonOptions = {
      text: '닫기',
      onClick(e: any, thisObj: OBPIComponent) {
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
    //견적팝업 저장 버튼
    this.estimatepopupsaveButtonOptions = {
      text: '저장',
      onClick: async (e: any) => {
        var znumber = this.estimateDetailFormData.RFQSEQ.padStart(3, '0');
        this.estimateDetailFormData.RFQSEQ = (parseInt(znumber) + 1)

        this.loadingVisible = true;
        var resultModel = await this.datainsert(this);

        this.loadingVisible = false;
        if (resultModel.ES_RESULT.TYPE !== "S") {
          alert(`등록을 하지 못했습니다.\n\nSAP 메시지: ${resultModel.ES_RESULT.MESSAGE}`);
        } else {
          alert(`등록 하였습니다.\n\nSAP 메시지: ${resultModel.ES_RESULT.MESSAGE}`);

          return;
        }
      }
    }

    //견적팝업 엑셀 버튼
    this.estimateexportSelectedData = {
      text: '엑셀 다운',
      onClick(e: any, thisObj: OBPIComponent) {
        that.estimateDataGrid.instance.exportToExcel(true);
      },
    };
    //견적팝업 닫기 버튼
    this.estimatepopupcloseButtonOptions = {
      text: '닫기',
      onClick(e: any, thisObj: OBPIComponent) {
        that.estimatepopupVisible = false;
      },
    };
  }

  /**
* 화면 종료
* */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore("obpi");
  }

  //async getCodeInfo() {

  //  let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.BusinessCategoryCode); //ZCM_CODE1

  //  this.tableresultModel = dataSet?.tables["CODES"].getDataObjectAny();


  //}



  //데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {
    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")

    var zmms9000Model = new ZMMS9000Model("", "");

    var zmmbidmstModel = new ZMMBIDMstModel(zmms9000Model, this.startDate, this.endDate, this.PrgstatusEntry.selectedValue ?? "", "0000600033", [], []);

    var modelList: ZMMBIDMstModel[] = [zmmbidmstModel];

    this.loadingVisible = true;
    var resultModel = await dataService.RefcCallUsingModel<ZMMBIDMstModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDMstModelList", modelList, QueryCacheType.None);
    this.loadingVisible = false;

    //let model: Array<any> = this.tableresultModel;

    //resultModel[0].ET_DATA.forEach((array: any) => {

    //  model.find(array => array.BIDTY == "PRM");


    //});



    if (resultModel[0].ES_RESULT.TYPE !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].ES_RESULT.MESSAGE}`);
      return [];
    } 

    return resultModel[0].ET_DATA;

  }

  // 상세 데이터 로드
  public async detaildataLoad(parent: OBPIComponent, BIDNO:string) {


      var zmms9000Model = new ZMMS9000Model("", "");

    var zmmbiddtlModel = new ZMMBIDDtlModel(zmms9000Model, BIDNO, "0000600033", "", []);

      var modeldtlList: ZMMBIDDtlModel[] = [zmmbiddtlModel];

      return await parent.dataService.RefcCallUsingModel<ZMMBIDDtlModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDDtlModelList", modeldtlList, QueryCacheType.None);

  }

  // 8360 견적 로드
  public async formdataLoad(dataService: ImateDataService, thisObj: OBPIComponent) {

    var bidno = thisObj.estimateFormData.BIDNO.padStart(15, '0');

    var resultModel = await dataService.SelectModelData<ZMMT8360Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8360ModelList", [],
      `BIDNO = '${bidno}' AND LIFNR =  '0000600033'`, "", QueryCacheType.None);

    return resultModel;

  }

  // 8370 견적 로드
  public async datagridLoad(dataService: ImateDataService, thisObj: OBPIComponent) {


    var bidno = thisObj.estimateFormData.BIDNO.padStart(15, '0');
    var resultModel = await dataService.SelectModelData<ZMMT8370Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8370ModelList", [],
      `BIDNO = '${bidno}' AND LIFNR =  '0000600033'`, "", QueryCacheType.None);


    //var dataList: any = [];

    //resultModel.forEach((array: any, index: number) => {
    //  dataList.push({ BIDNO: array.BIDNO, NO: index });
    //});
    //return dataList;
    return resultModel;

  }


  // 데이터 저장
  public async datainsert(thisObj: OBPIComponent) {

    var zmms9000Model = new ZMMS9000Model("", "");
    let now = new Date();
    let minDate = new Date("0001-01-01");
    thisObj.estimateDetailFormData.RFQDTH = now;
    thisObj.estimateDetailFormData.GRETD = minDate;
    var zmms8031Model = new ZMMS8031Model("I", thisObj.estimateDetailFormData.BIDNO, thisObj.estimateDetailFormData.LIFNR, thisObj.estimateDetailFormData.RFQSEQ, thisObj.estimateDetailFormData.BIDNO,
      thisObj.estimateDetailFormData.RFQDTH, thisObj.estimateDetailFormData.RFGDTT, thisObj.estimateDetailFormData.GRETD, thisObj.estimateDetailFormData.PAYTY, thisObj.estimateDetailFormData.RFQCST,
      thisObj.estimateDetailFormData.RFQVAT, thisObj.estimateDetailFormData.RFQAMT, thisObj.estimateFormData.RFQPYN, DIMModelStatus.UnChanged);

    var zmms8032Model = new ZMMS8032Model(thisObj.estpopupData[0].BANFN, thisObj.estpopupData[0].BNFPO, thisObj.estpopupData[0].RFQCST, thisObj.estpopupData[0].MAKER, thisObj.estpopupData[0].REMARK, DIMModelStatus.UnChanged);

    var zmmrgqrtnModel = new ZMMRFQRtnModel(zmms9000Model, zmms8031Model, [zmms8032Model]);

    var modelList: ZMMRFQRtnModel[] = [zmmrgqrtnModel];

    var insertModel = await this.dataService.RefcCallUsingModel<ZMMRFQRtnModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMRFQRtnModelList", modelList, QueryCacheType.None);

    return insertModel[0];


  }


  //// 상세 데이터 로드
  //public async detaildataLoad(dataService: ImateDataService, thisObj: OBPIComponent) {

  //  try {
  //    return await dataService.SelectModelData<ZMMTDETAILModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMTDETAILModelList",
  //      [thisObj.selectedItemKeys[0].BIDNO], "", "", QueryCacheType.None);

 
  //  } catch (error: any) {
  //    alert(error.message);
  //    return null;
  //  }

  //}


  async onPrgstatusDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.PrgstatusCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.PrgstatusCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

    }
  }
  async onRegulationDataLoaded(e: any) {
    this.loadePeCount++;
    if (this.loadePeCount >= 3) {
      setTimeout(() => { this.loadingVisible = false });

      let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet("obpi", this.appConfig, this.RegulationCode);

      let resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

      //---------------------------------------------------------------------------------
      dataSet = await this.dataService.dbSelectToDataSet(
        PossibleEntryDataStore.createCommQueryMessage(this.appConfig, this.PrgstatusCode, null)
      );

      resultModel = dataSet?.tables["ZCMT0020"].getDataObject(ZCMT0020Model);

      console.info(resultModel);

    }
  }
  //전체 버튼
  allCategory(thisObj: OBPIComponent) {
    thisObj.bizpmtagbox.instance.reset();
    thisObj.statusDataGrid.instance.clearFilter();
   
  }
  //결제조건코드 값 변경
  onRegulationCodeValueChanged(e: any) {
    this.estimateFormData.PAYTY = e.selectedValue

    return;
  }


  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }
  //날짜 클릭
  dateCheck(e: any) {
    var staDate = new Date(this.startDate);
    var endDate = new Date(this.endDate);

    var diffDay = Math.floor(Math.abs((staDate.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000)));

    if (diffDay > 90) {
      alert("조회기간을 최대 3개월 이내로 설정해주세요.");
    } else {
      this.dataLoad(this.imInfo, this.dataService);
    }
  }

  //상세내용 버튼 이벤트
  statusDetailData : any = async (e: any) => {
    this.selectedItemKeys.forEach(async (key: any) => {
      this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

      this.detailFormData = this.selectGridData[0];

      this.loadingVisible = true;
      var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);
      this.loadingVisible = false;


      this.popupData = new ArrayStore(
        {
          key: ["BIDNO", "BANFN", "BNFPO"],
          data: resultModel[0].ET_DATA
        });

    });
    this.statuspopupVisible = !this.statuspopupVisible;

  }
  //견적제출
  Duplication: any = async (thisObj: OBPIComponent) => {
    this.selectedItemKeys.forEach(async (key: any) => {
      this.selectGridData = this.statusDataGrid.instance.getSelectedRowsData();

      this.estimateFormData = this.selectGridData[0];

      var result8360Model = await this.formdataLoad(this.dataService, this);


      this.estimateDetailFormData = result8360Model[0];

      this.loadingVisible = true;
      var result8370Model = await this.datagridLoad(this.dataService, this);
      var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].BIDNO);
      this.loadingVisible = false;


      result8370Model.forEach((array: any) => {
        var resultData = resultModel[0].ET_DATA.find(obj => obj.BANFN == array.BANFN);

        if (resultData != undefined) {
          Object.assign(array, {
            MATNR: resultData.MATNR, MATNRT: resultData.MATNRT, MENGE: resultData.MENGE,
            MEINS: resultData.MEINS, CONPR: resultData.CONPR, MAKER: resultData.MAKER, REMARK: resultData.REMARK
          });
        }
      });

      this.estpopupData = new ArrayStore(
        {
          key: ["BIDNO"],
          data: result8370Model
        });

    });
    this.estimatepopupVisible = !this.estimatepopupVisible;

  }
  //회원가입 버튼 페이지 이동 이벤트
  movePage(e: any) {
    this.router.navigate(['obmr']);
  }
  //자료첨부
  test() {

  }
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }

  //조회필터조건
  selectStatus(data: any) {
    this.statusDataGrid.instance.filter(['BIZUPJ', '=', data.value]);
  }

}
