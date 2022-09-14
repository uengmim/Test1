/**
 *
 * 
 * 유창 배분 등록
 *
 * 
 */
import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, Regis, AddData } from '../OWDR/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';



//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'owdr.component.html',
  providers: [ImateDataService, Service]
})

export class OWDRComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  formData: any = {};
  popupMode = 'Add';

  //data
  dataSource: any;
  indiQuan?: number;
  dispcNum?: number;
  indiNum?: number;
  //정보
  regis: Regis[];
  adddata: AddData[];
  //날짜 조회
  startDate: any;
  endDate: any;

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;
  currentFilter: any;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 조회 버튼
  searchButtonOptions: any;
  savesButtonOptions: any;
  closeButtonOptions: any;
  popupVisible = false;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //줄 선택
  selectedRowIndex = -1;
  selectedItemKeys: any[] = [];

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 유창배분등록";

    //정보
    this.regis = service.getRegis();
    this.adddata = service.getAddData();

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
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    //popup
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      }
    }
    this.savesButtonOptions = {
      text: 'Save',
      onClick: () => {

        that.popupVisible = false;
      },
    };

    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
    this.saleAmountHeaderFilter = [{
      text: 'Less than $100',
      value: ['oilSetAmount', '<', 3000],
    }, {
      text: '$100 - $200',
      value: [
        ['PARoilSetAmountAM9', '>=', 3000],
        ['oilSetAmount', '<', 5000],
      ],
    }, {
      text: '$300 - $400',
      value: [
        ['oilSetAmount', '>=', 5000],
        ['oilSetAmount', '<', 10000],
      ],
    }, {
      text: '$400 - $500',
      value: [
        ['oilSetAmount', '>=', 10000],
        ['oilSetAmount', '<', 20000],
      ],
    }, {
      text: 'Greater than $500',
      value: ['oilSetAmount', '>=', 20000],
    }];
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
  onCellPrepared(e: any) {
    if (e.rowType === "data" && e.column.dataField == ["oilRack"]) {
      e.cellElement.style.backgroundColor = '#424242';
    }
    if (e.rowType === "data" && e.column.dataField == ["oilOrderSort"]) {
      e.cellElement.style.backgroundColor = '#424242';
    }
    if (e.rowType === "data" && e.column.dataField == ["oilTem"]) {
      e.cellElement.style.backgroundColor = '#424242';
    }
    if (e.rowType === "data" && e.column.dataField == ["oilBLNum"]) {
      e.cellElement.style.backgroundColor = '#424242';
    }
    if (e.rowType === "data" && e.column.dataField == ["oilOrder"]) {
      e.cellElement.style.backgroundColor = '#424242';
    }
    if (e.rowType === "data" && e.column.dataField == ["oilRequset"]) {
      e.cellElement.style.backgroundColor = '#424242';
    }
    if (e.rowType === "data" && e.column.dataField == ["oilSOil"]) {
      e.cellElement.style.backgroundColor = '#424242';
    }
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

  onFocusedRowChanged(e: any) {
    const rowData = e.row && e.row.data;

    if (rowData) {
      this.indiQuan = rowData.indiQuan;
      this.dispcNum = rowData.dispcNum;
      this.indiNum = rowData.indiNum;

    }
  }
}
