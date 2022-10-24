import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';

import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data, SeasonalInfo } from '../PGWI/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';

/**
 *
 * 석고 공차/중량계근I/F component
 * */


@Component({
  templateUrl: 'pgwi.component.html',
  providers: [ImateDataService, Service]
})

export class PGWIComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  dataSource: any;

  //정보
  data: Data[];
  seasonalInfo: any;
  price!: string[];

  //데이터 조회 버튼
  searchButtonOptions: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //버튼
  closeButtonOptions: any;

  //날짜 조회
  startDate: any;
  endDate: any;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //delete
  selectedItemKeys: any[] = [];

  //줄 선택
  selectedRowIndex = -1;

  //필터
  customOperations!: Array<any>;
  saleAmountHeaderFilter: any;
  popupPosition: any;

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //상세팝업 오픈
  popupVisible = false;

  formOrderData: Data;

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 석고 공차/중량계근I/F";
    //this._dataService = dataService;
    this.data = service.getData();
    this.seasonalInfo = service.getSeasonalInfo();
    this.formOrderData = new Data();

    let modelTest01 = this;
    this.dataSource = new CustomStore(
      {
        key: ["PARAM1"],
        load: function (loadOptions) {
          return modelTest01.dataLoad(dataService);
        }
      });
    const that = this;
    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
    //삭제버튼
    this.deleteButtonOptions = {
      icon: 'trash',
      onClick: () => {

        this.dataGrid.instance.deleteRow(this.selectedRowIndex)
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

  RegisRecords() {
    this.formOrderData = new Data();
    //this.formOrderData.Reqdate = new Date();

    this.popupVisible = true;
  };


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

  orderDBClick(e: any) {
    this.popupVisible = !this.popupVisible;
  }

}
