import { Component } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';

import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../shared/dataModel/ZxnscNewRfcCalltestFNProxy';
import { QueryCacheType } from '../../shared/imate/imateCommon'

@Component({
  templateUrl: 'modeltest01.component.html',
  providers: [ImateDataService]
})

export class Modeltest01Component {
  dataSource: any;

  _dataService: ImateDataService;

  constructor(private dataService: ImateDataService) {
    this._dataService = dataService;

    let modelTest01 = this;
    this.dataSource = new CustomStore(
      {
        key: ["PARAM1"],
        load: function (loadOptions) {
          return modelTest01.dataLoad(dataService);
        }
      });
  }


public async dataLoad(dataService: ImateDataService) {
  var itlnput: ZIMATETESTStructModel[] = [];
  var input1 = new ZIMATETESTStructModel("ABCD", 1.21, 100000, new Date("2020-12-01"), "10:05:30.91");

  itlnput.push(new ZIMATETESTStructModel("EGCH", 2.32, 20, new Date("2021-01-02"), "22:00:15.1"));
  itlnput.push(new ZIMATETESTStructModel("IJKL", 3.43, 30, new Date("2022-05-11"), "09:20:27.540"));
  itlnput.push(new ZIMATETESTStructModel("MNON", 4.54, 40, new Date("2022-04-20"), "16:00:20.101"));

  var rfcModel = new ZXNSCNEWRFCCALLTestModel(input1, itlnput);
  var rfcMoelList: ZXNSCNEWRFCCALLTestModel[] = [rfcModel];

  var resultModel = await dataService.RefcCallUsingModel<ZXNSCNEWRFCCALLTestModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCNEWRFCCALLTestModelList",
    rfcMoelList, QueryCacheType.None);
  return resultModel[0].IT_RESULT;
  }

}
