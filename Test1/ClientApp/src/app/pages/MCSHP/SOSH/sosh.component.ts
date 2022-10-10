/**
 *
 * 
 * 서버 유류출하자료
 *
 * 
 */
import { NgModule, Component, enableProdMode, ViewChild} from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, ShipData } from '../SOSH/app.service'
import ArrayStore from 'devextreme/data/array_store';
import {
  DxDataGridComponent,
} from 'devextreme-angular';



//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'sosh.component.html',
  providers: [ImateDataService, Service]
})

export class SOSHComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  dataSource: ArrayStore;

  //delete
  selectedItemKeys: any[] = [];


  //정보
  shipdata: ShipData[];

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
  exportSelectedData: any;
  saveButtonOptions: any;
  deleteButtonOptions: any;
  addButtonOptions: any;
  cancelEditButtonOptions: any;

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //줄 선택
  selectedRowIndex = -1;

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 서버유류출하자료";

    this.dataSource = new ArrayStore({
      key: 'turn',
      data: service.getShipData(),
    });

    //정보
    this.shipdata = service.getShipData();

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

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
    //엑셀버튼
    this.exportSelectedData = {
      icon: 'export',
      onClick: () => {
        this.dataGrid.instance.exportToExcel(true);

      },
    };

    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $100',
      value: ['shipTotalAmt', '<', 3000],
    }, {
      text: '$100 - $200',
      value: [
        ['shipTotalAmt', '>=', 3000],
        ['shipTotalAmt', '<', 5000],
      ],
    }, {
      text: '$300 - $400',
      value: [
        ['shipTotalAmt', '>=', 5000],
        ['shipTotalAmt', '<', 10000],
      ],
    }, {
      text: '$400 - $500',
      value: [
        ['shipTotalAmt', '>=', 10000],
        ['shipTotalAmt', '<', 20000],
      ],
    }, {
      text: 'Greater than $500',
      value: ['shipTotalAmt', '>=', 20000],
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

  deleteRecords() {
    this.selectedItemKeys.forEach((key: any) => {
      this.dataSource.remove(key);
    });
    this.dataGrid.instance.refresh();
  }
  onToolbarPreparing(e:any) {
    e.toolbarOptions.items[0].showText = 'always';

    e.toolbarOptions.items.push({
      location: 'after',
      template: 'deleteButton',
    });
  }

}
