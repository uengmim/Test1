import { NgModule, Component, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DxDataGridModule } from 'devextreme-angular';
import { ZXNSCRFCResultModel } from '../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../shared/imate/dimModelStatusEnum';
import { QueryCacheType } from '../../shared/imate/imateCommon';

@Component({
  templateUrl: 'modeltest02.component.html',
  providers: [ImateDataService]
})


export class Modeltest02Component {
  dataSource: any;
  rowCount: number;

  _dataService: ImateDataService;
  allowDeleting() {
  }
  constructor(private dataService: ImateDataService) {
    this._dataService = dataService;
    this.rowCount = 0;
      
    let modelTest02 = this;
    this.dataSource = new CustomStore(
      {
        key: ["dATA1"],

        load: function (loadOptions) {
          return modelTest02.dataLoad(dataService);
        }
      });
  }

  public async dataLoad(dataService: ImateDataService) {

    //var data1 = new ZXNSCRFCResultModel(12, "EFGH", "5678", DIMModelStatus.Delete);
    //var data2 = new ZXNSCRFCResultModel(19, "채승민", "56987424", DIMModelStatus.Add);
    //var data3 = new ZXNSCRFCResultModel(3, "IJNM", "9ABC", DIMModelStatus.Delete);
    //var data4 = new ZXNSCRFCResultModel(5, "WXYZ", "HIJK", DIMModelStatus.Add);
    //var data5 = new ZXNSCRFCResultModel(7, "8452", "USNS", DIMModelStatus.Modify);

    //var modelList: ZXNSCRFCResultModel[] = [ data1, data2];
    //this.rowCount = await dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA",
    //                      "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);

    var resultModel = await dataService.SelectModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", [],
                            "", "DATA2 DESC", QueryCacheType.None);
    return resultModel;
  }
}
