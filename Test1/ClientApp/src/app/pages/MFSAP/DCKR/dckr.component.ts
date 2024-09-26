import { NgModule, Component, enableProdMode, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { BrowserModule, Title } from '@angular/platform-browser';
import 'devextreme/data/odata/store';
import { lastValueFrom } from 'rxjs';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { Service, OrderInfo, Product, PriorityEntity, PriorityEntity1,  } from './app.service';
import {
  DxDataGridComponent, DxRadioGroupComponent, DxFormComponent
} from 'devextreme-angular';
import { ZCMS3010Model, ZSDIFSAPPORALLogisticModel, ZSDS6500Model } from '../../../shared/dataModel/MFSAP/ZsdIfSapPoralLogistic';
import { ThemeManager } from '../../../shared/app.utilitys';
import { T001lModel } from '../../../shared/dataModel/MLOGP/T001l';
import { ZSDIFPORALSAPLogisticModel, ZSDS6510Model } from '../../../shared/dataModel/MFSAP/ZsdIfPoralSapLogistic';
import { ZSDT7110Model } from '../../../shared/dataModel/MLOGP/Zsdt7110';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

/*물류기지 CHECK LIST 등록 Component*/


@Component({
  templateUrl: 'dckr.component.html',
  providers: [ImateDataService, Service]
})

export class DCKRComponent {
  @ViewChild('DataGrid', { static: false }) DataGrid!: DxDataGridComponent;
  @ViewChild('radioBox1', { static: false }) radioBox1!: DxRadioGroupComponent;
  @ViewChild('radioBox2', { static: false }) radioBox2!: DxRadioGroupComponent;
  @ViewChild('radioBox3', { static: false }) radioBox3!: DxRadioGroupComponent;
  @ViewChild('radioBox4', { static: false }) radioBox4!: DxRadioGroupComponent;
  @ViewChild('radioBox5', { static: false }) radioBox5!: DxRadioGroupComponent;
  @ViewChild('radioBox6', { static: false }) radioBox6!: DxRadioGroupComponent;
  @ViewChild('radioBox7', { static: false }) radioBox7!: DxRadioGroupComponent;
  @ViewChild('radioBox8', { static: false }) radioBox8!: DxRadioGroupComponent;
  @ViewChild('radioBox9', { static: false }) radioBox9!: DxRadioGroupComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: CommonPossibleEntryComponent;


    dataGrid!: DxDataGridComponent;


  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  dataLoading: boolean = false;
  enteryLoading: boolean = false;
  private loadePeCount: number = 0;
  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  value1: any;
  value2: any;
  value3: any;
  value4: any;
  value5: any;
  value6: any;
  value7: any;
  value8: any;
  value9: any;
  //조회버튼
  searchButtonOptions: any;
  //insert,modify,delete 
  rowCount: number;
  _dataService: ImateDataService;
  //date box
  now: Date = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  refreshButtonOptions: any;
  startEditAction = 'click';
  selectTextOnEditStart = true;
  popupVisible = false;
  DBClikCloseButtonOptions: any;
  priorities: any[];
  priorities1: any[];
  priorityEntities: PriorityEntity[];
  priorityEntities1: PriorityEntity1[];
  collapsed: any;
  //데이터 추가 버튼
  addButtonOptions: any;
  rolid: string[] = [];
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";
  isDisabled: boolean = false;


  /*-------------------------------------메인화면-------------------------------------*/
  //메인데이터
  mainData: any;
  //날짜 조회
  startDate: any;
  endDate: any;
  checkPopupVisible = false; // 메인 팝업
  DBClikVisible = false; // 메인 팝업
  checkListFormData: any = {};;   //유류 메인 폼데이터
  DBClikFormData: any = {};;   //유류 메인 폼데이터
  selectedValue: string;
  lgCode!: TableCodeInfo;
  /**
* 데이터 스토어 키
* */
  dataStoreKey: string = "dckr";
  lgNmList: T001lModel[] = [];
  roldid: string[] = [];
  empId: string = "";
  //비료창고
  lgValue: string | null = null;
  //유류출하지시팝업 버튼
  checkPopupSaveButtonOptions: any;
  checkPopupCloseButtonOptions: any;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo,
    private authService: AuthService, private titleService: Title, private cd: ChangeDetectorRef) {
    // dropdownbox
    appInfo.title = AppInfoService.APP_TITLE + " | 물류기지 CHECK LIST 등록";

    this.lgCode = appConfig.tableCode("전체창고");
    this.lgValue = "";



    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),

    ];

    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------

    this.getLgortNm();
    var now = new Date();
    this.startDate = formatDate(now.setDate(new Date().getDate() - 90), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;
    this.priorities = [
      { ID: '01', Name: '양호' },
      { ID: '02', Name: '불량' }
    ];
    this.priorities1 = [
      { ID: '01', Name: '있음' },
      { ID: '02', Name: '없음' }
    ];
    this.priorityEntities = service.getPriorityEntities();
    this.priorityEntities1 = service.getpriorityEntities1();


    //아이디
    let userInfo = this.authService.getUser().data;
    this.rolid = userInfo?.role;
    this.vorgid = userInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = userInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = userInfo.orgOption.torgid.padStart(10, '0');
    this.empId = this.corgid;


    //insert,modify,delete 
    this._dataService = dataService;
    this.rowCount = 0;

    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.mainDataLoad(this);
      },
    };

    this.DBClikCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.DBClikVisible = false;
      },
    };



    //유류팝업저장버튼
    this.checkPopupSaveButtonOptions = {
      text: '저장',
      onClick: async () => {

        //저장
        if (await confirm("저장하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          var result = await this.datainsert(this);
          this.loadingVisible = false;
          if (result.ES_RESULT.MTY === "E")
            alert(result.ES_RESULT.MSG, "알림");
          else {
            alert("저장되었습니다.", "알림");
            this.mainDataLoad(this);
            that.checkPopupVisible = false;
          }
        }
      },
    };
    //유류팝업닫기버튼
    this.checkPopupCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.checkPopupVisible = false;
      }
    }


  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  //메인화면 로드   //ZSDIFSAPPORALLogisticModel(RFC)
  public async mainDataLoad(thisObj: DCKRComponent) {
    var sdate = formatDate(this.startDate, "yyyyMMdd", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMdd", "en-US")
    var zcms3010 = new ZCMS3010Model("", "");
    var zsds6500List: ZSDS6500Model[] = [];
    var oilDataResult = new ZSDIFSAPPORALLogisticModel(zcms3010, thisObj.lgValue, thisObj.lgValue, this.appConfig.plant, thisObj.startDate, thisObj.endDate, zsds6500List);
    var modelList: ZSDIFSAPPORALLogisticModel[] = [oilDataResult];
    this.loadingVisible = true;
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFSAPPORALLogisticModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFSAPPORALLogisticModelList", modelList, QueryCacheType.None);
    this.loadingVisible = false;
    if (resultModel[0].ES_RESULT.MTY !== "S") {
      alert(`자료를 가져오지 못했습니다.\n\nSAP 메시지: ${resultModel[0].ES_RESULT.MSG}`, "알림");
      return;
    } 
    var returnData = resultModel[0].T_DATA;

    this.mainData = new ArrayStore(
      {
        key: ["LGORT"],
        data: returnData
      });
  }
  // 저장
  public async datainsert(thisObj: DCKRComponent) {
    var insertData = thisObj.checkListFormData;
    var zcms3010 = new ZCMS3010Model("", "");
    var zsds6510 = new ZSDS6510Model(this.appConfig.plant, insertData.LGORT, insertData.KUNNR, insertData.ZREPRESN, insertData.VKBUR, insertData.ZMYCAR, "", insertData.ZRENTCAR,
      "", insertData.ZFORKLIFT, insertData.ZESTATE, insertData.ZMAXCAPA, insertData.ZSTORAGE_STOCK, insertData.ZYARD_STOCK, insertData.ZTOTAL_STOCK, insertData.ZBLOCK_STOCK, insertData.ZUNIT ?? "",
      this.radioBox1.value, insertData.ZCHECK1_TEXT ?? "", this.radioBox2.value, insertData.ZCHECK2_TEXT ?? "", this.radioBox3.value, insertData.ZCHECK3_TEXT ?? "", this.radioBox4.value, insertData.ZCHECK4_TEXT ?? "", this.radioBox5.value, insertData.ZCHECK5_TEXT ?? "",
      this.radioBox6.value, insertData.ZCHECK6_TEXT ?? "", this.radioBox7.value, insertData.ZCHECK7_TEXT ?? "", this.radioBox8.value, insertData.ZCHECK8_TEXT ?? "", this.radioBox9.value, insertData.ZCHECK9_TEXT ?? "", insertData.ZCHECK10 ?? "", insertData.ZCHECK11 ?? "",
      insertData.ZEDATE, insertData.ZNAME, DIMModelStatus.Add);

    this.loadingVisible = true;

    var checkRFCData = new ZSDIFPORALSAPLogisticModel(zcms3010, zsds6510);

    var checkModelList: ZSDIFPORALSAPLogisticModel[] = [checkRFCData];

    var resultCheckModel = await this.dataService.RefcCallUsingModel<ZSDIFPORALSAPLogisticModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORALSAPLogisticModelList", checkModelList, QueryCacheType.None);
    this.loadingVisible = false;
    return resultCheckModel[0];


  }


  //------------------------------------------------ 팝업 오픈 --------------------------------------------//

  //체크리스트 저장팝업
  async checkListAdd() {

    if (this.checkListFormData.LGORT == undefined) {
      alert("비료창고를 클릭 후 등록하세요.", "알림")
      return;
    }
    this.loadingVisible = true;

    var now = new Date();
    var checkListResult = await this.dataService.SelectModelData<ZSDT7110Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7110ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND WERKS = '${this.appConfig.plant}' AND LGORT = '${this.checkListFormData.LGORT}'AND KUNNR = '${this.checkListFormData.KUNNR}' `, "", QueryCacheType.None);

    Object.assign(this.checkListFormData, {
      NAME1: checkListResult[0].ZNAME, ZREPRESN: checkListResult[0].ZREPRESN, ZMYCAR: checkListResult[0].ZMYCAR, ZRENTCAR: checkListResult[0].ZRENTCAR,
      ZFORKLIFT: checkListResult[0].ZFORKLIFT, ZMAXCAPA: checkListResult[0].ZMAXCAPA, VKBUR: checkListResult[0].VKBUR, ZESTATE: checkListResult[0].ZESTATE,
      ZUNIT: checkListResult[0].ZUNIT1, ZEDATE: now,
      ZYARDSCALE1: checkListResult[0].ZYARDSCALE1, ZYARDSCALE2: checkListResult[0].ZYARDSCALE2, ZYARDCAPA1: checkListResult[0].ZYARDCAPA1, ZYARDCAPA2: checkListResult[0].ZYARDCAPA2,
    });

    this.checkPopupVisible = true;
    this.loadingVisible = false;
  };

  // 더블클릭
  async orderDBClick(e: any) {

    this.loadingVisible = true;

    var selectData: ZSDS6500Model[] = this.DataGrid.instance.getSelectedRowsData();
    this.DBClikFormData = selectData[0];

    this.value1 = selectData[0].ZCHECK1
    this.value2 = selectData[0].ZCHECK2
    this.value3 = selectData[0].ZCHECK3
    this.value4 = selectData[0].ZCHECK4
    this.value5 = selectData[0].ZCHECK5
    this.value6 = selectData[0].ZCHECK6
    this.value7 = selectData[0].ZCHECK7
    this.value8 = selectData[0].ZCHECK8
    this.value9 = selectData[0].ZCHECK9
    var checkListResult = await this.dataService.SelectModelData<ZSDT7110Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7110ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND WERKS = '${this.appConfig.plant}' AND LGORT = '${this.checkListFormData.LGORT}'AND KUNNR = '${this.checkListFormData.KUNNR}' `, "", QueryCacheType.None);

    Object.assign(this.DBClikFormData, {
      ZYARDSCALE1: checkListResult[0].ZYARDSCALE1, ZYARDSCALE2: checkListResult[0].ZYARDSCALE2, ZYARDCAPA1: checkListResult[0].ZYARDCAPA1, ZYARDCAPA2: checkListResult[0].ZYARDCAPA2,
    });
    this.loadingVisible = false;

    this.DBClikVisible = true;
  }



  get diffInDay() {
    return `${Math.floor(Math.abs(((new Date()).getTime() - this.value.getTime()) / (24 * 60 * 60 * 1000)))} days`;
  }

  async DataChanged(e: any, thisObj: DCKRComponent) {
      var data = 0;
    if (e.dataField === "ZSTORAGE_STOCK") {
      data = parseInt(thisObj.checkListFormData.ZSTORAGE_STOCK ?? "0") + parseInt(thisObj.checkListFormData.ZYARD_STOCK ?? "0")
      thisObj.checkListFormData.ZTOTAL_STOCK = data.toString();
    }
    if (e.dataField === "ZYARD_STOCK") {
      data = parseInt(thisObj.checkListFormData.ZSTORAGE_STOCK ?? "0") + parseInt(thisObj.checkListFormData.ZYARD_STOCK ?? "0")
      thisObj.checkListFormData.ZTOTAL_STOCK = data.toString();
    }
    if (e.dataField === "ZYARDSCALE1") {
      data = parseInt(thisObj.checkListFormData.ZYARDSCALE1 ?? "0") + parseInt(thisObj.checkListFormData.ZYARDSCALE2 ?? "0")
      thisObj.checkListFormData.ZBUZISIZE_TOTAL = data.toString();
    }
    if (e.dataField === "ZYARDSCALE2") {
      data = parseInt(thisObj.checkListFormData.ZYARDSCALE1 ?? "0") + parseInt(thisObj.checkListFormData.ZYARDSCALE2 ?? "0")
      thisObj.checkListFormData.ZBUZISIZE_TOTAL = data.toString();
    }
    if (e.dataField === "ZYARDCAPA1") {
      data = parseInt(thisObj.checkListFormData.ZYARDCAPA1 ?? "0") + parseInt(thisObj.checkListFormData.ZYARDCAPA2 ?? "0")
      thisObj.checkListFormData.ZBUZICAPA_TOTAL = data.toString();
    }
    if (e.dataField === "ZYARDCAPA2") {
      data = parseInt(thisObj.checkListFormData.ZYARDCAPA1 ?? "0") + parseInt(thisObj.checkListFormData.ZYARDCAPA2 ?? "0")
      thisObj.checkListFormData.ZBUZICAPA_TOTAL = data.toString();
    }

  }

  /* Entry Data Form에 바인딩 */
  //분할 차량번호 선택이벤트
  onLGCodeValueChanged(e: any) {
    setTimeout(() => {
      if (e.selectedItem !== null) {
        this.checkListFormData.LGORT = this.lgEntery.gridDataSource._array.find(item => item.LGORT === e.selectedValue)?.LGORT;
        this.checkListFormData.LGOBE = this.lgEntery.gridDataSource._array.find(item => item.LGORT === e.selectedValue)?.LGOBE;
        this.checkListFormData.KUNNR = this.lgEntery.gridDataSource._array.find(item => item.LGORT === e.selectedValue)?.KUNNR;

        return;
      }
    });
  }
  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */
  onPEDataLoaded(e: any) {
    this.loadePeCount++;
    console.info(`DATA LOAD COUNT: ${this.loadePeCount}`);
    /*
     if (e.component.ClearSelectedValue != undefined) {
       setTimeout(() => {
         e.component.ClearSelectedValue();
       });
     }
     */
    if (this.loadePeCount >= 0) {

      setTimeout(() => {
        if (this.rolid.find(item => item === "ADMIN") === undefined) {
          var lgVal = this.lgNmList.find(row => row.KUNNR === this.empId);
          if (lgVal !== undefined)
            this.lgValue = lgVal.LGORT;
          else
            this.lgValue = "3000";

          this.isDisabled = true;
        }
        this.loadePeCount = 0;
        this.mainDataLoad(this);
      }, 500);
    }
    
  }


  async getLgortNm() {

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.lgCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(T001lModel);
    this.lgNmList = resultModel;


  }

}
