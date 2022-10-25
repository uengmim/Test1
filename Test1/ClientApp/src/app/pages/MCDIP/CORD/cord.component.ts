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
  DxButtonModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ZSDS5000Model } from '../../../shared/dataModel/MFSAP/ZSDEpSoListProxy';

/*고객주문처리(액상) Component*/

const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'cord.component.html',
  providers: [ImateDataService, Service]
})

export class CORDComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('sd007Entery', { static: false }) sd007Entery!: CommonPossibleEntryComponent;
  @ViewChild('maEntery', { static: false }) maEntery!: TablePossibleEntryComponent;
  @ViewChild('maktEntery', { static: false }) maktEntery!: TablePossibleEntryComponent;
  

  //주문구분 
  sd007Code: CommonCodeInfo;

  //주문구분 필터 : 처음에 필터는 자료가 아무것도 안나오게 한다.
  //sd007Filter: any = ["ZCM_CODE2", "=", "#"];

  //제품구분 정보

  maCode: TableCodeInfo;
  //제품구분 필터 : 처음에 필터는 자료가 아무것도 안나오게 한다.
  //maFilter: any = ["MTART", "=", "#"];

  //주문명 정보
  maktCode: TableCodeInfo;


  //delete
  selectedItemKeys: any[] = [];

  dataSource: ArrayStore;
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

  formData: any = {};
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

  //

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;

  editFlag = false;
  saveVisible = false;
  popupVisible = false;
  //_dataService: ImateDataService;
  capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

  click = (e:any) => {
    const buttonText = e.component.option('text');
    notify(`The ${this.capitalize(buttonText)} button was clicked`);
  };
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo) {


    appInfo.title = AppInfoService.APP_TITLE + " | 고객주문처리(액상)";


    this.sd007Code = appConfig.commonCode("주문구분");
    this.maCode = appConfig.tableCode("제품구분");
    this.maktCode = appConfig.tableCode("제품명");
    //form
    this.labelMode = 'floating';
    this.labelLocation = 'left';
    this.readOnly = false;
    this.showColon = true;
    this.minColWidth = 300;
    this.colCount = 2;
    let page = this;



    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //거래처
    this.clients = service.getclient();
    const that = this;
    //정보

    let modelTest01 = this;

    this.dataSource = new ArrayStore({
      key: 'VBELN',
      data: service.getRequestProcess(),
    });

    this.orderData = new CustomStore(
      {
        key: ["VBELN"],
        load: function (loadOptions) {
          return page.dataLoad(imInfo, dataService);
        }
      });


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
        this.dataGrid.instance.saveEditData();
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

    //from 수정가능여부
    this.editFlag = true;
    //저장버튼 여부
    this.saveVisible = false;
    this.popupVisible = !this.popupVisible;
  }

  //고객주문리스트 조회 RFC
  public async dataLoad(iminfo: ImateInfo, dataService: ImateDataService) {

    var zps5000Model = new ZSDS5000Model("", this.startDate, this.endDate, this.sd007Entery.selectedValue ? this.sd007Entery.selectedValue : "", this.maEntery.selectedValue ? this.maEntery.selectedValue : "", this.maktEntery.selectedValue ? this.maktEntery.selectedValue : "");
    var modelList: ZSDS5000Model[] = [zps5000Model];

    var resultModel = await dataService.RefcCallUsingModel<ZSDS5000Model[]>("DS4", "NBPDataModels", "NAMHE.Model.ZSDEPSOListModelList", modelList, QueryCacheType.None);
    console.log(resultModel);
    console.log(JSON.stringify(resultModel));

    console.table(resultModel);
    return resultModel[0]['E_RETRUN'];
    
  }


}
