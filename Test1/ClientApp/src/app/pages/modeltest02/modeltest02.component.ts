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


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  templateUrl: 'modeltest02.component.html',
  providers: [ImateDataService, Service]
})

export class Modeltest02Component {
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
  rowCount: number;
  _dataService: ImateDataService;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  disabledDates: Date[];


  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo) {
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
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.dataSource = new CustomStore(
      {
        key: "dATA1",

        load: function (loadOptions) {
          return modelTest01.dataLoad(imInfo, dataService);
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

  // 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {
    //period
    var sdate = formatDate(this.startDate, "yyyyMMDD", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMDD", "en-US")

    //sql datafield / 문자열'' / 날짜 시간 내림차순
    var resultModel = await dataService.SelectModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", [],
      `UPDAT >= '${sdate}' AND UPDAT <= '${edate}'`, "UPDAT DESC, UPTIM DESC", QueryCacheType.None);
    
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

  // 데이터 수정
  public async dataModify(key: any, values: ZXNSCRFCResultModel) {
    var ModifyData = new ZXNSCRFCResultModel(key, values.dATA2, values.dATA3, values.nUM1, values.cOD1, values.sEL1, values.updat, values.uptim, DIMModelStatus.Modify);
    var ModifyData2 = new ZXNSCRFCResultModel(key, values.dATA2, values.dATA3, values.nUM1, values.cOD1, values.sEL1, values.updat, values.uptim, DIMModelStatus.Modify);
    values.sEL1 = this.gridBoxValue.join(",");
    values.uptim = formatDate(this.now, "HH:mm:ss", "en-US");
    values.updat = formatDate(this.now, "MM-dd-yyyy", "en-US");

    this.dataGrid.editing; {
      equals: (ModifyData: { dATA1: any; dATA2: any; dATA3: any; nUM1: any; cOD1: any; sEL1: any; updat: any; uptim: any; },
        ModifyData2: { dATA1: any; dATA2: any; dATA3: any; nUM1: any; cOD1: any; sEL1: any; updat: any; uptim: any; }) => {
        const dATAEuqal = ModifyData.dATA1 = ModifyData2.dATA1;
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

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }
}

