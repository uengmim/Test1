/*
 * W/O 작업결과등록
 */
import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { BrowserModule } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { ZPMF0001Model, ZPMS0002Model } from '../../../shared/dataModel/MFMPO/ZPmF0001Proxy';
import { ZPMF0002Model } from '../../../shared/dataModel/MFMPO/ZPmF0002Proxy';
import { ZPMF0003Model, ZPMT0010Model, ZPMT0020Model } from '../../../shared/dataModel/MFMPO/ZPmF0003Proxy';
import { ZPMF0006Model, ZPMS0008Model } from '../../../shared/dataModel/MFMPO/ZPmF0006Proxy';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Product } from './app.service';
import { DxDataGridComponent, } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: './worr.component.html',
  styleUrls: ['./worr.component.scss'],
  providers: [ImateDataService, Service],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WORRComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  //dataSource: any;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;

  //오더데이터
  orderData: any;
  //오더내역
  orderInfo: any;
  //작업목록
  workOrderList: any;
  //작업계약리스트
  workContractList: any;
  //고장원인
  FaultInfo: any;
  //계약리스트
  contractList: any;

  //버튼
  exportSelectedData: any;
  searchButtonOptions: any;
  closeButtonOptions: any;
  savesButtonOptions: any;

  zpmF002Models: ZPMF0002Model[] = [];

  //현재날짜
  now: Date = new Date();
  startDate: any;
  endDate: any;
  //date box
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  collapsed = false;
  selectedMaterKey: number = -1;
  rowCount: number;

  _dataService: ImateDataService;
  //상세팝업 오픈
  popupVisible = false;
  //줄 선택
  selectedOrderRowIndex = -1;
  selectedOrderItemKeys: any[] = [];
  selectedMerterialRowIndex = -1;
  selectedMerterialItemKeys: any[] = [];
  formData: any = {};
  popupMode = 'Add';
  customOperations: Array<any>;
  isPopupVisible= false;

  //_dataService: ImateDataService;
  /**
 * 생성자
 * @param appConfig 앱 수정 정보
 * @param nbpAgetService nbpAgent Service
 * @param authService 사용자 인증 서버스
 */

  constructor(private appConfig: AppConfigService,private dataService: ImateDataService, private appInfo: AppInfoService, service: Service, http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | W/O 작업결과등록";

    let usrInfo = authService.getUser();
    console.info(usrInfo);
    console.info();
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;
    let test = this;
    this.rowCount = 0;
    //필터
    this.customOperations = [{
      name: 'weekends',
      caption: 'Weekends',
      dataTypes: ['date'],
      icon: 'check',
      hasValue: false,
      calculateFilterExpression() {
        return [[getOrderDay, '=', 0], 'or', [getOrderDay, '=', 6]];
      },
    }];
    this._dataService = dataService;
    this.imInfo = imInfo;

    this.rowCount = 0;

    //엑셀버튼
    this.exportSelectedData = {
      icon: 'export',
      onClick: () => {
        this.dataGrid.instance.exportToExcel(true);

      },
    };
    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
    //팝업닫기버튼
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      },
    };
    //팝업저장버튼
    this.savesButtonOptions = {
      text: 'Save',
      onClick: () => {

        that.popupVisible = false;
      },
    };
  }


  /**
   * Angular 초가화
   **/
  async ngOnInit() {
    var orderData = await this.dataLoad(this.imInfo, this.dataService);
    this.orderData = new ArrayStore(
      {
        key: ["AUFNR"],
        data: orderData
      });
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };
  //메인 더블클릭시 팝업
  dblClick: any = async (e: any) => {
    this.showPopup('Add', {}); //change undefined to {}
    this.isPopupVisible = false;
    this.detaildatareload(this);
  
    //this.showPopup('Add', {}); //change undefined to {}
  }
  //데이터 다시 로드
  async detaildatareload(thisObj : WORRComponent) { 
    thisObj.zpmF002Models = await thisObj.detaildataLoad(thisObj, thisObj.selectedOrderItemKeys[0].AUFNR);
    var resultModel = thisObj.zpmF002Models;
    //if (resultModel[0].E_TYPE !== "S") {
    //  alert(`상세 자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`);
    //}

    thisObj.orderInfo = resultModel[0].ITAB_DATA2[0]
    thisObj.workOrderList = new ArrayStore(
      {
        key: ["AUFNR", "QMNUM"],
        data: resultModel[0].ITAB_DATA6
      });
    thisObj.workContractList = new ArrayStore(
      {
        key: ["AUFNR", "PAYITEM"],
        data: resultModel[0].ITAB_DATA5
      });
    thisObj.FaultInfo = new ArrayStore(
      {
        key: ["KATALOGART"],
        data: resultModel[0].ITAB_DATA4

      });
  }
  //팝업이벤트
  showPopup(popupMode: any, data: any): void {
    this.formData = {};
    console.log(data);
    console.log(this.formData);

    this.formData = data;
    this.popupMode = popupMode;
    this.popupVisible = true;
    this.isPopupVisible = true;
    console.log(this.formData);
  }
  //날짜
  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }
  makeAsyncDataSource(service: Service) {
    return new CustomStore({
      loadMode: 'raw',
      key: ['GCODE', 'GCODENM', 'SCODE', 'SCODENM'],
      load() {
        return service.getProduct();
      },
    });
  }
  //작업결과등록
  AddRecords() {
    this.selectedOrderItemKeys.forEach((key: any) => {
      this.orderData.addRow();
    });
    this.dataGrid.instance.saveEditData();
  }

  //계약추가 팝업
  addRow: any = async (e: any) => {
    this.showPopup('Add', {}); //change undefined to {}
    var resultModel = await this.popupdataLoad(this.imInfo, this.dataService);
    this.contractList = new ArrayStore(
      {
        key: ["WERKS", "EBELP"],
        data: resultModel
      });
  }

  //계약추가 팝업 내의 추가 버튼
  ReqRecords: any = async () => {
    this.selectedMerterialItemKeys.forEach(async (key: any) => {
      var resultModel = await this.datainsert(this, key);
      if (resultModel === null)
        return;

      //this.contractList = resultModel.ITAB_DATA3[0]
      //this.contractList = resultModel.ITAB_DATA4[0]
    });

    this.isPopupVisible = false;
    this.detaildatareload(this);
  }
  //클릭 키
  selectionOrderChanged(data: any) {
    this.selectedOrderRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedOrderItemKeys = data.currentSelectedRowKeys;
  }

  selectionMeterialChanged(data: any) {
    this.selectedMerterialRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedMerterialItemKeys = data.currentSelectedRowKeys;
  }
  //데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {
    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")

    var zpf0001Model = new ZPMF0001Model("", "", "", "", this.endDate, this.startDate, "", "", "", "", "", []);
    var modelList: ZPMF0001Model[] = [zpf0001Model];

    var resultModel = await dataService.RefcCallUsingModel<ZPMF0001Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0001ModelList", modelList, QueryCacheType.None);
    if (resultModel[0].E_TYPE !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`);
      return [];
    }

    return resultModel[0].ITAB_DATA;
  }

  // 상세 데이터 로드
  public async detaildataLoad(parent: WORRComponent, aufnr: string) {
    var zpf0002Model = new ZPMF0002Model("", "", aufnr, []);
    var modelList: ZPMF0002Model[] = [zpf0002Model];
    //Test
    return await parent.dataService.RefcCallUsingModel<ZPMF0002Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0002ModelList", modelList, QueryCacheType.None);
  }

  // 팝업 데이터 로드
  public popupdataLoad = async (iminfo: ImateInfo, dataService: ImateDataService) => {
    var zpf0006Model = new ZPMF0006Model("", "", this.zpmF002Models[0].ITAB_DATA1[0].IDAT1, this.zpmF002Models[0].ITAB_DATA1[0].PARNR, this.zpmF002Models[0].ITAB_DATA1[0].WERKS, []);
    var modelList: ZPMF0006Model[] = [zpf0006Model];

    var resultModel = await dataService.RefcCallUsingModel<ZPMF0006Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0006ModelList", modelList, QueryCacheType.None);
    if (resultModel[0].E_TYPE === "E") {
      alert(`데이터가 없습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`);
      return [];
    }
    return resultModel[0].ITAB_DATA;
  }

  // 계약추가 데이터 삽입
  public async datainsert(thisObj: WORRComponent, key : any) {
    try {
      var contract = await (thisObj.contractList as ArrayStore).byKey(key) as ZPMS0008Model;

      var order = await (thisObj.orderData as ArrayStore).byKey(thisObj.selectedOrderItemKeys[0]) as ZPMS0002Model;
      var currDate = new Date();
      var currTim = formatDate(currDate, "HH:mm:ss", "en-US");


      var zpf0003Model = new ZPMF0003Model("", "", "", []);
      zpf0003Model.ITAB_DATA3.push(new ZPMT0010Model(thisObj.appConfig.mandt, order.AUFNR, "", currDate, currDate, currDate, contract!.EBELN, "", contract!.PARNR, "", "", "", currDate, currTim, "", currDate, currTim));
      zpf0003Model.ITAB_DATA4.push(new ZPMT0020Model(thisObj.appConfig.mandt, order.AUFNR, "", contract!.EBELN, contract!.EBELP, contract!.PAYITEM, contract!.MENGE.toString(), "", "", currDate, currTim, "", currDate, currTim));

      var modelList: ZPMF0003Model[] = [zpf0003Model];

      var insertModel = await thisObj.dataService.RefcCallUsingModel<ZPMF0003Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0003ModelList", modelList, QueryCacheType.None);

      return insertModel[0];
    }
    catch (error) {
      alert(error);
      return null;
    }
  }

  //Data refresh 날짜 새로고침 이벤트

  public refreshDataGrid = async (e: Object) => {
    var orderData = await this.dataLoad(this.imInfo, this.dataService);
    this.orderData = new ArrayStore(
      {
        key: ["AUFNR"],
        data: orderData
      });
  }
}
