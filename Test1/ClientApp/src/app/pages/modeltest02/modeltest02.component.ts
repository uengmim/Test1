import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import { ZXNSCRFCResultModel } from '../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../shared/imate/dimModelStatusEnum';
import { QueryCacheType } from '../../shared/imate/imateCommon';
import dxDataGrid from 'devextreme/ui/data_grid';


@Component({
  templateUrl: 'modeltest02.component.html',
  providers: [ImateDataService]
})

export class Modeltest02Component {

  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;
  dataSource: any;
  rowCount: number;
  _dataService: ImateDataService;

  constructor(private dataService: ImateDataService) {
    this._dataService = dataService;
    this.rowCount = 0;

    let modelTest01 = this;
    this.dataSource = new CustomStore(
      {
        key: "dATA1",

        load: function (loadOptions) {
          return modelTest01.dataLoad(dataService);
        },
        insert: (values) => this.dataInsert(values),
        update: (key, values) => this.dataModify(key, values),
        remove: (key) => this.dataDelete(key),
      });
  }

  public async dataLoad(dataService: ImateDataService) {

    //var data1 = new ZXNSCRFCResultModel(2, "EFGH", "5678", DIMModelStatus.Add);
    //var data2 = new ZXNSCRFCResultModel(4, "1234", "NOQP", DIMModelStatus.Modify); 
    //var data3 = new ZXNSCRFCResultModel(3, "IJNM", "9ABC", DIMModelStatus.Delete); 
    //var data4 = new ZXNSCRFCResultModel(5, "WXYZ", "HIJK", DIMModelStatus.Add);

    //var modelList: ZXNSCRFCResultModel[] = [data1, data4];
    //this.rowCount = await dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA",
    //                       "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);

    var resultModel = await dataService.SelectModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", [],
      "", "", QueryCacheType.None);
    return resultModel;
  }
  public async dataInsert(values: ZXNSCRFCResultModel) {

    var insertData = new ZXNSCRFCResultModel(values.dATA1, values.dATA2, values.dATA3, DIMModelStatus.Add);
    //var insertData2 = new ZXNSCRFCResultModel(values.dATA1, values.dATA2, values.dATA3, DIMModelStatus.Add);

    var modelList: ZXNSCRFCResultModel[] = [values, insertData];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }


  public async dataModify(key: any, values: ZXNSCRFCResultModel) {
    var ModifyData = new ZXNSCRFCResultModel(key, values.dATA2, values.dATA3, DIMModelStatus.Modify);
    var ModifyData2 = new ZXNSCRFCResultModel(key, values.dATA2, values.dATA3, DIMModelStatus.Modify);

    this.dataGrid.editing; {
      equals: (ModifyData: { dATA1: any; dATA2: any; dATA3: any; }, ModifyData2: { dATA1: any; dATA2: any; dATA3: any; }) => {
        const dATAEuqal = ModifyData.dATA1 === ModifyData2.dATA1;
        const dATA2Euqal = ModifyData.dATA2 === ModifyData2.dATA2;
        const dATA3Euqal = ModifyData.dATA3 === ModifyData2.dATA3;
        return dATAEuqal && dATA2Euqal && dATA3Euqal;

      }
    }
    var modelList: ZXNSCRFCResultModel[] = [values, ModifyData];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }


  public async dataDelete(key: any) {
    var DeleteData1 = new ZXNSCRFCResultModel(key, key.dATA2, key.dATA3, DIMModelStatus.Delete);
    var DeleteData2 = new ZXNSCRFCResultModel(key.dATA1, key.dATA2, key.dATA3, DIMModelStatus.Delete);

    var modelList: ZXNSCRFCResultModel[] = [DeleteData1, DeleteData2];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }
}
