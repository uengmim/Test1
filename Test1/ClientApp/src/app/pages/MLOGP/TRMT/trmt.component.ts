import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, Data, SerchInfo, Option, Company, Car, Local } from '../TRMT/app.service'
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';


//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

/**
 *
 *챠량마스터 등록 component
 * */

@Component({
  templateUrl: 'trmt.component.html',
  providers: [ImateDataService, Service]
})



export class TRMTComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  carsnumber!: string[];

  dataSource: any;
  //거래처

  //정보
  data: Data[];
  options: Option[];
  company: Company[];
  car: Car[];
  local: Local[];


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
  //상세 추가 버튼
  addDetailButtonOptions: any;
  //버튼
  closeButtonOptions: any;

  //편집 취소 버튼
  cancelEditButtonOptions: any;

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //줄 선택
  selectedRowIndex = -1;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;

  //상세팝업 오픈
  popupVisible = false;


  //_dataService: ImateDataService;

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 차량마스터 등록";
    //정보
    this.data = service.getData();
    this.carsnumber = service.getclient();

    this.options = service.getOption();
    this.company = service.getCompany();
    this.car = service.getCar();
    this.local = service.getLocal();

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

    const that = this;
    //추가버튼
    this.addButtonOptions =
    {
      icon: 'add',
      onClick: async () => {
        this.dataGrid.instance.addRow();
      },
    };

    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };

    this.deleteButtonOptions = {
      icon: 'trash',
      onClick: () => {
        this.dataGrid.instance.deleteRow(this.selectedRowIndex);
        this.dataGrid.instance.deselectAll();
      },
    };

    this.saveButtonOptions = {
      icon: 'save',
      onClick: () => {
        this.dataGrid.instance.saveEditData();
      },
    };


    this.addDetailButtonOptions =
    {
      icon: 'add',
      onClick: async () => {
        this.dataGrid.instance.addRow();
      },
    };

    this.cancelEditButtonOptions =
    {
      icon: 'undo',
      onClick: async () => {
        this.dataGrid.instance.cancelEditData()
      },
    };
    //닫기버튼
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e: any) {
        that.popupVisible = false;
      }
    }
  }

  public async dataLoad(dataService: ImateDataService) {

    var sdate = formatDate(this.startDate, "yyyyMMDD", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMDD", "en-US")

    var resultModel = await dataService.SelectModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCDataModelList", [],
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
  orderDBClick(e: any) {
    this.popupVisible = !this.popupVisible;
  }
}
