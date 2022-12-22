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
import { Service, Data, Data2, CarSeq } from '../ALRF/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
  DxFormComponent, 
  DxPopupComponent,
  DxSelectBoxComponent,
} from 'devextreme-angular';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';
import ArrayStore from 'devextreme/data/array_store';
import { ZSDS6410Model, ZSDIFPORTALSAPLE028SndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Snd';
import { ZSDS6400Model, ZSDIFPORTALSAPGIRcvModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapGiRcvProxy';
import { confirm, alert } from "devextreme/ui/dialog";
//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shpq.component.html',
  providers: [ImateDataService, Service]
})



export class SHPQComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('vsEntery', { static: false }) vsEntery!: TablePossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: TablePossibleEntryComponent;
  @ViewChild('maraEntery', { static: false }) maraEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tEntery', { static: false }) dd07tEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: TablePossibleEntryComponent;
  @ViewChild('tvlvEntery', { static: false }) tvlvEntery!: TablePossibleEntryComponent;
  @ViewChild('zpalEntery', { static: false }) zpalEntery!: TablePossibleEntryComponent;
  @ViewChild('sort', { static: false }) sort!: DxSelectBoxComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: TablePossibleEntryComponent;
  @ViewChild('zcarnoCodeEntery', { static: false }) zcarnoCodeEntery!: TablePossibleEntryComponent;
  @ViewChild('zcarnoModiCodeEntery', { static: false }) zcarnoModiCodeEntery!: TablePossibleEntryComponent;
  @ViewChild('z4parvwCodeEntery', { static: false }) z4parvwCodeEntery!: CommonPossibleEntryComponent;
  /* Entry  선언 */
  //출하지점
  vsCode!: TableCodeInfo;
  //비료창고
  lgCode!: TableCodeInfo;
  //제품구분(비료:10, 친환경:40)
  maraCode!: TableCodeInfo;
  //하차 방법
  dd07tCode!: TableCodeInfo;
  //화물차종
  dd07tCarCode: TableCodeInfo;
  //용도 정보
  tvlvCode: TableCodeInfo;
  //파레트유형
  zpalCode!: TableCodeInfo;

  //운송사
  tdlnrCode!: TableCodeInfo;

  //2차운송사
  z4parvwCode!: CommonCodeInfo;

  //차량번호
  zcarnoCode!: TableCodeInfo;

  //차량번호(수정)
  zcarnoModiCode!: TableCodeInfo;

  /*Entery value 선언*/
  //출하지점
  vsValue!: string | null;
  //비료창고
  lgValue!: string | null;
  //제품구분(비료:10, 친환경:40)
  maraValue!: string | null;
  //허처
  zunloadValue: string | null;
  //용도
  vkausValue!: string | null;
  //용도
  zpalValue!: string | null;
  //화물차종
  zcarValue!: string | null;

  //운송사
  tdlnrValue!: string | null;
  //2차운송사
  z4parvwValue!: string | null;

  //차량번호
  zcarnoValue!: string | null;
  //차량번호(수정)
  zcarnoModiValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;

  //셀렉트박스
  data2!: Data2[];
  carSeq: CarSeq[];
  sort2!: string[];

  selectStatus: string = "30";
  selectData2: string = "1000";
  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "shpq";

  dataSource: any;
  //거래처


  //정보
  orderData: any;

  //납품총수량-배차량
  possible!: number;
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
  addButtonOptions2: any;
  //데이터 저장 버튼
  shipmentProcessing: any;
  saveButtonOptions2: any;
  saveButtonOptions4: any;
  //데이터 삭제 버튼
  deleteButtonOptions: any;
  //데이터 조회 버튼
  searchButtonOptions: any;
  //상세 추가 버튼
  addDetailButtonOptions: any;

  //편집 취소 버튼
  cancelEditButtonOptions: any;
  loadPanelOption: any;
  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;
  //줄 선택
  selectedRowIndex = -1;
  //팝업데이터
  popupData: any; // 팝업위
  addFormData!: any; //팝업아래
  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;
  closeButtonOptions: any;
  closeButtonOptions2: any;
  closeButtonOptions3: any;
  closeButtonOptions4: any;
  popupVisible = false;

  collapsed: any;
  //배차팝업 선택값
  selectGrid2Data: ZSDS6400Model[] = [];
  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 출하진행현황-포장재";

    this.loadingVisible = true;

    this.vsCode = appConfig.tableCode("출하지점");
    this.lgCode = appConfig.tableCode("비료창고");
    this.maraCode = appConfig.tableCode("제품구분");
    this.dd07tCode = appConfig.tableCode("하차정보");
    this.dd07tCarCode = appConfig.tableCode("화물차종");
    this.tvlvCode = appConfig.tableCode("용도구분");
    this.zpalCode = appConfig.tableCode("RFC_파레트유형");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.zcarnoCode = appConfig.tableCode("비료차량");
    this.zcarnoModiCode = appConfig.tableCode("비료차량");
    this.z4parvwCode = appConfig.commonCode("운송사");
    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.vsCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maraCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tvlvCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoModiCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.z4parvwCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;

    this.vsValue = "";
    this.lgValue = "";
    this.zunloadValue = "";
    this.vkausValue = "";
    this.zpalValue = "";
    this.zcarValue = "";
    this.zcarnoValue = "";
    this.zcarnoModiValue = "";
    this.z4parvwValue=""
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    //정보
    this.data2 = service.getData2();
    //1차2차운송사 구분
    this.carSeq = service.getCarSeq();

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        this.loadPanelOption = { enabled: true };
        this.dataLoad();
      },
    };
    //삭제버튼
    this.deleteButtonOptions = {
      text: "삭제",
      onClick: () => {
        this.dataGrid.instance.deleteRow(this.selectedRowIndex);
        this.dataGrid.instance.deselectAll();
      },
    };
  //출고처리
    this.shipmentProcessing = {
      text: "출고처리",
      onClick: async () => {
        if (await confirm("출고처리 하시겠습니까?", "알림")) {
          var result = await this.release();

          //if (this.popupData.ZMENGE4 < this.addFormData.ZMENGE3) {
          //  alert("출고수량은 배차수량을 넘길 수 없습니다.");
          //  return;
          //}

          if (result.EV_TYPE === "E") {
            alert(`출고처리 실패,\n\n오류 메세지: ${result.EV_MESSAGE}`, "알림");
            return;
          }
          else if (result.EV_TYPE === "S") {

            alert("출고처리 완료", "알림");
            this.popupVisible = false;
            /*   this.dataLoad();*/
          }
        }
      },
    };

    //출고취소
    this.cancelEditButtonOptions =
    {
      text: '출고취소', 
      onClick: async () => {
        this.dataGrid.instance.cancelEditData()
      },
    };

    //배차등록취소버튼
    this.closeButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.popupVisible = false;
      },
    };

    ////상세조회취소버튼
    //this.closeButtonOptions3 = {
    //  text: '닫기',
    //  onClick(e: any) {
    //    that.popupVisible3 = false;
    //  },
    //};


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
  //조회더블클릭
  //orderDBClick(e: any) {
  //  var selectData = this.orderGrid.instance.getSelectedRowsData();

  //  //this.popupData.push(new ZSDS6420Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].VRKME, 0, 0, this.startDate, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS, selectData[0].ZSHIPMENT_NO, this.endDate, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, 0, selectData[0].ZTEXT, selectData[0].MTY, selectData[0].MSG));
  //  //this.popupData2 = { VBELN: selectData[0].VBELN, POSNR: selectData[0].POSNR, ZMENGE2: selectData[0].ZMENGE2, WADAT_IST: selectData[0].WADAT_IST };
  //  this.popupVisible3 = !this.popupVisible3;
  //}


  onData2ValueChanged(e: any) {
    this.selectData2 = e.value;
  }


  //1차2차운송사 구분변경 이벤트
  onGubunValueChanged(e: any) {
    if (e.value === 1)
      this.selectStatus = "10";
    else
      this.selectStatus = "20";
  }

  onTdlnrCodeValueChanged(e: any) {
    this.tdlnrValue = e.value;
  }

  //첫화면 데이터 조회 RFC
  public async dataLoad() {
    let fixData = { I_ZSHIPSTATUS: this.selectStatus };
    var zsds6410: ZSDS6410Model[] = [];
    var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", this.lgEntery.selectedValue ?? "", "", this.startDate, this.endDate, "", "", this.selectData2, "", this.tdlnrValue??"", "", fixData.I_ZSHIPSTATUS, zsds6410);

    var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: resultModel[0].IT_DATA
      });
  }

  //출고처리 rfc
  public async release() {
    var data = this.addFormData
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    var zsds6400 = new ZSDS6400Model(this.popupData.VBELN, this.popupData.POSNR, "I", selectData[0].ZSAPSTATUS, selectData[0].KZPOD, selectData[0].VGBEL, selectData[0].VGPOS, selectData[0].MATNR, data.ARKTX, 0, selectData[0].VRKME, selectData[0].VSTEL, data.ZMENGE3, data.WADAT_IST, 0, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT, selectData[0].KUNNR, selectData[0].KUNAG, selectData[0].SPART, selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, data.Z4PARVW, data.ZCARTYPE, data.ZCARNO, data.ZDRIVER, data.ZDRIVER1, data.ZDRIVER2, data.ZPHONE, data.ZPHONE1, data.ZPHONE2, data.ZUNLOAD, data.ZSHIPMENT_NO, data.ZSHIPMENT_DATE, data.ZPALLTP, data.ZPALLETQTY, data.ZVKAUS, selectData[0].ZVBELN2, selectData[0].ZSAPMESSAGE, selectData[0].ZIFMESSAGE, selectData[0].ZIFSTATUS, selectData[0].ZIFDELETE, new Date(), "000000", selectData[0].ZERNAM, new Date(), "000000", selectData[0].ZAENAM);
    var zsdsList: ZSDS6400Model[] = [zsds6400];
    var rcv = new ZSDIFPORTALSAPGIRcvModel("", "", zsdsList)


    var model: ZSDIFPORTALSAPGIRcvModel[] = [rcv];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPGIRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPGIRcvModelList", model, QueryCacheType.None);
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

  //출고버튼
  refAddOrder(e: any) {
    
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    this.popupData = { VBELN: selectData[0].VBELN, POSNR: selectData[0].POSNR, ZMENGE2: selectData[0].ZMENGE2, ZMENGE4: selectData[0].ZMENGE4, ARKTX: selectData[0].ARKTX }
/*    this.addFormData = { MATNR: selectData[0].MATNR }*/
    var model1 = new ZSDS6400Model(selectData[0].VBELN, selectData[0].POSNR, "I", selectData[0].ZSAPSTATUS, selectData[0].KZPOD, selectData[0].VGBEL, selectData[0].VGPOS, selectData[0].MATNR, selectData[0].ARKTX, 0, selectData[0].VRKME, selectData[0].VSTEL, selectData[0].ZMENGE3, selectData[0].WADAT_IST, 0, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT, selectData[0].KUNNR, selectData[0].KUNAG, selectData[0].SPART, selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZDRIVER2, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZPHONE2, selectData[0].ZUNLOAD, selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, selectData[0].ZVKAUS, selectData[0].ZVBELN2, selectData[0].ZSAPMESSAGE, selectData[0].ZIFMESSAGE, selectData[0].ZIFSTATUS, selectData[0].ZIFDELETE, new Date(), "000000", selectData[0].ZERNAM, new Date(), "000000", selectData[0].ZAENAM);
    var model1Data = model1;
    this.addFormData = model1Data;
    this.popupVisible = !this.popupVisible;
    this.clearEntery();
  }

  //하차
  onZunloadCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZUNLOAD = e.selectedValue;
    });
  }
  //용도
  onZvkausCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZVKAUS = e.selectedValue;
    });
  }
  //파레트유형
  onZpalltpCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZPALLTP = e.selectedValue;
    });
  }
  //화물차종
  onZcartypeCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZCARTYPE = e.selectedValue;
    });
  }
  //2차운송사
  onz4parvwCodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.Z4PARVW = e.selectedValue;
    });
  }
  //분할 차량번호 선택이벤트
  onZcarno1CodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZCARNO = e.selectedValue;
      this.addFormData.ZDRIVER = e.selectedItem.ZDRIVER;
      this.addFormData.ZPHONE = e.selectedItem.ZPHONE;
      this.zcarValue = e.selectedItem.ZCARTYPE;
    });
  }
  
  //수정 차량번호 선택이벤트
  onZcarno2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZCARNO = e.selectedValue;
      this.addFormData.ZDRIVER = e.selectedItem.ZDRIVER;
      this.addFormData.ZPHONE = e.selectedItem.ZPHONE;
      this.zcarValue = e.selectedItem.ZCARTYPE;
    });
  }

  public clearEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    this.dd07tEntery.ClearSelectedValue();
    this.tvlvEntery.ClearSelectedValue();
    this.zpalEntery.ClearSelectedValue();
    this.dd07tCarEntery.ClearSelectedValue();
    this.zcarnoCodeEntery.ClearSelectedValue();
    this.zcarnoModiCodeEntery.ClearSelectedValue();
    this.z4parvwCodeEntery.ClearSelectedValue();
  }
}

