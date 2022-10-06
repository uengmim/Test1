/*
 * 출고 결과 반영
 */
import { Component, enableProdMode, ViewChild} from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient } from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, OilShip,ChemShip } from '../OSHA/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';



//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'osha.component.html',
  providers: [ImateDataService, Service]
})

export class OSHAComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  //data
  dataSource: any;

  //정보
  OilShip: OilShip[];
  ChemShip: ChemShip[];

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

  //버튼
  searchButtonOptions: any;
  exportSelectedData: any;


  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //줄 선택
  selectedRowIndex = -1;


  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출고결과반영";

    //정보
    this.OilShip = service.getOilShip();
    this.ChemShip = service.getChemShip();

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
    //엑셀버튼
    this.exportSelectedData = {
      icon: 'export',
      onClick: () => {
        this.dataGrid.instance.exportToExcel(true);

      },
    };

    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $10000',
      value: ['chemInsQuan', '<', 1000],
    }, {
      text: '$10000 - $20000',
      value: [
        ['chemInsQuan', '>=', 10000],
        ['chemInsQuan', '<', 20000],
      ],
    }, {
      text: '$20000 - $30000',
      value: [
        ['chemInsQuan', '>=', 20000],
        ['chemInsQuan', '<', 30000],
      ],
    }, {
      text: '$30000 - $40000',
      value: [
        ['chemInsQuan', '>=', 30000],
        ['chemInsQuan', '<', 40000],
      ],
    }, {
      text: 'Greater than $40000',
      value: ['chemInsQuan', '>=', 40000],
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



}
