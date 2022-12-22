import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { Service, VsGubun, CarSeq, CSpart } from '../SETB/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
  DxFormComponent, 
  DxPopupComponent,
  DxSelectBoxComponent,
  DxTextBoxComponent,
} from 'devextreme-angular';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';
import ArrayStore from 'devextreme/data/array_store';
import { alert, confirm } from "devextreme/ui/dialog";
import dxTextBox from 'devextreme/ui/text_box';
import { ZSDIFPORTALSAPLELIQSndModel, ZSDS6430Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqSnd';
import { ZSDIFPORTALSAPLELIQRcvModel, ZSDS6440Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqRcv';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'setb.component.html',
  providers: [ImateDataService, Service]
})



export class SETBComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('popupGrid', { static: false }) popupGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('vsEntery', { static: false }) vsEntery!: TablePossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: TablePossibleEntryComponent;
  @ViewChild('vgpostText', { static: false }) vgpostText!: DxTextBoxComponent;
  @ViewChild('vbelnText', { static: false }) vbelnText!: DxTextBoxComponent;
  @ViewChild('vsSelect', { static: false }) vsSelect!: DxSelectBoxComponent;
  /* Entry  선언 */
  //출하지점
  vsCode!: TableCodeInfo;
  //비료창고
  lgCode!: TableCodeInfo;
  //2차운송사
  tdlnrCode!: TableCodeInfo;

  /*Entery value 선언*/
  //출하지점
  vsValue!: string | null;
  //비료창고
  lgValue!: string | null;
  //2차운송사
  tdlnrValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;

  vsList: VsGubun[] = [];


  selectedVs: VsGubun;
  addDisabled: boolean = true;

  keyArray: any = [];

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  carSeq: CarSeq[];
  cSpart: CSpart[];

  selectStatus: string = "10";
  selectCSpart: string = "20";

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "setb";

  dataSource: any;
  //거래처

  //정보
  orderData: any;
  orderList: ZSDS6430Model[] = [];


  //날짜 조회
  startDate: any;
  endDate: any;
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

  selectedItemKeys: any[] = [];

  loadPanelOption: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //줄 선택
  selectedRowIndex = -1;
  //팝업데이터
  popupData: ZSDS6440Model[] = []; // 팝업 폼 data

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;

  closeButtonOptions: any;
  addButtonOptions: any;
  popupVisible = false;
  collapsed: any;


  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 2차운송사지정-액상";

    this.keyArray = ['VBELN', 'POSNR'];

    //1차2차운송사 구분
    this.carSeq = service.getCarSeq();

    //화학, 유류 구분
    this.cSpart = service.getCSpart();

    //this.vsCode = appConfig.tableCode("출하지점");
    /*this.lgCode = appConfig.tableCode("비료창고");*/
    this.tdlnrCode = appConfig.tableCode("운송업체")
    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.vsCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;

    this.vsValue = "";
    this.lgValue = "";

    this.vsList = service.getVsGubun();
    
    this.selectedVs = this.vsList[0];
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    this.loadingVisible = true;
    this.loadPanelOption = { enabled: false };

    this.dataLoad();


    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        this.loadPanelOption = { enabled: true };
        this.dataLoad();
      },
    };
    //등록버튼
    this.addButtonOptions = {
      text: "등록",
      onClick: async () => {
        if (this.tdlnrValue === "") {
          alert("선택된 2차 운송사가 없습니다.", "알림");
        } else {

          var selectData = this.orderGrid.instance.getSelectedRowsData();
          selectData.forEach((array: any) => {
            array.Z4PARVW = this.tdlnrValue;
            array.ZSHIPSTATUS = "20";
          });

          this.popupVisible = false;
          this.tdlnrEntery.ClearSelectedValue();
        }
      },
    };

    this.closeButtonOptions = {
      text: '닫기',
      onClick: async () => {
        this.popupVisible = false;
        this.tdlnrEntery.ClearSelectedValue();
      }
    }

    //배차등록 저장
    this.saveButtonOptions = {
      text: "저장",
      onClick: async () => {
        if (await confirm("저장하시겠습니까?", "알림")) {

          if (this.orderGrid.instance.getSelectedRowsData().length > 0) {
            var result = await this.saveData();

            if (result.E_MTY === "E") {
              alert(result.E_MSG, "저장오류");
            } else {
              alert("2차운송사 정보가 저장되었습니다.", "알림");
              this.loadPanelOption = { enabled: true };
              this.dataLoad();
            }
          } else {
            alert("2차운송사 정보를 저장행을 선택하세요.", "알림");
          }
        }

      },
    };

  }

  public async dateLoad(dataService: ImateDataService) {

    var sdate = formatDate(this.startDate, "yyyyMMDD", "en-US")
    var edate = formatDate(this.endDate, "yyyyMMDD", "en-US")

  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  selectedChanged(e:any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }


  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };




  //첫화면 데이터 조회 RFC
  public async dataLoad() {
    let fixData = { I_ZSHIPSTATUS: "10" };
    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", "", "", this.selectCSpart, this.startDate, this.endDate, "", "", "", "", "", "", fixData.I_ZSHIPSTATUS, []);

    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);
    this.orderList = resultModel[0].IT_DATA;
    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: resultModel[0].IT_DATA
      });

    this.loadingVisible = false;
  }

  //
  public async saveData() {
    var zsd6440list: ZSDS6440Model[] = [];

    this.orderGrid.instance.getSelectedRowsData().forEach((array: any) => {
      zsd6440list.push(new ZSDS6440Model(array.VBELN, array.POSNR, array.ZSEQUENCY, array.KZPOD, array.VGBEL, array.VGPOS,
        array.TDDAT, array.MATNR, array.ARKTX, array.ZMENGE1, array.ZMENGE2, array.VRKME, array.VSTEL,
        array.ZMENGE4, array.ZMENGE3, new Date("9999-12-31"), array.BRGEW, array.GEWEI, array.LGORT, array.ZLGORT,
        array.INCO1, array.VSBED, array.KUNNR, array.NAME1, array.CITY, array.STREET, array.TELF1,
        array.MOBILENO, array.KUNAG, array.NAME1_AG, array.SPART, array.WERKS, array.LFART, array.Z3PARVW,
        array.Z4PARVW, array.ZCARTYPE, array.ZCARNO, array.ZDRIVER, array.ZDRIVER1, array.ZPHONE, array.ZPHONE1,
        array.ZSHIPMENT, array.ZSHIPSTATUS, array.ZSHIPMENT_NO, array.ZSHIPMENT_DATE, array.ZCONFIRM_CUT, array.ZTEXT,
        array.MTY, array.MSG, DIMModelStatus.UnChanged));
    });

    var createModel = new ZSDIFPORTALSAPLELIQRcvModel("", "", zsd6440list);
    var createModelList: ZSDIFPORTALSAPLELIQRcvModel[] = [createModel];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQRcvModelList", createModelList, QueryCacheType.None);
    return insertModel[0];
    
  }

  //1차2차운송사 구분변경 이벤트
  onGubunValueChanged(e: any) {
      this.selectStatus = "10";
  }

  //화학, 유류 구분
  onCSpartValueChanged(e: any) {
    this.selectCSpart = e.value;
  }
  


  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */
  onPEDataLoaded(e: any) {
    this.loadePeCount++;
    console.info(`DATA LOAD COUNT: ${this.loadePeCount}`);

    if (this.loadePeCount >= 1) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      /*this.dataLoad();*/

    }
  }

  //배차등록버튼
  AddOrder(e: any) {
    this.popupVisible = !this.popupVisible;
  }
  
  //하차
  onZunloadCodeValueChanged(e: any) {
    setTimeout(() => {
     // this.popupData.ZUNLOAD = e.selectedValue;
    });
  }

  //화물차종
  onTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      //this.addFormData.ZCARTYPE = e.selectedValue;
    });
  }
  

  selectionChanged(data: any) {
    this.selectedItemKeys = data.currentSelectedRowKeys;
    if (this.orderGrid.instance.getSelectedRowsData().length > 0) {
      this.addDisabled = false;
    } else {
      this.addDisabled = true;
    }
  }
}

