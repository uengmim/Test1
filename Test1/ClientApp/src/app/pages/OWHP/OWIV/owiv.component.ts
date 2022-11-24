/*
 * 재고현황확인
 */
import { NgModule, Component, enableProdMode, ViewChild, Input, AfterViewInit } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service, OrderData, CheOrderData } from '../OWIV/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZMMCURRStockModel, ZMMS3120Model, ZMMS3140Model } from '../../../shared/dataModel/OWHP/ZmmCurrStockProxy';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';



//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'owiv.component.html',
  providers: [ImateDataService, Service]
})

export class OWIVComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  //data
  dataSource: any;

  //정보
  mainGridData: any;
  sort: string[];

  //날짜 조회
  startDate: any;
  endDate: any;

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;
  currentFilter: any;

  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 조회 버튼
  searchButtonOptions: any;
  exportSelectedData: any;


  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //줄 선택
  selectedRowIndex = -1;

  constructor(private dataService: ImateDataService, service: Service, imInfo: ImateInfo, http: HttpClient, private appInfo: AppInfoService, private appConfig: AppConfigService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 재고현황확인";
    let page = this;

    //정보
    this.sort = service.getSort();

    this.mainGridData = new CustomStore(
      {
        key: ["LGORT", "MATNR"],
        load: function (loadOptions) {
          return page.dataLoad(imInfo, dataService, appConfig);
        }
      });
   
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.dataGrid.instance.refresh();
      },
    };
    //엑셀버튼
    this.exportSelectedData = {
      icon: 'export',
      onClick: () => {
        this.dataGrid.instance.exportToExcel(true);

      },
    };
    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $100',
      value: ['oilSetAmount', '<', 3000],
    }, {
      text: '$100 - $200',
      value: [
        ['PARoilSetAmountAM9', '>=', 3000],
        ['oilSetAmount', '<', 5000],
      ],
    }, {
      text: '$300 - $400',
      value: [
        ['oilSetAmount', '>=', 5000],
        ['oilSetAmount', '<', 10000],
      ],
    }, {
      text: '$400 - $500',
      value: [
        ['oilSetAmount', '>=', 10000],
        ['oilSetAmount', '<', 20000],
      ],
    }, {
      text: 'Greater than $500',
      value: ['oilSetAmount', '>=', 20000],
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
  }

  private async dataLoad(iminfo: ImateInfo, dataService: ImateDataService, appConfig: AppConfigService) {
    var model: ZMMS3140Model = new ZMMS3140Model("", "", "", "", "", "", "", "30", "", "", DIMModelStatus.UnChanged);
    var rfcModelList: ZMMCURRStockModel[] = [new ZMMCURRStockModel("", "1000", [], [model], DIMModelStatus.UnChanged)];

    var result = await this.dataService.RefcCallUsingModel<ZMMCURRStockModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMCURRStockModelList", rfcModelList, QueryCacheType.None);
    return result[0].ET_LIST;
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }
}
