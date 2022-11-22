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
import { Service, Data } from '../ALRF/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
  DxFormComponent, 
  DxPopupComponent,
} from 'devextreme-angular';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';
import ArrayStore from 'devextreme/data/array_store';
import { ZSDS6410Model, ZSDIFPORTALSAPLE028SndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Snd';
import { ZSDS6420Model, ZSDIFPORTALSAPLE028RcvModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Rcv';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'alrf.component.html',
  providers: [ImateDataService, Service]
})



export class ALRFComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('orderGrid2', { static: false }) orderGrid2!: DxDataGridComponent;
  @ViewChild('popupGrid', { static: false }) popupGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('vsEntery', { static: false }) vsEntery!: TablePossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: TablePossibleEntryComponent;
  @ViewChild('maraEntery', { static: false }) maraEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tEntery', { static: false }) dd07tEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: TablePossibleEntryComponent;
  @ViewChild('tvlvEntery', { static: false }) tvlvEntery!: TablePossibleEntryComponent;
  @ViewChild('zpalEntery', { static: false }) zpalEntery!: TablePossibleEntryComponent;
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
  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "alrf";

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
  saveButtonOptions: any;
  saveButtonOptions2: any;
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
  popupData: ZSDS6420Model[] = []; // 팝업 안 그리드
  popupData2: any; // 배차등록 팝업 안 상단내용
  popupData3: any; // 배차추가 팝업 안 상단내용
  addFormData: any; // 등록팝업 form데이터
  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;
  closeButtonOptions: any;
  closeButtonOptions2: any;
  closeButtonOptions3: any;
  closeButtonOptions4: any;
  popupVisible = false;
  popupVisible2 = false;
  popupVisible3 = false;
  popupVisible4 = false;
  collapsed: any;
  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 배차등록-포장재";


    this.vsCode = appConfig.tableCode("출하지점");
    this.lgCode = appConfig.tableCode("비료창고");
    this.maraCode = appConfig.tableCode("제품구분");
    this.dd07tCode = appConfig.tableCode("하차정보");
    this.dd07tCarCode = appConfig.tableCode("화물차종");
    this.tvlvCode = appConfig.tableCode("용도구분");
    this.zpalCode = appConfig.tableCode("파레트유형");
    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.vsCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maraCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tvlvCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),
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
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;


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
  //배차등록 저장
    this.saveButtonOptions = {
      text: "저장",
      onClick: async () => {
        /*this.orderData.push(this.popupData);*/
        var sum = 0;
        this.popupData.forEach((array: any) => {
          sum = sum + parseInt(array.ZMENGE4);
        });

        if (this.popupData2.ZMENGE2 == sum) {
          var result = await this.createOrder();
          if (result.E_MTY === "E") {
            alert(`배차등록 실패,\n\n오류 메세지: ${result.E_MSG}`);
            return;
          }
          else if ((result.E_MTY === "S")){
            alert("배차등록완료");
            this.popupVisible = false;
/*            this.orderData.push(this.popupData);*/
            this.dataLoad();
          }
        }
        else {
          alert("납품총수량과 배차수량을 맞춰주세요.");
        }
      },
    };

    //배차추가 저장
    this.saveButtonOptions2 = {
      text: "저장",
      onClick: () => {

        var maxIndex = this.popupData.length -1 ;
        //분할번호 +1 
        var znumber = this.popupData[maxIndex].ZSEQUENCY;
        this.addFormData.ZSEQUENCY = (parseInt(znumber) + 1).toString().padStart(9, '0');

        console.log(this.popupData);
        console.log(this.addFormData);
        this.popupData.push(this.addFormData);
        that.popupVisible2 = false;

        
      },
    };

    //취소버튼
    this.cancelEditButtonOptions =
    {
      text: '닫기', 
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
    //차량정보취소버튼
    this.closeButtonOptions2 = {
      text: '닫기',
      onClick(e: any) {
        that.popupVisible2 = false;
      },
    };

    //상세조회취소버튼
    this.closeButtonOptions3 = {
      text: '닫기',
      onClick(e: any) {
        that.popupVisible3 = false;
      },
    };

    //수정팝업취소버튼
    this.closeButtonOptions4 = {
      text: '닫기',
      onClick(e: any) {
        that.popupVisible4 = false;
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
  //조회더블클릭
  //orderDBClick(e: any) {
  //  var selectData = this.orderGrid.instance.getSelectedRowsData();

  //  //this.popupData.push(new ZSDS6420Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].VRKME, 0, 0, this.startDate, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS, selectData[0].ZSHIPMENT_NO, this.endDate, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, 0, selectData[0].ZTEXT, selectData[0].MTY, selectData[0].MSG));
  //  //this.popupData2 = { VBELN: selectData[0].VBELN, POSNR: selectData[0].POSNR, ZMENGE2: selectData[0].ZMENGE2, WADAT_IST: selectData[0].WADAT_IST };
  //  this.popupVisible3 = !this.popupVisible3;
  //}

  //수정더블클릭
  orderDBClick2(e: any) {
    //var selectData = this.orderGrid.instance.getSelectedRowsData();
    //this.popupData.push(new ZSDS6420Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].VRKME, 0, 0, this.startDate, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS, selectData[0].ZSHIPMENT_NO, this.endDate, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, 0, selectData[0].ZTEXT, selectData[0].MTY, selectData[0].MSG));
    this.popupVisible4 = !this.popupVisible4;
  }



  //첫화면 데이터 조회 RFC
  public async dataLoad() {
    let fixData = { I_ZSHIPSTATUS: "10" };
    var zsds6410: ZSDS6410Model[] = [];
    var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "", "", this.startDate, this.endDate, "", "", "", "", fixData.I_ZSHIPSTATUS, zsds6410);

    var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR"],
        data: resultModel[0].IT_DATA
      });
  }

  //배차등록
  public async createOrder() {
    var data = this.popupData
    let fixData = {ZSHIPSTATUS: "20" };
    var zsd6420 = new ZSDS6420Model("", "", "", "", 0, 0, this.startDate, "", "", "", "", "", "", "", "", "", "", fixData.ZSHIPSTATUS, "", this.endDate, "", "", 0, "", "", "");
    var zsd6420list: ZSDS6420Model[] = this.popupData;

    var createModel = new ZSDIFPORTALSAPLE028RcvModel("", "", zsd6420list);
    var createModelList: ZSDIFPORTALSAPLE028RcvModel[] = [createModel];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028RcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028RcvModelList", createModelList, QueryCacheType.None);
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
    if (this.loadePeCount >= 1) {
      this.enteryLoading = true;
      this.loadePeCount = 0;
      this.dataLoad();

    }
  }

  //배차등록버튼
  refAddOrder(e: any) {
    //this.dataLoad("search");
    this.popupData = [];
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    //납품문서번호 등등 원래값 넣는거
    this.popupData2 = { VBELN: selectData[0].VBELN, POSNR: selectData[0].POSNR, ZMENGE2: selectData[0].ZMENGE2, WADAT_IST: selectData[0].WADAT_IST };
    this.popupData.push(new ZSDS6420Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].VRKME, selectData[0].ZMENGE4, selectData[0].ZMENGE3, selectData[0].WADATIST, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS, selectData[0].ZSHIPMENT_NO, new Date(), selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, 0, selectData[0].ZTEXT, selectData[0].MTY, selectData[0].MSG));
    // this.popupData = this.orderGrid.instance.getSelectedRowsData();
    this.popupVisible = !this.popupVisible;
/*   this.clearEntery();*/
  }
  //배차추가버튼
  refAddOrder2(e: any) {
    var selectData = this.orderGrid2.instance.getSelectedRowsData();
    this.addFormData = new ZSDS6420Model(this.popupData2.VBELN, this.popupData2.POSNR, "", "", 0, selectData[0].ZMENGE3, this.popupData2.WADAT_IST, "", "", selectData[0].ZCARTYPE, '', "", "", "", "", selectData[0].ZVKAUS, selectData[0].ZUNLOAD, "", "", selectData[0].ZSHIPMENT_DATE, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, 0, "", "", "");
    //배차량 더하기
    var sum = 0;
    this.popupData.forEach((array: any) => {
      sum = sum + parseInt(array.ZMENGE4);
    });
    this.popupData3 = { ZMENGE2: this.popupData2.ZMENGE2, possible: (this.popupData2.ZMENGE2) - sum };
    //하차방법
    this.zunloadValue = selectData[0].ZUNLOAD;
    //용도
    this.vkausValue = selectData[0].ZVKAUS;
    //파렛트유형
    this.zpalValue = selectData[0].ZPALLTP;
    //화물차종
    this.zcarValue = selectData[0].ZCARTYPE;
    this.popupVisible2 = !this.popupVisible2;
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

  public clearEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    this.vsEntery.ClearSelectedValue();
    this.lgEntery.ClearSelectedValue();
    this.dd07tEntery.ClearSelectedValue();
    this.tvlvEntery.ClearSelectedValue();
    this.zpalEntery.ClearSelectedValue();
    this.dd07tCarEntery.ClearSelectedValue();
  }
}

