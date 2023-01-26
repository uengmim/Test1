import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType, QueryDataType, QueryMessage, QueryParameter, QueryRunMethod } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { Service} from '../VOCR/app.service'
import {
  DxDataGridComponent,
  DxDateBoxModule,
} from 'devextreme-angular';
import { VocCodeInfo } from '../../../shared/dataModel/QMSIF/VocCodeInfo';
import { ArrayCodeInfo, TableColumnInfo } from '../../../shared/app.utilitys';
import { VocPersonnfo } from '../../../shared/dataModel/QMSIF/VocPersonInfo';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { VocInfData } from '../../../shared/dataModel/QMSIF/VocInfData';
import { QmsInfResult } from '../../../shared/dataModel/QMSIF/QmsInfResult';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';


//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'vocr.component.html',
  styleUrls: ['./vocr.component.scss'],
  providers: [ImateDataService, Service]
})



export class VOCRComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('manureQtyUnitEntery', { static: false }) manureQtyUnitEntery!: CommonPossibleEntryComponent;
  @ViewChild('inChargesCodeEntery', { static: false }) inChargesCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('siteEntery', { static: false }) siteEntery!: CommonPossibleEntryComponent;
  @ViewChild('bunitEntery', { static: false }) bunitEntery!: CommonPossibleEntryComponent;
  @ViewChild('cystmerTypeEntery', { static: false }) cystmerTypeEntery!: CommonPossibleEntryComponent;
  @ViewChild('areaEntery', { static: false }) areaEntery!: CommonPossibleEntryComponent;
  @ViewChild('selculytivateTypeEntery', { static: false }) culytivateTypeEntery!: CommonPossibleEntryComponent;
  @ViewChild('partnmQtyUnitEntery', { static: false }) partnmQtyUnitEntery!: CommonPossibleEntryComponent;
  @ViewChild('rejectQtyUnitEntery', { static: false }) rejectQtyUnitEntery!: CommonPossibleEntryComponent;
  @ViewChild('productGroupEntery', { static: false }) productGroupEntery!: CommonPossibleEntryComponent;
  @ViewChild('vocCauseEntery', { static: false }) vocCauseEntery!: CommonPossibleEntryComponent;
  @ViewChild('vocTypeEntery', { static: false }) vocTypeEntery!: CommonPossibleEntryComponent;
  @ViewChild('factoryEntery', { static: false }) factoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('domesticEntery', { static: false }) domesticEntery!: CommonPossibleEntryComponent;
  @ViewChild('overseaEntery', { static: false }) overseaEntery!: CommonPossibleEntryComponent;

  dataSource: any;

  //폼데이터
  vocList: any;

  //날짜 조회
  startDate: any;
  endDate: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //편집 취소 버튼
  cancelEditButtonOptions: any;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;

  callbacks = [];


  //_dataService: ImateDataService;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {

    appInfo.title = AppInfoService.APP_TITLE + " | MODEL TEST1";

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

  }

  //시비량 선택
  selManureQtyUnit: string | null = null;
  manureQtyAdapter =
    {
      getValue: () => {
        return this.selManureQtyUnit;
      },
      applyValidationResults: (e: any) => {
        this.manureQtyUnitEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //사업장 선택
  selSite: string | null = null;
  siteAdapter =
    {
      getValue: () => {
        return this.selSite;
      },
      applyValidationResults: (e: any) => {
        this.siteEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //사업부 선택
  selBunit: string | null = null;
  bunitAdapter =
    {
      getValue: () => {
        return this.selBunit;
      },
      applyValidationResults: (e: any) => {
        this.bunitEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //고객유형 선택
  selCystmerType: string | null = null;
  cystmerTypeAdapter =
    {
      getValue: () => {
        return this.selCystmerType;
      },
      applyValidationResults: (e: any) => {
        this.cystmerTypeEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //지역 선택
  selArea: string | null = null;
  areaAdapter =
    {
      getValue: () => {
        return this.selArea;
      },
      applyValidationResults: (e: any) => {
        this.areaEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //재배형태 선택
  selCulytivateType: string | null = null;
  culytivateTypeAdapter =
    {
      getValue: () => {
        return this.selCulytivateType;
      },
      applyValidationResults: (e: any) => {
        this.culytivateTypeEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };


  //제품명 선택
  selPartnmQtyUnit: string | null = null;
  partnmQtyAdapter =
    {
      getValue: () => {
        return this.selPartnmQtyUnit;
      },
      applyValidationResults: (e: any) => {
        this.partnmQtyUnitEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //불량단위 선택
  selRejectQtyUnit: string | null = null;
  rejectQtyUnitAdapter =
    {
      getValue: () => {
        return this.selRejectQtyUnit;
      },
      applyValidationResults: (e: any) => {
        this.rejectQtyUnitEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //제품군 선택
  selProductGroup: string | null = null;
  productGroupAdapter =
    {
      getValue: () => {
        return this.selProductGroup;
      },
      applyValidationResults: (e: any) => {
        this.productGroupEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //민원종류 선택
  selVocType: string | null = null;
  vocTypeAdapter =
    {
      getValue: () => {
        return this.selVocType;
      },
      applyValidationResults: (e: any) => {
        this.vocTypeEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //민원원인 선택
  selVocCause: string | null = null;
  vocCauseAdapter =
    {
      getValue: () => {
        return this.selVocCause;
      },
      applyValidationResults: (e: any) => {
        this.vocCauseEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //생산공장 선택
  selFactory: string | null = null;
  factoryAdapter =
    {
      getValue: () => {
        return this.selFactory;
      },
      applyValidationResults: (e: any) => {
        this.factoryEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //지역국내 선택
  selDomestic: string | null = null;
  domesticAdapter =
    {
      getValue: () => {
        return this.selDomestic;
      },
      applyValidationResults: (e: any) => {
        this.domesticEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };
  
  //담당자 선택
  selInChargePerson: string | null = null;
  inChargePersonAdapter =
    {
      getValue: () => {
        return this.selInChargePerson;
      },
      applyValidationResults: (e: any) => {
        this.inChargesCodeEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  /**
   * QMS VOC 기본 코드
   * @param e
   */
  async getVocBaseCode(e: any) {

    //VOC 기초 코드 정보
    let vocBaseCodeQuery = new QueryMessage(QueryRunMethod.Alone, "vocBaseCode", "#func", "NBPDataModels@NAMHE.CustomFunction.QmsVocBaseCodeInterface", [], []);
    var resultSet = await this.dataService.dbSelectToDataSet([vocBaseCodeQuery])

    //사업장
    var site = resultSet.getDataObject("site", VocCodeInfo);
    //사업부
    var bunit = resultSet.getDataObject("bunit", VocCodeInfo);
    //생산공장
    var factory = resultSet.getDataObject("factory", VocCodeInfo);
    //고객 유형
    var cystmerType = resultSet.getDataObject("cystmerType", VocCodeInfo);
    //지역
    var area = resultSet.getDataObject("area", VocCodeInfo);
    //지역국내
    var domestic = resultSet.getDataObject("domestic", VocCodeInfo);
    //지역해외
    var oversea = resultSet.getDataObject("oversea", VocCodeInfo);
    //재배형태
    var culytivateType = resultSet.getDataObject("culytivateType", VocCodeInfo);
    //제품군
    var productGroup = resultSet.getDataObject("productGroup", VocCodeInfo);
    //민원종류
    var vocType = resultSet.getDataObject("vocType", VocCodeInfo);
    //민원원인
    var vocCause = resultSet.getDataObject("vocCause", VocCodeInfo);
    //불량수량단위
    var rejectQtyUnit = resultSet.getDataObject("rejectQtyUnit", VocCodeInfo);

    //시비량단위
    var manureQtyUnit = resultSet.getDataObject("manureQtyUnit", VocCodeInfo);
    //담당자
    var InCharges = resultSet.getDataObject("inCharge", VocPersonnfo);

    //배열 코드정보를 만든다.
    let manureQtyUnitCode = new ArrayCodeInfo("시비량단위", ["code"], manureQtyUnit,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);
    //파서블 엔터리의 코드 정보를 변경 한다.
    this.manureQtyUnitEntery.ChangeCodeInfo(manureQtyUnitCode, "code", "%codenm%(%code%)");

    //배열 코드정보를 만든다.
    let inChargesCode = new ArrayCodeInfo("담당자", ["id"], InCharges,
      [new TableColumnInfo("plant", "플렌트"), new TableColumnInfo("id", "ID"), new TableColumnInfo("name", "이름"), new TableColumnInfo("buseonm", "부서")]);
    //파서블 엔터리의 코드 정보를 변경 한다.
    this.inChargesCodeEntery.ChangeCodeInfo(inChargesCode, "id", "%name% / %buseonm% (%id%)");
  }

  /**
 * QMS VOC 기본 코드
 * @param e
 */
  async getVocDataSave(e: any) {

    //QMS 요구 일자 포멧
    let now = formatDate(new Date(), "yyyy.MM.dd", "en-US");

    let vocData = new VocInfData("1000", "COM_001", "테스크 고객1", "COM_001", "D", "COM_001", "상세 지역1", "COM_001", "R06MOAA-008",
      "농업용 염화가리", 3, "ETC", "기타단위1", "COM_001", "PU50", "20628", now, "LOT12345", now, now,
      "COM_001", "COM_001", "작물1", 100, "1", "", 12, "COM_001", "22345", "조치내용1", "특기사항1", null);

    let vocDataStr = JSON.stringify([vocData]);
    let queryParam = new QueryParameter("vocdata", QueryDataType.String, vocDataStr, "", "", "", "");

    //VOC 기초 코드 정보를 가져 온다.
    let vocDataSaveQuery = new QueryMessage(QueryRunMethod.Alone, "vocBaseCode", "#func", "NBPDataModels@NAMHE.CustomFunction.QmsVocDataInterface", [], [queryParam]);
    var resultSet = await this.dataService.dbSelectToDataSet([vocDataSaveQuery]);
    let result = resultSet.getDataObject("result", QmsInfResult);

    console.log(result);
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  /*onAreaCodeValueChanged(e: any) {
    setTimeout(() => {
      this.vocData.AREA = e.selectedValue;
      if (this.vocData.AREA === "해외") {
        this.domesticEntery.ChangeCodeInfo(this.vocConfig.VocCodeInfo("해외지역"), "ZCM_CODE3", "%ZCMF01_CH%(%ZCM_CODE3%)", "운송방법")
      }
      else if (this.vocData.AREA === "국내") {

      }
    });
  }*/
}
