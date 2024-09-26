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
import { Service, State, Role, PriorityEntity, Option } from '../modeltest03/app.service'

import {
  DxDataGridComponent,
  DxSelectBoxComponent,
  DxFormComponent
} from 'devextreme-angular';
import { formatDate } from '@angular/common';
import { ZXNSCRFCDetailModel } from '../../shared/dataModel/ZxnscRfcDetail';
import { updateObject } from '../../shared/imate/utility/object-copy';
import { AppInfoService } from '../../shared/services/app-info.service';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  templateUrl: 'modeltest03.component.html',
  providers: [ImateDataService, Service]
})

export class Modeltest03Component {
  @ViewChild('detailGrid', { static: false }) detailGrid!: DxDataGridComponent;
  @ViewChild("masterForm", { static: false }) masterForm!: DxFormComponent;
  @ViewChild("company", { static: false }) companySelBox!: DxSelectBoxComponent;


  startDate: any;
  endDate: any;
  // dropdownbox
  states: State[];
  roles: Role[];
  option: Option[];
  selectedOption: string[] = [];

  //multiseletbox
  gridDataSource: any;
  gridBoxValue: string[] = [];

  //insert,modify,delete 
  dataSource: any;
  detaildataSource: any;
  rowCount: number;
  selectedMaterKey: number = -1;

  _dataService: ImateDataService;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  disabledDates: Date[] = [];

  //toolbar option
  backButtonOptions: any;

  //새로고침 버턴
  refreshButtonOptions: any;

  //마스터 추가 버턴
  addMasterButtonOptions: any;

  //자료 저정 버턴
  saveButtonOptions: any;

  //상세 추가 버턴
  addDetailButtonOptions: any;

  //편집 취소 보놑
  cancelEditButtonOptions: any;

  //form option
  labelMode: string = "";

  labelLocation: string = "";

  readOnly: boolean = false;

  showColon: boolean = false;

  minColWidth: number = 0;

  colCount: number = 0;

  width: any;

  //check box
  checkBoxValue: boolean | null = null;

  //radio button
  priorities: any[];
  priorityEntities: PriorityEntity[] = [];

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //Mater 모드
  masterAddMode: boolean = false;

  constructor(private dataService: ImateDataService, service: Service, http: HttpClient, imInfo: ImateInfo, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | MODEL TEST3";

    //radio button
    this.priorities = [
      { ID: '1', Name: 'OPTION1' },
      { ID: '2', Name: 'OPTION2' },
      { ID: '3', Name: 'OPTION3' },
      { ID: '4', Name: 'OPTION4' }
    ];

    this.priorityEntities = service.getPriorityEntities();

    //button option
    this.backButtonOptions = {
      type: 'back',
      onClick: () => {
        location.href = "http://localhost:44460/#/modeltest02"
      },
    };

    // dropdownbox
    this.states = service.getStates();
    this.roles = service.getRoles();
    this.option = service.getOption();
    // multiselectbox

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
        }
      });

    this.detaildataSource = new CustomStore(
      {
        key: ["dATA1", "itmno"],

        load: function (loadOptions) {
          return modelTest01.detaildataLoad(modelTest01, imInfo, dataService);
        },
        insert: (values) => this.detaildataInsert(modelTest01, values),
        update: (key, values) => this.detaildataModify(modelTest01, key, values),
        remove: (key) => this.detaildataDelete(modelTest01, key),
      });

    //Toolbar option
    //자료 저장
    this.saveButtonOptions = {
      icon: 'save',
      onClick: async () => {
        //마스터 저장
        var masterData = this.masterForm.formData as ZXNSCRFCResultModel;
        if (this.masterAddMode) {
          this.selectedMaterKey = masterData.dATA1;
          masterData.ModelStatus = DIMModelStatus.Add;
          await this.dataInsert(masterData);
        }
        else {
          masterData.ModelStatus = DIMModelStatus.Modify;
          await this.dataModify(modelTest01, masterData.dATA1, masterData);
        }

        //Detail저정
        this.detailGrid.instance.saveEditData();

        //SelectBox 데이터 Reload
        this.companySelBox.instance.getDataSource().reload();
      },
    };

    //마스터 추가
    this.addMasterButtonOptions = {
      icon: 'add',
      onClick: async () => {
        var currDate = new Date();
        var uptim = formatDate(currDate, "HH:mm:ss", "en-US");
        var updat = formatDate(currDate, "MM-dd-yyyy", "en-US");

        this.masterAddMode = true;
        this.masterForm.formData = new ZXNSCRFCResultModel(-1, "", "", 0, "", "", updat, uptim, DIMModelStatus.Add);
      },
    };

    this.addDetailButtonOptions =
    {
      icon: 'add',
      onClick: async () => {
        this.detailGrid.instance.addRow();
      },
    };

    this.cancelEditButtonOptions =
    {
      icon: 'undo',
      onClick: async () => {
        this.detailGrid.instance.cancelEditData()
      },
    };
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
      load: (loadOptions) => {
        return lastValueFrom(http.get(`data/${jsonFile}`));
      },
    });
  }

  //-------------------------------------------------------------------------------------------------------------
  // 마스터 데이터 로드
  //-------------------------------------------------------------------------------------------------------------

  // 마스터 데이터 로드
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {

    var resultModel = await dataService.SelectModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", [],
      "", "", QueryCacheType.None);

    return resultModel;
  }

  // 마스터 데이터 삭제
  public async dataDelete(key: any) {
    var DeleteData1 = new ZXNSCRFCResultModel(key, key.dATA2, key.dATA3, key.nUM1, key.cOD1, key.sEL1, key.updat, key.uPTIM, DIMModelStatus.Delete);
    var DeleteData2 = new ZXNSCRFCResultModel(key.dATA1, key.dATA2, key.dATA3, key.nUM1, key.cOD1, key.sEL1, key.updat, key.uPTIM, DIMModelStatus.Delete);

    var modelList: ZXNSCRFCResultModel[] = [DeleteData1, DeleteData2];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }

  // 마스터 데이터 삽입
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

  // 마스터 데이터 수정
    public async dataModify(parent: Modeltest03Component, key: any, values: ZXNSCRFCResultModel) {

    values.sEL1 = parent.gridBoxValue.join(",");
    values.uptim = formatDate(parent.now, "HH:mm:ss", "en-US");
    values.updat = formatDate(parent.now, "MM-dd-yyyy", "en-US");
    values.ModelStatus = DIMModelStatus.Modify;

    var modelList: ZXNSCRFCResultModel[] = [values];
    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCResultModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCResultModelList", modelList);
  }

  //-------------------------------------------------------------------------------------------------------------
  // 상세 데이터 로드
  //-------------------------------------------------------------------------------------------------------------

  // 상세 데이터 로드
  public async detaildataLoad(parent: Modeltest03Component, iminfo: ImateInfo, dataService: ImateDataService) {
    //Test
    var resultModel = await dataService.SelectModelData<ZXNSCRFCDetailModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCDetailModelList", [],
      `DATA1 = ${parent.selectedMaterKey}`, "", QueryCacheType.None);

    return resultModel;
  }

  // 상세 데이터 삽입
  public async detaildataInsert(parent: Modeltest03Component, values: any) {
    //data 서버로 넘기기 위해 쉼표 join
    values.dATA1 = parent.selectedMaterKey;

    values.uptim = formatDate(parent.now, "HH:mm:ss", "en-US");
    values.updat = formatDate(parent.now, "MM-dd-yyyy", "en-US");

    var opt = values.detopt.join(",");
    var sel = values.dETSEL1 ? "O" : "X";

    var data = new ZXNSCRFCDetailModel(values.dATA1, values.itmno, values.dETAIL1, values.dETAIL2, values.dETNUM1, values.dATNUM2, sel, values.dETSEL2, opt, values.updat, values.uptim, DIMModelStatus.Add);
    var modelList: ZXNSCRFCDetailModel[] = [data];

    this.rowCount = await this._dataService.ModifyModelData<ZXNSCRFCDetailModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCDetailModelList", modelList);
  }

  //상세 데이터 수정
  public async detaildataModify(parent: Modeltest03Component, key: any, values: any) {

    let rows = parent.detailGrid.instance.getVisibleRows();
    let rowIndex = parent.detailGrid.instance.getRowIndexByKey(key);
    let modifyData = rows[rowIndex].data;  

    if (values.uptim !== undefined)
      values.uptim = formatDate(parent.now, "HH:mm:ss", "en-US");
    if (values.updat !== undefined)
      values.updat = formatDate(parent.now, "MM-dd-yyyy", "en-US");
    if (values.detopt !== undefined)
      values.detopt = values.detopt.join(",");
    if (values.dETSEL1 !== undefined)
      values.dETSEL1 = values.dETSEL1 ? "X" : " ";

    updateObject(values, modifyData);

    modifyData.ModelStatus = DIMModelStatus.Modify;

    var modelList: ZXNSCRFCDetailModel[] = [modifyData];

    this.rowCount = await parent._dataService.ModifyModelData<ZXNSCRFCDetailModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCDetailModelList", modelList);
  }

  //상세 데이터 삭제
  public async detaildataDelete(parent: Modeltest03Component, key: any) {

    var DetaildeleteData1 = new ZXNSCRFCDetailModel(key, key, key.dETAIL1, key.dETAIL2, key.dETNUM1, key.dATNUM2, key.dETSEL1, key.dETSEL2, key.dETOPT, key.updat, key.uptim, DIMModelStatus.Delete);

    var modelList: ZXNSCRFCDetailModel[] = [DetaildeleteData1];
    this.rowCount = await parent._dataService.ModifyModelData<ZXNSCRFCDetailModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCRFCDetailModelList", modelList);
  }

  //------------------------------------------------------------------------------------------------------------

  //컴퍼니 변경
  companyChanged(e: any) {
    this.masterAddMode = false;
    this.selectedMaterKey = e.selectedItem.dATA1;
    this.detailGrid.instance.refresh();
  }

  getCompanySelectorLabelMode() {
    return this.labelMode === 'outside'
      ? 'hidden'
      : this.labelMode;
  }

  //옵션 변경
  onDetailOptionChanged(cellInfo: any, e: any) {
    cellInfo.setValue(e.value);
  }

  //상세 자료 Row 변경
  detailRowChanged(e: any) {
    this.selectedOption = e.component.cellValue(e.rowIndex, "detopt");
  }

  //Option 선택한 키
  detailSelectedKeys(cellInfo :any)
  {
    return cellInfo.value.split(',');
  }
}
