import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { ZXNSCRFCDataModel } from '../../shared/dataModel/ZxnscRfcData';
import { QueryCacheType } from '../../shared/imate/imateCommon';
import { AppInfoService } from '../../shared/services/app-info.service';
import ArrayStore from 'devextreme/data/array_store';
import { formatDate } from '@angular/common';
import { Service, RequestProcess } from '../orderprocess/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'orderprocess.component.html',
  providers: [ImateDataService, Service]
})

export class OrderProcessComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  //delete
  selectedItemKeys: any[] = [];

  dataSource: ArrayStore;
  //거래처
  clients: string[];
  //정보
  requestprocess: RequestProcess[];

  //날짜 조회
  startDate: any;
  endDate: any;


  //form

  labelMode: string;

  labelLocation: string;

  readOnly: boolean;

  showColon: boolean;

  minColWidth: number;

  colCount: number;

  width: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 저장 버튼
  saveButtonOptions: any;
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

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 고객주문처리 - 포장재";
    //form
    this.labelMode = 'floating';
    this.labelLocation = 'left';
    this.readOnly = false;
    this.showColon = true;
    this.minColWidth = 300;
    this.colCount = 2;
    //거래처
    this.clients = service.getclient();

    //정보
    this.requestprocess = service.getRequestProcess();

    //this._dataService = dataService;
    let modelTest01 = this;
    this.dataSource = new ArrayStore({
      key: 'OrderNum',
      data: service.getRequestProcess(),
    });

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")


    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $3000',
      value: ['PARAM9', '<', 3000],
    }, {
      text: '$3000 - $5000',
      value: [
        ['PARAM9', '>=', 3000],
        ['PARAM9', '<', 5000],
      ],
    }, {
      text: '$5000 - $10000',
      value: [
        ['PARAM9', '>=', 5000],
        ['PARAM9', '<', 10000],
      ],
    }, {
      text: '$10000 - $20000',
      value: [
        ['PARAM9', '>=', 10000],
        ['PARAM9', '<', 20000],
      ],
    }, {
      text: 'Greater than $20000',
      value: ['PARAM9', '>=', 20000],
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
    //저장버튼
    
    this.saveButtonOptions = {
      icon: 'save',
      onClick: () => {
        this.dataGrid.instance.saveEditData();
      },
    };
  }

  public async dataLoad(dataService: ImateDataService) {

    var sdate = formatDate(this.startDate, "yyyyMMDD", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMDD", "en-US")

    var resultModel = await dataService.SelectModelData<ZXNSCRFCDataModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCDataModelList", [],
      `PARAM14 >= '${sdate}' AND PARAM14 <= '${edate}'`, "PARAM14 DESC", QueryCacheType.None);

    return resultModel;
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
    this.selectedItemKeys.forEach((key:any) => {
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

  getCompanySelectorLabelMode() {
    return this.labelMode === 'outside'
      ? 'hidden'
      : this.labelMode;
  }
}
