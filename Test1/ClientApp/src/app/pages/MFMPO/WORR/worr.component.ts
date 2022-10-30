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
import { ZPMF0001Model } from '../../../shared/dataModel/MFMPO/ZPmF0001Proxy';
import { ZPMF0002Model } from '../../../shared/dataModel/MFMPO/ZPmF0002Proxy';
import { ZPMF0003Model } from '../../../shared/dataModel/MFMPO/ZPmF0003Proxy';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Product } from './app.service';
import { DxDataGridComponent, } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import { AuthService } from '../../../shared/services';

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

export class WORRComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  //dataSource: any;

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
  //버튼
  exportSelectedData: any;
  searchButtonOptions: any;
  closeButtonOptions: any;
  savesButtonOptions: any;

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
  isPopupVisible: boolean = false;

  //_dataService: ImateDataService;
  /**
 * 생성자
 * @param appConfig 앱 수정 정보
 * @param nbpAgetService nbpAgent Service
 * @param authService 사용자 인증 서버스
 */

  constructor(private dataService: ImateDataService, private appInfo: AppInfoService, service: Service, http: HttpClient, private ref: ChangeDetectorRef, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | W/O 진행현황";

    let usrInfo = authService.getUser();
    console.info(usrInfo);
    console.info();
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
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

  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  dblClick: any = async (e: any) => {
    this.showPopup('Add', {}); //change undefined to {}
    //this.dataGrid.instance.saveEditData();

    var resultModel = await this.detaildataLoad(this, this.selectedItemKeys[0].AUFNR);
    if (resultModel[0].E_TYPE !== "S") {
      alert(`상세 자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`);
    }

    this.orderInfo = resultModel[0].ITAB_DATA2[0]
    this.MaterialList = new ArrayStore(
      {
        key: ["AUFNR", "RSNUM", "WERKS", "LGORT", "MATNR"],
        data: resultModel[0].ITAB_DATA3
      });
    this.FaultInfo = new ArrayStore(
      {
        key: ["AUFNR", "QMNUM", "FENUM", "URNUM", "FEKAT", "FECOD", "FEVER", "OTKAT", "OTGRP", "OTEIL", "FEGRP"],
        data: resultModel[0].ITAB_DATA4

      });
    this.ItemPrice = new ArrayStore(
      {
        key: ["AUFNR", "PAYITEM"],
        data: resultModel[0].ITAB_DATA5
      });
    this.TroubleshootingList = new ArrayStore(
      {
        key: ["QMNUM", "MANUM"],
        data: resultModel[0].ITAB_DATA6
      });
    //this.showPopup('Add', {}); //change undefined to {}
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
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }
  addRow(e: any): void {
    this.showPopup('Add', {}); //change undefined to {}
    this.dataGrid.instance.saveEditData();
  }
  AddRecords() {
    this.selectedItemKeys.forEach((key: any) => {
      this.orderData.addRow();
    });
    this.dataGrid.instance.saveEditData();
  }
  //데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {
    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")

    var zpf0001Model = new ZPMF0001Model("", "", "", "", this.endDate, this.startDate, "", "", "", "", "", []);
    var modelList: ZPMF0001Model[] = [zpf0001Model];

    var resultModel = await dataService.RefcCallUsingModel<ZPMF0001Model[]>("DS4", "NBPDataModels", "NAMHE.Model.ZPMF0001ModelList", modelList, QueryCacheType.None);
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
    return await parent.dataService.RefcCallUsingModel<ZPMF0002Model[]>("DS4", "NBPDataModels", "NAMHE.Model.ZPMF0002ModelList", modelList, QueryCacheType.None);
  }


  // 상세 데이터 삽입
  public async datainsert(iminfo: ImateInfo, dataService: ImateDataService, aufnr: string) {
    var zpf0003Model = new ZPMF0003Model("", "", aufnr, []);
    var modelList: ZPMF0003Model[] = [zpf0003Model];

    var insertModel = await dataService.RefcCallUsingModel<ZPMF0003Model[]>("DS4", "NBPDataModels", "NAMHE.Model.ZPMF0003ModelList", modelList, QueryCacheType.None);
    if (insertModel[0].E_TYPE !== "S") {
      alert(`저장에 실패하였습니다.\n\nSAP 메시지: ${insertModel[0].E_MSG}`);
      return [];
    }
    return insertModel[0].ITAB_DATA1;
  }
  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }
}
