import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { ZXNSCRFCDataModel } from '../../../shared/dataModel/ZxnscRfcData';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import ArrayStore from 'devextreme/data/array_store';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { Service, RequestProcess } from './app.service';
import {
  DxDataGridComponent,
  DxButtonModule,
  DxFormComponent,
  DxPopupComponent
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ZSDEPSOListModel, ZSDS5000Model, ZSDS5001Model } from '../../../shared/dataModel/MFSAP/ZSDEpSoListProxy';
import dxForm from 'devextreme/ui/form';
import { AuthService } from '../../../shared/services';
import { ZSDEPSOENTRYInfoModel, ZSDS3013Model, ZSDS3014Model } from '../../../shared/dataModel/MFSAP/ZSdEpSoEntryInfoProxy';
import { ZSDCREATESODoModel, ZSDS3100Model, ZSDS6001Model, ZSDS6002Model } from '../../../shared/dataModel/MFSAP/ZsdCreateSodoProxy';

/*고객주문처리(S/O)-포장재 Component*/

const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'ford.component.html',
  providers: [ImateDataService, Service]
})

export class FORDComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('sd007Entery', { static: false }) sd007Entery!: CommonPossibleEntryComponent;
  @ViewChild('maEntery', { static: false }) maEntery!: TablePossibleEntryComponent;
  @ViewChild('maktEntery', { static: false }) maktEntery!: TablePossibleEntryComponent;
  @ViewChild('kunnEntery', { static: false }) kunnEntery!: TablePossibleEntryComponent;
  @ViewChild('tvlvEntery', { static: false }) tvlvEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tEntery', { static: false }) dd07tEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnr1Entery', { static: false }) tdlnr1Entery!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr2Entery', { static: false }) tdlnr2Entery!: CommonPossibleEntryComponent;
  @ViewChild('t001Entery', { static: false }) t001Entery!: CommonPossibleEntryComponent;


  /* Entry  선언 */

  //주문구분 
  sd007Code: CommonCodeInfo;
  //제품구분 정보
  maCode: TableCodeInfo;
  //주문명 정보
  maktCode: TableCodeInfo;
  //도착지 정보
  kunnCode: TableCodeInfo;
  //용도 정보
  tvlvCode: TableCodeInfo;
  //하차 방법
  dd07tCode: TableCodeInfo;
  //화물차종
  dd07tCarCode: TableCodeInfo;
  //운송사
  tdlnr1Code: CommonCodeInfo;
  //2차운송사
  tdlnr2Code: CommonCodeInfo;
  //출고사업장
  t001Code: CommonCodeInfo;


  //delete
  selectedItemKeys: any[] = [];

  //거래처
  clients: string[];
  //정보
  orderData: any;

  //날짜 조회
  startDate: any;
  endDate: any;


  //form

  labelMode: string;

  labelLocation: string;

  readOnly: boolean;

  showColon: boolean;

  minColWidth: number;

  colCount: number;

  width: any;

  popupData: any;

  popupTitle: string;

  addData: any;



  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 저장 버튼
  saveButtonOptions: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //데이터 추가 버튼
  addButtonOptions: any;
  //편집 취소 버튼
  cancelEditButtonOptions: any;
  closeButtonOptions: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  collapsed: any;
  //줄 선택
  selectedRowIndex = -1;
  ;

  //

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;

  editFlag = false;
  saveVisible = false;
  popupVisible = false;
  //_dataService: ImateDataService;
  capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

  click = (e: any) => {
    const buttonText = e.component.option('text');
    notify(`The ${this.capitalize(buttonText)} button was clicked`);
  };
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {


    appInfo.title = AppInfoService.APP_TITLE + " | 고객주문처리(S/O)-포장재";


    this.sd007Code = appConfig.commonCode("주문구분");
    this.maCode = appConfig.tableCode("제품구분");
    this.maktCode = appConfig.tableCode("제품명");
    this.kunnCode = appConfig.tableCode("납품처");
    this.tvlvCode = appConfig.tableCode("용도구분");
    this.dd07tCode = appConfig.tableCode("하차정보");
    this.dd07tCarCode = appConfig.tableCode("화물차종");
    this.tdlnr1Code = appConfig.commonCode("운송사");
    this.tdlnr2Code = appConfig.commonCode("운송사");
    this.t001Code = appConfig.commonCode("출고사업장");


    //form
    this.labelMode = 'floating';
    this.labelLocation = 'left';
    this.readOnly = false;
    this.showColon = true;
    this.minColWidth = 300;
    this.colCount = 2;
    let page = this;
    this.popupTitle = "";

    let userInfo = authService.getUser().data;
    console.log(userInfo);

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //거래처
    this.clients = service.getclient();
    const that = this;
    //정보

    let modelTest01 = this;


    this.orderData = new CustomStore(
      {
        key: ["VBELN", "MATNR"],
        load: function (loadOptions) {
          return page.dataLoad();
        }
      });

    console.log(this.orderData);

    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $3000',
      value: ['PARAM9', '<', 3000],
    }, {
      text: '$3000 - $5000',
      value: [
        ['PARAM9', '>=', 3000],
        ['PARAM9', '<', 5000],
      ],
    }, {
      text: '$5000 - $10000',
      value: [
        ['PARAM9', '>=', 5000],
        ['PARAM9', '<', 10000],
      ],
    }, {
      text: '$10000 - $20000',
      value: [
        ['PARAM9', '>=', 10000],
        ['PARAM9', '<', 20000],
      ],
    }, {
      text: 'Greater than $20000',
      value: ['PARAM9', '>=', 20000],
    }];
    this.customOperations = [{
      name: 'weekends',
      caption: 'Weekends',
      dataTypes: ['date'],
      icon: 'check',
      hasValue: false,
      calculateFilterExpression() {
        return [[getOrderDay, '=', 0], 'or', [getOrderDay, '=', 6]];
      },
    }];


    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
    //추가버튼
    this.addButtonOptions =
    {
      icon: 'add',
      onClick: async () => {
        //this.dxForm.instance.option("formdata", {});
        this.dxForm.instance.resetValues();
        this.popupTitle = "주문등록/수정";
        this.editFlag = false;
        this.saveVisible = true;
        this.popupVisible = !this.popupVisible;
        //this.dataGrid.instance.addRow();
      },
    };

    //삭제버튼
    this.deleteButtonOptions = {
      icon: 'trash',
      onClick: () => {

        this.dataGrid.instance.deleteRow(this.selectedRowIndex)
      },
    };
    //저장버튼

    this.saveButtonOptions = {
      icon: 'save',
      onClick: () => {
        console.log(this.dxForm.instance.option('formData'));
        //this.dataGrid.instance.saveEditData();
        this.dataInsert(this);
      },
    };
  }


  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  selectedChanged(e: any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }

  selectionChanged(data: any) {
    this.selectedItemKeys = data.selectedRowKeys;
  }


  getCompanySelectorLabelMode() {
    return this.labelMode === 'outside'
      ? 'hidden'
      : this.labelMode;
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };
  orderDBClick(e: any) {
    this.infoDataLoad();

  }
  form_fieldDataChanged(e: any) {
    console.log(e.component.option("formData"));
    this.popupData = e.component.option("formData");
  }
  onKunweCodeValueChanged(e: any) {
    this.popupData.KUNWE = e.selectedValue;
  }
  //고객주문리스트 조회 RFC
  public async dataLoad() {

    var zps5000Model = new ZSDS5000Model("", this.startDate, this.endDate, this.sd007Entery.selectedValue ? this.sd007Entery.selectedValue : "", this.maEntery.selectedValue ? this.maEntery.selectedValue : "", this.maktEntery.selectedValue ? this.maktEntery.selectedValue : "");
    var modelList: ZSDS5001Model[] = [];
    var zpsModel = new ZSDEPSOListModel(zps5000Model, modelList);

    var zps500List: ZSDEPSOListModel[] = [zpsModel];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOListModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOListModelList", zps500List, QueryCacheType.None);

    return resultModel[0].E_RETURN;

  }

  //고객주문 정보 조회 RFC
  public async infoDataLoad() {
    var selectData = this.dataGrid.instance.getSelectedRowsData();


    var zsd3013Model = new ZSDS3013Model(selectData[0].KUNNR, selectData[0].KUNWE, "30", selectData[0].MATNR, selectData[0].AUART);
    var zsd3014Model = new ZSDS3014Model(0, 0, 0, "", "", "", "", "", "", "", "", "", "", "", "", "", "");


    var zsdModel = new ZSDEPSOENTRYInfoModel(zsd3014Model, zsd3013Model);
    var zsdList: ZSDEPSOENTRYInfoModel[] = [zsdModel];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOENTRYInfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOENTRYInfoModelList", zsdList, QueryCacheType.None);

    var allData = Object.assign(selectData[0], resultModel[0].E_RETURN);
    this.popupData = allData;
    console.log(this.popupData);
    this.popupTitle = "주문조회";
    this.editFlag = true;
    //저장버튼 여부
    this.saveVisible = false;
    this.popupVisible = !this.popupVisible;
  }

  //주문생성
  public async dataInsert(thisObj : FORDComponent) {
    var headModel = new ZSDS3100Model("", "1000", "10", "", "", "", this.startDate, this.endDate, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
    var itemModel = new ZSDS6001Model("10", "", 0, "", "", "", 0, 0, "", "");
    var textModel = new ZSDS6002Model("");
    //배열선언
    var itemModel2 = [itemModel];
    var textModel2 = [textModel];
    var zsdModel = new ZSDCREATESODoModel("", "", "", "", "", "", headModel, itemModel2, textModel2);
    var zsdList: ZSDCREATESODoModel[] = [zsdModel];
    var resultModel = await thisObj.dataService.RefcCallUsingModel<ZSDCREATESODoModel[]>("DS4", "NBPDataModels", "NAMHE.Model.ZSDCREATESODoModelList", zsdList, QueryCacheType.None);

    return resultModel[0];
    /*return resultModel[0].E_TYPESO;*/
    // console.log(insertModel);
  }

}
