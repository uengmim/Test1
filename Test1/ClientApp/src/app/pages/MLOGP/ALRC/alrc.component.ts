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
import { Service, CarSeq, CSpart } from '../ALRC/app.service';
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
import { confirm, alert } from "devextreme/ui/dialog";
import { ZSDS6430Model, ZSDIFPORTALSAPLELIQSndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqSnd';
import { ZSDS6440Model, ZSDIFPORTALSAPLELIQRcvModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLeLiqRcv';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'alrc.component.html',
  providers: [ImateDataService, Service]
})



export class ALRCComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild('orderGrid2', { static: false }) orderGrid2!: DxDataGridComponent;
  @ViewChild('popupGrid', { static: false }) popupGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('vsEntery', { static: false }) vsEntery!: TablePossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: TablePossibleEntryComponent;
  @ViewChild('maraEntery', { static: false }) maraEntery!: TablePossibleEntryComponent;
  //@ViewChild('dd07tEntery', { static: false }) dd07tEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: TablePossibleEntryComponent;
  //@ViewChild('tvlvEntery', { static: false }) tvlvEntery!: TablePossibleEntryComponent;
  //@ViewChild('zpalEntery', { static: false }) zpalEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: TablePossibleEntryComponent;
  @ViewChild('zcarnoCodeEntery', { static: false }) zcarnoCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoModiCodeEntery', { static: false }) zcarnoModiCodeEntery!: CommonPossibleEntryComponent;

  /* Entry  선언 */
  //출하지점
  vsCode!: TableCodeInfo;
  //비료창고
  lgCode!: TableCodeInfo;
  //제품구분(비료:10, 친환경:40)
  maraCode!: TableCodeInfo;
  //하차 방법
  //dd07tCode!: TableCodeInfo;
  //화물차종
  dd07tCarCode: TableCodeInfo;
  //용도 정보
  //tvlvCode: TableCodeInfo;
  //파레트유형
  //zpalCode!: TableCodeInfo;

  //2차운송사
  tdlnrCode!: TableCodeInfo;

  //차량번호
  zcarnoCode!: TableCodeInfo;

  //차량번호(수정)
  zcarnoModiCode!: TableCodeInfo;

  /*Entery value 선언*/
  ////출하지점
  //vsValue!: string | null;
  ////비료창고
  //lgValue!: string | null;
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
  //2차운송사
  tdlnrValue!: string | null;

  //차량번호
  zcarnoValue!: string | null;
  //차량번호(수정)
  zcarnoModiValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;

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
  dataStoreKey: string = "alrc";

  dataSource: any;
  //거래처

  numberPattern: any = /^[^0-9]+$/;
  //정보
  orderData: any;
  orderGridData: ZSDS6430Model[] = [];

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
  //팝업줄 선택
  selectedRowIndex = -1;
  //메인줄 선택
  mainDataselectedRowIndex = -1;
  //팝업데이터
  popupData: ZSDS6440Model[] = []; // 팝업 안 그리드
  popupData2: any; // 배차등록 팝업 안 상단내용
  popupData3: any; // 배차추가 팝업 안 상단내용
  popupData4: any; // 배차추가 팝업 안 상단내용
  addFormData: any; // 등록팝업 form데이터
  addFormData2: any; // 수정데이터
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

  //배차팝업 선택값
  selectGrid2Data: ZSDS6440Model[] = [];
  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 배차등록-액상";

    this.loadingVisible = true;

    //1차2차운송사 구분
    this.carSeq = service.getCarSeq();

    //화학, 유류 구분
    this.cSpart = service.getCSpart();
 
    //this.vsCode = appConfig.tableCode("출하지점");
    //this.lgCode = appConfig.tableCode("비료창고");
    this.maraCode = appConfig.tableCode("제품구분");
    /*this.dd07tCode = appConfig.tableCode("하차정보");*/
    this.dd07tCarCode = appConfig.tableCode("화물차종");
    //this.tvlvCode = appConfig.tableCode("용도구분");
    //this.zpalCode = appConfig.tableCode("파레트유형");
    this.tdlnrCode = appConfig.tableCode("운송업체");

    if (this.selectCSpart === "20") {
      this.zcarnoCode = appConfig.tableCode("화학차량");
      this.zcarnoModiCode = appConfig.tableCode("화학차량");
    } else {
      this.zcarnoCode = appConfig.tableCode("유류차량");
      this.zcarnoModiCode = appConfig.tableCode("유류차량");
    }
    

    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.vsCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maraCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tvlvCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.zcarnoCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.zcarnoModiCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;

    //this.vsValue = "";
    //this.lgValue = "";
    this.zunloadValue = "";
    this.vkausValue = "";
    this.zpalValue = "";
    this.zcarValue = "";
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    this.dataLoad();

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        this.loadingVisible = true;
        await this.dataLoad();
        this.loadingVisible = false;
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
        var zeroCheck: boolean = true;
        var carCheck: boolean = true;
        var checkIndex: number[] = [];

        this.popupData.forEach((array: ZSDS6440Model) => {
          if (array.ZMENGE4 === 0)
            zeroCheck = false;

          if (array.ZCARTYPE === "" || array.ZCARNO === "" || array.ZDRIVER === "") {
            carCheck = false;
          }

          sum = sum + array.ZMENGE4;
        });

        if (!zeroCheck) {
          alert("배차수량 0은 지정할 수 없습니다.", "알림");
          return;
        }

        if (!carCheck) {
          alert("차량정보 및 운전기사정보는 필수입니다.", "알림");
          return;
        }

        if (await confirm("저장하시겠습니까?", "알림")) {

          this.loadingVisible = true;
          var result = await this.createOrder();
          this.loadingVisible = false;
          var reMSG = "";
          result.T_DATA.forEach(async (row: ZSDS6440Model) => {
            if (row.MTY === "E")
              reMSG = row.MSG;
          });

          if (reMSG !== "") {
            alert(`배차등록 실패,\n\n오류 메세지: ${reMSG}`, "알림");
            return;
          }
          else if ((result.E_MTY === "S")) {
            alert("등록완료되었습니다.", "알림");
            this.popupVisible = false;
            /*            this.orderData.push(this.popupData);*/
            this.dataLoad();

          } else {
            alert("2차운송사 정보를 저장행을 선택하세요.", "알림");
          }
        }

        ////Ascending
        //this.popupData.sort((a, b) => (a.ZSEQUENCY > b.ZSEQUENCY ? 1 : -1));

        //var fillterData = this.orderGridData.filter(item => item.VBELN === this.popupData2.VBELN && item.POSNR === this.popupData2.POSNR && item.ZSEQUENCY !== "000000000");

        ////Descending
        //fillterData.sort((a, b) => (a.ZSEQUENCY > b.ZSEQUENCY ? -1 : 1));

        //fillterData.forEach(async (row: ZSDS6430Model, index) => {
        //  var checkVal = this.orderGridData.findIndex(item => item.VBELN === row.VBELN && item.POSNR === item.POSNR && item.ZSEQUENCY === row.ZSEQUENCY);
        //  delete this.orderGridData[checkVal];
        //});

        //var setCount = this.orderGridData.findIndex(item => item.VBELN === this.popupData2.VBELN && item.POSNR === this.popupData2.POSNR && item.ZSEQUENCY === "000000000");

        //if (this.popupData2.ZMENGE2 >= sum) {
        //  var mainModel: ZSDS6430Model[] = [];
        //  this.popupData.forEach(async (row: ZSDS6440Model) => {
          
        //    //mainModel.push(new ZSDS6430Model(row.VBELN, row.POSNR, row.ZSEQUENCY, row.KZPOD, row.VGBEL, row.VGPOS, row.INCO1, row.VSBED, row.TDDAT, row.MATNR, row.ARKTX,
        //    //  row.ZMENGE1, row.ZMENGE2, row.VRKME, row.VSTEL, row.ZMENGE4, row.ZMENGE3, row.WADAT_IST, row.BRGEW, row.GEWEI, row.LGORT, row.ZLGORT, row.KUNNR, row.NAME1,
        //    //  row.CITY1, row.STREET, row.TELF1, row.MOBILENO, row.KUNAG, row.NAME1_AG, row.SPART, row.WERKS, row.LFART, row.Z3PARVW, row.Z4PARVW, row.ZCARTYPE,
        //    //  row.ZCARNO, row.ZDRIVER, row.ZDRIVER1, row.ZPHONE, row.ZPHONE1, row.ZSHIPMENT, row.ZSHIPSTATUS, row.ZSHIPMENT_NO, row.ZSHIPMENT_DATE, row.ZCONFIRM_CUT,
        //    //  row.ZTEXT, row.MTY, row.MSG, DIMModelStatus.UnChanged));
        //    var model = new ZSDS6430Model(row.VBELN, row.POSNR, row.ZSEQUENCY, row.KZPOD, row.VGBEL, row.VGPOS, row.INCO1, row.VSBED, row.TDDAT, row.MATNR, row.ARKTX,
        //      row.ZMENGE1, row.ZMENGE2, row.VRKME, row.VSTEL, row.ZMENGE4, row.ZMENGE3, row.WADAT_IST, row.BRGEW, row.GEWEI, row.LGORT, row.ZLGORT, row.KUNNR, row.NAME1,
        //      row.CITY1, row.STREET, row.TELF1, row.MOBILENO, row.KUNAG, row.NAME1_AG, row.SPART, row.WERKS, row.LFART, row.Z3PARVW, row.Z4PARVW, row.ZCARTYPE,
        //      row.ZCARNO, row.ZDRIVER, row.ZDRIVER1, row.ZPHONE, row.ZPHONE1, row.ZSHIPMENT, row.ZSHIPSTATUS, row.ZSHIPMENT_NO, row.ZSHIPMENT_DATE, row.ZCONFIRM_CUT,
        //      row.ZTEXT, row.MTY, row.MSG, DIMModelStatus.UnChanged);

        //    var checkVal = this.orderGridData.findIndex(item => item.VBELN === row.VBELN && item.POSNR === row.POSNR && item.ZSEQUENCY === row.ZSEQUENCY);
            
        //    if (checkVal === -1) {
        //      this.orderGridData.splice(setCount, 0, model);
        //    } else {
        //      this.orderGridData.splice(setCount, 1, model);
        //    }

        //    setCount = setCount + 1;
        //  });

        //  this.orderData = new ArrayStore(
        //    {
        //      key: ["VBELN", "POSNR", "ZSEQUENCY"],
        //      data: this.orderGridData
        //    });
          this.popupVisible = false;
          
          //this.loadingVisible = true;
          //var result = await this.createOrder();
          //this.loadingVisible = false;
          //var reMSG = "";
          //result.T_DATA.forEach(async (row: ZSDS6440Model) => {
          //  if (row.MTY === "E")
          //    reMSG = row.MSG;
          //});

          //if (reMSG !== "") {
          //  alert(`배차등록 실패,\n\n오류 메세지: ${reMSG}`);
          //  return;
          //}
          //else if ((result.E_MTY === "S")) {
          //  alert("배차등록완료");
          //  this.popupVisible = false;
          //  /*            this.orderData.push(this.popupData);*/
          //  this.dataLoad();
          //}
        //} else {
        //  alert("배차수량은 납품총수량을 넘을 수 없습니다.");

        //}
      },
    };

    //분할저장
    this.saveButtonOptions2 = {
      text: "등록",
      onClick: () => {
        if (this.popupData3.possible < this.addFormData.ZMENGE4) {
          alert("분할가능수량을 넘을 수 없습니다.", "알림");
          this.addFormData.ZMENGE4 = this.popupData3.possible;
          return;
        }

        if (this.addFormData.ZMENGE4 === 0) {
          alert("배차수량을 입력해야합니다.", "알림");
          return;
        }

        if (this.addFormData.ZCARTYPE === "" || this.addFormData.ZCARNO === "" || this.addFormData.ZDRIVER === "") {
          alert("차량정보 및 운전기사정보를 입력해야합니다.", "알림");
          return;
        }

        var maxIndex = this.popupData.length - 1;
        //분할번호 +1 
        var znumber = this.popupData[maxIndex].ZSEQUENCY;
        this.addFormData.ZSEQUENCY = (parseInt(znumber) + 1).toString().padStart(9, '0');

        console.log(this.popupData);
        console.log(this.addFormData);
        this.popupData.push(this.addFormData);
        that.popupVisible2 = false;


      },
    };
    //수정 저장
    this.saveButtonOptions4 = {
      text: "등록",
      onClick: () => {

        if (this.popupData4.possible < this.addFormData2.ZMENGE4) {
          alert("분할가능수량을 넘을 수 없습니다.", "알림");
          this.addFormData2.ZMENGE4 = this.popupData4.possible;
          return;
        }

        if (this.addFormData2.ZMENGE4 === 0) {
          alert("배차수량을 입력해야합니다.", "알림");
          return;
        }

        if (this.addFormData2.ZCARTYPE === "" || this.addFormData2.ZCARNO === "" || this.addFormData2.ZDRIVER === "") {
          alert("차량정보 및 운전기사정보를 입력해야합니다.", "알림");
          return;
        }



        this.popupData[this.selectedRowIndex] = this.addFormData2;
        this.orderGrid2.instance.refresh();
        this.popupVisible4 = false;
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

  //1차2차운송사 구분변경 이벤트
  onGubunValueChanged(e: any) {
    if(e.value === 1)
      this.selectStatus = "10";
    else
      this.selectStatus = "20";
  }

  //화학, 유류 구분
  onCSpartValueChanged(e: any) {
    setTimeout(() => {
      this.selectCSpart = e.value;

      if (this.selectCSpart === "20") {
        this.zcarnoCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("화학차량"), "ZCARNO", "%ZCARNO%", "차량정보");
        this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("화학차량"), "ZCARNO", "%ZCARNO%", "차량정보");
      } else {
        this.zcarnoCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("유류차량"), "ZCARNO", "%ZCARNO%", "차량정보");
        this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("유류차량"), "ZCARNO", "%ZCARNO%", "차량정보");
      }
    });
  }

  selectedChanged(e: any) {
    this.selectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
  }

  mainDataselectedChanged(e: any) {
    this.mainDataselectedRowIndex = e.component.getRowIndexByKey(e.selectedRowKeys[0]);
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

  onTdlnrCodeValueChanged(e: any) {
    this.tdlnrValue = e.value;
  }

  //첫화면 데이터 조회 RFC
  public async dataLoad() {
    let fixData = { I_ZSHIPSTATUS: this.selectStatus };
    var zsds6430: ZSDS6430Model[] = [];
    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", "", "", this.selectCSpart, this.startDate, this.endDate, "", "", "", "", this.tdlnrValue ?? "", "", fixData.I_ZSHIPSTATUS, zsds6430);

    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);

    this.orderGridData = resultModel[0].IT_DATA;

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR", "ZSEQUENCY"],
        data: this.orderGridData
      });
  }

  //배차등록
  public async createOrder() {
    //var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();
    //var modelList: ZSDS6440Model[] = [];
    //selectData.forEach(async (row: ZSDS6430Model) => {
    //  modelList.push(new ZSDS6440Model(row.VBELN, row.POSNR, row.ZSEQUENCY, row.KZPOD, row.VGBEL, row.VGPOS,
    //    row.TDDAT, row.MATNR, row.ARKTX, row.ZMENGE1, row.ZMENGE2, row.VRKME, row.VSTEL,
    //    row.ZMENGE4, row.ZMENGE3, row.WADAT_IST, row.BRGEW, row.GEWEI, row.LGORT, row.ZLGORT,
    //    row.INCO1, row.VSBED, row.KUNNR, row.NAME1, row.CITY, row.STREET, row.TELF1,
    //    row.MOBILENO, row.KUNAG, row.NAME1_AG, row.SPART, row.WERKS, row.LFART, row.Z3PARVW,
    //    row.Z4PARVW, row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, row.ZDRIVER1, row.ZPHONE, row.ZPHONE1,
    //    row.ZSHIPMENT, "30", row.ZSHIPMENT_NO, row.ZSHIPMENT_DATE, row.ZCONFIRM_CUT, row.ZTEXT,
    //    row.MTY, row.MSG, DIMModelStatus.UnChanged));
    //});

    var zsd6440list: ZSDS6440Model[] = this.popupData;

    //배차 키 생성 년 + 월 + 일 + 시간 + 차량뒷번호 4자리
    var now = new Date();
    var key = now.getFullYear().toString().substr(2, 2).padStart(2, '0') + now.getMonth().toString().padStart(2, '0') + now.getDay().toString().padStart(2, '0')
      + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');

    zsd6440list.forEach(async (row: ZSDS6440Model) => {
      row.ZSHIPSTATUS = "30";
      var carkey = row.ZCARNO.substr(row.ZCARNO.length - 4, row.ZCARNO.length - 1);
      row.ZSHIPMENT_NO = row.ZSHIPMENT_NO.concat(key, carkey)
      row.WADAT_IST = new Date("9999-12-31");
    });

    var createModel = new ZSDIFPORTALSAPLELIQRcvModel("", "", zsd6440list);
    var createModelList: ZSDIFPORTALSAPLELIQRcvModel[] = [createModel];

    var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQRcvModelList", createModelList, QueryCacheType.None);
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
    if (this.loadePeCount >= 3) {
      this.loadingVisible = false;
      this.loadePeCount = 0;
    }
  }

  //저장 이벤트
  async refSaveData(e: any) {
    if (await confirm("저장하시겠습니까?", "알림")) {

      if (this.orderGrid.instance.getSelectedRowsData().length > 0) {
        this.loadingVisible = true;
          var result = await this.createOrder();
          this.loadingVisible = false;
          var reMSG = "";
          result.T_DATA.forEach(async (row: ZSDS6440Model) => {
            if (row.MTY === "E")
              reMSG = row.MSG;
          });

          if (reMSG !== "") {
            alert(`배차등록 실패,\n\n오류 메세지: ${reMSG}`, "알림");
            return;
          }
          else if ((result.E_MTY === "S")) {
            alert("등록완료되었습니다.", "알림");
            this.popupVisible = false;
            /*            this.orderData.push(this.popupData);*/
            this.dataLoad();
          }
      } else {
        alert("2차운송사 정보를 저장행을 선택하세요.", "알림");
      }
    }
  }

  //배차등록버튼
  refAddOrder(e: any) {
    //this.dataLoad("search");
    this.popupData = [];
    var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();

    var selectSubData = this.orderGridData.filter(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR);
    if (selectSubData === undefined)
      return;

    //납품문서번호 등등 원래값 넣는거
    this.popupData2 = { VBELN: selectData[0].VBELN, POSNR: selectData[0].POSNR, ZMENGE2: selectData[0].ZMENGE2, WADAT_IST: selectData[0].WADAT_IST };

    selectSubData.forEach(async (row: ZSDS6430Model) => {
      this.popupData.push(new ZSDS6440Model(row.VBELN, row.POSNR, row.ZSEQUENCY, row.KZPOD, row.VGBEL, row.VGPOS,
        row.TDDAT, row.MATNR, row.ARKTX, row.ZMENGE1, row.ZMENGE2, row.VRKME, row.VSTEL,
        row.ZMENGE4, row.ZMENGE3, row.WADAT_IST, row.BRGEW, row.GEWEI, row.LGORT, row.ZLGORT,
        row.INCO1, row.VSBED, row.KUNNR, row.NAME1, row.CITY, row.STREET, row.TELF1,
        row.MOBILENO, row.KUNAG, row.NAME1_AG, row.SPART, row.WERKS, row.LFART, row.Z3PARVW,
        row.Z4PARVW, row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, row.ZDRIVER1, row.ZPHONE, row.ZPHONE1,
        row.ZSHIPMENT, row.ZSHIPSTATUS, row.ZSHIPMENT_NO, row.ZSHIPMENT_DATE, row.ZCONFIRM_CUT, row.ZTEXT,
        row.MTY, row.MSG, DIMModelStatus.UnChanged));
    });

    //this.popupData.push(new ZSDS6440Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].KZPOD, selectData[0].VGBEL, selectData[0].VGPOS,
    //  selectData[0].TDDAT, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE1, selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL,
    //  selectData[0].ZMENGE4, selectData[0].ZMENGE3, selectData[0].WADAT_IST, selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT,
    //  selectData[0].INCO1, selectData[0].VSBED, selectData[0].KUNNR, selectData[0].NAME1, selectData[0].CITY, selectData[0].STREET, selectData[0].TELF1,
    //  selectData[0].MOBILENO, selectData[0].KUNAG, selectData[0].NAME1_AG, selectData[0].SPART, selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW,
    //  selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1,
    //  selectData[0].ZSHIPMENT, selectData[0].ZSHIPSTATUS, selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT,
    //  selectData[0].MTY, selectData[0].MSG, DIMModelStatus.UnChanged));
    // this.popupData = this.orderGrid.instance.getSelectedRowsData();
    this.popupVisible = !this.popupVisible;
    /*   this.clearEntery();*/
  }
  //분할버튼
  refAddOrder2(e: any) {
    var selectData: ZSDS6440Model[] = this.orderGrid2.instance.getSelectedRowsData();

    //if (selectData[0].ZSHIPMENT_DATE < new Date("1000-01-01"))
    //  selectData[0].ZSHIPMENT_DATE = new Date();

    this.addFormData = new ZSDS6440Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].KZPOD, selectData[0].VGBEL, selectData[0].VGPOS,
      selectData[0].TDDAT, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE1, selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL,
      selectData[0].ZMENGE4, selectData[0].ZMENGE3, selectData[0].WADAT_IST, selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT,
      selectData[0].INCO1, selectData[0].VSBED, selectData[0].KUNNR, selectData[0].NAME1, selectData[0].CITY1, selectData[0].STREET, selectData[0].TELF1,
      selectData[0].MOBILENO, selectData[0].KUNAG, selectData[0].NAME1_AG, selectData[0].SPART, selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW,
      selectData[0].Z4PARVW, selectData[0].ZCARTYPE, "", "", "", "", "",
      selectData[0].ZSHIPMENT, selectData[0].ZSHIPSTATUS, selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT,
      selectData[0].MTY, selectData[0].MSG, DIMModelStatus.UnChanged);
    //배차량 더하기
    var sum = 0;
    this.popupData.forEach((array: ZSDS6440Model) => {
        sum = sum + array.ZMENGE4;
    });
    this.popupData3 = { ZMENGE2: this.popupData2.ZMENGE2, possible: (this.popupData2.ZMENGE2) - sum };
    //하차방법
/*    this.zunloadValue = selectData[0].ZUNLOAD;*/
    ////용도
    //this.vkausValue = selectData[0].ZVKAUS;
    ////파렛트유형
    //this.zpalValue = selectData[0].ZPALLTP;
    //화물차종
    this.zcarValue = selectData[0].ZCARTYPE;
    this.popupVisible2 = !this.popupVisible2;
    this.clearEntery();
  }

  //수정더블클릭
  orderDBClick2(e: any) {
    this.selectGrid2Data = this.orderGrid2.instance.getSelectedRowsData();

    //this.addFormData2 = new ZSDS6420Model(this.popupData2.VBELN, this.popupData2.POSNR, "", "", 0, this.selectGrid2Data[0].ZMENGE3,
    //  this.popupData2.WADAT_IST, "", "", this.selectGrid2Data[0].ZCARTYPE, '', "", "", "", "", this.selectGrid2Data[0].ZVKAUS,
    //  this.selectGrid2Data[0].ZUNLOAD, "", "", this.selectGrid2Data[0].ZSHIPMENT_DATE, this.selectGrid2Data[0].ZPALLTP, this.selectGrid2Data[0].ZPALLETQTY, 0, "", "", "");
    //var minDate = new Date("1000-01-01");
    //if (this.selectGrid2Data[0].ZSHIPMENT_DATE.getDate() < minDate.getDate())
    //  this.selectGrid2Data[0].ZSHIPMENT_DATE = new Date();

    this.addFormData2 = this.selectGrid2Data[0];


    //배차량 더하기
    var sum = 0;
    this.popupData.forEach((array: any) => {
      if (array.ZSEQUENCY !== this.selectGrid2Data[0].ZSEQUENCY)
        sum = sum + parseInt(array.ZMENGE4);
    });
    this.popupData4 = { ZMENGE2: this.popupData2.ZMENGE2, possible: (this.popupData2.ZMENGE2) - sum };

    ////하차방법
    //this.zunloadValue = this.selectGrid2Data[0].ZUNLOAD;
    ////용도
    //this.vkausValue = this.selectGrid2Data[0].ZVKAUS;
    ////파렛트유형
    //this.zpalValue = this.selectGrid2Data[0].ZPALLTP;
    //화물차종
    this.zcarValue = this.selectGrid2Data[0].ZCARTYPE;
    this.popupVisible4 = !this.popupVisible4;
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
  onZcartypeCode1ValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZCARTYPE = e.selectedValue;
    });
  }

  //화물차종
  onZcartypeCode2ValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData2.ZCARTYPE = e.selectedValue;
    });
  }

  //분할 차량번호 선택이벤트
  onZcarno1CodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData.ZCARNO = e.selectedValue;
      this.addFormData.ZDRIVER = e.selectedItem.ZDERIVER1;
      this.addFormData.ZPHONE = e.selectedItem.ZPHONE1;
      this.zcarValue = e.selectedItem.ZCARTYPE1;
    });
  }

  //수정 차량번호 선택이벤트
  onZcarno2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.addFormData2.ZCARNO = e.selectedValue;
      this.addFormData2.ZDRIVER = e.selectedItem.ZDERIVER1;
      this.addFormData2.ZPHONE = e.selectedItem.ZPHONE1;
      this.zcarValue = e.selectedItem.ZCARTYPE1;
    });
  }

  public clearEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    this.vsEntery.ClearSelectedValue();
    this.lgEntery.ClearSelectedValue();
    //this.dd07tEntery.ClearSelectedValue();
    //this.tvlvEntery.ClearSelectedValue();
    //this.zpalEntery.ClearSelectedValue();
    this.dd07tCarEntery.ClearSelectedValue();
    this.zcarnoCodeEntery.ClearSelectedValue();
    this.zcarnoModiCodeEntery.ClearSelectedValue();
  }
}

