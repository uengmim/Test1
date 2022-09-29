/*
 * 출하 요청 등록 - 액상대리점
 */
import { Component, enableProdMode, ViewChild, Input, AfterViewInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from "devextreme/data/array_store";
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient} from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, OrderData, Reqclass, OilType, ShipSort } from '../CDRQ/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';
import { updateObject } from '../../../shared/imate/utility/object-copy';


//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'cdrq.component.html',
  providers: [ImateDataService, Service]
})

export class CDRQComponent implements AfterViewInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  
  //multiseletbox
  gridDataSource: any;
  gridBoxValue1: string[] = [];
  gridBoxValue2: string[] = [];
  gridBoxValue3: string[] = [];
  gridBoxValue4: string[] = [];
  gridBoxValue5: string[] = [];
  gridBoxValue6: string[] = [];


  //delete
  selectedItemKeys: any[] = [];
  //data
  store!: ArrayStore;
  dataSource: any;

  //정보
  oiltype: OilType[];
  Orderdata: OrderData[];
  reqclass: Reqclass[];
  shipsort: ShipSort[];
  
  //날짜 조회
  startDate: any;
  endDate: any;
  formOrderData: OrderData;
  //form popup
  colCountByScreen: Object;
  closeButtonOptions: any;

  //form
  popupVisible = false;
  labelMode: string;
  labelLocation: string
  readOnly: boolean;
  showColon: boolean;
  colCount: number;
  width: any;

  //date box
  now: any = new Date();

  
  //데이터 저장 버튼
  saveButtonOptions: any;
  savesButtonOptions: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //데이터 추가 버튼
  addButtonOptions: any;
  //편집 취소 버튼
  cancelEditButtonOptions: any;

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
    appInfo.title = AppInfoService.APP_TITLE + " | 출하요청등록";

    this.formOrderData = new OrderData();
    // formpopup
    const that = this;
    //스크린크기조정
    this.colCountByScreen = {
      md: 3,
      sm: 2,
    };

    //form
    this.labelMode = 'floating';
    this.labelLocation = 'left';
    this.readOnly = false;
    this.showColon = true;
    this.colCount = 2;

    //정보
    this.oiltype = service.getOilType();
    this.Orderdata = service.getOrderData();
    this.reqclass = service.getReqclass();
    this.shipsort = service.getShipSort();

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $3000',
      value: ['vehicleCapacity', '<', 3000],
    }, {
      text: '$3000 - $5000',
      value: [
        ['vehicleCapacity', '>=', 3000],
        ['vehicleCapacity', '<', 5000],
      ],
    }, {
      text: '$5000 - $10000',
      value: [
        ['vehicleCapacity', '>=', 5000],
        ['vehicleCapacity', '<', 10000],
      ],
    }, {
      text: '$10000 - $20000',
      value: [
        ['vehicleCapacity', '>=', 10000],
        ['vehicleCapacity', '<', 20000],
      ],
    }, {
      text: 'Greater than $20000',
      value: ['vehicleCapacity', '>=', 20000],
    }];
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

    //팝업닫기버튼
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      }
    }
    //팝업저장버튼
    this.savesButtonOptions = {
      text: 'Save',
      onClick: () => {

        this.Orderdata.push(this.formOrderData);
        that.popupVisible = false;
      },
    };
    //저장버튼
    this.saveButtonOptions = {
      icon: 'save',
      onClick: () => {
        this.dataGrid.instance.saveEditData();
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
        this.dataGrid.instance.cancelEditData( )
      },
    };
    //삭제버튼
    this.deleteButtonOptions = {
      icon: 'trash',
      onClick: () => {

        this.dataGrid.instance.deleteRow(this.selectedRowIndex)
      },
    };
  }


  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  selectedChanged(e: any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }

  selectionChanged(data: any) {
    this.selectedItemKeys = data.selectedRowKeys;
  }

  AddRecords() {
    this.selectedItemKeys.forEach((key:any) => {
      this.dataGrid.instance.addRow();
    });
    this.dataGrid.instance.refresh();
  }

  SOILRecords() {
    this.formOrderData = new OrderData();
    //this.formOrderData.Reqdate = new Date();

    this.popupVisible = true;
  };
  
  onToolbarPreparing(e:any) {
    e.toolbarOptions.items[0].showText = 'always';

    e.toolbarOptions.items.push({
      location: 'after',
      template: 'deleteButton',
    });
  }

  getCompanySelectorLabelMode() {
    return this.labelMode === 'outside'
      ? 'hidden'
      : this.labelMode;
  }
  ngAfterViewInit() {
    this.dataSource = new DataSource({
      store: new ArrayStore({
        data: this.Orderdata,
        key: ['ReqNum']
      }),
    });
  }
  onInitNewRow(e:any) {
    var selDatas = e.component.getSelectedRowsData();
    if (selDatas.length <= 0) 
      return;

    var selData = selDatas[0];
    updateObject(selData, e.data);

    e.data.reqNum = "";
    e.data.reqDate = new Date();
    e.data.shipmentDate = new Date();
  }

  //onInsertRow(e: any) {
  //  var data = e.component.getSelectedRowsData() as [];
  //  e.cancel = data.length <= 0;
  //  if (e.cancel) {
  //    alert("먼저 자료를 선택하여 주십시오.");
  //  }
  //}
  // formpopup
  screen(width:any) {
    return width < 720 ? 'sm' : 'md';
  }

}
