/*
 * 출고 결과 반영
 */
import { Component, enableProdMode, ViewChild, AfterViewInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import ArrayStore from "devextreme/data/array_store";
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient } from '@angular/common/http';
import { confirm, alert } from "devextreme/ui/dialog";
import { ZSDS6430Model, ZSDIFPORTALSAPLELIQSndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqSnd';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AuthService } from '../../../shared/services';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { UtijisifModel } from '../../../shared/dataModel/ORACLE/UTIJISIFProxy';
import { CarbynmfModel } from '../../../shared/dataModel/ORACLE/CARBYNMFProxy';
import { CHMWkodModel } from '../../../shared/dataModel/ORACLE/CHM_WKODProxy';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { ThemeManager } from '../../../shared/app.utilitys';
import { Service, OilShip, ChemShip } from '../OSHA/app.service'
import {
  DxDataGridComponent,
} from 'devextreme-angular';
import { ZSDIFPORTALSAPSHIPPINGInsModel, ZSDS6901Model, ZSDT6901Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingIns';



//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'osha.component.html',
  providers: [ImateDataService, Service]
})

export class OSHAComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('cheDataGrid', { static: false }) cheDataGrid!: DxDataGridComponent;
  @ViewChild('oilDataGrid', { static: false }) oilDataGrid!: DxDataGridComponent;
  //data
  dataSource: any;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  //정보
  OilShipData: OilShip[];
  ChemShipData: ChemShip[];
  //메인데이터
  OilShip: any;
  ChemShip: any;
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


  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //줄 선택
  selectedRowIndex = -1;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출고결과반영";
    const that = this;
    //정보
    this.OilShip = [];
    this.ChemShip = [];

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.mainDataLoad();
    this.cheDataLoad(this);
    //필터
    this.saleAmountHeaderFilter = [{
      text: 'Less than $10000',
      value: ['chemInsQuan', '<', 1000],
    }, {
      text: '$10000 - $20000',
      value: [
        ['chemInsQuan', '>=', 10000],
        ['chemInsQuan', '<', 20000],
      ],
    }, {
      text: '$20000 - $30000',
      value: [
        ['chemInsQuan', '>=', 20000],
        ['chemInsQuan', '<', 30000],
      ],
    }, {
      text: '$30000 - $40000',
      value: [
        ['chemInsQuan', '>=', 30000],
        ['chemInsQuan', '<', 40000],
      ],
    }, {
      text: 'Greater than $40000',
      value: ['chemInsQuan', '>=', 40000],
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
  //메인화면 로드   //ZSDIFPORTALSAPSHIPPINGInsModel(RFC)
  public async mainDataLoad() {
    try {
      this.OilShipData = [];
      var sdate = formatDate(this.startDate, "yyyyMMdd", "en-US")
      var edate = formatDate(this.endDate, "yyyyMMdd", "en-US")
      var zsds6901List: ZSDS6901Model[] = [];
      var zsdt6901List: ZSDT6901Model[] = [];

      var oilDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "O", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List);

      var modelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilDataResult];

      this.loadingVisible = true;
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", modelList, QueryCacheType.None);
      this.loadingVisible = false;

      resultModel[0].ET_DATA.forEach(async (array: ZSDS6901Model) => {
        var model = new OilShip();
        model.oilShipDate = array.DODAT
        model.oilNum = array.ZSEQ
        model.oilClient = array.NAME1
        model.oilType = array.MAKTX
        model.oilVehNum = array.ZCARNO
        model.oilDesti = array.CITY
        model.oilBACHDAT = array.BACHDAT
        model.oilBACHNUM = array.BACHSEQ

        this.OilShipData.push(model);

      });

      var carDataResult: CarbynmfModel[] = await this.dataService.SelectModelData<CarbynmfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CarbynmfModelList", [],
        `BYILJA >= '${parseInt(sdate)}' AND BYILJA <= '${parseInt(edate)}'`, "", QueryCacheType.None);

      this.OilShipData.forEach(async (array: OilShip) => {
        var resultData = carDataResult.find(obj => obj.BYILJA == parseInt(array.oilBACHDAT) && obj.BYSEQ == array.oilBACHNUM);

        if (resultData != undefined) {
          array.oilState = resultData.BYSTATUS
          if (resultData.BYSTATUS == "" || resultData.BYSTATUS == "R" || undefined) {
            array.oilState = "대기"
          } else if (resultData.BYSTATUS == "Y") {
            array.oilState = "진행중"
          } else if (resultData.BYSTATUS == "C") {
            array.oilState = "완료"
          } else if (resultData.BYSTATUS == "D" || resultData.BYSTATUS == "X") {
            array.oilState = "취소"
          }
          array.oilInsQuan = resultData.BYJITOT
          array.oilYuchang1 = `${resultData.BYSTTIME01 ?? ""} ~ ${resultData.BYENTIME01 ?? ""}`
          array.oilYuchang2 = `${resultData.BYSTTIME02 ?? ""} ~ ${resultData.BYENTIME02 ?? ""}`
          array.oilYuchang3 = `${resultData.BYSTTIME03 ?? ""} ~ ${resultData.BYENTIME03 ?? ""}`
          array.oilYuchang4 = `${resultData.BYSTTIME04 ?? ""} ~ ${resultData.BYENTIME04 ?? ""}`
          array.oilYuchang5 = `${resultData.BYSTTIME05 ?? ""} ~ ${resultData.BYENTIME05 ?? ""}`
          array.oilYuchang6 = `${resultData.BYSTTIME06 ?? ""} ~ ${resultData.BYENTIME06 ?? ""}`
          array.oilYuchang7 = `${resultData.BYSTTIME07 ?? ""} ~ ${resultData.BYENTIME07 ?? ""}`
          array.oilYuchang8 = `${resultData.BYSTTIME08 ?? ""} ~ ${resultData.BYENTIME08 ?? ""}`
          array.oilYuchang9 = `${resultData.BYSTTIME09 ?? ""} ~ ${resultData.BYENTIME09 ?? ""}`
          array.oilYuchang10 = `${resultData.BYSTTIME10 ?? ""} ~ ${resultData.BYENTIME10 ?? ""}`

        }

      });

      this.loadingVisible = true;
      this.OilShip = new ArrayStore(
        {
          key: ["oilShipDate", "oilNum"],
          data: this.OilShipData
        });
      this.oilDataGrid.instance.getScrollable().scrollTo(0);

      this.loadingVisible = false;

    }
    catch (error) {
      alert("error", "알림");
      return null;

    }
  }
  //화학메인화면 로드   //ZSDIFPORTALSAPSHIPPINGInsModel(RFC)
  public async cheDataLoad(thisObj: OSHAComponent) {
    try {
      this.ChemShipData = [];
      var sdate = formatDate(this.startDate, "yyyyMMdd", "en-US")
      var edate = formatDate(this.endDate, "yyyyMMdd", "en-US")
      var zsds6901List: ZSDS6901Model[] = [];
      var zsdt6901List: ZSDT6901Model[] = [];
      var oilDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "C", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List);

      var modelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilDataResult];

      this.loadingVisible = true;
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", modelList, QueryCacheType.None);
      this.loadingVisible = false;

      resultModel[0].ET_DATA.forEach(async (array: ZSDS6901Model) => {
        var model = new ChemShip();
        model.chemShipDate = array.DODAT
        model.chemNum = array.ZSEQ
        model.chemClient = array.NAME1
        model.chemProduct = array.MAKTX
        model.chemVehNum = array.ZCARNO
        model.chemDesti = array.CITY
        this.ChemShipData.push(model);

      });

      var cheDataResult = await this.dataService.SelectModelData<CHMWkodModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CHMWkodModelList", [],
        `JIYYMM >= '${parseInt(sdate)}' AND JIYYMM <= '${parseInt(edate)}'`, "", QueryCacheType.None);

      this.ChemShipData.forEach(async (array: ChemShip) => {
        var resultData = cheDataResult.find(obj => obj.JIYYMM == parseInt(array.chemShipDate) && obj.JISEQ == array.chemNum);

        if (resultData != undefined) {
          array.chemState = resultData.JISTATUS
          if (resultData.JISTATUS == "R") {
            array.chemState = "대기"
          } else if (resultData.JISTATUS == "S") {
            array.chemState = "시작"
          } else if (resultData.JISTATUS == "C") {
            array.chemState = "완료"
          } else if (resultData.JISTATUS == "T") {
            array.chemState = "지시"
          } else if (resultData.JISTATUS == "G") {
            array.chemState = "공차계근"
          } else if (resultData.JISTATUS == "Y") {
            array.chemState = "유류"
          }
          array.chemInsQuan = resultData.JIJIQTY
          array.chemShipQuan = resultData.JICHQTY
          array.chemWeight = resultData.JIEMPTY
          array.chemTWeight = resultData.JITOTAL
          array.chemStaTim = resultData.JISTIME
          array.chemEndTim = resultData.JIETIME

        }

      });
      this.loadingVisible = true;
      this.ChemShip = new ArrayStore(
        {
          key: ["chemShipDate", "chemNum"],
          data: this.ChemShipData
        });
      this.cheDataGrid.instance.getScrollable().scrollTo(0);

      this.loadingVisible = false;

    }
    catch (error) {
      alert("error", "알림");
      return null;

    }
  }
  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.oilDataGrid.instance.refresh();
    this.cheDataGrid.instance.refresh();
    this.mainDataLoad();
    this.cheDataLoad(this);
  }



}
