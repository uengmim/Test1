import { formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
    DxDataGridComponent, DxFormComponent,
    DxPopupComponent
} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import 'devextreme/data/odata/store';
import { confirm, alert } from "devextreme/ui/dialog";
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { ZSDCREATESODoModel, ZSDS3100Model, ZSDS6001Model, ZSDS6002Model } from '../../../shared/dataModel/MFSAP/ZsdCreateSodoProxy';
import { ZSDEPSOENTRYInfoModel, ZSDS3013Model, ZSDS3014Model } from '../../../shared/dataModel/MFSAP/ZSdEpSoEntryInfoProxy';
import { ZSDEPSOListModel, ZSDS5000Model, ZSDS5001Model } from '../../../shared/dataModel/MFSAP/ZSdEpSoListProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { AuthService } from '../../../shared/services';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { Service } from './app.service';

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
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('sd007Entery1', { static: false }) sd007Entery1!: CommonPossibleEntryComponent;
  @ViewChild('sd007Entery2', { static: false }) sd007Entery2!: CommonPossibleEntryComponent;
  @ViewChild('maEntery', { static: false }) maEntery!: TablePossibleEntryComponent;
  @ViewChild('kunnrEntery', { static: false }) kunnrEntery!: TablePossibleEntryComponent;
  @ViewChild('kunnrEntery2', { static: false }) kunnrEntery2!: TablePossibleEntryComponent;
  @ViewChild('kunnrEntery3', { static: false }) kunnrEntery3!: TablePossibleEntryComponent;
  @ViewChild('maktEntery', { static: false }) maktEntery!: TablePossibleEntryComponent;
  @ViewChild('maktEntery2', { static: false }) maktEntery2!: TablePossibleEntryComponent;
  @ViewChild('kunnEntery', { static: false }) kunnEntery!: TablePossibleEntryComponent;
  @ViewChild('tvlvEntery', { static: false }) tvlvEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tEntery', { static: false }) dd07tEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnr1Entery', { static: false }) tdlnr1Entery!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr2Entery', { static: false }) tdlnr2Entery!: CommonPossibleEntryComponent;
  @ViewChild('t001Entery', { static: false }) t001Entery!: CommonPossibleEntryComponent;
  @ViewChild('incoEntery', { static: false }) incoEntery!: CommonPossibleEntryComponent;
  
  callbacks = [];

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  popupLoading: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;

  private loadePeCount: number = 0;

  /**
   * 데이터 스토어 키
   * */
  dataStoreKey: string = "cord";

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
  tdlnrCode: CommonCodeInfo;
  //출고사업장
  t001Code: CommonCodeInfo;
  //운송방법
  inco1Code: CommonCodeInfo;

  /*Entery value 선언*/
  kunnrValue : string | null;
  kunnrValue2 : string | null;
  maktValue: string | null;
  auartValue: string | null;
  zunloadValue: string | null;
  incoValue: string | null;
  lgortValue: string | null;
  tdlnrValue: string | null;
  tdlnrValue2: string | null;
  zcarValue: string | null;



  //delete
  selectedItemKeys: any[] = [];

  //거래처
  clients: string[];
  //정보
  orderData: any;

  //날짜 조회
  startDate: any;
  endDate: any;

  //로딩패널 처리를 위한 변수
  dataLoading: boolean = false;
  enteryLoading: boolean = false;


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

  orderDataRow: any;

  incoFilter: any = ["ZCM_CODE2", "<>", "NH"];


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
  //데이터 참조추가 버튼
  RefaddButtonOptions: any;

  loadPanelOption: any;

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
  

  //필터
  saleAmountHeaderFilter: any;
  customOperations: Array<any>;

  editFlag = false;
  saveVisible = true;
  popupVisible = false;
  //_dataService: ImateDataService;
  capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);


  //값 체크
  kunnAdapter = {
    getValue: () => {
      return this.kunnEntery.selectedValue;
    },
    applyValidationResults: (e: any) => {
      this.kunnEntery.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };

  kunnrAdapter = {
    getValue: () => {
      return this.kunnrEntery.selectedValue;
    },
    applyValidationResults: (e: any) => {
      this.kunnrEntery.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };

  maktAdapter = {
    getValue: () => {
      return this.maktEntery2.selectedValue;
    },
    applyValidationResults: (e: any) => {
      this.maktEntery2.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };

  sd007Adapter = {
    getValue: () => {
      return this.sd007Entery2.selectedValue;
    },
    applyValidationResults: (e: any) => {
      this.sd007Entery2.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };

  t001Adapter = {
    getValue: () => {
      return this.t001Entery.selectedValue;
    },
    applyValidationResults: (e: any) => {
      this.t001Entery.validationStatus = e.isValid ? "valid" : "invalid"
    },
    validationRequestsCallbacks: this.callbacks
  };

  kukAdapter = {
    getValue: () => {
      //return this.t001Entery.selectedValue;
    },
    applyValidationResults: (e: any) => {
      if (this.popupData.KWMENG > 0) {
        e.isValid = "vaild";
      }
      else {
        e.isValid = "invalid";
      }
    },
    validationRequestsCallbacks: this.callbacks
  };

  validateNumber(e : any) {
    return e.value > 0;
  }



  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService : AuthService) {


    appInfo.title = AppInfoService.APP_TITLE + " | 고객주문처리(액상)";


    this.sd007Code = appConfig.commonCode("액상주문구분");
    this.maCode = appConfig.tableCode("액상제품구분");
    this.maktCode = appConfig.tableCode("액상제품명");
    this.kunnCode = appConfig.tableCode("액상납품처");
    this.tvlvCode = appConfig.tableCode("용도구분");
    this.dd07tCode = appConfig.tableCode("하차정보");
    this.dd07tCarCode = appConfig.tableCode("화물차종");
    this.tdlnrCode = appConfig.commonCode("운송사");
    this.t001Code = appConfig.commonCode("액상출고사업장");
    this.inco1Code = appConfig.commonCode("액상운송방법");

    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.sd007Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maktCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tvlvCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.t001Code),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.inco1Code)
    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------

   
    this.kunnrValue = "";
    this.kunnrValue2 = "";
    this.maktValue = "";
    this.auartValue = "";
    this.zunloadValue = "";
    this.incoValue = "";
    this.lgortValue = "";
    this.tdlnrValue = "";
    this.tdlnrValue2 = "";
    this.zcarValue = "";
    
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

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    

    //거래처
    this.clients = service.getclient();
    //정보


    //데이터 로딩 패널 보이기
    this.loadingVisible = true;

    this.loadPanelOption = { enabled: false };
    
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


    /*화면에 사용되는 버튼정의*/

    //조회버튼
    this.searchButtonOptions = {
      icon: 'search',
      onClick: async () => {
        this.loadPanelOption = { enabled: true };
        this.dataLoad();
      },
    };

    //닫기버튼
    this.closeButtonOptions = {
      icon: 'close',
      onClick: async () => {
        this.popupVisible = false;
        this.clearEntery();
      }
    }

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
      onClick: async (e :any) => {

        let valid = e.validationGroup.validate();
        if (!valid.isValid) {
          alert("필수값을 입력하여 주십시오.","알림");
        }
        this.popupLoading = true;
        var result = await this.createOrder();
        this.popupLoading = false;
        
        if (result.E_TYPESO === "E") {
          alert(`주문등록 실패,\n\n오류 메세지: ${result.E_MESSAGESO}`,"알림");
          return;
        } else if (result.E_TYPEDO === "E") {
          alert(`주문등록 실패,\n\n오류 메세지: ${result.E_MESSAGEDO}`,"알림");
          return;
        } else {
          alert("주문등록완료", "알림");
          this.popupVisible = false;
          this.loadingVisible = true;
          this.dataLoad();
        }
        
      },
    };
  }

  /**
 * 화면 종료
 * */
  ngOnDestroy(): void {
    PossibleEntryDataStoreManager.removeDataStore(this.dataStoreKey);
  }

  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };

  orderDBClick(e: any) {
    this.popupTitle = "주문조회";
    this.infoDataLoad("search");
    this.editFlag = true;
    //저장버튼 여부
    this.saveVisible = false;
    this.popupVisible = !this.popupVisible;
  }
  
  /* Entry Data Form에 바인딩 */

  onKunnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.KUNNR = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 고객번호)
      this.popupLoading = true;
      this.detailDataLoad();
    });
  }
  onKunweCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.KUNWE = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 납품처)
      this.popupLoading = true;
      this.detailDataLoad();
    });
  }
  onMatnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.MATNR = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 자재)
      this.popupLoading = true;
      this.detailDataLoad();
    });
  }
  onAuartCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.AUART = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 주문유형)
      this.popupLoading = true;
      this.detailDataLoad();
    });
  }
  onTvlvCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.VKAUS = e.selectedValue;
    });
  }
  onZunloadCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.ZUNLOAD = e.selectedValue;
    });
  }
  onLgortCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.LGORT = e.selectedValue;
      //변경시 마다 RFC 2번 조회 (파라미터 중 저장위치)
      this.popupLoading = true;
      this.detailDataLoad();
    });
  }
  onTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.TDLNR = e.selectedValue;
    });
  }
  onTdlnr2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.TDLNR2 = e.selectedValue;
    });
  }
  onZcartypeCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.ZCARTYPE = e.selectedValue;
    });
  }
  onIncoCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popupData.INCO1 = e.selectedValue;
    });
  }




  //고객주문리스트 조회 RFC
  public async dataLoad() {
    this.dataLoading = false;
    //고객번호 부분 대체 필요함
    var zps5000Model = new ZSDS5000Model("", "", this.startDate, this.endDate, "20", this.sd007Entery1.selectedValue ? this.sd007Entery1.selectedValue : "", this.maEntery.selectedValue ? this.maEntery.selectedValue : "", this.maktEntery.selectedValue ? this.maktEntery.selectedValue : "");
    var modelList: ZSDS5001Model[] = [];
    var zpsModel = new ZSDEPSOListModel(zps5000Model, modelList);

    var zps500List: ZSDEPSOListModel[] = [zpsModel];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOListModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOListModelList", zps500List, QueryCacheType.Cached);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "MATNR"],
        data: resultModel[0].E_RETURN
      });

    this.dataLoading = true;

    if (this.dataLoading == true && this.enteryLoading == true) {
      this.loadingVisible = false;
    }
    
  }

  //고객주문 정보 조회 RFC 
  public async infoDataLoad(flag: string) {

    var selectData = this.dataGrid.instance.getSelectedRowsData();
    //참조추가는 고객번호가 지워져야함
    var sendData = new ZSDS5001Model("", selectData[0].MATNR, selectData[0].MAKTX, selectData[0].MATKL, selectData[0].MATKL_N, selectData[0].MVGR1, selectData[0].MVGR2, selectData[0].MVGR3, selectData[0].MVGR1_N,
                                     selectData[0].MVGR2_N, selectData[0].MVGR3_N, selectData[0].ZZPACK, selectData[0].ZZPACK_N, selectData[0].AUART, selectData[0].AUART_N, selectData[0].VKAUS, selectData[0].VKAUS_N,
                                     selectData[0].KUNNR, selectData[0].KUNNR_N, selectData[0].KUNWE, selectData[0].KUNWE_N, selectData[0].TAXK1, selectData[0].TAXK1_N, selectData[0].INCO1, selectData[0].INCO1_N, selectData[0].KWMENG,
                                     selectData[0].VRKME, selectData[0].NETPR, selectData[0].NETWR, selectData[0].WAERK, selectData[0].DONUMBER, selectData[0].GIQTY, selectData[0].VDATU, selectData[0].LGORT, selectData[0].LGORT_N,
                                     selectData[0].TDLNR, selectData[0].TDLNR_N, selectData[0].TDLNR2, selectData[0].TDLNR2_N, selectData[0].ZCARTYPE, selectData[0].ZCARTYPE_N, selectData[0].ZCARNO, selectData[0].ZDRIVER,
                                     selectData[0].ZPHONE, selectData[0].ERDAT, selectData[0].ZUNLOAD, selectData[0].ZUNLOAD_N, selectData[0].ZEXID, selectData[0].ZEXIDNAME, selectData[0].DOLOG, selectData[0].TEXT);

    var zsd3013Model = new ZSDS3013Model(selectData[0].KUNNR, selectData[0].KUNWE, "20", selectData[0].MATNR, selectData[0].AUART, selectData[0].LGORT);
    var zsd3014Model = new ZSDS3014Model("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0, 0, 0, "", 0, "", "");


    var zsdModel = new ZSDEPSOENTRYInfoModel(zsd3014Model ,zsd3013Model);
    var zsdList: ZSDEPSOENTRYInfoModel[] = [zsdModel];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOENTRYInfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOENTRYInfoModelList", zsdList, QueryCacheType.None);

    if (flag == "add") {
      this.popupData = Object.assign(sendData, resultModel[0].E_RETURN);
    } else {
      this.popupData = Object.assign(selectData[0], resultModel[0].E_RETURN);
    }


    this.kunnrValue = sendData.KUNWE;
    this.kunnrValue2 = sendData.KUNNR;
    this.maktValue = sendData.MATNR;
    this.auartValue = sendData.AUART;
    this.zunloadValue = sendData.ZUNLOAD;
    this.incoValue = sendData.INCO1;
    this.lgortValue = sendData.LGORT;
    this.tdlnrValue = sendData.TDLNR;
    this.tdlnrValue2 = sendData.TDLNR2;
    this.zcarValue = sendData.ZCARTYPE;

  }

  //고객주문 정보 조회 RFC
  public async detailDataLoad() {
    var selectData = this.popupData;

    var zsd3013Model = new ZSDS3013Model(selectData.KUNNR, selectData.KUNWE, "20", selectData.MATNR, selectData.AUART, selectData.LGORT);
    var zsd3014Model = new ZSDS3014Model("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 0, 0, 0, "", 0, "", "");


    var zsdModel = new ZSDEPSOENTRYInfoModel(zsd3014Model, zsd3013Model);
    var zsdList: ZSDEPSOENTRYInfoModel[] = [zsdModel];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDEPSOENTRYInfoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDEPSOENTRYInfoModelList", zsdList, QueryCacheType.None);

    var allData = Object.assign(selectData, resultModel[0].E_RETURN);
    this.popupData = allData;

    this.popupLoading = false;
  }

  // 주문생성
  public async createOrder() {
    var data = this.popupData;
    let fixData = { VKORG: "1000", VTWEG: "10", SPART: "20", ZLOGFLG: "X", ZDOFLG: "", POSNR: "10", WERKS: "1000" };
    let userInfo = this.authService.getUser().data; // 나중에 고객번호 가져올때 사용(업무포탈도)

    var zsds3100Model = new ZSDS3100Model(data.AUART, fixData.VKORG, fixData.VTWEG, fixData.SPART,"", "", "", data.VDATU, new Date, data.KUNNR, "", data.KUNWE, data.TDLNR, data.TDLNR2, data.INCO1, "", "", "", "", "", "", data.ZCARTYPE, data.ZCARNO, data.ZDRIVER, data.ZPHONE, data.ZUNLOAD, fixData.ZLOGFLG, fixData.ZDOFLG, "", "", "", "");
    var zsds6001Model = new ZSDS6001Model(fixData.POSNR, data.MATNR, data.KWMENG, "", fixData.WERKS, data.LGORT, 0, 0, "", data.VKAUS,"", "", "");
    var zsds6002Model = new ZSDS6002Model(data.TEXT);

    var zsds6001List: ZSDS6001Model[] = [zsds6001Model];
    var zsds6002List: ZSDS6002Model[] = [zsds6002Model];

    var createModel = new ZSDCREATESODoModel("", "", "", "", "", "", zsds3100Model, zsds6001List, zsds6002List);
    var createModelList: ZSDCREATESODoModel[] = [createModel];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDCREATESODoModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDCREATESODoModelList", createModelList, QueryCacheType.None);
    return insertModel[0];
  }

  /**
   * 파서블 엔트리 데이터 로딩 완료
   * @param e
   */
  onPEDataLoaded(e: any) {
    this.loadePeCount++;
    console.info(`DATA LOAD COUNT: ${this.loadePeCount}`);

    if (this.loadePeCount >= 14) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      this.dataLoad();
      
    }
  }
  addOrder(e: any) {
    // 고객번호 -> 현재 로그인 값으로 세팅해줘야함 꼭 수정!! (입력시 2번 조회할때 필요한 값)
    var model1 = new ZSDS3100Model("", "", "", "", "", "", "", new Date, new Date, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
    var model2 = new ZSDS6001Model("", "", 0, "", "", "", 0, 0, "", "", "", "", "");
    var model3 = new ZSDS6002Model("");


    var initData = Object.assign(model1, model2);
    initData = Object.assign(initData, model3);


    this.popupData = initData;
    console.log(this.popupData);

    //this.dxForm.instance.resetValues();
    this.popupTitle = "주문등록/수정";
    this.editFlag = false;
    this.saveVisible = true;
    this.loadingVisible = true;
    this.popupVisible = !this.popupVisible;

    setTimeout((that: CORDComponent) => {

      that.incoEntery.ApplyFilter();

    }, 500, this);

    
  }

  public clearEntery() {

    //팝업화면에 사용되는 엔트리 초기화

    this.sd007Entery2.ClearSelectedValue();
    this.maktEntery2.ClearSelectedValue();
    this.kunnEntery.ClearSelectedValue();
    this.dd07tEntery.ClearSelectedValue();
    this.dd07tCarEntery.ClearSelectedValue();
    this.tdlnr1Entery.ClearSelectedValue();
    this.tdlnr2Entery.ClearSelectedValue();
    this.t001Entery.ClearSelectedValue();
    this.kunnrEntery.ClearSelectedValue();
    this.incoEntery.ClearSelectedValue();

    //ClrarSelectedValue 시 필터가 초기화되고 있어 다시 설정
    this.incoEntery.SetDataFilter(["ZCM_CODE2", "<>", "NH"]);
  }

  //참조추가버튼 Action
  refAddOrder(e: any) {

    this.infoDataLoad("add");

    this.popupTitle = "주문등록/수정";
    this.editFlag = false;
    this.saveVisible = true;
    this.loadingVisible = true;
    this.popupVisible = !this.popupVisible;

    setTimeout((that: CORDComponent) => {

      that.incoEntery.ApplyFilter();

    }, 500, this);
    //this.popupData.VBELN = "";
  }

  saveOrder(e: any) {
  }
  
}
