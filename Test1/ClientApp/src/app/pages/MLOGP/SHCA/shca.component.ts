import { Component, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';

import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { Service, Data, FoAgent, SettlementCl, SeedlingCl, SeClassification } from '../SHCA/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';

/**
 *
 *운송비정산확인-비료,고체화학 component
 * */


@Component({
  templateUrl: 'shca.component.html',
  providers: [ImateDataService, Service]
})

export class SHCAComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent
  dataSource: any;

  //date box
  value: Date = new Date(1981, 3, 27);
  now: Date = new Date();

  //정보
  data: Data[];
  foAgent!: string[];
  settlementCl!: string[];
  seedlingCl!: string[];
  seClassification!: string[];
 

  //데이터 조회 버튼
  searchButtonOptions: any;

  //필터
  customOperations!: Array<any>;
  saleAmountHeaderFilter: any;
  popupPosition: any;


  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 운송비정산확인-비료,고체화학";
    //this._dataService = dataService;
    this.data = service.getData();

    this.foAgent = service.getFoAgent();
    this.settlementCl = service.getSettlementCl();
    this.seedlingCl = service.getSeedlingCl();
    this.seClassification = service.getSeClassification();


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
