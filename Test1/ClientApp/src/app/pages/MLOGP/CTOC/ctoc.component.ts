import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { formatDate } from '@angular/common';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data, Order, ShAddress, Sortation, Classification, Product } from '../CTOC/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';

/**
 *
 *인수확인(화학) component
 * */

@Component({
  templateUrl: 'ctoc.component.html',
  providers: [ImateDataService, Service]
})

export class CTOCComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  dataSource: any;

  selectedItemKeys: any[] = [];
  selectedRowIndex = -1;

  //정보
  data: Data[];
  order!: string[];
  shAddress!: string[];
  sortation!: string[];
  classification!: string[];
  product!: string[];

  //date box
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  now: Date = new Date();
  dateClear = new Date(2015, 11, 1, 6);


  //데이터 조회 버튼
  searchButtonOptions: any;

  //버튼
  saveButtonOptions: any;

  //날짜 조회
  startDate: any;
  endDate: any;

  checkBoxValue: boolean | null = null;

  //필터
  customOperations!: Array<any>;
  saleAmountHeaderFilter: any;
  popupPosition: any;

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  selectedOption: string[] = [];



  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 인수확인(화학)";

    this.data = service.getData();

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //정보
    this.order = service.getOrder();
    this.shAddress = service.getShAddress();
    this.sortation = service.getSortation();
    this.classification = service.getClassification();
    this.product = service.getProduct();

    let modelTest01 = this;
    this.dataSource = new CustomStore(
      {
        key: ["PARAM1"],
        load: function (loadOptions) {
          return modelTest01.dataLoad(dataService);
        }
      });
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
    }
  }

  public async dataLoad(dataService: ImateDataService) {

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
  //옵션 변경
  onDetailOptionChanged(cellInfo: any, e: any) {
    cellInfo.setValue(e.value);
  }

  detailRowChanged(e: any) {
    this.selectedOption = e.component.cellValue(e.rowIndex, "acStatus");
  }
  saveRecords() {
    this.selectedItemKeys.forEach((key: any) => {
      this.dataSource.remove(key);
    });
    this.dataGrid.instance.refresh();
  }
  selectedChanged(e: any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }

  selectionChanged(data: any) {
    this.selectedItemKeys = data.selectedRowKeys;
  }

}
