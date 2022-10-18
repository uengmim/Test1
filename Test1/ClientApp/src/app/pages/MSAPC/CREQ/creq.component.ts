/*
 * 여신현황정보조회
 */
import { Component, enableProdMode, ViewChild } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, Datainq } from '../CREQ/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'creq.component.html',
  providers: [ImateDataService, Service]
})

export class CREQComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  //data
  dataSource: any;
  //거래처
  clients: string[];
  //정보
  datainq: Datainq[];
  Summary: any;
  exportSelectedData: any;
  printSelectedData: any;
  //날짜 조회
  startDate: any;
  endDate: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //버튼
  addButtonOptions: any;
  saveButtonOptions: any;
  deleteButtonOptions: any;
  searchButtonOptions: any;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 여신현황정보조회";
    //정보
    this.clients = service.getclient();
    this.datainq = service.getDatainq();
    this.Summary = service.getsum();

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $3000',
      value: ['price', '<', 3000],
    }, {
      text: '$3000 - $5000',
      value: [
        ['price', '>=', 3000],
        ['price', '<', 5000],
      ],
    }, {
      text: '$5000 - $10000',
      value: [
        ['price', '>=', 5000],
        ['price', '<', 10000],
      ],
    }, {
      text: '$10000 - $20000',
      value: [
        ['price', '>=', 10000],
        ['price', '<', 20000],
      ],
    }, {
      text: 'Greater than $20000',
      value: ['price', '>=', 20000],
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
    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
    //엑셀버튼
    this.exportSelectedData = {
      icon: 'export',
      onClick: () => {
        this.dataGrid.instance.exportToExcel(true);

      },
    };
  }
  // 날짜 계산
  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }
}
