/*
 * 출하 요청 등록
 */
import { Component, enableProdMode, ViewChild, Input, AfterViewInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from "devextreme/data/array_store";
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient} from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { Service, OrderData, Reqclass, OilType, ShipSort } from '../CSRQ/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';
import { updateObject } from '../../../shared/imate/utility/object-copy';


//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'csrq.component.html',
  providers: [ImateDataService, Service],

})

export class CSRQComponent implements AfterViewInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('gridBox1') gridBox1: any; 
  @ViewChild('gridBox2') gridBox2: any; 
  @ViewChild('gridBox3') gridBox3: any; 
  @ViewChild('gridBox4') gridBox4: any; 
  @ViewChild('gridBox5') gridBox5: any; 
  @ViewChild('gridBox6') gridBox6: any; 

  
  //multiseletbox
  gridDataSource: any;
  selectedOption1: string[] = [];
  selectedOption2: string[] = [];
  selectedOption3: string[] = [];
  gridBoxValue4: string[] = [];
  gridBoxValue5: string[] = [];
  gridBoxValue6: string[] = [];

  isGridBoxOpened: boolean;
  gridBoxValue: number[] = [3];

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
  formData: any = {};

  //날짜 조회
  startDate: any;
  endDate: any;
  formOrderData: OrderData;
  //form popup
  colCountByScreen: Object;
  closeButtonOptions: any;
  exportSelectedData: any;

  //form
  popupVisible = false;

  labelMode: string;

  labelLocation: string;

  readOnly: boolean;

  showColon: boolean;

  colCount: number;

  width: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  
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
  popupMode = 'Edit';

  //줄 선택
  selectedRowIndex = -1;

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;

  //_dataService: ImateDataService;

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, private appInfo: AppInfoService ) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출하요청등록";
    this.isGridBoxOpened = false;

    this.formOrderData = new OrderData();
    // formpopup
    const that = this;
    // 
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
      value: ['settlement', '<', 3000],
    }, {
      text: '$3000 - $5000',
      value: [
        ['settlement', '>=', 3000],
        ['settlement', '<', 5000],
      ],
    }, {
      text: '$5000 - $10000',
      value: [
        ['settlement', '>=', 5000],
        ['settlement', '<', 10000],
      ],
    }, {
      text: '$10000 - $20000',
      value: [
        ['settlement', '>=', 10000],
        ['settlement', '<', 20000],
      ],
    }, {
      text: 'Greater than $20000',
      value: ['settlement', '>=', 20000],
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
    //엑셀버튼
    this.exportSelectedData = {
      icon: 'export',
      onClick: () => {
        this.dataGrid.instance.exportToExcel(true);

      },
    };
    //팝업 close 버튼
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      }
    }
    //팝업 save 버튼
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
 
  selectionChanged(data: any ) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;
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
  editRow(e: any): void {
    e.component.editRow(this.selectedRowIndex);  

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
  //드롭박스close
  onSelectionChanged(e: any): void {
    this.gridBox1.instance.close();
    this.gridBox2.instance.close();
    this.gridBox3.instance.close();
    this.gridBox4.instance.close();
    this.gridBox5.instance.close();
    this.gridBox6.instance.close();

  }
  detailRowChanged(e: any) {
    this.selectedOption1 = e.component.cellValue(e.rowIndex, "orderClass");
    this.selectedOption2 = e.component.cellValue(e.rowIndex, "liquidClass");
    this.selectedOption3 = e.component.cellValue(e.rowIndex, "sort");


  }
  onDetailOptionChanged(cellInfo: any, e: any) {
    cellInfo.setValue(e.value);
  }
  detailSelectedKeys(cellInfo: any) {
    return cellInfo.value.split(',');
  }
}
