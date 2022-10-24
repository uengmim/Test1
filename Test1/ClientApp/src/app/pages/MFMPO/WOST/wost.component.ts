/*
 * W/O 진행현황
 */
import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { BrowserModule } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { ZPMF0001Model } from '../../../shared/dataModel/MFMPO/ZPmF0001Proxy';
import { ZPMF0002Model } from '../../../shared/dataModel/MFMPO/ZPmF0002Proxy';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Product } from './app.service';
import { DxDataGridComponent,} from 'devextreme-angular';
@Component({
  templateUrl: './wost.component.html',
  styleUrls: ['./wost.component.scss'],
  providers: [ImateDataService, Service],
//  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WOSTComponent {
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

  _dataService: ImateDataService;
  rowCount: number;

  //상세팝업 오픈
  popupVisible = false;
  //줄 선택
  selectedRowIndex = -1;
  selectedItemKeys: any[] = [];
  formData: any = {};
  popupMode = 'Add';

  //_dataService: ImateDataService;

  constructor(private dataService: ImateDataService, private appInfo: AppInfoService, service: Service, http: HttpClient, private ref: ChangeDetectorRef, imInfo: ImateInfo) {
    appInfo.title = AppInfoService.APP_TITLE + " | W/O 진행현황";
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.orderData = service.getOrderData();
    const that = this;
    let test = this;

  
    this._dataService = dataService;
    this.rowCount = 0;
    this.orderData = new CustomStore(
      {
        key: ["AUFNR"],
        load: function (loadOptions) {
          return test.dataLoad(imInfo, dataService);
        }
      });

    this.orderInfo = service.getOrderInfo();

    this.MaterialList = new CustomStore(
      {
        key: ["AUFNR", "RSNUM", "WERKS", "LGORT", "MATNR"],
        load: function (loadOptions) {
          return service.getMaterialList();
        }
      });

    this.FaultInfo = new CustomStore(
      {
        key: ["AUFNR", "QMNUM", "FENUM", "URNUM", "FEKAT", "FECOD", "FEVER", "OTKAT", "OTGRP", "OTEIL", "FEGRP"],
        load: function (loadOptions) {
          return service.getFaultInfo();
        }
      });

    this.ItemPrice = new CustomStore(
      {
        key: ["AUFNR", "PAYITEM"],
        load: function (loadOptions) {
          return service.getItemPrice();
        }
      });

    this.TroubleshootingList = new CustomStore(
      {
        key: ["QMNUM", "MANUM"],
        load: function (loadOptions) {
          return service.getTroubleshootingList();
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

  addRow(e: any): void {
    this.showPopup('Add', {}); //change undefined to {}
    this.dataGrid.instance.saveEditData();
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
  AddRecords() {
    this.selectedItemKeys.forEach((key: any) => {
      this.orderData.addRow();
    });
    this.dataGrid.instance.refresh();
  }
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {
    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")

    var zpf0001Model = new ZPMF0001Model("", "", "", "", this.endDate, this.startDate,  "", "", "","", "", []);
    var modelList: ZPMF0001Model[] = [zpf0001Model];

    var resultModel = await dataService.RefcCallUsingModel<ZPMF0001Model[]>("DS4", "NBPDataModels", "NAMHE.Model.ZPMF0001ModelList", modelList, QueryCacheType.None);
    if (resultModel[0].E_TYPE !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].E_MSG}`);
      return [];
    }
    return resultModel[0].ITAB_DATA;
  }
  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }
}
