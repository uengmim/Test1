import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';

import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data } from '../SHCQ/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';

/**
 *
 *운송비 마스터 조회 component
 * */


@Component({
  templateUrl: 'shcq.component.html',
  providers: [ImateDataService, Service]
})

export class SHCQComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  dataSource: any;

  //정보
  data: Data[];
  price!: string[];

  //데이터 조회 버튼
  searchButtonOptions: any;


  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 운송비 마스터 조회";
    //this._dataService = dataService;
    this.data = service.getData();

    this.price = service.getprice();

    let modelTest01 = this;
    this.dataSource = new CustomStore(
      {
        key: ["PARAM1"],
        load: function (loadOptions) {
          return modelTest01.dataLoad(dataService);
        }
      });

    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
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
}
