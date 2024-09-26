/*
 * 출고 지시 등록
 */
import { Component, enableProdMode, ViewChild, AfterViewInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import ArrayStore from "devextreme/data/array_store";
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { HttpClient } from '@angular/common/http';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { confirm, alert } from "devextreme/ui/dialog";
import { formatDate } from '@angular/common';
import { ZSDS6430Model, ZSDIFPORTALSAPLELIQSndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqSnd';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AuthService } from '../../../shared/services';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { Service, ChemTRP } from '../CSSO/app.service'
import { UtijisifModel } from '../../../shared/dataModel/ORACLE/UTIJISIFProxy';
import { CarbynmfModel } from '../../../shared/dataModel/ORACLE/CARBYNMFProxy';
import { CHMWkodModel } from '../../../shared/dataModel/ORACLE/CHM_WKODProxy';
import { ZSDT7020Model } from '../../../shared/dataModel/MFSAP/Zsdt7020Proxy';
import { ZSDIFPORTALSAPSHIPPINGReqModel, ZSDS6900Model, ZSDT6900Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingReqProxy';
import { ThemeManager } from '../../../shared/app.utilitys';
import {
  DxDataGridComponent, DxCheckBoxComponent, DxFormComponent
} from 'devextreme-angular';
import { ZCMT0020CustomModel } from '../../../shared/dataModel/MCSHP/Zcmt0020CustomProxy';
import { ZSDIFPORTALSAPLELIQRcvModel, ZSDS6440Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqRcv';
import { ZMMOILBLGrinfoModel, ZMMS3200Model, ZMMS9900Model } from '../../../shared/dataModel/MCDIP/ZmmOilBlGrinfo';
import { ZMMOILGirecvModel, ZMMS3210Model } from '../../../shared/dataModel/MCDIP/ZmmOilGirecv';
import { ZSDIFPORTALSAPSHIPPINGInsModel, ZSDS6901Model, ZSDT6901Model } from '../../../shared/dataModel/MCDIP/ZsdIfPortalSapShippingIns';
import { UtichulfModel } from '../../../shared/dataModel/ORACLE/UTICHULFProxy';
import { OILWkodModel } from '../../../shared/dataModel/ORACLE/OIL_WKODProxy';
import notify from 'devextreme/ui/notify';
import { ZMMT3063Model } from '../../../shared/dataModel/MLOGP/Zmmt3063';
import { locale, loadMessages } from "devextreme/localization";
import { Title } from '@angular/platform-browser';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'csso.component.html',
  providers: [ImateDataService, Service]
})

export class CSSOComponent {
  @ViewChild('oilDataGrid', { static: false }) oilDataGrid!: DxDataGridComponent;
  @ViewChild('cheDataGrid', { static: false }) cheDataGrid!: DxDataGridComponent;
  @ViewChild('oilGrid', { static: false }) oilGrid!: DxDataGridComponent;
  @ViewChild('cheGrid', { static: false }) cheGrid!: DxDataGridComponent;
  @ViewChild('oilSubGrid', { static: false }) oilSubGrid!: DxDataGridComponent;
  @ViewChild('carDataCodeEntery', { static: false }) carDataCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('cheCarDataCodeEntery', { static: false }) cheCarDataCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('chkgbox', { static: false }) chkgbox!: DxCheckBoxComponent;
  @ViewChild('chechkgbox', { static: false }) chechkgbox!: DxCheckBoxComponent;
  @ViewChild('detailchkgbox', { static: false }) detailchkgbox!: DxCheckBoxComponent;
  @ViewChild('detailchechkgbox', { static: false }) detailchechkgbox!: DxCheckBoxComponent;
  @ViewChild('masterform', { static: false }) masterform!: DxFormComponent;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  dataLoading: boolean = false;
  enteryLoading: boolean = false;
  private loadePeCount: number = 0;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  /**
   * 데이터 스토어 키
   * */
  dataStoreKey: string = "csso";


  /* Entry  선언 */
  //차량번호
  carDataCode: TableCodeInfo;
  cheCarDataCode: TableCodeInfo;
  carDataValue!: string | null;
  detailcarDataValue!: string | null;
  cheCarDataValue!: string | null;
  detailchecarDataValue!: string | null;

  chemTrp: ChemTRP[];
  //delete
  selectedItemKeys: any[] = [];
  //data
  dataSource: any;


  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  width: any;
  /*날짜*/
  now: any = new Date();
  shipJIsiDate: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);
  //날짜 조회
  startDate: any;
  endDate: any;
  oilStartDate: any;
  oilEndDate: any;
  cheStartDate: any;
  cheEndDate: any;
  detailStartDate: any;
  detailEndDate: any;

  /*-------------------------------------메인화면-------------------------------------*/
  //메인데이터
  mainData: any;
  cheMainData: any;
  //메인화면
  searchButtonOptions: any;
  saveButtonOptions: any;
  //줄 선택
  selectedRowIndex = -1;

  /*-------------------------------------유류----------------------------------------*/
  //유류데이터
  orderGridData: ZSDS6430Model[] = [];
  oilGridData: ZMMS3210Model[] = [];
  oilSubGridData: ZMMS3200Model[] = [];
  oilSubData: any;
  orderData: any;
  oilFormData: any = {};   //유류 메인 폼데이터
  yuchangFormData: any = {};   //유류 메인 폼데이터
  oilSubFormData: any = {};   //유류 메인 폼데이터
  oilPopupVisible = false; //유류 메인 팝업
  //유류출하지시팝업 버튼
  oilPopupSaveButtonOptions: any;
  oilPopupSearchButtonOptions: any;
  oilPopupCloseButtonOptions: any;
  //유류 선택 값
  selectCSpart: string = "30";
  oilDetailPopupVisible = false; //유류 메인 팝업
  oilDetailCloseButtonOptions: any;
  oilDetailFormData: any = {};


  /*----------------------------------------화학---------------------------------------*/
  cheGridData: ZSDS6430Model[] = [];
  cheOrderData: any;
  cheFormData: any = {};   //화학 메인 폼데이터
  chemicalPopupVisible = false;   //화학출하지시팝업
  //화학출하지시팝업 버튼
  chemicalPopupSearchButtonOptions: any;
  chemicalCloseButtonOptions: any;
  chemicalSaveButtonOptions: any;
  //화학 선택 값
  cheSelectCSpart: string = "20";
  cheDetailPopupVisible = false; //화학 메인 팝업
  cheDetailCloseButtonOptions: any;
  cheDetailFormData: any = {};

  /*----------------------------------------차량배차-------------------------------------*/
  choicePopupVisible = false;
  choicePopupCloseButtonOptions: any;
  oldCarPopupVisible = false;
  oldCarPopupCloseButtonOptions: any;
  //차량배차
  carPopupVisible = false;//차량 배차 메인 팝업
  carFormData: any = {};  //차량 배차 메인 폼데이터
  //차량배차 버튼
  carPopupCloseButtonOptions: any;
  carPopupSaveButtonOptions: any;
  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;
  rowCount1: any;
  rowCount2: any;
  rowCount3: any;
  rowCount4: any;
  rowCount5: any;
  rowCount6: any;
  rowCount7: any;
  liqsndLGORT: string;
  //_dataService: ImateDataService;

  //ORACLE 초기화
  utiJisiModel: UtijisifModel[];
  carByModel: CarbynmfModel[];
  chmWkodModel: CHMWkodModel[];
  chulfByModel: UtichulfModel[];
  oilCarModel: OILWkodModel[];
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo,
    private authService: AuthService, private titleService: Title) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출고지시등록";
    this.titleService.setTitle(appInfo.title);

    this.liqsndLGORT = "6000"
    setTimeout(() => {
      this.mainDataLoad();
    }, 100);
    //locale(navigator.language);
    setTimeout(() => {
      this.cheMainDataLoad();
    }, 200);
    //파서블엔트리
    this.carDataCode = appConfig.tableCode("유류차량");
    this.cheCarDataCode = appConfig.tableCode("화학차량");
    this.oilSubGridData = [];
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.carDataCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.cheCarDataCode),

    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    this.carDataValue = "";
    this.detailcarDataValue = "";
    this.cheCarDataValue = "";
    this.detailchecarDataValue = "";

    const that = this;

    //메인 날짜
    var now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    console.log(lastDay);
    this.startDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.oilStartDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.oilEndDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.detailStartDate = formatDate(now.setDate(new Date().getDate() - 365), "yyyy-MM-dd", "en-US");
    this.detailEndDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    this.cheStartDate = formatDate(new Date(now.getFullYear() + 1, now.getMonth(), 1), "yyyy-MM-dd", "en-US");
    this.cheEndDate = formatDate(new Date(now.getFullYear() + 1, now.getMonth(), lastDay), "yyyy-MM-dd", "en-US");
    this.chemTrp = service.getChemTRP();
    //필터
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

    //메인조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.mainDataLoad();
        this.cheMainDataLoad();
      },
    };
    //메인저장버튼
    this.saveButtonOptions = {
      text: '저장',
      onClick: () => {
        this.oilDataGrid.instance.refresh();
        this.cheDataGrid.instance.refresh();
      },
    };


    //유류팝업조회버튼
    this.oilPopupSearchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadingVisible = true;
        await this.dataLoad();
        this.loadingVisible = false;
      },
    };
    //유류팝업저장버튼
    this.oilPopupSaveButtonOptions = {
      text: '저장',
      onClick: async () => {

        if (this.oilFormData.VBELN == undefined || this.oilFormData.VBELN == "") {
          alert("주문 정보를 클릭 후 저장하세요.", "알림")
          return;
        }
        if (this.oilFormData.ZTANK == 0 || this.oilFormData.ZTANK == undefined || this.oilFormData.ZTANK == null) {
          alert("출하탱크를 입력하여주세요.", "알림");
          return;
        }

        if (this.oilSubFormData.ChulHaJaeGo == 0 || this.oilSubFormData.ChulHaJaeGo == undefined || this.oilSubFormData.ChulHaJaeGo == null) {
          alert("재고가 없습니다.", "알림");
          return;
        }

        //차량 체크 로직
        if (this.carFormData.ZMENGE3 == "" || this.carFormData.ZMENGE3 == "0" || this.carFormData.ZMENGE3 == 0 || this.carFormData.ZMENGE3 == undefined) {
          alert("차량 배차 후 저장하세요.", "알림");
          return;
        }

        if (this.oilFormData.ZRFID == undefined || this.oilFormData.ZRFID == "") {
          alert("RFID가 없는 차량입니다.", "알림")
          return;
        }

        //자재 체크 로직
        var insertData = this.oilFormData;
        var resultModel = await this.dataService.SelectModelData<ZCMT0020CustomModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020CustomModelList",
          [this.appConfig.mandt, insertData.MATNR], "", "", QueryCacheType.None);

        if (resultModel.length == 0) {
          alert("SAP에 해당되는 제품이 없습니다", "알림")
          return;
        }

        //지시사항 체크 로직
        var insertText = this.oilFormData.ZTEXT;
        var ztext = encodeURI(insertText).split(/%..|./).length - 1;

        if (ztext > 50) {
          alert("지시사항은 50 자리를 넘을 수 없습니다.", "알림");
          return;
        }

        //저장
        if (await confirm("저장하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          var result = await this.datainsert(this);
          this.loadingVisible = false;
          if (result.E_MTY === "E")
            alert(result.E_MSG, "알림");
          else {
            alert("저장되었습니다.", "알림");
            this.mainDataLoad();
            that.oilPopupVisible = false;
          }
        }
      },
    };
    //유류팝업닫기버튼
    this.oilPopupCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.oilPopupVisible = false;
      }
    }
    //유류팝업닫기버튼
    this.oilDetailCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.oilDetailPopupVisible = false;
      }
    }

    //차량배차 선택 화면
    this.choicePopupCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.choicePopupVisible = false;
      }
    }

    //차량배차팝업저장버튼
    this.carPopupSaveButtonOptions = {
      text: '저장',
      async onClick(e: any) {
        var loadTotal: number = (parseInt(that.carFormData.load1 ?? 0) + parseInt(that.carFormData.load2 ?? 0) + parseInt(that.carFormData.load3 ?? 0) + parseInt(that.carFormData.load4 ?? 0) + parseInt(that.carFormData.load5 ?? 0)
          + parseInt(that.carFormData.load6 ?? 0) + parseInt(that.carFormData.load7 ?? 0) + parseInt(that.carFormData.load8 ?? 0) + parseInt(that.carFormData.load9 ?? 0) + parseInt(that.carFormData.load10 ?? 0))
        if (loadTotal !== parseInt(that.carFormData.ZMENGE3)) {
          if (await confirm("출고량과 적재 수량이 다른데 등록하시겠습니까?", "알림")) {
            alert("등록되었습니다.", "알림");
            that.oilFormData.ZMENGE4 = loadTotal
            that.carPopupVisible = false;
            return;
          } else {
            return;

          }
        } else {
          if (await confirm("저장하시겠습니까?", "알림")) {

            alert("저장되었습니다.", "알림");
            that.carPopupVisible = false;
          }
        }
      }
    }
    //차량배차팝업닫기버튼
    this.carPopupCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.carPopupVisible = false;
      }
    }
    //차량배차 선택 화면
    this.oldCarPopupCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.oldCarPopupVisible = false;
      }
    }


    //화학팝업조회버튼
    this.chemicalPopupSearchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadingVisible = true;
        await this.cheDataLoad();
        this.loadingVisible = false;
      },
    };
    //화학팝업닫기버튼
    this.chemicalCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.chemicalPopupVisible = false;
        that.cheGrid.instance.clearFilter();
      }
    }
    //유류팝업닫기버튼
    this.cheDetailCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.cheDetailPopupVisible = false;
      }
    }
    //화학팝업저장버튼
    this.chemicalSaveButtonOptions = {
      text: '저장',
      onClick: async (e: any) => {
        if (this.cheFormData.VBELN == undefined || this.cheFormData.VBELN == "") {
          alert("주문 정보를 클릭 후 저장하세요.", "알림")
          return;
        }
        if (this.chechkgbox.value == false) {
          if (this.cheFormData.ZRFID == undefined || this.cheFormData.ZRFID == "") {
            alert("RFID가 없는 차량입니다.", "알림")
            return;
          }
        }
        //자재 체크 로직
        var insertData = this.cheFormData;
        var resultModel = await this.dataService.SelectModelData<ZCMT0020CustomModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020CustomModelList",
          [this.appConfig.mandt, insertData.MATNR], "", "", QueryCacheType.None);

        if (resultModel.length == 0) {
          alert("SAP에 해당되는 제품이 없습니다", "알림")
          return;
        }

        //지시사항 체크 로직 현재 적재 용량보다 지시 수량이 큽니다.
        var insertText = this.cheFormData.ZTEXT;
        var ztext = encodeURI(insertText).split(/%..|./).length - 1;

        if (ztext > 50) {
          alert("지시사항은 50 자리를 넘을 수 없습니다.", "알림");
          return;
        }

        if (this.cheFormData.ZMENGE4 > this.cheFormData.JITOTAL) {
          alert("현재 적재 용량보다 지시 수량이 큽니다.", "알림")
          return;
        }

        //저장
        if (await confirm("저장하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          var result = await this.cheDatainsert(this);
          this.loadingVisible = false;
          if (result.E_MTY !== "S")
            alert(result.E_MSG, "알림");
          else {
            alert("저장되었습니다.", "알림");
            this.cheMainDataLoad();
            that.chemicalPopupVisible = false;
          }

        }


      },
    };


    //유류메인화면
    this.mainData = new CustomStore(
      {
        key: ["DONUM", "DODAT", "ZSEQ"],

        load: function (loadOptions) {
          return that.mainDataLoad();
        },
      });
    //화학메인화면
    this.cheMainData = new CustomStore(
      {
        key: ["DONUM", "DODAT", "ZSEQ"],

        load: function (loadOptions) {
          return that.cheMainDataLoad();
        },
      });
  }
  //------------------------------------------------ 메인 데이터 로드 --------------------------------------------//

  //메인화면 로드   //ZSDIFPORTALSAPSHIPPINGInsModel(RFC)
  public async mainDataLoad() {
    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")
    var zsds6901List: ZSDS6901Model[] = [];
    var zsdt6901List: ZSDT6901Model[] = [];

    var oilDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "O", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List, "", "", "");
    var modelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilDataResult];
    this.loadingVisible = true;
    var resultOilModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", modelList, QueryCacheType.None);
    this.loadingVisible = false;
    return resultOilModel[0].ET_DATA;



  }


  //화학메인화면 로드  //ZSDIFPORTALSAPSHIPPINGInsModel(RFC)
  public async cheMainDataLoad() {
    var sdate = formatDate(this.startDate, "yyyy-MM-dd", "en-US")
    var edate = formatDate(this.endDate, "yyyy-MM-dd", "en-US")
    var zsds6901List: ZSDS6901Model[] = [];
    var zsdt6901List: ZSDT6901Model[] = [];

    var oilDataResult = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", "", "C", this.endDate, this.startDate, "D", zsds6901List, zsdt6901List, "", "", "");

    var modelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilDataResult];
    this.loadingVisible = true;
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", modelList, QueryCacheType.None);
    this.loadingVisible = false;
    return resultModel[0].ET_DATA;
  }


  //------------------------------------------------ 팝업 데이터 로드 --------------------------------------------//

  //유류데이터로드  //ZSDIFPORTALSAPLELIQSndModel & ZSDIFPORTALSAPSHIPPINGReqModel (RFC)
  public async dataLoad() {
    this.orderData = [];
    let fixData = { I_ZSHIPSTATUS: "30" };
    var zsds6430: ZSDS6430Model[] = [];
    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", this.liqsndLGORT, "", this.selectCSpart, this.oilStartDate, this.oilEndDate, "", "", "", "X", "", "", "", "", fixData.I_ZSHIPSTATUS, zsds6430);

    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);

    /*this.orderGridData = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C");*/
    this.orderGridData = resultModel[0].IT_DATA;

    var zsdsList: ZSDS6900Model[] = [];
    var zsdtList: ZSDT6900Model[] = [];
    var soilmodel = new ZSDIFPORTALSAPSHIPPINGReqModel("", "", this.endDate, "", "", this.startDate, "D", "", "", zsdsList, zsdtList);
    var modelList: ZSDIFPORTALSAPSHIPPINGReqModel[] = [soilmodel];

    var resultsOilModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGReqModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGReqModelList", modelList, QueryCacheType.None);

    resultsOilModel[0].ET_DATA.forEach(async (row: ZSDS6900Model) => {
      this.orderGridData.push(new ZSDS6430Model(row.VBELN, "000010", "000000000", "", "", "", row.INCO1, "", new Date(), row.MATNR, row.MAKTX, row.ZMENGE, row.ZMENGE, row.MEINS, "", row.ZMENGE,
        0, new Date(), 0, row.MEINS, "", "", row.KUNNR, row.NAME1, row.CITY1, row.STREET, row.TELF1, row.MOBILENO, "", row.NAME2, "", "", "", "", "", row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "",
        "", "", "", new Date(), 0, "", row.ZTEXT, "", "", "", row.S_OILNO));


    });
    this.loadingVisible = true;
    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: this.orderGridData
      });
    this.oilGrid.instance.getScrollable().scrollTo(0);

    this.loadingVisible = false;
  }


  //유류서브데이터로드   //ZMMOILBLGrinfoModel(RFC 조회)
  public async oilSubDataLoad() {
    this.oilSubData = [];
    var selectedData = [];
    selectedData = this.oilGrid.instance.getSelectedRowsData();
    var insertData = this.oilFormData;

    var matnr = selectedData[0].MATNR
    var werks = selectedData[0].WERKS
    var zmms3200: ZMMS3200Model[] = [];
    var zmms9900 = new ZMMS9900Model("", "");
    var gridModel: ZMMS3200Model[] = [];

    var oilBlGr = new ZMMOILBLGrinfoModel(zmms9900, matnr, werks, zmms3200);

    var grModel: ZMMOILBLGrinfoModel[] = [oilBlGr];
    var oilSubModel = await this.dataService.RefcCallUsingModel<ZMMOILBLGrinfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMOILBLGrinfoModelList", grModel, QueryCacheType.None);
    if (oilSubModel[0].ES_RESULT.MTY == "S") {

      if (selectedData[0].S_OILNO === "" || selectedData[0].S_OILNO === undefined) {
        var filterModel = oilSubModel[0].T_DATA.filter(item => item.ZTANK == insertData.ZTANK);

        gridModel = filterModel.filter(item => item.GRTYP !== "S");
      } else {
        var filterModel = oilSubModel[0].T_DATA.filter(item => item.ZTANK == insertData.ZTANK);

        gridModel = filterModel.filter(item => item.GRTYP === "S");
      }
    }
    else if (oilSubModel[0].ES_RESULT.MTY == "E") {
      gridModel = [];
    }


    //gridModel = this.oilSubData._array;
    if (gridModel.length > 0) {
      gridModel.forEach(async (array: any) => {
        if (array.ZGI_RSV_QTY == 0 || array.ZGI_RSV_QTY == undefined || Number.isNaN(array.ZGI_RSV_QTY)) {
          array.ZGI_RSV_QTY = 0
        }
        array.ChulHaJaeGo = parseInt(array.ZSTOCK) - parseInt(array.ZGI_RSV_QTY)
      });

    } else {
      gridModel = [];
    }
    this.oilSubGridData = gridModel

    this.loadingVisible = true;
    this.oilSubData = new ArrayStore(
      {
        key: ["ZARRDT", "ZTANK"],
        data: this.oilSubGridData
      });
    this.oilGrid.instance.getScrollable().scrollTo(0);

    this.loadingVisible = false;


    if (this.oilSubGridData.length == 0) {
      this.oilSubFormData = [];
    } else {

      var model: ZMMS3200Model[] = this.oilSubGridData as ZMMS3200Model[]

      var selectSubGridData = model.find(item => item.MATNR === selectedData[0].MATNR && item.ZSTOCK >= selectedData[0].ZMENGE4)

      if (selectSubGridData !== undefined)
        this.oilSubFormData = selectSubGridData;

      else {
        alert("출하지시수량에 맞는 통관재고가 없습니다.", "알림");
        return;
      }

    }
  }


  //화학데이터로드   // ZSDIFPORTALSAPLELIQSndModel(RFC)
  public async cheDataLoad() {
    this.cheOrderData = [];
    let fixData = { I_ZSHIPSTATUS: "30" };
    var chezsds6430: ZSDS6430Model[] = [];
    var chezsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", "", "", this.cheSelectCSpart, this.cheStartDate, this.cheEndDate, "", "", "4000", "X", "", "", "", "", fixData.I_ZSHIPSTATUS, chezsds6430);

    var model: ZSDIFPORTALSAPLELIQSndModel[] = [chezsdif];

    var cheResultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);

    /*this.cheGridData = cheResultModel[0].IT_DATA.filter(item => item.WBSTK !== "C");*/
    this.cheGridData = cheResultModel[0].IT_DATA;
    this.loadingVisible = true;

    this.cheOrderData = new ArrayStore(
      {
        key: ["VGBEL", "VGPOS"],
        data: this.cheGridData
      });
    this.oilGrid.instance.getScrollable().scrollTo(0);

    this.loadingVisible = false;
  }
  public async cheSubDataLoad() {
    var insertData = this.cheFormData;

    var resultModel = await this.dataService.SelectModelData<ZCMT0020CustomModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020CustomModelList",
      [this.appConfig.mandt, insertData.MATNR], "", "", QueryCacheType.None);
    if (resultModel.length > 0) {
      var resultValue = this.chemTrp.find(item => item.HWAMUL === resultModel[0].ZCM_CODE2)
      this.cheFormData.RACK = resultValue.RACK
      this.cheFormData.PUMP = resultValue.PIPE
      this.cheFormData.ZTANK = resultValue.TANK
    }
  }

  //------------------------------------------------ 데이터 저장 --------------------------------------------//

  // 유류 데이터 저장
  //UtijisifModel(ORACLE)
  //CarbynmfModel(ORACLE)
  //OILWkodModel(ORACLE)
  ///////////////////////////////////////////////////ZSDIFPORTALSAPLELIQRcvModel (RFC) (ZSDT6420)//
  //ZMM_OIL_GIRECV (RFC) (ZMMT3063)
  //ZSDIFPORTALSAPSHIPPINGInsModel (RFC) (ZSDT6901)
  //UtichulfModel(ORACLE)
  public async datainsert(thisObj: CSSOComponent) {
    try {
      let now = formatDate(new Date(), 'yyyyMMdd', "en-US");
      let minDate = new Date("0001-01-01");
      let minTime = formatDate(new Date("0001-01-01"), "HHmmss", "en-US");
      let oilCVDate = new Date();
      let oilCVTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
      let oilNowDate = new Date();
      let oilNowTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
      let chulNowDate = formatDate(new Date(), "yyyyMMdd", "en-US");
      let chulNowTIme = formatDate(new Date(), "HHmmss", "en-US");

      //ORACLE 유류
      //유류정보
      var oilSelectResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
        `JIYYMM = '${parseInt(now)}' `, "JISEQ DESC", QueryCacheType.None);
      //지시순번
      if (oilSelectResult.length > 0) {
        var jiseq = oilSelectResult[0].JISEQ + 1
      } else {
        var jiseq = 1;
      }
      //배차정보
      var carSelectResult = await this.dataService.SelectModelData<CarbynmfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CarbynmfModelList", [],
        `BYILJA = '${parseInt(now)}' `, "BYSEQ DESC", QueryCacheType.None);
      //배차순번
      if (carSelectResult.length > 0) {
        var byseq = carSelectResult[0].BYSEQ + 1
      } else {
        var byseq = 1;
      }
      var insertData = thisObj.oilFormData;
      var insertSubData = thisObj.oilSubFormData;
      if (insertData.RACK == undefined || insertData.RACK == null) {
        insertData.RACK = ""
      }
      if (insertData.PUMP == undefined || insertData.PUMP == null) {
        insertData.PUMP = ""
      }
      var istData: string = insertData.ZTEXT
      var resultModel = await this.dataService.SelectModelData<ZCMT0020CustomModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020CustomModelList",
        [this.appConfig.mandt, insertData.MATNR], "", "", QueryCacheType.None);

      var jijangb = "";
      //통관재고 잔량처리
      var value = this.chkgbox.value;
      if (value == true) {
        jijangb = "Y"

      } else {
        jijangb = ""
      }
      //잔량처리가 체크 되면 2들은 복사
      if (jijangb == "Y") {
        var phang2 = insertSubData.ZARRDT
        var bonsun2 = "1"
        var hwaju2 = "0000520"
        var hwamul2 = resultModel[0].ZCM_CODE2
        var blno2 = insertSubData.ZIIPNO
        var custil2 = insertSubData.ZIPWDT ?? minDate;
        var chasu2 = 1
      } else {
        phang2 = 0
        bonsun2 = ""
        hwaju2 = ""
        hwamul2 = ""
        blno2 = ""
        custil2 = 0
        chasu2 = 0
      }
      let arrdt = formatDate(new Date(insertSubData.ZARRDT), 'yyyyMMdd', "en-US");
      var formatARRDT = parseInt(arrdt)
      let pwdt = formatDate(new Date(insertSubData.ZIPWDT ?? minDate), 'yyyyMMdd', "en-US");
      var formatIPWDT = parseInt(pwdt)
      //RFID 없이 저장 후 RF카드 테스트 임시로직 insertData.jisija 뒤 RFID
      var oilInsertData = new UtijisifModel(parseInt(now), jiseq, formatARRDT, "1", "0000520", resultModel[0].ZCM_CODE2, insertSubData.ZIIPNO, "0000520", formatIPWDT, 1, "0000520", "", "",
        "0000520", insertData.gubun, insertData.ZTANK, "", "1", "1", "1", insertData.ZMENGE4, insertData.ZCARNO, "", insertData.jisija, "", insertData.RACK.padStart(2, '0'), insertData.PUMP, "", istData, 0, 0, 0, 0, jijangb,
        phang2, bonsun2, hwaju2, hwamul2, blno2, custil2, chasu2, parseInt(now), byseq, "", 0, "", 0, "", "", parseInt(chulNowDate), parseInt(chulNowTIme), "", "Y", "N", "", "", "", DIMModelStatus.Add);

      var oilModelList: UtijisifModel[] = [oilInsertData];


      // CarbynmfModel
      var carData = thisObj.carFormData;
      var BYJISI1 = now + byseq.toString().padStart(3, '0');
      var BYJISI2 = now + byseq.toString().padStart(3, '0');
      var BYJISI3 = now + byseq.toString().padStart(3, '0');
      var BYJISI4 = now + byseq.toString().padStart(3, '0');
      var BYJISI5 = now + byseq.toString().padStart(3, '0');
      var BYJISI6 = now + byseq.toString().padStart(3, '0');
      var BYJISI7 = now + byseq.toString().padStart(3, '0');
      var BYJISI8 = now + byseq.toString().padStart(3, '0');
      var BYJISI9 = now + byseq.toString().padStart(3, '0');
      var BYJISI10 = now + byseq.toString().padStart(3, '0');
      var num1 = 1;
      var num2 = 2;
      var num3 = 3;
      var num4 = 4;
      var num5 = 5;
      var num6 = 6;
      var num7 = 7;
      var num8 = 8;
      var num9 = 9;
      var num10 = 10;
      var doCode1 = "999";
      var doCode2 = "999";
      var doCode3 = "999";
      var doCode4 = "999";
      var doCode5 = "999";
      var doCode6 = "999";
      var doCode7 = "999";
      var doCode8 = "999";
      var doCode9 = "999";
      var doCode10 = "999";
      var doName1 = "포탈도착지";
      var doName2 = "포탈도착지";
      var doName3 = "포탈도착지";
      var doName4 = "포탈도착지";
      var doName5 = "포탈도착지";
      var doName6 = "포탈도착지";
      var doName7 = "포탈도착지";
      var doName8 = "포탈도착지";
      var doName9 = "포탈도착지";
      var doName10 = "포탈도착지";

      if (carData.ZTANKLITER1 === 0) {
        carData.load1 = 0
      } if (carData.ZTANKLITER2 === 0) {
        carData.load2 = 0
      } if (carData.ZTANKLITER3 === 0) {
        carData.load3 = 0
      } if (carData.ZTANKLITER4 === 0) {
        carData.load4 = 0
      } if (carData.ZTANKLITER5 === 0) {
        carData.load5 = 0
      } if (carData.ZTANKLITER6 === 0) {
        carData.load6 = 0
      } if (carData.ZTANKLITER7 === 0) {
        carData.load7 = 0
      } if (carData.ZTANKLITER8 === 0) {
        carData.load8 = 0
      } if (carData.ZTANKLITER9 === 0) {
        carData.load9 = 0
      } if (carData.ZTANKLITER10 === 0) {
        carData.load10 = 0
      }
      // 도착지
      if (carData.load1 === 0 || carData.load1 === undefined || carData.load1 === null) {
        carData.ZTANKLITER1 = 0
        num1 = 0
        BYJISI1 = ""
        doCode1 = "";
        doName1 = "";
      } if (carData.load2 === 0 || carData.load2 === undefined || carData.load2 === null) {
        carData.ZTANKLITER2 = 0
        num2 = 0
        BYJISI2 = ""
        doCode2 = "";
        doName2 = "";
      } if (carData.load3 === 0 || carData.load3 === undefined || carData.load3 === null) {
        carData.ZTANKLITER3 = 0
        num3 = 0
        BYJISI3 = ""
        doCode3 = "";
        doName3 = "";
      } if (carData.load4 === 0 || carData.load4 === undefined || carData.load4 === null) {
        carData.ZTANKLITER4 = 0
        num4 = 0
        BYJISI4 = ""
        doCode4 = "";
        doName4 = "";
      } if (carData.load5 === 0 || carData.load5 === undefined || carData.load5 === null) {
        carData.ZTANKLITER5 = 0
        num5 = 0
        BYJISI5 = ""
        doCode5 = "";
        doName5 = "";
      } if (carData.load6 === 0 || carData.load6 === undefined || carData.load6 === null) {
        carData.ZTANKLITER6 = 0
        num6 = 0
        BYJISI6 = ""
        doCode6 = "";
        doName6 = "";
      } if (carData.load7 === 0 || carData.load7 === undefined || carData.load7 === null) {
        carData.ZTANKLITER7 = 0
        num7 = 0
        BYJISI7 = ""
        doCode7 = "";
        doName7 = "";
      } if (carData.load8 === 0 || carData.load8 === undefined || carData.load8 === null) {
        carData.ZTANKLITER8 = 0
        num8 = 0
        BYJISI8 = ""
        doCode8 = "";
        doName8 = "";
      } if (carData.load9 === 0 || carData.load9 === undefined || carData.load9 === null) {
        carData.ZTANKLITER9 = 0
        num9 = 0
        BYJISI9 = ""
        doCode9 = "";
        doName9 = "";
      } if (carData.load10 === 0 || carData.load10 === undefined || carData.load10 === null) {
        carData.ZTANKLITER10 = 0
        num10 = 0
        BYJISI10 = ""
        doCode10 = "";
        doName10 = "";
      }
      var carInsertData = new CarbynmfModel(parseInt(now), byseq, insertData.ZCARNO, insertData.CHJANG, "1", carData.ZMENGE3, 1, 0, 0, 0, insertData.ZRFID, resultModel[0].ZCM_CODE2, insertData.ARKTX, insertData.ZTANK, insertData.RACK.padStart(2, '0'), insertData.PUMP,
        num1, carData.ZTANKLITER1, carData.load1, 0, BYJISI1, 0, 0, "", "", doCode1, doName1,
        num2, carData.ZTANKLITER2, carData.load2, 0, BYJISI2, 0, 0, "", "", doCode2, doName2,
        num3, carData.ZTANKLITER3, carData.load3, 0, BYJISI3, 0, 0, "", "", doCode3, doName3,
        num4, carData.ZTANKLITER4, carData.load4, 0, BYJISI4, 0, 0, "", "", doCode4, doName4,
        num5, carData.ZTANKLITER5, carData.load5, 0, BYJISI5, 0, 0, "", "", doCode5, doName5,
        num6, carData.ZTANKLITER6, carData.load6, 0, BYJISI6, 0, 0, "", "", doCode6, doName6,
        num7, carData.ZTANKLITER7, carData.load7, 0, BYJISI7, 0, 0, "", "", doCode7, doName7,
        num8, carData.ZTANKLITER8, carData.load8, 0, BYJISI8, 0, 0, "", "", doCode8, doName8,
        num9, carData.ZTANKLITER9, carData.load9, 0, BYJISI9, 0, 0, "", "", doCode9, doName9,
        num10, carData.ZTANKLITER10, carData.load10, 0, BYJISI10, 0, 0, "", "", doCode10, doName10,
        "R", "A", parseInt(chulNowDate), parseInt(chulNowTIme), "25685", 0, formatARRDT, "WS2", "0000520");
      carInsertData.ModelStatus = DIMModelStatus.Add;

      var carModelList: CarbynmfModel[] = [carInsertData];

      // OILWkodModel
      var oilCarInsertData = new OILWkodModel(parseInt(now), byseq, insertData.ZCARNO, insertData.CHJANG, "1", carData.ZMENGE3, 1, 0, 0, 0, insertData.ZRFID, resultModel[0].ZCM_CODE2, insertData.ARKTX, insertData.ZTANK, insertData.RACK.padStart(2, '0'), insertData.PUMP,
        num1, carData.ZTANKLITER1, carData.load1, 0, BYJISI1, 0, 0, "", "", doCode1, doName1,
        num2, carData.ZTANKLITER2, carData.load2, 0, BYJISI2, 0, 0, "", "", doCode2, doName2,
        num3, carData.ZTANKLITER3, carData.load3, 0, BYJISI3, 0, 0, "", "", doCode3, doName3,
        num4, carData.ZTANKLITER4, carData.load4, 0, BYJISI4, 0, 0, "", "", doCode4, doName4,
        num5, carData.ZTANKLITER5, carData.load5, 0, BYJISI5, 0, 0, "", "", doCode5, doName5,
        num6, carData.ZTANKLITER6, carData.load6, 0, BYJISI6, 0, 0, "", "", doCode6, doName6,
        num7, carData.ZTANKLITER7, carData.load7, 0, BYJISI7, 0, 0, "", "", doCode7, doName7,
        num8, carData.ZTANKLITER8, carData.load8, 0, BYJISI8, 0, 0, "", "", doCode8, doName8,
        num9, carData.ZTANKLITER9, carData.load9, 0, BYJISI9, 0, 0, "", "", doCode9, doName9,
        num10, carData.ZTANKLITER10, carData.load10, 0, BYJISI10, 0, 0, "", "", doCode10, doName10,
        "R", "A", parseInt(chulNowDate), parseInt(chulNowTIme), "25685");
      oilCarInsertData.ModelStatus = DIMModelStatus.Add;

      var oilCarModelList: OILWkodModel[] = [oilCarInsertData];

      //ZMMOILGirecvModel
      var selectedData = this.oilGrid.instance.getSelectedRowsData();
      var werks = selectedData[0].WERKS
      var zmms9900 = new ZMMS9900Model("", "");

      if (insertData.S_OILNO == "" || insertData.S_OILNO == undefined) {
        var giGubun = "1"
      } else {
        var giGubun = "2"
      }


      this.oilSubGridData = this.oilSubData._array;
      const sorted_list = this.oilSubGridData.sort(function (a, b) {
        return new Date(a.ZARRDT).getTime() - new Date(b.ZARRDT).getTime();
      });

      //var zmms3210Model = new ZMMS3210Model("R", giGubun, insertData.VBELN, insertData.POSNR, insertSubData.MATNR, insertSubData.ZTANK, insertSubData.ZIIPNO, insertSubData.BUDAT,
      //  insertSubData.GRTYP, "R", "", insertData.ZMENGE2, insertData.ZMENGE4, insertData.ZMENGE3, 0, oilNowDate, oilCVTIme, minDate, minTime, "", minDate, minTime, DIMModelStatus.Add);
      //var zmms3210ModelList: ZMMS3210Model[] = [zmms3210Model];

      var zmms3210ModelList: ZMMS3210Model[] = [];
      var jaego = insertData.ZMENGE4

      sorted_list.forEach(async (array: any) => {
        //var resultModel = await this.dataService.SelectModelData<ZCMT0020CustomModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020CustomModelList",
        //  [this.appConfig.mandt, array.MATNR], "", "", QueryCacheType.None);
        //if (array.MATNR == resultModel[0].ZCMF03_CH) {
        //  array.MATNR = resultModel[0].ZCMF01_CH
        //}
        if (jaego > 0 && jaego > array.ChulHaJaeGo) {
          zmms3210ModelList.push(new ZMMS3210Model("R", giGubun, insertData.VBELN, insertData.POSNR, array.MATNR, array.ZTANK, array.ZIIPNO, array.BUDAT, array.GRTYP, "R", "",
            insertData.ZMENGE2, array.ChulHaJaeGo, 0, 0, oilNowDate, oilCVTIme, minDate, minTime, "", minDate, minTime, DIMModelStatus.Add));
          jaego = jaego - array.ChulHaJaeGo

        } else if (jaego > 0 && jaego < array.ChulHaJaeGo) {
          zmms3210ModelList.push(new ZMMS3210Model("R", giGubun, insertData.VBELN, insertData.POSNR, array.MATNR, array.ZTANK, array.ZIIPNO, array.BUDAT, array.GRTYP, "R", "",
            insertData.ZMENGE2, jaego, 0, 0, oilNowDate, oilCVTIme, minDate, minTime, "", minDate, minTime, DIMModelStatus.Add));
          jaego = jaego - array.ChulHaJaeGo

        }
      });
      var oilSub = new ZMMOILGirecvModel(zmms9900, "R", werks, zmms3210ModelList);
      var oilSubModelList: ZMMOILGirecvModel[] = [oilSub];
      console.log(oilSubModelList)


      //ZSDIFPORTALSAPSHIPPINGInsModel
      var doNum = now + jiseq.toString().padStart(3, '0');

      if (insertData.S_OILNO == undefined) {
        var sOilNo = ""
        var oilDType = "O"
      } else {
        sOilNo = insertData.S_OILNO;
        oilDType = "S"
      }
      var chulfSelectResult = await this.dataService.SelectModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", [],
        `CHYYMM = '${parseInt(now)}' `, "CHSEQ DESC", QueryCacheType.None);
      //지시순번
      if (chulfSelectResult.length > 0) {
        var chseq = chulfSelectResult[0].CHSEQ + 1
      } else {
        var chseq = 1;
      }

      var zsds6901 = new ZSDS6901Model("", "", 0, new Date(), "", "", "", "", "", "", "", "", "", "", 0, "", "", "", "", "", "", "", new Date(), new Date(), "", "", "", 0, new Date(), "", 0, "");


      var zsdt6901 = new ZSDT6901Model(thisObj.appConfig.mandt, doNum, now, jiseq, insertData.OrderDate, insertData.KUNNR, insertData.MATNR, insertData.ZCARNO, insertData.ZDRIVER,
        "R", insertData.ZMENGE4, insertData.VRKME ?? "", oilDType, BYJISI1, insertData.VBELN, insertData.POSNR, sOilNo, insertSubData.ZARRDT ?? minDate, insertSubData.ZIPWDT ?? minDate, insertSubData.ZTANK ?? ""
        , insertSubData.ZIIPNO ?? "", insertData.TDDAT ?? minDate, now, chseq, insertData.ZPHONE, this.appConfig.interfaceId, oilNowDate, oilNowTIme, this.appConfig.interfaceId, oilNowDate, oilNowTIme, DIMModelStatus.Add);


      var zsds6901List: ZSDS6901Model[] = [zsds6901];
      var zsdt6901List: ZSDT6901Model[] = [zsdt6901];
      var oilRFCData = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", doNum, "O", new Date(), new Date(), "I", zsds6901List, zsdt6901List);

      var oilRFCModelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilRFCData];




      var chulfInsertData = new UtichulfModel(parseInt(now), chseq, 0, "1", "0000520", resultModel[0].ZCM_CODE2, insertSubData.ZIIPNO, "", 0, 0, "0000520", "", insertData.ZTANK, "", "",
        "1", "1", insertData.ZMENGE4, 0, 0, 0, 0, 0, 0, 0, "", "", "1", 0, 0,
        0, insertData.ZCARNO, "", insertData.jisija, "", insertData.ZRFID, insertData.RACK.padStart(2, '0'), insertData.PUMP, "", 0, 0, "", parseInt(now), jiseq, 0,
        0, 0, 0, "N", "A", parseInt(chulNowDate), parseInt(chulNowTIme), "", "", 0, parseInt(now), "N", DIMModelStatus.Add);

      var chulfModelList: UtichulfModel[] = [chulfInsertData];
      this.rowCount1 = await this.dataService.RefcCallUsingModel<ZMMOILGirecvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMOILGirecvModelList", oilSubModelList, QueryCacheType.None);
      var resultOilModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", oilRFCModelList, QueryCacheType.None);
      if (resultOilModel[0].E_MTY === "S") {
        this.rowCount3 = await this.dataService.ModifyModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", oilModelList);
        this.rowCount4 = await this.dataService.ModifyModelData<CarbynmfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CarbynmfModelList", carModelList);
        this.rowCount5 = await this.dataService.ModifyModelData<OILWkodModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.OILWkodModelList", oilCarModelList);
        this.rowCount6 = await this.dataService.ModifyModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", chulfModelList);
        this.masterform.instance.resetValues();
      }

      return resultOilModel[0];

    }
    catch (error) {
      alert("error", "알림");
      return null;

    }
  }


  // 화학 데이터 저장  //UtijisifModel(ORACLE)  //CHMWkodModel(ORACLE) //ZSDIFPORTALSAPSHIPPINGInsModel(RFC) //UtichulfModel(ORACLE)
  public async cheDatainsert(thisObj: CSSOComponent) {
    try {
      let now = formatDate(new Date(), 'yyyyMMdd', "en-US");
      let minDate = new Date("0001-01-01");
      let minTime = formatDate(new Date("0001-01-01"), "HHmmss", "en-US");
      let chulNowDate = formatDate(new Date(), "yyyyMMdd", "en-US");
      let chulNowTIme = formatDate(new Date(), "HHmmss", "en-US");


      //UtijisifModel
      var cheJisiSelectResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
        `JIYYMM = '${parseInt(now)}' `, "JISEQ DESC", QueryCacheType.None);
      //지시순번
      if (cheJisiSelectResult.length > 0) {
        var jiseq = cheJisiSelectResult[0].JISEQ + 1
      } else {
        var jiseq = 1;
      }

      var insertData = thisObj.cheFormData;

      var istData: string = insertData.ZTEXT
      var resultModel = await this.dataService.SelectModelData<ZCMT0020CustomModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020CustomModelList",
        [this.appConfig.mandt, insertData.MATNR], "", "", QueryCacheType.None);

      //통관재고 잔량처리
      var value = this.chechkgbox.value;
      var jijangb = ""
      if (value == true) {
        jijangb = "T"
      } else {
        jijangb = "R"
      }
      if (insertData.RACK == undefined || insertData.RACK == null) {
        insertData.RACK = ""
      }
      if (insertData.PUMP == undefined || insertData.PUMP == null) {
        insertData.PUMP = ""
      }

      var CheJisiInsertData = new UtijisifModel(parseInt(now), jiseq, 0, "1", "0000520", resultModel[0].ZCM_CODE2, "", "0000520", 0, 0, "0000520", "", "",
        "0000520", insertData.gubun, insertData.ZTANK, "", "2", "1", "2", insertData.ZMENGE4, insertData.ZCARNO, "", insertData.jisija, insertData.ZRFID, insertData.RACK.padStart(2, '0'), insertData.PUMP, "", istData, 0, 0, 0, 0, "",
        0, "", "", "", "", 0, 0, 0, 0, "", 0, "", 0, "1", "A", parseInt(chulNowDate), parseInt(chulNowTIme), "", jijangb, "N", "", "", "", DIMModelStatus.Add);

      var CheJisiModelList: UtijisifModel[] = [CheJisiInsertData];


      //UtichulfModel
      var chulfSelectResult = await this.dataService.SelectModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", [],
        `CHYYMM = '${parseInt(now)}' `, "CHSEQ DESC", QueryCacheType.None);
      //지시순번
      if (chulfSelectResult.length > 0) {
        var chseq = chulfSelectResult[0].CHSEQ + 1
      } else {
        var chseq = 1;
      }

      //CHMWkodModel
      var insertData = thisObj.cheFormData;

      var cheInsertData = new CHMWkodModel(parseInt(now), jiseq, 0, "1", "0000520", resultModel[0].ZCM_CODE2, "", "0000520", 0, 0, "0000520", "", "",
        "0000520", insertData.gubun, insertData.ZTANK, "", "2", "1", "2", insertData.ZMENGE4, insertData.ZCARNO, "", insertData.jisija, insertData.ZRFID, insertData.RACK.padStart(2, '0'), insertData.PUMP, "", istData, 0, 0, 0, 0, "",
        0, "", "", "", "", 0, 0, 0, 0, "", 0, "", 0, "1", "A", parseInt(chulNowDate), parseInt(chulNowTIme), "", jijangb, 0, 0, "", "", insertData.JISANET, insertData.JIEMPTY, insertData.JITOTAL, "", "", "", DIMModelStatus.Add);

      var cheModelList: CHMWkodModel[] = [cheInsertData];



      //UtichulfModel
      var chulfInsertData = new UtichulfModel(parseInt(now), chseq, 0, "1", "0000520", resultModel[0].ZCM_CODE2, "", "0000520", 0, 0, "0000520", "", insertData.ZTANK, "", "",
        "2", "1", insertData.ZMENGE4, 0, 0, 0, 0, 0, 0, 0, "", "", "2", 0, 0,
        0, insertData.ZCARNO, "", insertData.jisija, "", insertData.ZRFID, insertData.RACK.padStart(2, '0'), insertData.PUMP, "", 0, 0, "", parseInt(now), jiseq, 0,
        0, 0, 0, "", "A", parseInt(chulNowDate), parseInt(chulNowTIme), "", jijangb, 0, "", "N", DIMModelStatus.Add);

      var chulfModelList: UtichulfModel[] = [chulfInsertData];


      //ZSDIFPORTALSAPSHIPPINGInsModel
      var doNum = now + jiseq.toString().padStart(3, '0');
      let cheNowDate = new Date();
      let cheNowTIme = formatDate(new Date(), "HH:mm:ss", "en-US");

      var zsds6901 = new ZSDS6901Model("", "", 0, new Date(), "", "", "", "", "", "", "", "", "", "", 0, "", "", "", "", "", "", "", new Date(), new Date(), "", "", "", 0, new Date(), "", 0, "");

      var zsdt6901 = new ZSDT6901Model(thisObj.appConfig.mandt, doNum, now, jiseq, insertData.OrderDate, insertData.KUNNR, insertData.MATNR, insertData.ZCARNO, insertData.ZDRIVER,
        "R", insertData.ZMENGE4, insertData.VRKME, "C", "", insertData.VBELN, insertData.POSNR, "", minDate, minDate, "", "", insertData.TDDAT, now, chseq, insertData.ZPHONE,
        this.appConfig.interfaceId, cheNowDate, cheNowTIme, this.appConfig.interfaceId, cheNowDate, cheNowTIme, DIMModelStatus.Add);


      var zsds6901List: ZSDS6901Model[] = [zsds6901];
      var zsdt6901List: ZSDT6901Model[] = [zsdt6901];

      var cheRFCData = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", doNum, "C", new Date(), new Date(), "I", zsds6901List, zsdt6901List);

      var cheRFCModelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [cheRFCData];

      var resultINGModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", cheRFCModelList, QueryCacheType.None);
      if (resultINGModel[0].E_MTY === "S") {
        this.rowCount2 = await this.dataService.ModifyModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", CheJisiModelList);
        this.rowCount3 = await this.dataService.ModifyModelData<CHMWkodModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CHMWkodModelList", cheModelList);
        this.rowCount4 = await this.dataService.ModifyModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", chulfModelList);
      }

      return resultINGModel[0];
    }
    catch (error) {
      alert("error", "알림");
      return null;

    }
  }
  public async yuchangDataLoad() {
    var selectData: ZSDS6901Model[] = this.oilDataGrid.instance.getSelectedRowsData();
    var jisiilja = selectData[0].DONUM.substring(0, 8);
    var jisiseq = selectData[0].DONUM.substring(9, 11);
    var jisiDataResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
      ` JIYYMM = '${parseInt(jisiilja)}' AND JISEQ = '${parseInt(jisiseq)}'`, "", QueryCacheType.None);

    var byilja = jisiDataResult[0].JIBCNO1
    var byseq = jisiDataResult[0].JIBCNO2
    var oilDataResult = await this.dataService.SelectModelData<CarbynmfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CarbynmfModelList", [],
      ` BYILJA = '${byilja}' AND BYSEQ = '${byseq}'`, "", QueryCacheType.None);


    this.yuchangFormData = oilDataResult[0];
    this.yuchangFormData.BYSTTIME01 = (oilDataResult[0].BYSTTIME01 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYSTTIME02 = (oilDataResult[0].BYSTTIME02 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYSTTIME03 = (oilDataResult[0].BYSTTIME03 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYSTTIME04 = (oilDataResult[0].BYSTTIME04 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYSTTIME05 = (oilDataResult[0].BYSTTIME05 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYSTTIME06 = (oilDataResult[0].BYSTTIME06 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYSTTIME07 = (oilDataResult[0].BYSTTIME07 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYSTTIME08 = (oilDataResult[0].BYSTTIME08 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYSTTIME09 = (oilDataResult[0].BYSTTIME09 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYSTTIME10 = (oilDataResult[0].BYSTTIME10 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME01 = (oilDataResult[0].BYENTIME01 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME02 = (oilDataResult[0].BYENTIME02 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME03 = (oilDataResult[0].BYENTIME03 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME04 = (oilDataResult[0].BYENTIME04 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME05 = (oilDataResult[0].BYENTIME05 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME06 = (oilDataResult[0].BYENTIME06 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME07 = (oilDataResult[0].BYENTIME07 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME08 = (oilDataResult[0].BYENTIME08 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME09 = (oilDataResult[0].BYENTIME09 ?? "000000").toString().padEnd(6, '0');
    this.yuchangFormData.BYENTIME10 = (oilDataResult[0].BYENTIME10 ?? "000000").toString().padEnd(6, '0');
  }


  //------------------------------------------------ 데이터 삭제 --------------------------------------------//
  //유류 삭제버튼
  deleteRecords() {
    this.selectedItemKeys.forEach(async (key: any) => {
      if (await confirm("삭제하시겠습니까?", "알림")) {
        var result = await this.deleteData();
        if (result.E_MTY !== "")
          await alert("삭제되었습니다.", "알림");
        else
          await alert(result.E_MSG, "오류");
      }
    });
    this.refreshDataGrid(event);
    this.oilDataGrid.instance.refresh();
    this.saveButtonOptions
  }
  // 유류 데이터 삭제  //UtijisifModel(ORACLE)  //CarbynmfModel(ORACLE) //OILWkodModel(ORACLE) //ZSDIFPORTALSAPLELIQRcvModel(RFC)  //ZMM_OIL_GIRECV(RFC) //ZSDIFPORTALSAPSHIPPINGInsModel(RFC)
  public async deleteData() {
    var insResult: ZSDIFPORTALSAPSHIPPINGInsModel[] = [];

    try {
      var selectData = this.oilDataGrid.instance.getSelectedRowsData();
      //UtijisifModel
      var jisiDeleteResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
        `JIYYMM = '${selectData[0].DODAT}' AND JISEQ = '${selectData[0].ZSEQ}'`, "", QueryCacheType.None);
      this.utiJisiModel = jisiDeleteResult;
      this.utiJisiModel.forEach((array: any) => {
        array.ModelStatus = DIMModelStatus.Delete;
      })

      //CarbynmfModel
      var carDeleteResult = await this.dataService.SelectModelData<CarbynmfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CarbynmfModelList", [],
        `BYILJA = '${selectData[0].BACHDAT}' AND BYSEQ = '${selectData[0].BACHSEQ}'`, "", QueryCacheType.None);
      this.carByModel = carDeleteResult;
      this.carByModel.forEach((array: any) => {
        array.ModelStatus = DIMModelStatus.Delete;
      })

      //OILWkodModel
      var oilCarDeleteResult = await this.dataService.SelectModelData<OILWkodModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.OILWkodModelList", [],
        `BYILJA = '${selectData[0].BACHDAT}' AND BYSEQ = '${selectData[0].BACHSEQ}'`, "", QueryCacheType.None);
      this.oilCarModel = oilCarDeleteResult;
      this.oilCarModel.forEach((array: any) => {
        array.ModelStatus = DIMModelStatus.Delete;
      })

      //ZMM_OIL_GIRECV
      var deleteData: ZSDS6901Model[] = this.oilDataGrid.instance.getSelectedRowsData();
      let minDate = new Date("0001-01-01");
      let minTime = formatDate(new Date("0001-01-01"), "HHmmss", "en-US");
      let oilCVTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
      let oilNowDate = new Date();
      var oilGireCVDeleteResult = await this.dataService.SelectModelData<ZMMT3063Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT3063ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND ZVBELN = '${deleteData[0].VBELN}' AND ZPOSNR = '${deleteData[0].POSNR}'AND MATNR = '${deleteData[0].MATNR}' AND ZTANK = '${deleteData[0].ZTANK}' `, "", QueryCacheType.None);
      console.log(oilGireCVDeleteResult)

      var zmms9900 = new ZMMS9900Model("", "");
      var zmms3210Model: ZMMS3210Model[] = [];

      oilGireCVDeleteResult.forEach(async (array: any) => {
        zmms3210Model.push(new ZMMS3210Model("B", array.GI_GUBUN, array.ZVBELN, array.ZPOSNR, array.MATNR, array.ZTANK, array.ZIIPNO,
          array.BUDAT, array.GRTYP, "B", "", array.ZGI_REQ_QTY, 0, 0, 0, oilNowDate, oilCVTIme, minDate, minTime, "", minDate, minTime, DIMModelStatus.Add));
      });
      var oilSub = new ZMMOILGirecvModel(zmms9900, "B", this.appConfig.plant, zmms3210Model);
      var oilSubModelList: ZMMOILGirecvModel[] = [oilSub];
      console.log(zmms3210Model)
      //ZSDIFPORTALSAPSHIPPINGInsModel
      var zsds6901List: ZSDS6901Model[] = [];
      var zsdt6901List: ZSDT6901Model[] = [];
      var oilRFCData = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", selectData[0].DONUM, "O", new Date(), new Date(), "C", zsds6901List, zsdt6901List);
      var oilDeleteModelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilRFCData];

      console.log(oilDeleteModelList)


      insResult = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", oilDeleteModelList, QueryCacheType.None);
      if (insResult[0].E_MTY !== "E") {
        var chulfDeleteResult = await this.dataService.SelectModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", [],
          `CHYYMM = '${selectData[0].CHDAT}' AND CHSEQ = '${selectData[0].CHSEQ}'`, "", QueryCacheType.None);
        this.chulfByModel = chulfDeleteResult;
        this.chulfByModel.forEach((array: any) => {
          array.ModelStatus = DIMModelStatus.Delete;
        })
        this.rowCount1 = await this.dataService.RefcCallUsingModel<ZMMOILGirecvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMOILGirecvModelList", oilSubModelList, QueryCacheType.None);
        /*this.rowCount2 = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", oilDeleteModelList, QueryCacheType.None);*/
        this.rowCount3 = await this.dataService.ModifyModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", this.utiJisiModel);
        this.rowCount4 = await this.dataService.ModifyModelData<CarbynmfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CarbynmfModelList", this.carByModel);
        this.rowCount5 = await this.dataService.ModifyModelData<OILWkodModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.OILWkodModelList", this.oilCarModel);
        this.rowCount6 = await this.dataService.ModifyModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", this.chulfByModel);
      }


      this.oilDataGrid.instance.refresh();

      return insResult[0];
    } catch (error) {
      insResult[0].E_MTY = "E";
      insResult[0].E_MSG = error.toString();
      return insResult[0];
    }
  }
  //화학 삭제버튼
  cheDeleteRecords() {
    this.selectedItemKeys.forEach(async (key: any) => {
      if (await confirm("삭제하시겠습니까?", "알림")) {
        var result = await this.cheDeleteData();
        if (result.E_MTY !== "E")
          await alert("삭제되었습니다.", "알림");
        else
          await alert(result.E_MSG, "오류");
      }

    });
    this.refreshDataGrid(event);
    this.cheDataGrid.instance.refresh();
    this.saveButtonOptions
  }
  // 화학 데이터 삭제  //UtijisifModel(ORACLE)  //CHMWkodModel(ORACLE) //ZSDIFPORTALSAPSHIPPINGInsModel(RFC)
  public async cheDeleteData() {
    var insResult: ZSDIFPORTALSAPSHIPPINGInsModel[] = [];

    try {
      var selectData = this.cheDataGrid.instance.getSelectedRowsData();

      //UtijisifModel
      var jisiDeleteResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
        `JIYYMM = '${selectData[0].DODAT}' AND JISEQ = '${selectData[0].ZSEQ}'`, "", QueryCacheType.None);
      this.utiJisiModel = jisiDeleteResult;
      this.utiJisiModel.forEach((array: any) => {
        array.ModelStatus = DIMModelStatus.Delete;
      })

      //CHMWkodModel
      var chmwDeleteResult = await this.dataService.SelectModelData<CHMWkodModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CHMWkodModelList", [],
        `JIYYMM = '${selectData[0].DODAT}' AND JISEQ = '${selectData[0].ZSEQ}'`, "", QueryCacheType.None);
      this.chmWkodModel = chmwDeleteResult;
      this.chmWkodModel.forEach((array: any) => {
        array.ModelStatus = DIMModelStatus.Delete;
      })

      //ZSDIFPORTALSAPSHIPPINGInsModel
      var zsds6901List: ZSDS6901Model[] = [];
      var zsdt6901List: ZSDT6901Model[] = [];
      var oilRFCData = new ZSDIFPORTALSAPSHIPPINGInsModel("", "", selectData[0].DONUM, "C", new Date(), new Date(), "C", zsds6901List, zsdt6901List);
      var oilDeleteModelList: ZSDIFPORTALSAPSHIPPINGInsModel[] = [oilRFCData];

      insResult = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", oilDeleteModelList, QueryCacheType.None);
      if (insResult[0].E_MTY !== "E") {
        var chulfDeleteResult = await this.dataService.SelectModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", [],
          `CHYYMM = '${selectData[0].CHDAT}' AND CHSEQ = '${selectData[0].CHSEQ}'`, "", QueryCacheType.None);
        this.chulfByModel = chulfDeleteResult;
        this.chulfByModel.forEach((array: any) => {
          array.ModelStatus = DIMModelStatus.Delete;
        })
        /*this.rowCount1 = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGInsModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGInsModelList", oilDeleteModelList, QueryCacheType.None);*/
        this.rowCount2 = await this.dataService.ModifyModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", this.utiJisiModel);
        this.rowCount3 = await this.dataService.ModifyModelData<CHMWkodModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.CHMWkodModelList", this.chmWkodModel);
        this.rowCount4 = await this.dataService.ModifyModelData<UtichulfModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtichulfModelList", this.chulfByModel);
      }

      this.cheDataGrid.instance.refresh();

      return insResult[0];
    } catch (error) {
      insResult[0].E_MTY = "E";
      insResult[0].E_MSG = error.toString();
      return insResult[0];
    }
  }
  //------------------------------------------------ 팝업 오픈 --------------------------------------------//

  //유류출고지시등록
  oilReleasRegis() {
    this.loadingVisible = true;
    this.oilPopupVisible = true;
    this.dataLoad();
    this.loadingVisible = false;
    this.loadingVisible = true;
    this.oilSubData = [];
    this.oilFormData = {};
    this.oilSubFormData = {};
    this.carDataCodeEntery.ClearSelectedValue();
    this.oilFormData.ZDRIVER = "";
    this.loadingVisible = false;
  };
  //화학출고지시등록
  chemicalReleasRegis() {
    this.loadingVisible = true;
    this.chemicalPopupVisible = true;
    this.cheDataLoad();
    this.cheFormData = {};
    this.cheCarDataCodeEntery.ClearSelectedValue();

    this.loadingVisible = false;

  };


  //------------------------------------------------ 차량 배차 --------------------------------------------//
  //차량 배차 선택
  carChoice() {
    this.choicePopupVisible = true;
  }

  //차량 신규 배차
  carNewAllocation: any = async () => {

    if (this.oilFormData.ZCARNO == "" || this.oilFormData.ZCARNO == undefined) {
      alert("차량번호를 클릭후 배차하세요.", "알림");
      return;
    }

    this.choicePopupVisible = false;
    //var zcarno = this.carDataValue
    var zcarno = this.carDataCodeEntery.selectedItemData.ZCARNO;
    var selectResultData = await this.dataService.SelectModelData<ZSDT7020Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7020ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND ZCARNO = '${zcarno}' `, "", QueryCacheType.None);
    console.log(selectResultData)
    this.carFormData = selectResultData[0];
    this.carFormData.ZMENGE3 = this.oilFormData.ZMENGE4

    //// 몫 구하기 = 출고량 / (차량 총 용량 / 유창 개수)
    //var result = Math.trunc(this.carFormData.ZMENGE3 / (this.carFormData.ZLITER / this.carFormData.ZCARTANK));
    //// 나머지 구하기 = 출고량 / (차량 총 용량 / 유창 개수)
    //var remainder = this.carFormData.ZMENGE3 % (this.carFormData.ZLITER / this.carFormData.ZCARTANK)
    //for (var i = 1; i <= result; i++) {
    //  const name = "load" + i;
    //  //적재에 몫 숫자만큼 나눈 값 넣어주기
    //  Object.assign(this.carFormData, { [name]: (this.carFormData.ZLITER / this.carFormData.ZCARTANK) });
    //}
    // //적재에 나머지 넣어주기
    //const name = "load" + (result + 1);
    //Object.assign(this.carFormData, { [name]: remainder });


    //출고량
    var total = this.carFormData.ZMENGE3;
    for (var i = 1; i <= this.carFormData.ZCARTANK; i++) {
      const name = "load" + i;      //적재필드명
      const key = "ZTANKLITER" + i; //유창필드명

      //출고량을 가지고 유창의 용량만큼 빼주면서 값이 양수일때는 유창의 용량으로 적재하면서 출고량에서 적재량 빼주기
      //음수라면 현재 total의 출고량이 마지막 용량이므로 total값을 넣어준다.
      if ((total - this.carFormData[key]) > 0) {
        this.carFormData[name] = this.carFormData[key];
        total = total - this.carFormData[key];
      }
      else {

        console.log(total);
        this.carFormData[name] = total;
        total = 0;
      }
    }

    this.carPopupVisible = true; if (this.carFormData.ZLITER < this.carFormData.ZMENGE3) {
      setTimeout(() => {
        notify("차량 총 용량보다 출고량이 클 수 없습니다.  출하 지시 물량을 다시 입력해주세요.", "error", 5000)
        this.carPopupVisible = false;

      }, 1000);
    } else {
      setTimeout(() => {
        notify("적용되었습니다.", "info", 3000)
      }, 1000);
    }
  };


  //차량 합적 배차
  public async carOldAllocation() {
    this.oldCarPopupVisible = true;
  }


  //배분적용
  allocationApply: any = async () => {
    if (this.carFormData.ZMENGE3 == "" || this.carFormData.ZMENGE3 == undefined) {
      alert("출고량을 입력해주세요.", "알림");
      return;
    }
    if (this.carFormData.ZLITER < this.carFormData.ZMENGE3) {
      alert("총 용량보다 출고량이 클 수 없습니다.", "알림");
      return;
    } else {
      //출고량
      var total = this.carFormData.ZMENGE3;
      for (var i = 1; i <= this.carFormData.ZCARTANK; i++) {
        const name = "load" + i;      //적재필드명
        const key = "ZTANKLITER" + i; //유창필드명

        //출고량을 가지고 유창의 용량만큼 빼주면서 값이 양수일때는 유창의 용량으로 적재하면서 출고량에서 적재량 빼주기
        //음수라면 현재 total의 출고량이 마지막 용량이므로 total값을 넣어준다.
        if ((total - this.carFormData[key]) > 0) {
          this.carFormData[name] = this.carFormData[key];
          total = total - this.carFormData[key];
        }
        else {

          console.log(total);
          this.carFormData[name] = total;
          total = 0;
        }
      }
      notify("적용되었습니다.", "info", 3000)
    }

  };


  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.oilDataGrid.instance.refresh();
    this.cheDataGrid.instance.refresh();
  }

  //------------------------------------------------ 클릭 이벤트 --------------------------------------------//

  //유류 sub
  onFocusedRowChanging(e: any) {
    const rowsCount = e.component.getVisibleRows().length;
    const pageCount = e.component.pageCount();
    const pageIndex = e.component.pageIndex();
    const key = e.event && e.event.key;

    if (key && e.prevRowIndex === e.newRowIndex) {
      if (e.newRowIndex === rowsCount - 1 && pageIndex < pageCount - 1) {
        e.component.pageIndex(pageIndex + 1).done(() => {
          e.component.option('focusedRowIndex', 0);
        });
      } else if (e.newRowIndex === 0 && pageIndex > 0) {
        e.component.pageIndex(pageIndex - 1).done(() => {
          e.component.option('focusedRowIndex', rowsCount - 1);
        });
      }
    }
  }
  onFocusedRowChanged(e: any) {
    const rowData = e.row && e.row.data;

    if (rowData) {
      this.oilSubFormData = rowData;
    }
  }
  oilSubselectionChanged(e: any) {
    setTimeout(() => {
      const rowData = e.selectedRowsData[0];

      if (rowData) {
        this.oilSubFormData = rowData;
      }
    }, 100);
  }

  //유류
  orderFocusedRowChanging(e: any) {
    const rowsCount = e.component.getVisibleRows().length;
    const pageCount = e.component.pageCount();
    const pageIndex = e.component.pageIndex();
    const key = e.event && e.event.key;
    if (key && e.prevRowIndex === e.newRowIndex) {
      if (e.newRowIndex === rowsCount - 1 && pageIndex < pageCount - 1) {
        e.component.pageIndex(pageIndex + 1).done(() => {
          e.component.option('focusedRowIndex', 0);
        });
      } else if (e.newRowIndex === 0 && pageIndex > 0) {
        e.component.pageIndex(pageIndex - 1).done(() => {
          e.component.option('focusedRowIndex', rowsCount - 1);
        });
      }
    }
  }
  orderFocusedRowChanged(e: any) {
    setTimeout(() => {
    });
  }
  selectionChanged: any = async (e: any) => {
    const rowData = e.selectedRowsData[0];
    setTimeout(() => {

      if (rowData) {
        this.oilSubDataLoad();
        var zcarKey = "";
        this.carDataValue = zcarKey.concat(rowData.ZCARNO, rowData.ZDRIVER);
        this.oilFormData = rowData;
        var carData = this.carDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === this.carDataValue)
        if (carData !== undefined) {

          Object.assign(this.oilFormData, { ZDRIVER: carData.ZDERIVER1, ZPHONE: carData.ZPHONE1, ZRFID: carData.ZRFID });
        }
        Object.assign(this.oilFormData, { CHJANG: "1", OrderDate: new Date(), jisija: "30189", gubun: "1" });
      }
    }, 500);
  }

  //화학
  cheFocusedRowChanging(e: any) {
    const rowsCount = e.component.getVisibleRows().length;
    const pageCount = e.component.pageCount();
    const pageIndex = e.component.pageIndex();
    const key = e.event && e.event.key;

    if (key && e.prevRowIndex === e.newRowIndex) {
      if (e.newRowIndex === rowsCount - 1 && pageIndex < pageCount - 1) {
        e.component.pageIndex(pageIndex + 1).done(() => {
          e.component.option('focusedRowIndex', 0);
        });
      } else if (e.newRowIndex === 0 && pageIndex > 0) {
        e.component.pageIndex(pageIndex - 1).done(() => {
          e.component.option('focusedRowIndex', rowsCount - 1);
        });
      }
    }
  }
  cheselectionChanged(e: any) {
    const rowData = e.selectedRowsData[0];
    setTimeout(() => {
      if (rowData) {
        var zcarKey = "";
        this.cheCarDataValue = zcarKey.concat(rowData.ZCARNO, rowData.ZDRIVER);
        this.cheFormData = rowData;
        var carData = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === this.cheCarDataValue)
        if (carData !== undefined) {

          Object.assign(this.cheFormData, { ZDRIVER: carData.ZDERIVER1, ZPHONE: carData.ZPHONE1, ZRFID: carData.ZRFID, JITOTAL: carData.ZCARTON, JIEMPTY: carData.ZWEIGHT1 });
        }
        Object.assign(this.cheFormData, { CHJANG: "1", OrderDate: new Date(), jisija: "30189", gubun: "1" });

      }
    }, 500);
  }


  //유류삭제
  oilDeleteselectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }
  //유류삭제
  cheDeleteselectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }
  /* Entry Data Form에 바인딩 */
  //분할 차량번호 선택이벤트
  onZcarNoCodeValueChanged(e: any) {
    setTimeout(() => {
      if (e.selectedItem !== null) {
        this.oilFormData.ZCARNO = this.carDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZCARNO;
        this.oilFormData.ZDRIVER = this.carDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZDERIVER1;
        this.oilFormData.ZPHONE = this.carDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZPHONE1;
        this.oilFormData.ZRFID = this.carDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZRFID;

        return;
      }
    });
  }
  onDetailZcarNoCodeValueChanged(e: any) {
    setTimeout(() => {
      this.oilDetailFormData.ZCARNO = this.carDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZCARNO;
      this.oilDetailFormData.ZDRIVER = this.carDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZDERIVER1;
      this.oilDetailFormData.ZPHONE = this.carDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZPHONE1;
      this.oilDetailFormData.ZRFID = this.carDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZRFID;

      return;
    });
  }
  onCheZcarNoCodeValueChanged(e: any) {
    setTimeout(() => {
      if (e.selectedItem !== null) {

        this.cheFormData.ZCARNO = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZCARNO;
        this.cheFormData.ZDRIVER = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZDERIVER1;
        this.cheFormData.ZPHONE = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZPHONE1;
        this.cheFormData.ZRFID = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZRFID;
        this.cheFormData.JITOTAL = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZCARTON;
        this.cheFormData.JIEMPTY = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.COMBINEKEY === e.selectedValue)?.ZWEIGHT1;

        return;
      }
    }, 100);
  }
  onDetailCheZcarNoCodeValueChanged(e: any) {
    setTimeout(() => {
      if (e.selectedItem !== null) {

        this.cheDetailFormData.ZCARNO = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZCARNO;
        this.cheDetailFormData.ZDRIVER = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZDERIVER1;
        this.cheDetailFormData.ZPHONE = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZPHONE1;
        this.cheDetailFormData.ZRFID = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZRFID;
        this.cheDetailFormData.JITOTAL = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZCARTON;
        this.cheDetailFormData.JIEMPTY = this.cheCarDataCodeEntery.gridDataSource._array.find(item => item.ZCARNO === e.selectedValue)?.ZWEIGHT1;

        return;
      }
    }, 100);
  }
  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */

  async DataChanged(e: any) {
    if (e.dataField === "ZTANK") {
      this.oilSubDataLoad();
    }
  }
  async cheDataChanged(e: any) {
    if (e.dataField === "ARKTX") {
      this.cheSubDataLoad();
    }
    if (e.dataField === "RACK") {
      if (this.cheFormData.RACK == "05" || this.cheFormData.RACK == "5" || this.cheFormData.RACK == 5) {
        this.chechkgbox.value = true;
      } else {
        this.chechkgbox.value = false;
      }
    }

    if (e.dataField === "ZMENGE4") {
      if (this.cheFormData.ZMENGE4 > this.cheFormData.JITOTAL) {
        this.cheFormData.ZMENGE4 = this.cheFormData.JITOTAL
      }
    }
    if (e.dataField === "JITOTAL") {
      if (this.cheFormData.ZMENGE4 > this.cheFormData.JITOTAL) {
        this.cheFormData.ZMENGE4 = this.cheFormData.JITOTAL
      }
    }
  }
  async carDataChanged(e: any) {
    this.carFormData.ZMENGE3 = (parseInt(this.carFormData.load1 ?? 0) + parseInt(this.carFormData.load2 ?? 0) + parseInt(this.carFormData.load3 ?? 0) + parseInt(this.carFormData.load4 ?? 0) + parseInt(this.carFormData.load5 ?? 0)
      + parseInt(this.carFormData.load6 ?? 0) + parseInt(this.carFormData.load7 ?? 0) + parseInt(this.carFormData.load8 ?? 0) + parseInt(this.carFormData.load9 ?? 0) + parseInt(this.carFormData.load10 ?? 0))


  }


  //메인데이터 더블클릭 이벤트
  async oilMainDBClick(e: any) {

    this.orderData = [];
    this.loadingVisible = true;

    var selectData: ZSDS6901Model[] = this.oilDataGrid.instance.getSelectedRowsData();
    var zsds6430: ZSDS6430Model[] = [];
    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", this.liqsndLGORT, "", this.selectCSpart, this.detailStartDate, this.detailEndDate, selectData[0].VBELN, "", "", "", "", "", "", "", "", zsds6430);
    console.log(zsdif)

    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);

    /*this.orderGridData = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C");*/
    this.orderGridData = resultModel[0].IT_DATA;

    var zsdsList: ZSDS6900Model[] = [];
    var zsdtList: ZSDT6900Model[] = [];
    var soilmodel = new ZSDIFPORTALSAPSHIPPINGReqModel("", "", this.endDate, "", "", this.startDate, "D", "", "", zsdsList, zsdtList);
    var modelList: ZSDIFPORTALSAPSHIPPINGReqModel[] = [soilmodel];

    var resultsOilModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSHIPPINGReqModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSHIPPINGReqModelList", modelList, QueryCacheType.None);

    resultsOilModel[0].ET_DATA.forEach(async (row: ZSDS6900Model) => {
      this.orderGridData.push(new ZSDS6430Model(row.VBELN, "000010", "000000000", "", "", "", row.INCO1, "", new Date(), row.MATNR, row.MAKTX, row.ZMENGE, row.ZMENGE, row.MEINS, "", row.ZMENGE,
        0, new Date(), 0, row.MEINS, "", "", row.KUNNR, row.NAME1, row.CITY1, row.STREET, row.TELF1, row.MOBILENO, "", row.NAME2, "", "", "", "", "", row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "",
        "", "", "", new Date(), 0, "", row.ZTEXT, "", "", "", row.S_OILNO));


    });
    setTimeout(async (
    ) => {
      console.log(this.orderGridData)
      if (this.orderGridData.length > 0) {
        Object.assign(this.oilDetailFormData, {
          OrderDate: selectData[0].INDAT ?? "", ARKTX: this.orderGridData[0].ARKTX ?? "", NAME1: this.orderGridData[0].NAME1 ?? "", VBELN: this.orderGridData[0].VBELN ?? "",
          TDDAT: this.orderGridData[0].TDDAT ?? "", S_OILNO: this.orderGridData[0].S_OILNO ?? "", ZMENGE4: selectData[0].JISIMENGE ?? "", GEWEI: this.orderGridData[0].GEWEI ?? "",
          VRKME: this.orderGridData[0].VRKME ?? "", CITY: this.orderGridData[0].CITY ?? "", VSBED: this.orderGridData[0].VSBED ?? "", NAME1_AG: this.orderGridData[0].NAME1_AG ?? "",
        });
      } else {
        alert("해당 데이터가 없습니다.", "알림");
        this.loadingVisible = false;
        return;

      }
      var zcarKey = "";
      this.detailcarDataValue = zcarKey.concat(selectData[0].ZCARNO, selectData[0].ZDRIVER);
      var jisiResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
        `JIYYMM = '${selectData[0].DODAT}' AND JISEQ = '${selectData[0].ZSEQ}'`, "", QueryCacheType.None);

      Object.assign(this.oilDetailFormData, {
        CHJANG: jisiResult[0].JICHJANG, jisija: jisiResult[0].JIJISAB, gubun: jisiResult[0].JIPMGB, RACK: jisiResult[0].JIRACK, PUMP: jisiResult[0].JIPUMP,
        ZTANK: jisiResult[0].JITANKNO, ZTEXT: jisiResult[0].JIBIGO
      });
      if (jisiResult[0].JIJANGB == "Y") {
        this.detailchkgbox.value = true;
      }
      this.yuchangDataLoad();
      this.oilDetailPopupVisible = true;
      this.loadingVisible = false;
    }, 100);
  }


  //메인데이터 더블클릭 이벤트
  async cheMainDBClick(e: any) {
    this.loadingVisible = true;
    var selectData: ZSDS6901Model[] = this.cheDataGrid.instance.getSelectedRowsData();
    this.cheOrderData = [];
    var chezsds6430: ZSDS6430Model[] = [];
    var chezsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", "", "", this.cheSelectCSpart, this.detailStartDate, this.detailEndDate, selectData[0].VBELN, "", "4000", "", "", "", "", "", "", chezsds6430);

    var model: ZSDIFPORTALSAPLELIQSndModel[] = [chezsdif];

    var cheResultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);

    this.cheGridData = cheResultModel[0].IT_DATA;
    setTimeout(async (
    ) => {
      console.log(this.cheGridData)

      Object.assign(this.cheDetailFormData, {
        OrderDate: selectData[0].INDAT ?? "", ARKTX: this.cheGridData[0].ARKTX ?? "", NAME1: this.cheGridData[0].NAME1 ?? "", VBELN: this.cheGridData[0].VBELN ?? "",
        TDDAT: this.cheGridData[0].TDDAT ?? "", S_OILNO: this.cheGridData[0].S_OILNO ?? "", ZMENGE4: selectData[0].JISIMENGE ?? "", GEWEI: this.cheGridData[0].GEWEI ?? "",
        VRKME: this.cheGridData[0].VRKME ?? "", CITY: this.cheGridData[0].CITY ?? "", VSBED: this.cheGridData[0].VSBED ?? "", NAME1_AG: this.cheGridData[0].NAME1_AG ?? "",
      });

      var zcarKey = "";
      this.detailchecarDataValue = zcarKey.concat(selectData[0].ZCARNO, selectData[0].ZDRIVER);
      var jisiResult = await this.dataService.SelectModelData<UtijisifModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UtijisifModelList", [],
        `JIYYMM = '${selectData[0].DODAT}' AND JISEQ = '${selectData[0].ZSEQ}'`, "", QueryCacheType.None);

      Object.assign(this.cheDetailFormData, {
        CHJANG: jisiResult[0].JICHJANG, jisija: jisiResult[0].JIJISAB, gubun: jisiResult[0].JIPMGB, RACK: jisiResult[0].JIRACK, PUMP: jisiResult[0].JIPUMP,
        ZTANK: jisiResult[0].JITANKNO, ZTEXT: jisiResult[0].JIBIGO
      });
      if (jisiResult[0].JISTATUS == "T") {
        this.detailchechkgbox.value = true;
      }
      this.cheDetailPopupVisible = true;
      this.loadingVisible = false;
    }, 100);
  }
}
