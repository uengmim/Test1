import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ZXNSCRFCResultModel } from '../../shared/dataModel/ZxnscRfcResult';
import { DIMModelStatus } from '../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../shared/imate/imateCommon';
import { Service, State, Role } from '../modeltest02/app.service'
import {
  DxDataGridComponent,
  DxRangeSelectorModule,
  DxDropDownBoxModule,
  DxBoxModule,
  DxDataGridModule,
  DxButtonModule,
  DxDateBoxModule,
} from 'devextreme-angular';
import { formatDate } from '@angular/common';
import notify from 'devextreme/ui/notify';
import { ZXNSCRFCDetailModel } from '../../shared/dataModel/ZxnscRfcDetail';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  templateUrl: 'modeltest03.component.html',
  providers: [ImateDataService, Service]
})

export class Modeltest03Component {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;



  startDate: any;
  endDate: any;
  // dropdownbox
  states: State[];
  roles: Role[];

  //multiseletbox
  gridDataSource: any;
  gridBoxValue: string[] = [];

  //insert,modify,delete 
  dataSource: any;
  detaildataSource: any;
  rowCount: number;
  _dataService: ImateDataService;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  disabledDates: Date[];

  //toolbar option
  backButtonOptions: any;

  refreshButtonOptions: any;

  addButtonOptions: any;

  saveButtonOptions: any;


  //form option
  labelMode: string;

  labelLocation: string;

  readOnly: boolean;

  showColon: boolean;

  minColWidth: number;

  colCount: number;

  width: any;

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo) {


    //button option
    this.backButtonOptions = {
      type: 'back',
      onClick: () => {
        location.href ="http://localhost:44460/#/modeltest02"
      },
    };

    this.addButtonOptions = {
      icon: 'plus',
      onclick: () => {
        notify('add button has been clicked!');
      },
    };

    this.saveButtonOptions = {
      text: 'Save',
      onClick: () => {
        notify('Save option has been clicked!');
      },
    };

  
    // dropdownbox
    this.states = service.getStates();
    this.roles = service.getRoles();
    // multiselectbox
    this.gridDataSource = this.makeAsyncDataSource(http, 'roles.json');

    // insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;
    let modelTest01 = this;

    //date
    var now = new Date();
    this.dataSource = new CustomStore(
      {
        key: "dATA1",

        load: function (loadOptions) {
          return modelTest01.dataLoad(imInfo, dataService);
        },
        insert: function (values) {
          return modelTest01.dataInsert(values);
        },
        //update: (key, values) => this.dataModify(key, values),
        remove: function (key) {
          return modelTest01.dataDelete(key);
        },
        //  remove: (key) => this.dataDelete(key),
      });

    //Test


    this.detaildataSource = new CustomStore(
      {
        key: "dATA1",

        load: function (loadOptions) {
          return modelTest01.detaildataLoad(dataService);
        },
      });
    //Test
  }


  

  // 날짜 계산
  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }


  //multiselectbox
  makeAsyncDataSource(http: any, jsonFile: any) {
    return new CustomStore({
      loadMode: 'raw',
      key: 'ID',
      load() {
        return lastValueFrom(http.get(`data/${jsonFile}`));
      },
    });
  }



  public async detaildataLoad(dataService: ImateDataService) {

  //Test
    var resultModel = await dataService.SelectModelData<ZXNSCRFCDetailModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCDetailModelList", [],
      "", "", QueryCacheType.None);
    return resultModel;
  }
  //Test



  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {

    var resultModel = await dataService.SelectModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", [],
      "", "", QueryCacheType.None);

    return resultModel;
  }


  // 데이터 삽입
  public async dataInsert(values: ZXNSCRFCResultModel) {
    //data 서버로 넘기기 위해 쉼표 join
    values.sEL1 = this.gridBoxValue.join(",");
    values.uptim = formatDate(this.now, "HH:mm:ss", "en-US");
    values.updat = formatDate(this.now, "MM-dd-yyyy", "en-US");

    var insertData = new ZXNSCRFCResultModel(values.dATA1, values.dATA2, values.dATA3, values.nUM1, values.cOD1, values.sEL1, values.updat, values.uptim, DIMModelStatus.Add);
    //var insertData2 = new ZXNSCRFCResultModel(values.dATA1, values.dATA2, values.dATA3, DIMModelStatus.Add);

    var modelList: ZXNSCRFCResultModel[] = [values, insertData];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }

  // 데이터 삭제
  public async dataDelete(key: any) {
    var DeleteData1 = new ZXNSCRFCResultModel(key, key.dATA2, key.dATA3, key.nUM1, key.cOD1, key.sEL1, key.updat, key.uPTIM, DIMModelStatus.Delete);
    var DeleteData2 = new ZXNSCRFCResultModel(key.dATA1, key.dATA2, key.dATA3, key.nUM1, key.cOD1, key.sEL1, key.updat, key.uPTIM, DIMModelStatus.Delete);

    var modelList: ZXNSCRFCResultModel[] = [DeleteData1, DeleteData2];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }

  //툴바 안의 팝업창 이벤트
  addDataGrid(e: any) {
    this.dataGrid.instance.addRow();
  }

  //multiseletebox 이벤트
  roleFocusedRowChanged(e: any) {
    let val = e.component.cellvalue(e.rowindex, "sEL1");
    this.gridBoxValue = val.split(",");
  }

  //Data refresh 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }






  getCompanySelectorLabelMode() {
    return this.labelMode === 'outside'
      ? 'hidden'
      : this.labelMode;
  }


}
