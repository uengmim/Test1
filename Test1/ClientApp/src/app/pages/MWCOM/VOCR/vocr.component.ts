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
import { ArrayCodeInfo, AttachFileInfo, CodeInfoType, CommonCodeInfo, TableCodeInfo, TableColumnInfo } from '../../../shared/app.utilitys';
import { VocPersonnfo } from '../../../shared/dataModel/QMSIF/VocPersonInfo';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { VocInfData } from '../../../shared/dataModel/QMSIF/VocInfData';
import { QmsInfResult } from '../../../shared/dataModel/QMSIF/QmsInfResult';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';
import { PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ZCMT0020Model } from '../../../shared/dataModel/common/zcmt0020';
import { OfficeXPUtility } from '../../../shared/officeXp.utility';



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
  @ViewChild('culytivateTypeEntery', { static: false }) culytivateTypeEntery!: CommonPossibleEntryComponent;
  @ViewChild('partnmQtyUnitEntery', { static: false }) partnmQtyUnitEntery!: CommonPossibleEntryComponent;
  @ViewChild('rejectQtyUnitEntery', { static: false }) rejectQtyUnitEntery!: CommonPossibleEntryComponent;
  @ViewChild('productGroupEntery', { static: false }) productGroupEntery!: CommonPossibleEntryComponent;
  @ViewChild('vocCauseEntery', { static: false }) vocCauseEntery!: CommonPossibleEntryComponent;
  @ViewChild('vocTypeEntery', { static: false }) vocTypeEntery!: CommonPossibleEntryComponent;
  @ViewChild('factoryEntery', { static: false }) factoryEntery!: CommonPossibleEntryComponent;
  @ViewChild('domesticEntery', { static: false }) domesticEntery!: CommonPossibleEntryComponent;
  @ViewChild('overseaEntery', { static: false }) overseaEntery!: CommonPossibleEntryComponent;
  @ViewChild('registerEntery', { static: false }) registerEntery!: CommonPossibleEntryComponent;
  @ViewChild('departmentEntery', { static: false }) departmentEntery!: CommonPossibleEntryComponent;

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
  vocData: any;

  //팝업 닫기
  closeButtonOptions: any;

  //제품명엔트리 값
  matnrValue: any;
  maktCode: TableCodeInfo;

  private loadePeCount: number = 0;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  /**
 * 첨부 파일들
 * */
  attachFiles: AttachFileInfo[] = [];

  /**
   * 업로드 문서 번호
   * */
  uploadDocumentNo: string;

  /**
   * OffcieXP 유틸리티
   * */
  offceXPUtility: OfficeXPUtility;

  /*
   *첨부파일 팝업
   */
  filePopupVisible: boolean = false;

  /**
* 데이터 스토어 키
* */
  dataStoreKey: string = "vocr";
  selectData: any;

  domesticCode: ArrayCodeInfo;
  overseaCode: ArrayCodeInfo;
  areaCode: ArrayCodeInfo;

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private appConfig: AppConfigService, private iminfo: ImateInfo,
    private authService: AuthService) {

   //_dataService: ImateDataService;

    const that = this;

    this.getVocBaseCode()

    appInfo.title = AppInfoService.APP_TITLE + " | VOC등록";

    this.maktCode = appConfig.tableCode("제품코드");
    this.matnrValue = "";
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maktCode),
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    //팝업닫기버튼
    this.closeButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.filePopupVisible = false;
      }
    }
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

  //불량수량 단위 선택
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

  //지역해외 선택
  selOversea: string | null = null;
  overseaAdapter =
    {
      getValue: () => {
        return this.selOversea;
      },
      applyValidationResults: (e: any) => {
        this.overseaEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };
  
  //지시담당자 선택
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

  //등록자 선택
  selRegister: string | null = null;
  registerAdapter =
    {
      getValue: () => {
        return this.selRegister;
      },
      applyValidationResults: (e: any) => {
        this.registerEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  //소속부서 선택
  selDepartment: string | null = null;
  departmentAdapter =
    {
      getValue: () => {
        return this.selDepartment;
      },
      applyValidationResults: (e: any) => {
        this.departmentEntery.validationStatus = e.isValid ? "valid" : "invalid"
      },
      validationRequestsCallbacks: this.callbacks
    };

  /**
   * QMS VOC 기본 코드
   * @param e
   */

  async getVocBaseCode() {

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
    //소속부서
    //var department = resultSet.getDataObject("Department", VocCodeInfo); 

    //배열 코드정보를 만든다.
    //시비량 단위
    let manureQtyUnitCode = new ArrayCodeInfo("시비량단위", ["code"], manureQtyUnit,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //사업장
    let siteCode = new ArrayCodeInfo("사업장", ["code"], site,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //사업부
    let bunitCode = new ArrayCodeInfo("사업부", ["code"], bunit,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //고객유형
    let cystmerTypeCode = new ArrayCodeInfo("고객유형", ["code"], cystmerType,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //지역
    this.areaCode = new ArrayCodeInfo("지역", ["code"], area,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //지역국내
    this.domesticCode = new ArrayCodeInfo("지역국내", ["code"], domestic,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //지역해외
    this.overseaCode = new ArrayCodeInfo("지역해외", ["code"], oversea,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //재배형태
    let culytivateTypeCode = new ArrayCodeInfo("재배형태", ["code"], culytivateType,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //불량수량단위
    let rejectQtyUnitCode = new ArrayCodeInfo("불량수량단위", ["code"], rejectQtyUnit,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //제품군
    let productGroupCode = new ArrayCodeInfo("제품군", ["code"], productGroup,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //민원종류
    let vocTypeCode = new ArrayCodeInfo("민원종류", ["code"], vocType,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //민원원인
    let vocCauseCode = new ArrayCodeInfo("민원원인", ["code"], vocCause,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //생산공장
    let factoryCode = new ArrayCodeInfo("생산공장", ["code"], factory,
      [new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //소속부서
    //let departmentCode = new ArrayCodeInfo("소속부서", ["code"], department,
      //[new TableColumnInfo("code", "코드"), new TableColumnInfo("codenm", "설명")]);

    //파서블 엔터리의 코드 정보를 변경 한다.
    //시비량 단위
    this.manureQtyUnitEntery.ChangeCodeInfo(manureQtyUnitCode, "code", "%codenm%(%code%)");

    //사업장
    this.siteEntery.ChangeCodeInfo(siteCode, "code", "%codenm%(%code%)")

    //사업부
    this.bunitEntery.ChangeCodeInfo(bunitCode, "code", "%codenm%(%code%)")

    //고객유형
    this.cystmerTypeEntery.ChangeCodeInfo(cystmerTypeCode, "code", "%codenm%(%code%)")

    //지역
    this.areaEntery.ChangeCodeInfo(this.areaCode, "code", "%codenm%(%code%)")

    //지역국내
    this.domesticEntery.ChangeCodeInfo(this.domesticCode, "code", "%codenm%(%code%)")

    //지역해외
    //this.overseaEntery.ChangeCodeInfo(this.overseaCode, "code", "%codenm%(%code%)")

    //재배형태
    this.culytivateTypeEntery.ChangeCodeInfo(culytivateTypeCode, "code", "%codenm%(%code%)")

    //불량수량단위
    this.rejectQtyUnitEntery.ChangeCodeInfo(rejectQtyUnitCode, "code", "%codenm%(%code%)")

    //제품군
    this.productGroupEntery.ChangeCodeInfo(productGroupCode, "code", "%codenm%(%code%)")

    //민원종류
    this.vocTypeEntery.ChangeCodeInfo(vocTypeCode, "code", "%codenm%(%code%)")

    //민원원인
    this.vocCauseEntery.ChangeCodeInfo(vocCauseCode, "code", "%codenm%(%code%)")

    //생산공장
    this.factoryEntery.ChangeCodeInfo(factoryCode, "code", "%codenm%(%code%)")

    //소속부서
    //this.departmentEntery.ChangeCodeInfo(departmentCode, "code", "%codenm(%code%)")

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

  onPEDataLoaded(e: any) {
    this.loadePeCount++;
  }

  //지역코드 변경
  onAreaCodeValueChanged(e: any) {
    setTimeout(() => {
      //this.vocData.AREA = e.selectedValue;
      //국내
      if (e.selectedValue === "D") {
        this.domesticEntery.ChangeCodeInfo(this.domesticCode, "code", "%codenm%(%code%)");
        //this.domesticEntery.ChangeCodeInfo(this.appConfig.commonCode("국내지역"), "code", "%codenm%(%code%)", "해외지역")
      }
      //해외
      else if (e.selectedValue === "E") {
        this.domesticEntery.ChangeCodeInfo(this.overseaCode, "code", "%codenm%(%code%)");
      }
      //기타
      else if (e.selectedValue === "ETC") {
        this.domesticEntery.ChangeCodeInfo(this.domesticCode, "code", "%codenm%(%code%)");
      }
      //터키
      else if (e.selectedValue === "C") {
        this.domesticEntery.ChangeCodeInfo(this.overseaCode, "code", "%codenm%(%code%)");
     }
    });
  }

  // 첨부파일
  filePopup() {
    this.filePopupVisible = true;
  }
}

