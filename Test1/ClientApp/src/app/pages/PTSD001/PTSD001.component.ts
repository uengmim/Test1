import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import notify from 'devextreme/ui/notify';

import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { QueryCacheType } from '../../shared/imate/imateCommon';
import { AppInfoService } from '../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service,Employee } from '../PTSD001/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'PTSD001.component.html',
  providers: [ImateDataService, Service]
})

export class PTSD001Component {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;


  dataSource: any;
  //거래처
  clients: string[];
  //정보
  employees: Employee[];

  //날짜 조회
  startDate: any;
  endDate: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 추가 버튼
  addButtonOptions: any;
  //데이터 저장 버튼
  saveButtonOptions: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //데이터 조회 버튼
  searchButtonOptions: any;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;


  //_dataService: ImateDataService;

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | MODEL TEST1";
    //거래처
    this.clients = service.getclient();
    //정보
    this.employees = service.getEmployees();

    //this._dataService = dataService;
    let modelTest01 = this;
    this.dataSource = new CustomStore(
      {
        key: ["PARAM1"],
        load: function (loadOptions) {
          return modelTest01.dataLoad(dataService);
        }
      });

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")


    //필터
    this.popupPosition = {
      of: window, at: 'top', my: 'top', offset: { y: 10 },
    };
    this.saleAmountHeaderFilter = [{
      text: 'Less than $3000',
      value: ['PARAM10', '<', 3000],
    }, {
      text: '$3000 - $5000',
      value: [
        ['PARAM10', '>=', 3000],
        ['PARAM10', '<', 5000],
      ],
    }, {
      text: '$5000 - $10000',
      value: [
        ['PARAM10', '>=', 5000],
        ['PARAM10', '<', 10000],
      ],
    }, {
      text: '$10000 - $20000',
      value: [
        ['PARAM10', '>=', 10000],
        ['PARAM10', '<', 20000],
      ],
    }, {
      text: 'Greater than $20000',
      value: ['PARAM10', '>=', 20000],
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
    this.searchButtonOptions = {
      icon: 'search',
      onClick: () => {
        notify('search button has been clicked!');
      },
    };
  
    this.addButtonOptions = {
      type: 'plus',
      onClick: () => {
        notify('add button has been clicked!');
      },
    };

    this.deleteButtonOptions = {
      icon: 'trash',
      onClick: () => {
        notify('remove button has been clicked!');
      },
    };
  
    this.saveButtonOptions = {
      icon: 'save',
      onClick: () => {
        notify('save button has been clicked!');
      },
    };
  }

  public async dataLoad(dataService: ImateDataService) {

    var sdate = formatDate(this.startDate, "yyyyMMDD", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMDD", "en-US")

    var itInput: ZIMATETESTStructModel[] = [];
    var input1 = new ZIMATETESTStructModel("ABCD", 1.21, 10000, new Date("2020-12-01"), "10:05:30.91");

    itInput.push(new ZIMATETESTStructModel("EGCH", 2.32, 20, new Date("2021-01-02"), "22:00:15.1"));
    itInput.push(new ZIMATETESTStructModel("IJKL", 3.43, 30, new Date("2022-05-11"), "09:20:27.540"));
    itInput.push(new ZIMATETESTStructModel("MNON", 4.54, 40, new Date("2022-04-20"), "16:00:20.101"));

    var rfcModel = new ZXNSCNEWRFCCALLTestModel(input1, itInput);
    var rfcMoelList: ZXNSCNEWRFCCALLTestModel[] = [rfcModel];

    var resultModel = await dataService.RefcCallUsingModel<ZXNSCNEWRFCCALLTestModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCNEWRFCCALLTestModelList",
      rfcMoelList, QueryCacheType.None);
    return resultModel[0].IT_RESULT;
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
