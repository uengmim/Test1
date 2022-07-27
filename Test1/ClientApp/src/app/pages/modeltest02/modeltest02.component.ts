import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import { ZXNSCRFCResultModel } from '../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../shared/imate/dimModelStatusEnum';
import { QueryCacheType } from '../../shared/imate/imateCommon';
import {  Service, State, Role } from '../modeltest02/app.service'


@Component({
  templateUrl: 'modeltest02.component.html',
  providers: [ImateDataService, Service]
})

export class Modeltest02Component {
  states: State[];
  roles: Role[];
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;
  dataSource: any;
  rowCount: number;
  _dataService: ImateDataService;

  constructor(private dataService: ImateDataService, service: Service) {
    this._dataService = dataService;
    this.states = service.getStates();
    this.roles = service.getRoles();

    this.rowCount = 0;

    let modelTest01 = this;
    this.dataSource = new CustomStore(
      {
        key: "dATA1",

        load: function (loadOptions) {
          return modelTest01.dataLoad(dataService);
        },
        insert: function (values) {
          return modelTest01.dataInsert(values);
        },
        //insert: (values) => this.dataInsert(values),
        update: function (key, values) {
          return modelTest01.dataModify(key, values);
        },
        //update: (key, values) => this.dataModify(key, values),
        remove: function (key) {
          return modelTest01.dataDelete(key);
        },
      //  remove: (key) => this.dataDelete(key),
      });


  }

  public async dataLoad(dataService: ImateDataService) {

    var resultModel = await dataService.SelectModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", [],
      "", "", QueryCacheType.None);
    return resultModel;
  }
  public async dataInsert(values: ZXNSCRFCResultModel) {

    var insertData = new ZXNSCRFCResultModel(values.dATA1, values.dATA2, values.dATA3, values.nUM1, values.cOD1, values.sEL1, values.updat, values.uptim, DIMModelStatus.Add);
    //var insertData2 = new ZXNSCRFCResultModel(values.dATA1, values.dATA2, values.dATA3, DIMModelStatus.Add);

    var modelList: ZXNSCRFCResultModel[] = [values, insertData];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }


  public async dataModify(key: any, values: ZXNSCRFCResultModel) {
    var ModifyData = new ZXNSCRFCResultModel(key, values.dATA2, values.dATA3, values.nUM1, values.cOD1, values.sEL1, values.updat, values.uptim, DIMModelStatus.Modify);
    var ModifyData2 = new ZXNSCRFCResultModel(key, values.dATA2, values.dATA3, values.nUM1, values.cOD1, values.sEL1, values.updat, values.uptim, DIMModelStatus.Modify);

    this.dataGrid.editing; {
      equals: (ModifyData: { dATA1: any; dATA2: any; dATA3: any; nUM1: any; cOD1: any; sEL1: any; updat: any; uptim: any; },
        ModifyData2: { dATA1: any; dATA2: any; dATA3: any; nUM1: any; cOD1: any; sEL1: any; updat: any; uptim: any; }) => {
        const dATAEuqal = ModifyData.dATA1 =ModifyData2.dATA1;
        const dATA2Euqal = ModifyData.dATA2 === ModifyData2.dATA2;
        const dATA3Euqal = ModifyData.dATA3 === ModifyData2.dATA3;
        const NUM1Euqal = ModifyData.nUM1 === ModifyData2.nUM1;
        const COD1Euqal = ModifyData.cOD1 === ModifyData2.cOD1;
        const SEL1Euqal = ModifyData.sEL1 === ModifyData2.sEL1;
        const UPDATEuqal = ModifyData.updat === ModifyData2.updat;
        const UPTIMEuqal = ModifyData.uptim === ModifyData2.uptim;

        return dATAEuqal || dATA2Euqal || dATA3Euqal || NUM1Euqal || COD1Euqal || SEL1Euqal || UPDATEuqal || UPTIMEuqal;

      }
    }
    var modelList: ZXNSCRFCResultModel[] = [values, ModifyData];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }


  public async dataDelete(key: any) {
    var DeleteData1 = new ZXNSCRFCResultModel(key, key.dATA2, key.dATA3, key.nUM1, key.cOD1, key.sEL1, key.updat, key.uPTIM, DIMModelStatus.Delete);
    var DeleteData2 = new ZXNSCRFCResultModel(key.dATA1, key.dATA2, key.dATA3, key.nUM1, key.cOD1, key.sEL1, key.updat, key.uPTIM, DIMModelStatus.Delete);

    var modelList: ZXNSCRFCResultModel[] = [DeleteData1, DeleteData2];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }
}
