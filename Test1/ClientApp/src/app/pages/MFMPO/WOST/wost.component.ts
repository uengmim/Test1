/*
 * W/O 진행현황
 */
import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { BrowserModule } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { ZPMF0001Model, ZPMS0002Model } from '../../../shared/dataModel/MFMPO/ZPmF0001Proxy';
import { ZPMF0002Model, ZPMS0003Model, ZPMS0004Model } from '../../../shared/dataModel/MFMPO/ZPmF0002Proxy';
import { ZPMF0003Model, ZPMS0009Model, ZPMS0012Model } from '../../../shared/dataModel/MFMPO/ZPmF0003Proxy';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Product } from './app.service';
import { DxDataGridComponent, } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import { confirm, alert } from "devextreme/ui/dialog";
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { AppStatus } from '../WORR/app.service';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: './wost.component.html',
  styleUrls: ['./wost.component.scss'],
  providers: [ImateDataService, Service],
  //  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WOSTComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('gcOrderData', { static: false }) gcOrderData!: DxDataGridComponent;

  //dataSource: any;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;

  //오더데이터
  orderData: any;
  //오더내역
  orderInfo: any;
  //사용자재정보
  MaterialList: any;
  //고장정보
  FaultInfo: any;
  //항목단가
  ItemPrice: any;
  //고장해결
  TroubleshootingList: any;
  //이전배정일
  alDateList: any;

  //버튼
  exportSelectedData: any;
  searchButtonOptions: any;
  closeButtonOptions: any;
  savesButtonOptions: any;

  //자재사용 데이터
  matUseList: ZPMS0004Model[] = [];

  //상태에 따른 컴포넌트 사용여부
  isDisabled = false;

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
  selectedRowIndex = -1;
  selectedItemKeys: any[] = [];
  formData: any = {};
  popupMode = 'Add';
  customOperations: Array<any>;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  selectedAppStatus: string = "";

  appStatus: AppStatus[] = [];

  //_dataService: ImateDataService;
  /**
 * 생성자
 * @param appConfig 앱 수정 정보
 * @param nbpAgetService nbpAgent Service
 * @param authService 사용자 인증 서버스
 */

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private appInfo: AppInfoService, service: Service, http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo) {
    appInfo.title = AppInfoService.APP_TITLE + " | W/O 진행현황";

    this.appStatus = service.getAppStatusList();

    //date
    var now = new Date();
    this.startDate = formatDate(new Date(), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(now.setDate(now.getDate() + 1), "yyyy-MM-dd", "en-US");
    this.orderData = service.getOrderData();
    const that = this;
    let test = this;
    this.rowCount = 0;
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
    this.rowCount = 0;
    this.orderData = new CustomStore(
      {
        key: ["AUFNR"],
        load: function (loadOptions) {
          return test.dataLoad(imInfo, dataService);
        }
      });


    //엑셀버튼
    this.exportSelectedData = {
      icon: 'export',
      onClick: () => {
        //this.dataGrid.instance.exportToExcel(true);

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

  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  dblClick: any = async (e: any) => {

    var selectData = this.gcOrderData.instance.getSelectedRowsData();
    if (selectData[0].STAT1 !== "")
      this.isDisabled = true;
    else
      this.isDisabled = false;

    //this.showPopup('Add', {}); //change undefined to {}
    //this.dataGrid.instance.saveEditData();
    this.loadingVisible = true;
    var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].AUFNR);
    this.loadingVisible = false;
    //if (resultModel[0].E_TYPE !== "S") {
    //  alert(`상세 자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`);
    //}

    this.orderInfo = resultModel[0].ITAB_DATA2[0]

    this.matUseList = resultModel[0].ITAB_DATA3;
    this.MaterialList = new ArrayStore(
      {
        key: ["AUFNR", "RSNUM", "WERKS", "LGORT", "MATNR"],
        data: this.matUseList
      });

    resultModel[0].ITAB_DATA4.forEach(async (row: ZPMS0009Model) => {
      if (row.KATALOGART === "C") {
        row.KATALNAME = "손상";
        row.SORT = 1;
      } else if (row.KATALOGART === "B") {
        row.KATALNAME = "위치";
        row.SORT = 0;
      } else if (row.KATALOGART === "5") {
        row.KATALNAME = "원인";
        row.SORT = 2;
      } else if (row.KATALOGART === "A") {
        row.KATALNAME = "해결";
        row.SORT = 3;
      }
    });

    this.FaultInfo = new ArrayStore(
      {
        key: ["NOTIF_NO", "POSNR", "CAUSE_KEY", "KATALOGART", "CODEGRUPPE", "CODE"],
        data: resultModel[0].ITAB_DATA4
        
      });
    this.ItemPrice = new ArrayStore(
      {
        key: ["AUFNR", "PAYITEM"],
        data: resultModel[0].ITAB_DATA5
      });
    this.TroubleshootingList = new ArrayStore(
      {
        key: ["AUFNR", "EBELN", "EBELP"],
        data: resultModel[0].ITAB_DATA6
      });
    this.alDateList = new ArrayStore(
      {
        key: ["ALDAT"],
        data: resultModel[0].ITAB_DATA7
      })
    this.showPopup('Add', {}); //change undefined to {}
  }


  showPopup(popupMode: any, data: any): void {
    this.formData = {};
    console.log(data);
    console.log(this.formData);

    this.formData = data;
    this.popupMode = popupMode;
    this.popupVisible = true;
    console.log(this.formData);
  }
  //get diffInDay() {
  //  return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  //}
  makeAsyncDataSource(service: Service) {
    return new CustomStore({
      loadMode: 'raw',
      key: ['GCODE', 'GCODENM', 'SCODE', 'SCODENM'],
      load() {
        return service.getProduct();
      },
    });
  }
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }
  AddRecords() {
    this.selectedItemKeys.forEach((key: any) => {
      this.orderData.addRow();
    });
    this.dataGrid.instance.saveEditData();
  }
  //자재요청등록
  ReqRecords: any = async () => {
    if (await confirm("요청하시겠습니까?", "알림")) {
      this.loadingVisible = true;
      var resultModel = await this.datainsert();
      this.loadingVisible = false;
      if (resultModel.E_TYPE !== "S") {
        alert(`자재요청을 하지 못했습니다.\n\nSAP 메시지: ${resultModel.E_MSG}`, "오류");
        return;
      }
      this.orderInfo = resultModel.ITAB_DATA1[0]

      alert(`자재요청 하였습니다.`, "알림");
    }
  }
  //자재사용등록
  async matUseSave() {
    if (this.matUseList.length === 0) {
      alert(`자재사용등록할 정보가 없습니다.`, "알림");
      return;
    }

    if (await confirm("등록하시겠습니까?", "알림")) {
      this.loadingVisible = true;
      var resultModel = await this.datainsertMat();
      this.loadingVisible = false;
      if (resultModel.E_TYPE !== "S") {
        alert(`저장하지 못했습니다.\n\nSAP 메시지: ${resultModel.E_MSG}`, "오류");
        return;
      }

      this.loadingVisible = true;
      var reModel = await this.detaildataLoad(this, this.selectedItemKeys[0].AUFNR);
      this.loadingVisible = false;

      this.matUseList = reModel[0].ITAB_DATA3;
      this.MaterialList = new ArrayStore(
        {
          key: ["AUFNR", "RSNUM", "WERKS", "LGORT", "MATNR"],
          data: this.matUseList
        });

      alert(`등록 완료하였습니다.`, "알림");
    }
  }

  //데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {
    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")

    var appStatus = this.selectedAppStatus;

    //작업요청 선택 시 RFC는 빈값으로 수행 후 데이터 조정
    if (appStatus === "O") appStatus = "";

    var zpf0001Model = new ZPMF0001Model("", "", "", "", this.endDate, this.startDate, "", "", "", appStatus, "", "", []);
    var modelList: ZPMF0001Model[] = [zpf0001Model];

    this.loadingVisible = true;
    var resultModel = await dataService.RefcCallUsingModel<ZPMF0001Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0001ModelList", modelList, QueryCacheType.None);

    resultModel[0].ITAB_DATA.forEach(async (row: ZPMS0002Model) => {
      if (row.STAT1 === "") row.STATNAME = "작업요청";
      else if (row.STAT1 === "I") row.STATNAME = "검수요청";
      else if (row.STAT1 === "C") row.STATNAME = "검수승인"
    });

    var returnData = resultModel[0].ITAB_DATA;

    //작업요청 선택 시 RFC는 빈값으로 수행 후 데이터 조정
    if (this.selectedAppStatus === "O")
      returnData = returnData.filter(item => item.STAT1 === "");

    this.loadingVisible = false;
    if (resultModel[0].E_TYPE !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`, "알림");
      return [];
    } 
    return returnData;
  }

  // 상세 데이터 로드
  public async detaildataLoad(parent: WOSTComponent, aufnr: string) {
    var zpf0002Model = new ZPMF0002Model("", "", aufnr, []);
    var modelList: ZPMF0002Model[] = [zpf0002Model];
    //Test
    return await parent.dataService.RefcCallUsingModel<ZPMF0002Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0002ModelList", modelList, QueryCacheType.None);
  }


  // 상세 데이터 삽입
  public async datainsert() {
    var zpf0003Model = new ZPMF0003Model("", "", this.orderInfo.AUFNR, []);
    zpf0003Model.ITAB_DATA1.push(new ZPMS0003Model(this.orderInfo.AUFNR, this.orderInfo.KURZTEXT, this.orderInfo.ARBEI, this.orderInfo.MEINH, this.orderInfo.ANZZL));
    var modelList: ZPMF0003Model[] = [zpf0003Model];

    var insertModel = await this.dataService.RefcCallUsingModel<ZPMF0003Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0003ModelList", modelList, QueryCacheType.None);
    
    return insertModel[0];
  }

  // 상세 데이터 삽입
  public async datainsertMat() {
    
    var zpms0012: ZPMS0012Model[] = [];
    this.matUseList.forEach(async (row: ZPMS0004Model) => {
      zpms0012.push(new ZPMS0012Model("", row.RSNUM, "", row.LGORT, row.MATNR, row.QTY_INPUT, 0, row.MEINS));
    });

    var zpf0003Model = new ZPMF0003Model("", "", this.orderInfo.AUFNR, [], [], [], [], zpms0012);

    var modelList: ZPMF0003Model[] = [zpf0003Model];

    var insertModel = await this.dataService.RefcCallUsingModel<ZPMF0003Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZPMF0003ModelList", modelList, QueryCacheType.None);

    return insertModel[0];
  }

  //검수구분 변경 이벤트
  onAppStatusChanged(e: any) {
    this.selectedAppStatus = e.value;
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }

  //사용수량 데이터 변경이벤트
  async gridDataUpdating(e: any) {
    var addData = { QTY_REC: 0 };
    if (e.newData.QTY_INPUT < 0) {
      alert("-수량은 입력할 수 없습니다..", "오류");
      e.newData.QTY_INPUT = e.oldData.QTY_INPUT;
      return;
    }
    var QTY = e.newData.QTY_INPUT + e.oldData.QTY_CON
    if (e.oldData.QTY_OUT < QTY) {
      alert("출고수량이상 입력할 수 없습니다.", "오류");
      e.newData.QTY_INPUT = e.oldData.QTY_INPUT;
    } else {

      addData.QTY_REC = e.oldData.QTY_OUT - e.newData.QTY_INPUT - e.oldData.QTY_CON;
      e.newData = Object.assign(e.newData, addData);
    }
  }
}

function aufnr(imInfo: ImateInfo, dataService: ImateDataService, aufnr: any): PromiseLike<any> {
    throw new Error('Function not implemented.');
}
