/*
 * 출고 지시 등록
 */
import { Component, enableProdMode, ViewChild, AfterViewInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import ArrayStore from "devextreme/data/array_store";
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient } from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { lastValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';
import { Service, OrderInfo, InvenList, InsRegis, LiqShip, Reqclass, OilType, SalesSort, Rack, LiqOrderInfo } from '../CSSO/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';


//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'csso.component.html',
  providers: [ImateDataService, Service]
})

export class CSSOComponent implements AfterViewInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  //databinding
  cusDate?: string;
  cusNum?: number;
  oilClass?: string;
  tankNum?: number;
  cusQuan?: number;
  invenQuan?: number;
  shipQuan?: number;
  klQuan?: number;
  shipper?: string;
  ship?: string;
  dPass?: string;
  sBlNo!: number;
  sPassNo?: string;
  orderOilClass?: string;
  orderVehicleNum?: string;
  orderShipNum?: string;
  orderCBusiNo?: number;
  orderCliName?: string;
  orderPhoneNum?: string;
  liqShipReqNum?: number;
  liqSOrdNum?: number;
  liqAlloVol?: number;

  //multiseletbox
  gridDataSource: any;
  gridBoxValue1: string[] = [];
  gridBoxValue2: string[] = [];

  //delete
  selectedItemKeys: any[] = [];
  //data
  store!: ArrayStore;
  dataSource: any;
  //정보
  oiltype: OilType[];
  salessort: SalesSort[];
  rack: Rack[];
  liqship: LiqShip[];
  reqclass: Reqclass[];
  orderinfo: OrderInfo[];
  invenlist: InvenList[];
  insregis: InsRegis[];
  formInvenList: InvenList;
  liqorderinfo: LiqOrderInfo[];
  //날짜 조회
  startDate: any;
  endDate: any;



  width: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //버튼 옵션
  saveButtonOptions: any;
  savesButtonOptions: any;
  liqsavesButtonOptions: any;
  deleteButtonOptions: any;
  searchButtonOptions: any;
  addButtonOptions: any;
  cancelEditButtonOptions: any;
  closeButtonOptions: any;
  liqcloseButtonOptions: any;
  backButtonOptions: any;

  //form popup
  formOrderData: OrderInfo;
  LiqOrderData: LiqOrderInfo;
  popupVisible = false;
  liqpopupVisible = false;
  colCountByScreen: Object;

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //줄 선택
  selectedRowIndex = -1;

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;

  //_dataService: ImateDataService;

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출고지시등록";
    //form popup
    this.formOrderData = new OrderInfo();
    this.LiqOrderData = new LiqOrderInfo();
    this.formInvenList = new InvenList();
    const that = this;
    this.colCountByScreen = {
      md: 3,
      sm: 2,
    };

    //정보
    this.oiltype = service.getOilType();
    this.orderinfo = service.getOrderInfo();
    this.invenlist = service.getInvenList();
    this.insregis = service.getInsRegis();
    this.reqclass = service.getReqclass();
    this.liqship = service.getLiqShip();
    this.rack = service.getRack();
    this.salessort = service.getSalesSort();
    this.liqorderinfo = service.getLiqOrderInfo();

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
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

    //유류팝업닫기버튼
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      }
    }
    //유류팝업저장버튼
    this.savesButtonOptions = {
      text: 'Save',
      onClick: () => {

        this.orderinfo.push(this.formOrderData);
        that.popupVisible = false;
      },
    };
    //액상팝업닫기버튼
    this.liqcloseButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.liqpopupVisible = false;
      }
    }
    //액상팝업저장버튼
    this.liqsavesButtonOptions = {
      text: 'Save',
      onClick: () => {

        this.orderinfo.push(this.formOrderData);
        that.liqpopupVisible = false;
      },
    };
    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
    //추가버튼
    this.addButtonOptions =
    {
      icon: 'add',
      onClick: async () => {
        this.dataGrid.instance.addRow();
      },
    };
    //취소버튼
    this.cancelEditButtonOptions =
    {
      icon: 'undo',
      onClick: async () => {
        this.dataGrid.instance.cancelEditData()
      },
    };
    //삭제버튼
    this.deleteButtonOptions = {
      icon: 'trash',
      onClick: () => {

        this.dataGrid.instance.deleteRow(this.selectedRowIndex)
      },
    };
    //저장버튼
    this.saveButtonOptions = {
      icon: 'save',
      onClick: () => {
        this.dataGrid.instance.saveEditData();
      },
    };

  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }


  AddRecords() {
    this.selectedItemKeys.forEach((key: any) => {
      this.dataGrid.instance.addRow();
    });
    this.dataGrid.instance.refresh();
  }

  RegisRecords() {
    this.formOrderData = new OrderInfo();
    //this.formOrderData.Reqdate = new Date();

    this.popupVisible = true;
  };
  Regis2Records() {
    this.LiqOrderData = new LiqOrderInfo();

    this.liqpopupVisible = true;
  };
  moveRecords() {
    window.location.assign('../trmt');
  };

  onToolbarPreparing(e: any) {
    e.toolbarOptions.items[0].showText = 'always';

    e.toolbarOptions.items.push({
      location: 'after',
      template: 'deleteButton',
    });
  }

  screen(width: any) {
    return width < 720 ? 'sm' : 'md';
  }
  ngAfterViewInit() {
    this.dataSource = new DataSource({
      store: new ArrayStore({
        data: this.invenlist,
        key: ['sBlNo']
      }),
    });
  }
  onFocusedRowChanging(e: any) {
    const rowsCount = e.component.getVisibleRows().length;
    const pageCount = e.component.pageCount();
    const pageIndex = e.component.pageIndex();
    const key = e.event && e.event.key;

    if (key && e.prevRowIndex === e.newRowIndex) {
      if (e.newRowIndex === rowsCount - 1 && pageIndex < pageCount - 1) {
        e.component.pageIndex(pageIndex + 1).done(() => {
          e.component.option('focusedRowIndex', 0);
        });
      } else if (e.newRowIndex === 0 && pageIndex > 0) {
        e.component.pageIndex(pageIndex - 1).done(() => {
          e.component.option('focusedRowIndex', rowsCount - 1);
        });
      }
    }
  }
  orderFocusedRowChanging(e: any) {
    const rowsCount = e.component.getVisibleRows().length;
    const pageCount = e.component.pageCount();
    const pageIndex = e.component.pageIndex();
    const key = e.event && e.event.key;

    if (key && e.prevRowIndex === e.newRowIndex) {
      if (e.newRowIndex === rowsCount - 1 && pageIndex < pageCount - 1) {
        e.component.pageIndex(pageIndex + 1).done(() => {
          e.component.option('focusedRowIndex', 0);
        });
      } else if (e.newRowIndex === 0 && pageIndex > 0) {
        e.component.pageIndex(pageIndex - 1).done(() => {
          e.component.option('focusedRowIndex', rowsCount - 1);
        });
      }
    }
  }
  liqFocusedRowChanging(e: any) {
    const rowsCount = e.component.getVisibleRows().length;
    const pageCount = e.component.pageCount();
    const pageIndex = e.component.pageIndex();
    const key = e.event && e.event.key;

    if (key && e.prevRowIndex === e.newRowIndex) {
      if (e.newRowIndex === rowsCount - 1 && pageIndex < pageCount - 1) {
        e.component.pageIndex(pageIndex + 1).done(() => {
          e.component.option('focusedRowIndex', 0);
        });
      } else if (e.newRowIndex === 0 && pageIndex > 0) {
        e.component.pageIndex(pageIndex - 1).done(() => {
          e.component.option('focusedRowIndex', rowsCount - 1);
        });
      }
    }
  }
  onFocusedRowChanged(e: any) {
    const rowData = e.row && e.row.data;

    if (rowData) {
      this.cusDate = rowData.cusDate;
      this.sBlNo = rowData.sBlNo;
      this.ship = rowData.ship;
      this.klQuan = rowData.klQuan;
      this.shipper = rowData.shipper;
      this.cusQuan = rowData.cusQuan;
      this.oilClass = rowData.oilClass;
      this.shipQuan = rowData.shipQuan;
      this.cusNum = rowData.cusNum;
      this.invenQuan = rowData.invenQuan;

    }
  }
  orderFocusedRowChanged(e: any) {
    const rowData = e.row && e.row.data;

    if (rowData) {
      this.orderOilClass = rowData.orderOilClass;
      this.orderVehicleNum = rowData.orderVehicleNum;
      this.orderShipNum = rowData.orderShipNum;
      this.orderCBusiNo = rowData.orderCBusiNo;
      this.orderCliName = rowData.orderCliName;
      this.orderPhoneNum = rowData.orderPhoneNum;
      this.invenQuan = rowData.invenQuan;

    }
  }
  liqFocusedRowChanged(e: any) {
    const rowData = e.row && e.row.data;

    if (rowData) {
      this.liqShipReqNum = rowData.liqShipReqNum;
      this.liqSOrdNum = rowData.liqSOrdNum;
      this.liqAlloVol = rowData.liqAlloVol;
    }
  }
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;
  }
  editRow(e: any): void {
    e.component.editRow(this.selectedRowIndex);

  }
}
