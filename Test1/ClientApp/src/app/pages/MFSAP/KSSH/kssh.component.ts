import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { ZXNSCRFCResultModel } from '../../../shared/dataModel/ZxnscRfcResult';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { formatDate } from '@angular/common';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { Service, Data } from './app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
  DxFormComponent,
  DxPopupComponent,
} from 'devextreme-angular';
import { ZSDIFPORTALSAPSDNHISPSndModel, ZSDS5050Model } from '../../../shared/dataModel/MFSAP/ZsdIfPortalSapSdNhispSndProxy';
import { ZSDIFPORTALSAPSDNHISPRcvModel } from '../../../shared/dataModel/MFSAP/ZsdIfPortalSapSdNhispRcvProxy';
import { AuthService } from '../../../shared/services';
import ArrayStore from 'devextreme/data/array_store';
import { confirm, alert } from "devextreme/ui/dialog";
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { CodeInfoType, TableCodeInfo } from '../../../shared/app.utilitys';
import { PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'kssh.component.html',
  providers: [ImateDataService, Service]
})



export class KSSHComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: TablePossibleEntryComponent;
  @ViewChild('kunnEntery', { static: false }) kunnEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnr2Entery', { static: false }) tdlnr2Entery!: TablePossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: TablePossibleEntryComponent;
  @ViewChild('zcarnoModiCodeEntery', { static: false }) zcarnoModiCodeEntery!: TablePossibleEntryComponent;
  @ViewChild('zpalEntery', { static: false }) zpalEntery!: TablePossibleEntryComponent;
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: TablePossibleEntryComponent;
  //비료창고
  lgCode!: TableCodeInfo;
  //도착지 정보
  kunnCode!: TableCodeInfo;
  //화물차종
  dd07tCarCode!: TableCodeInfo;
  //운송사
  tdlnrCode!: TableCodeInfo;
  tdlnr2Code!: TableCodeInfo;
  //차량번호
  zcarnoModiCode!: TableCodeInfo;
  //파레트유형
  zpalCode!: TableCodeInfo;
  //제품코드
  matnrCode!: TableCodeInfo;

  //비료창고
  lgValue!: string | null;
  //도착지
  kunnrValue!: string | null;
  //운송사
  tdlnrValue!: string | null;
  tdlnr2Value!: string | null;
  //화물차종
  zcarValue!: string | null;
  //차량번호
  zcarnoModiValue!: string | null;
  //용도
  zpalValue!: string | null;
  //제품코드
  matnrValue!: string | null;

  //정보
  orderData: any;
  /**
* 데이터 스토어 키
* */
  dataStoreKey: string = "kssh";
  showDataLoadingPanel = false;

  //날짜 조회
  startDate: any;
  endDate: any;
  //date box
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);

  //데이터 추가 버튼
  addButtonOptions: any;
  //데이터 저장 버튼
  saveButtonOptions: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //상세 추가 버튼
  addDetailButtonOptions: any;
  popupVisible = false;
  //편집 취소 버튼
  cancelEditButtonOptions: any;
  //닫기버튼
  closeButtonOptions: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //줄 선택
  selectedRowIndex = -1;
  //팝업데이터
  popupData: any;
  addFormData!: ZSDS5050Model;
  infoData: any;
  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;
  collapsed: any;

  private loadePeCount: number = 0;
  enteryLoading: boolean = false;
  loadingVisible: boolean = false;
  //_dataService: ImateDataService;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 보관자료분 출고등록";
    //정보

    this.loadingVisible = true;

    this.matnrCode = appConfig.tableCode("비료제품명");
    this.lgCode = appConfig.tableCode("비료창고");
    this.kunnCode = appConfig.tableCode("비료납품처");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.tdlnr2Code = appConfig.tableCode("운송업체");
    this.zcarnoModiCode = appConfig.tableCode("비료차량");
    this.zpalCode = appConfig.tableCode("RFC_파레트유형");
    this.dd07tCarCode = appConfig.tableCode("화물차종");
    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.kunnCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnr2Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoModiCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;
    this.lgValue = "";
    this.kunnrValue = "";
    this.zcarValue = "";
    this.tdlnrValue = "";
    this.tdlnr2Value = "";
    this.zcarnoModiValue = "";
    this.zpalValue = "";
    this.matnrValue = "";

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    this.dataLoad();
    const that = this;
     
    //조회버튼
    this.searchButtonOptions = {
      text: '조회',
      onClick: async () => {
        this.loadingVisible = true;
        await this.dataLoad();
        this.loadingVisible = false;
      },
    };

    //저장버튼
    this.saveButtonOptions = {
      text: '저장',
      onClick: async () => {
        var checkModel = this.addFormData;

        if (checkModel.ZMENGE3 > checkModel.ZMENGE4) {
          alert("출고잔량 이상 출고할 수 없습니다.", "오류");
          return;
        }


        if (await confirm("저장하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          var result = await this.createOrder();
          this.loadingVisible = false;
          if (result.E_MTY === "S") {
            alert("저장 완료되었습니다.", "알림");
            this.popupVisible = false;
          }
          else if (result.E_MTY === "E") {
            alert(`저장 실패,\n\n오류 메세지: ${result.E_MSG}`, "알림");
          }
        }
      },
    };

    //팝업닫기버튼
    this.closeButtonOptions = {
      text: '닫기',
      onClick(e: any) {

        that.popupVisible = false;


      },
    };
  }

  //데이터로드
  public async dataLoad() {
    var zsds5050: ZSDS5050Model[] = [];
    var zsdsIf = new ZSDIFPORTALSAPSDNHISPSndModel("", "", this.startDate, this.endDate, "", "", "", "", this.lgEntery.selectedValue ??"", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", zsds5050);
    var model: ZSDIFPORTALSAPSDNHISPSndModel[] = [zsdsIf];
    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSDNHISPSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSDNHISPSndModelList", model, QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: resultModel[0].T_DATA
      });
  }

  //저장rfc
  public async createOrder() {
    
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    var zsds5050 = new ZSDS5050Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].FKDAT, selectData[0].AUBEL, selectData[0].VGBEL, selectData[0].VGPOS,
      this.addFormData.MATNR, selectData[0].ARKTX, selectData[0].FKIMG, selectData[0].VRKME, selectData[0].NETWR, selectData[0].MWSBP, selectData[0].WAERK,
      this.addFormData.LGORT, this.addFormData.KUNWE, this.addFormData.NAME1, selectData[0].CITY1, selectData[0].STREET, selectData[0].TELF1, selectData[0].MOBILENO,
      this.addFormData.KUNAG, this.addFormData.NAME1_AG, this.addFormData.SPART, selectData[0].WERKS, selectData[0].VKBUR, selectData[0].BZIRK, selectData[0].ZVGBEL,
      selectData[0].ZVGPOS, this.addFormData.ZMENGE3, this.addFormData.ZMENGE4, new Date(), this.addFormData.Z3PARVW, this.addFormData.Z4PARVW, this.addFormData.ZKUNWE,
      this.addFormData.NAME1, selectData[0].ZCITY1, this.addFormData.ZSTREET, selectData[0].TELF1, selectData[0].MOBILENO, this.addFormData.ZCARTYPE, this.addFormData.ZCARNO,
      this.addFormData.ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS,
      selectData[0].ZSHIPMENT_NO, new Date(), this.addFormData.ZPALLETQTY, this.addFormData.ZPALLTP, this.addFormData.ZTEXT, selectData[0].ZEXID, selectData[0].ZDELETE,
      selectData[0].ZIFMESSAGE, selectData[0].ZIFSTATUS, selectData[0].ZIFDELETE, selectData[0].ZERDAT, selectData[0].ZERZET, selectData[0].ZERNAM, selectData[0].ZAEDAT,
      selectData[0].ZAEZET, selectData[0].ZAENAM, "", "");

    var zsdsList: ZSDS5050Model = zsds5050;
    var rcv = new ZSDIFPORTALSAPSDNHISPRcvModel("", "", zsdsList)
    var model: ZSDIFPORTALSAPSDNHISPRcvModel[] = [rcv];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPSDNHISPRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPSDNHISPRcvModelList", model, QueryCacheType.None);
    return insertModel[0];
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
    if (this.loadePeCount >= 7) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      this.dataLoad();
      this.loadingVisible = false;

    }
  }
  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  //도착지
  onKunweCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZSTREET = e.selectedValue;
    });
  }
  //운송사
  onTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.Z3PARVW = e.selectedValue;
    });
  }
  //2차운송사
  onTdlnr2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.Z4PARVW = e.selectedValue;
    });
  }

  //화물차종
  onZcartypeCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZCARTYPE = e.selectedValue;
    });
  }

  //파레트유형
  onZpalltpCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZPALLTP = e.selectedValue;
    });
  }

  //분할 차량번호 선택이벤트
  onZcarno1CodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZCARNO = e.selectedValue;
      this.addFormData.ZDRIVER = e.selectedItem.ZDRIVER;
      this.addFormData.ZPHONE = e.selectedItem.ZPHONE;
      this.addFormData.ZCARTYPE = this.zcarValue = e.selectedItem.ZCARTYPE;
    });
  }

  //제품코드 변경 이벤트
  onMatnrCodeValueChanged(e: any) {
    this.addFormData.MATNR = e.selectedValue;
    this.addFormData.ARKTX = e.selectedItem.MAKTX;
  }

  //검수출고수량 변경 이벤트
  onZmenge3keyDown(e: any) {
    setTimeout(() => {
      if (this.addFormData.ZMENGE4 < Number(e.value))
        alert("출고잔량을 넘길 수 없습니다.", "알림")
    }, 100); 
  }

  selectedChanged(e: any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }

  contentReady = (e: any) => {
    if (!this.collapsed) {
      this.collapsed = true;
      e.component.expandRow(['EnviroCare']);
    }
  };
  //보관출고등록 팝업
  addOrder(e: any) {
    this.clearEntery();

    setTimeout(() => {
      var selectData = this.orderGrid.instance.getSelectedRowsData();

      this.popupData = { VBELN: selectData[0].VBELN, VGPOS: selectData[0].VGPOS, VGBEL: selectData[0].VGBEL, VKBUR: selectData[0].VKBUR, MATNR: selectData[0].MATNR, ZSHIPMENT_NO: selectData[0].ZSHIPMENT_NO }
      this.addFormData = new ZSDS5050Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].FKDAT, selectData[0].AUBEL, selectData[0].VGBEL, selectData[0].VGPOS,
        selectData[0].MATNR, selectData[0].ARKTX, selectData[0].FKIMG, selectData[0].VRKME, selectData[0].NETWR, selectData[0].MWSBP, selectData[0].WAERK,
        selectData[0].LGORT, selectData[0].KUNWE, selectData[0].NAME1, selectData[0].CITY1, selectData[0].STREET, selectData[0].TELF1, selectData[0].MOBILENO,
        selectData[0].KUNAG, selectData[0].NAME1_AG, selectData[0].SPART, selectData[0].WERKS, selectData[0].VKBUR, selectData[0].BZIRK, selectData[0].ZVGBEL,
        selectData[0].ZVGPOS, selectData[0].ZMENGE3, selectData[0].ZMENGE4, selectData[0].WADAT_IST, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].KUNWE,
        selectData[0].NAME1, selectData[0].CITY1, selectData[0].STREET, selectData[0].TELF1, selectData[0].MOBILENO, selectData[0].ZCARTYPE, selectData[0].ZCARNO,
        selectData[0].ZDRIVER, selectData[0], selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS,
        selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZPALLETQTY, selectData[0].ZPALLTP, selectData[0].ZTEXT, selectData[0].ZEXID, selectData[0].ZDELETE,
        selectData[0].ZIFMESSAGE, selectData[0].ZIFSTATUS, selectData[0].ZIFDELETE, selectData[0].ZERDAT, selectData[0].ZERZET, selectData[0].ZERNAM, selectData[0].ZAEDAT,
        selectData[0].ZAEZET, selectData[0].ZAENAM, "", "");

      this.matnrValue = selectData[0].MATNR;

      this.popupVisible = !this.popupVisible;
    }, 100);
  }


  public clearEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    this.lgEntery.ClearSelectedValue();
    this.tdlnrEntery.ClearSelectedValue();
    this.tdlnr2Entery.ClearSelectedValue();
    this.dd07tCarEntery.ClearSelectedValue();
    this.zcarnoModiCodeEntery.ClearSelectedValue();
    this.zpalEntery.ClearSelectedValue();
    this.matnrCodeDynamic.ClearSelectedValue();
  }
}
