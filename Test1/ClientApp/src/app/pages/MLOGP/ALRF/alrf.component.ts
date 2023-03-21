import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CommonCodeInfo, ParameterDictionary, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { Service, CarSeq, CSpart, MatType } from '../ALRF/app.service';
import {
  DxDataGridComponent,
  DxDateBoxModule,
  DxFormComponent,
  DxPopupComponent,
} from 'devextreme-angular';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { AuthService } from '../../../shared/services';
import ArrayStore from 'devextreme/data/array_store';
import { confirm, alert } from "devextreme/ui/dialog";
import { ZSDS6410Model, ZSDIFPORTALSAPLE028SndModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Snd';
import { ZSDS6420Model, ZSDIFPORTALSAPLE028RcvModel } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapLe028Rcv';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ThisReceiver } from '@angular/compiler';
import { ZMMT1320Model } from '../../../shared/dataModel/OWHP/Zmmt1320Proxy';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { T001lModel } from '../../../shared/dataModel/MLOGP/T001l';
import { ZMMT1321Model } from '../../../shared/dataModel/MLOGP/Zmmt1321';
import { ZMMT1321Join1320Model } from '../../../shared/dataModel/MLOGP/Zmmt1320Join1321';
import { ZMMT1321GroupByModel } from '../../../shared/dataModel/OWHP/Zmmt1321GroupByProxy';
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
  @ViewChild('vsEntery', { static: false }) vsEntery!: CommonPossibleEntryComponent;
  @ViewChild('lgEntery', { static: false }) lgEntery!: CommonPossibleEntryComponent;
  @ViewChild('maraEntery', { static: false }) maraEntery!: CommonPossibleEntryComponent;
  //@ViewChild('dd07tEntery', { static: false }) dd07tEntery!: TablePossibleEntryComponent;
  @ViewChild('dd07tCarEntery', { static: false }) dd07tCarEntery!: CommonPossibleEntryComponent;
  //@ViewChild('tvlvEntery', { static: false }) tvlvEntery!: TablePossibleEntryComponent;
  //@ViewChild('zpalEntery', { static: false }) zpalEntery!: TablePossibleEntryComponent;
  @ViewChild('tdlnr1Entery', { static: false }) tdlnr1Entery!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrEntery!: CommonPossibleEntryComponent;
  /*@ViewChild('zcarnoCodeEntery', { static: false }) zcarnoCodeEntery!: CommonPossibleEntryComponent;*/
  @ViewChild('zcarnoModiCodeEntery', { static: false }) zcarnoModiCodeEntery!: CommonPossibleEntryComponent;
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;
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

  //1차운송사
  tdlnr1Code!: TableCodeInfo;

  //차량번호
  /*zcarnoCode!: TableCodeInfo;*/

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
  //1차운송사
  tdlnr1Value!: string | null;

  //차량번호
  /*zcarnoValue!: string | null;*/
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
  matType: MatType[];

  zmmt1320List: ZMMT1320Model[] = [];

  selectStatus: string = "10";
  selectCSpart: string = "1000";
  selectMatType: string = "1000";

  selectcarSeq: string = "1";

  isButtonLimit: boolean = false;

  isColVisible: boolean = true;

  lgNmList: T001lModel[] = [];


  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "alrf";

  dataSource: any;
  //거래처

  numberPattern: any = /^[^0-9]+$/;
  //정보
  orderData: any;
  orderGridData: ZSDS6410Model[] = [];

  //임가공 원데이터
  imOrderList: ZMMT1321Join1320Model[] = [];

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

  //분할버튼
  splitButtonOptions: any;
  //분할 취소버튼
  splitCancelButtonOptions: any;

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
  popupData: ZSDS6420Model[] = []; // 팝업 안 그리드

  popCarSetHeaderData: any; // 배차추가 팝업 안 상단내용
  popCarSetData: any; // 등록팝업 form데이터

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;
  closeButtonOptions: any;
  closeButtonOptions2: any;
  closeButtonOptions3: any;
  closeButtonOptions4: any;

  popSaveButtonOptions: any;
  popCloseButtonOptions: any;

  popupCarSetupVisible = false;
  collapsed: any;

  empid: string = "";
  vorgid: string = "";
  corgid: string = "";
  torgid: string = "";

  rolid: string[] = [];

  isTdlnrEnabled: boolean = false;

  //배차팝업 선택값
  selectGrid2Data: ZSDS6420Model[] = [];
  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService,
    private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 배차등록-포장재";

    let thisObj = this;

    //로그인 사용자 정보
    let usrInfo = authService.getUser().data;
    //this.empid = usrInfo.empId.padStart(10, '0');
    this.rolid = usrInfo.role;
    this.vorgid = usrInfo.orgOption.vorgid.padStart(10, '0');
    this.corgid = usrInfo.orgOption.corgid.padStart(10, '0');
    this.torgid = usrInfo.orgOption.torgid.padStart(10, '0');
    this.empid = this.torgid;

    this.loadingVisible = true;

    //1차2차운송사 구분
    this.carSeq = service.getCarSeq();

    //화학, 유류 구분
    this.cSpart = service.getCSpart();

    this.matType = service.getMatType();

    //this.vsCode = appConfig.tableCode("출하지점");
    this.lgCode = appConfig.tableCode("저장위치");
    /*this.maraCode = appConfig.tableCode("제품구분");*/
    /*this.dd07tCode = appConfig.tableCode("하차정보");*/
    this.dd07tCarCode = appConfig.tableCode("RFC_화물차종");
    //this.tvlvCode = appConfig.tableCode("용도구분");
    //this.zpalCode = appConfig.tableCode("파레트유형");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.tdlnr1Code = appConfig.tableCode("운송업체");
    this.zcarnoModiCode = appConfig.tableCode("비료차량");


    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.vsCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.lgCode),
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.maraCode),*/
      /*new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCode),*/
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.dd07tCarCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tvlvCode),
      //new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zpalCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.tdlnr1Code),
      /*new PossibleEnteryCodeInfo(CodeInfoType.commCode, this.zcarnoCode),*/
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
    this.tdlnrValue = "";
    this.tdlnr1Value = "";
    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")
    const that = this;

    //배차등록 팝업 초기화
    this.popCarSetData = { ZMENGE4: 0, ZCARTYPE: "", ZCARNO: "", ZDRIVER: "", ZPHONE: "", ZSHIPMENT_DATE: this.endDate, ZDRIVER1: "", ZPHONE1: "", ZSHIPMENT_NO: "" }

    this.getLgortNm();

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        this.loadingVisible = true;
        await this.dataLoad(this);
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
        var checkVBELN: string = "";
        var checkSum: boolean = true;
        var confirmText: string = "";

        //분할용 추가
        var carCheckDiv: boolean = true;

        var selectedData = this.orderGrid.instance.getSelectedRowsData();

        if (selectedData.length === 0) {
          alert("라인을 선택 후 저장하세요.", "알림");
          return;
        }

        selectedData.forEach(async (array: ZSDS6410Model) => {
          if (array.ZMENGE4 === 0) {
            checkVBELN = array.VBELN + " / " + array.POSNR;
            zeroCheck = false;
          }


          if (array.ZCARTYPE === "" || array.ZCARNO === "" || array.ZDRIVER === "") {
            checkVBELN = array.VBELN + " / " + array.POSNR;
            carCheck = false;
          }
          var vbelnMenge = { VBELN: "", POSNR: "", ZMENGE2: 0, ZMENGE4: 0 };

          //납품번호/품번으로 같은 데이터가 있나 확인
          var sameKeyData = thisObj.orderGridData.filter(item => item.VBELN === array.VBELN && item.POSNR === array.POSNR);

          //임가공 추가
          if (thisObj.selectCSpart == "9999") {
            sameKeyData = thisObj.orderGridData.filter(item => item.VBELN === array.VBELN);
          }

          if (sameKeyData.length > 1) {

            confirmText = "분할납품이 포함되어 있습니다.<br/>선택하지않은 모든 납품정보가 함께 저장됩니다.<br/>저장하시겠습니까?";


            //분할납품은 체크 안해도 같이 저장되기 때문에 체크를 해줘야한다.
            sameKeyData.forEach((obj: ZSDS6410Model) => {
              if (obj.ZMENGE4 === 0) {
                checkVBELN = obj.VBELN + " / " + obj.POSNR;
                zeroCheck = false;
              }


              if (obj.ZCARTYPE === "" || obj.ZCARNO === "" || obj.ZDRIVER === "") {
                checkVBELN = obj.VBELN + " / " + obj.POSNR;
                carCheckDiv = false;
              }

            });

          }
          else
            confirmText = "저장하시겠습니까?";

          //분할데이터 합산
          sameKeyData.forEach(async (row: ZSDS6410Model) => {
            vbelnMenge.VBELN = row.VBELN;
            vbelnMenge.POSNR = row.POSNR;
            vbelnMenge.ZMENGE2 = row.ZMENGE2;
            vbelnMenge.ZMENGE4 = vbelnMenge.ZMENGE4 + row.ZMENGE4;
          });
          //임가공일때 한번 더 체크
          if (thisObj.selectCSpart == "9999") {
            var resultModel = await thisObj.dataService.SelectModelData<ZMMT1321GroupByModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321GroupByList", [thisObj.appConfig.mandt, vbelnMenge.VBELN, " AND ZSHIP_STATUS <> '10' ", "SC_S_MENGE"],
              "", "", QueryCacheType.None);
            vbelnMenge.ZMENGE4 = vbelnMenge.ZMENGE4 + (resultModel.length > 0 ? resultModel[0].SUM_VALUE : 0);
          }
          //납품수량, 배차수량 비교
          if (vbelnMenge.ZMENGE2 < vbelnMenge.ZMENGE4) {
            checkSum = false;
            checkVBELN = vbelnMenge.VBELN + " / " + vbelnMenge.POSNR;
          }

        });
        setTimeout(async () => {
          if (!zeroCheck) {
            alert("배차수량 0은 지정할 수 없습니다.<br/>납품번호 : " + checkVBELN, "알림");
            return;
          }

          if (!carCheck) {
            alert("차량정보 및 운전기사정보는 필수입니다.<br/>납품번호 : " + checkVBELN, "알림");
            return;
          }
          if (thisObj.selectCSpart !== "9999") {
            if (!checkSum) {
              alert("납품수량보다 배차수량을 많이 입력할 수 없습니다.<br/>납품번호 : " + checkVBELN, "알림");
              return;
            }
          }



          if (!carCheckDiv) {
            confirmText = "배차 정보가 등록되지 않은 분할납품이 포함되어 있습니다.<br/>이대로 저장하시겠습니까?<br/>";
          }

          if (await confirm(confirmText, "알림")) {

            this.loadingVisible = true;
            var result = await this.createOrder(thisObj);



            this.loadingVisible = false;
            var reMSG = "";
            result.T_DATA.forEach(async (row: ZSDS6420Model) => {
              if (row.MTY === "E")
                reMSG = row.MSG;
            });

            if (reMSG !== "") {
              alert(`실패했습니다.<br/> SAP오류 메세지: ${reMSG}`, "알림");
              return;
            }
            if ((result.E_MTY === "S")) {
              alert("등록완료되었습니다.", "알림");
              /*            this.orderData.push(this.popupData);*/
              this.print(this);

              setTimeout(() => {
                this.dataLoad(this);
              }, 500);


            } else {
              alert(result.E_MSG, "알림");
            }
          }

        }, 500);
      },
    };

    this.splitButtonOptions = {
      text: "분할",
      onClick: async () => {
        var selectData: ZSDS6410Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
        if (selectData.length === 0) {
          alert("하나의 라인은 선택 후 실행하세요.", "알림");
          return;
        } else if (selectData.length > 1) {
          alert("하나의 라인만 선택 후 실행하세요.", "알림");
          return;
        }
        if (thisObj.selectCSpart !== "9999") {
          //선택행 인덱스 구하기
          var selectedIndex = thisObj.orderGridData.findIndex(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR &&
            item.ZSEQUENCY === selectData[0].ZSEQUENCY);

          var newLine = new ZSDS6410Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].KZPOD, selectData[0].VGBEL,
            selectData[0].VGPOS, selectData[0].INCO1, selectData[0].VSBED, selectData[0].TDDAT, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE1,
            selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL, selectData[0].ZMENGE4, selectData[0].ZMENGE3, selectData[0].WADAT_IST,
            selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT, selectData[0].KUNNR, selectData[0].NAME1, selectData[0].CITY,
            selectData[0].STREET, selectData[0].TELF1, selectData[0].MOBILENO, selectData[0].KUNAG, selectData[0].NAME1_AG, selectData[0].SPART,
            selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO,
            selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS,
            selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT,
            selectData[0].WBSTK, "", "", selectData[0].VKBUR, selectData[0].BEZEI, selectData[0].LGOBE, selectData[0].Z3PARVWTXT, selectData[0].Z4PARVWTXT, selectData[0].ZLGOBE,
            "", selectData[0].ZPALLTPT, selectData[0].ZUNLOADT, selectData[0].ZTAXKD_NAME);

          var sameData = thisObj.orderGridData.filter(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR);

          //분할번호 +1
          var nSeq = sameData.length;
          newLine.ZSEQUENCY = nSeq.toString().padStart(9, '0');

          //분할데이터 인서트
          thisObj.orderGridData.splice(selectedIndex + nSeq, 0, newLine);

          thisObj.orderData = new ArrayStore(
            {
              key: ["VBELN", "POSNR", "ZSEQUENCY"],
              data: thisObj.orderGridData
            });
        }
        else {
          //임가공 분할로직...
          var selectedIndex = thisObj.orderGridData.findIndex(item => item.VBELN === selectData[0].VBELN);

          var newLine = new ZSDS6410Model(selectData[0].VBELN, selectData[0].POSNR, selectData[0].ZSEQUENCY, selectData[0].KZPOD, selectData[0].VGBEL,
            selectData[0].VGPOS, selectData[0].INCO1, selectData[0].VSBED, selectData[0].TDDAT, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE1,
            selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL, selectData[0].ZMENGE4, selectData[0].ZMENGE3, selectData[0].WADAT_IST,
            selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].ZLGORT, selectData[0].KUNNR, selectData[0].NAME1, selectData[0].CITY,
            selectData[0].STREET, selectData[0].TELF1, selectData[0].MOBILENO, selectData[0].KUNAG, selectData[0].NAME1_AG, selectData[0].SPART,
            selectData[0].WERKS, selectData[0].LFART, selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE, selectData[0].ZCARNO,
            selectData[0].ZDRIVER, selectData[0].ZDRIVER1, selectData[0].ZPHONE, selectData[0].ZPHONE1, selectData[0].ZVKAUS, selectData[0].ZUNLOAD, selectData[0].ZSHIPSTATUS,
            selectData[0].ZSHIPMENT_NO, selectData[0].ZSHIPMENT_DATE, selectData[0].ZPALLTP, selectData[0].ZPALLETQTY, selectData[0].ZCONFIRM_CUT, selectData[0].ZTEXT,
            selectData[0].WBSTK, "", "", "", "", selectData[0].LGOBE, "", "", selectData[0].ZLGOBE);

          var sameData = thisObj.orderGridData.filter(item => item.VBELN === selectData[0].VBELN);

          newLine.POSNR = (parseInt(sameData[sameData.length - 1].POSNR) + 1).toString().padStart(6, '0');
          //분할데이터 인서트
          thisObj.orderGridData.splice(selectedIndex + sameData.length, 0, newLine);

          thisObj.orderData = new ArrayStore(
            {
              key: ["VBELN", "POSNR", "ZSEQUENCY"],
              data: thisObj.orderGridData
            });
        }
      }
    };

    this.splitCancelButtonOptions = {
      text: "분할취소",
      onClick: async () => {
        var selectData: ZSDS6410Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
        if (selectData.length === 0) {
          alert("하나의 라인은 선택 후 실행하세요.", "알림");
          return;
        } else if (selectData.length > 1) {
          alert("하나의 라인만 선택 후 실행하세요.", "알림");
          return;
        }

        if (thisObj.selectCSpart !== "9999") {
          var sameData = thisObj.orderGridData.filter(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR);
          var nSeq = sameData.length - 1;

          if (nSeq === 0) {
            alert("원본 납품문서는 더이상 분할취소할 수 없습니다.", "알림");
            return;
          }

          var maxSeq = nSeq.toString().padStart(9, '0');

          var maxIndex = thisObj.orderGridData.findIndex(item => item.VBELN === selectData[0].VBELN && item.POSNR === selectData[0].POSNR &&
            item.ZSEQUENCY === maxSeq);

          //분할데이터 삭제
          thisObj.orderGridData.splice(maxIndex, 1);

          thisObj.orderData = new ArrayStore(
            {
              key: ["VBELN", "POSNR", "ZSEQUENCY"],
              data: thisObj.orderGridData
            });
        }
        else {
          //임가공 분할취소
          var sameData = thisObj.orderGridData.filter(item => item.VBELN === selectData[0].VBELN);
          var nSeq = sameData.length - 1;

          if (nSeq === 0) {
            alert("원본 납품문서는 더이상 분할취소할 수 없습니다.", "알림");
            return;
          }

          var maxSeq = nSeq.toString().padStart(6, '0');

          var maxIndex = thisObj.orderGridData.findIndex(item => item.VBELN === selectData[0].VBELN && item.POSNR === maxSeq);

          //분할데이터 삭제
          thisObj.orderGridData.splice(maxIndex, 1);

          thisObj.orderData = new ArrayStore(
            {
              key: ["VBELN", "POSNR", "ZSEQUENCY"],
              data: thisObj.orderGridData
            });
        }
      }

    };

    //수정 저장
    this.popSaveButtonOptions = {
      text: "등록",
      onClick: () => {

        //if (this.popCarSetHeaderData.possible < this.popCarSetData.ZMENGE4) {
        //  alert("분할가능수량을 넘을 수 없습니다.", "알림");
        //  this.popCarSetData.ZMENGE4 = this.popCarSetHeaderData.possible;
        //  return;
        //}

        //if (this.popCarSetData.ZMENGE4 === 0) {
        //  alert("배차수량을 입력해야합니다.", "알림");
        //  return;
        //}

        if (this.popCarSetData.ZCARTYPE === "" || this.popCarSetData.ZCARNO === "" || this.popCarSetData.ZDRIVER === "") {
          alert("차량정보 및 운전기사정보를 입력해야합니다.", "알림");
          return;
        }

        if (this.popCarSetData.ZSHIPMENT_DATE === null) {
          alert("상차일자를 입력해야합니다.", "알림");
          return;
        }

        //if (this.popCarSetData.WADAT_IST === null || this.popCarSetData.WADAT_IST === undefined)
        //  this.popCarSetData.WADAT_IST = new Date("0001-01-01");

        var selectData: ZSDS6410Model[] = this.orderGrid.instance.getSelectedRowsData();

        //배차 키 생성 년 + 월 + 일 + 시간 + 차량뒷번호 4자리
        var now = new Date();
        var key = now.getFullYear().toString().substr(2, 2).padStart(2, '0') + now.getMonth().toString().padStart(2, '0') + now.getDay().toString().padStart(2, '0')
          + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');

        selectData.forEach(async (row: ZSDS6410Model) => {
          row.ZMENGE4 = this.popCarSetData.ZMENGE4;
          row.ZCARTYPE = this.popCarSetData.ZCARTYPE;
          row.ZCARNO = this.popCarSetData.ZCARNO;
          row.ZDRIVER = this.popCarSetData.ZDRIVER;
          row.ZDRIVER1 = this.popCarSetData.ZDRIVER1;
          row.ZSHIPMENT_DATE = this.popCarSetData.ZSHIPMENT_DATE;
          row.ZPHONE = this.popCarSetData.ZPHONE;
          row.ZPHONE1 = this.popCarSetData.ZPHONE1;

          var carkey = row.ZCARNO.substr(row.ZCARNO.length - 4, row.ZCARNO.length - 1);
          row.ZSHIPMENT_NO = "";
          row.ZSHIPMENT_NO = row.ZSHIPMENT_NO.concat(key, carkey)
        });

        this.popupCarSetupVisible = false;
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

    //수정팝업취소버튼
    this.popCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.popupCarSetupVisible = false;
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
    if (e.value === "1") {
      this.selectStatus = "10";
    } else {
      this.selectStatus = "20";
    }

  }

  //화학, 유류 구분
  onCSpartValueChanged(e: any) {
    this.loadingVisible = true;
    setTimeout(async () => {
      this.selectCSpart = e.value;
      if (this.selectCSpart === "9999") {
        this.isColVisible = false;
      } else {
        this.isColVisible = true;
      }

      await this.dataLoad(this);
      this.loadingVisible = false;
      //if (this.selectCSpart === "10") {
      //  /*this.zcarnoCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("화학차량"), "ZCARNO", "%ZCARNO%", "차량정보");*/
      //  this.zcarnoModiCodeEntery.ChangeCodeInfo(this.appConfig.tableCode("비료차량"), "ZCARNO", "%ZCARNO%", "차량정보");
      //} 
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
    /*this.tdlnrValue = e.value;*/
  }

  onMatTypeValueChanged(e: any) {
    this.selectMatType = e.value;
  }

  //첫화면 데이터 조회 RFC
  public async dataLoad(thisObj: ALRFComponent) {
    let fixData = { I_ZSHIPSTATUS: this.selectStatus };
    var zsds6410: ZSDS6410Model[] = [];
    thisObj.orderGridData = [];
    var tdlnr1 = "";
    var tdlnr2 = "";

    //권한 구분하기(비료, 화학 1차운송사)
    var tdl1 = this.rolid.find(item => item !== "R08" && item !== "R18");
    //권한 구분하기(비료, 화학 2차운송사)
    var tdl2 = this.rolid.find(item => item === "R08" || item === "R18");

    if (tdl1 !== undefined) {
      tdlnr1 = this.tdlnr1Value ?? "";
      tdlnr2 = this.tdlnrValue ?? "";
    }

    if (tdl2 !== undefined || this.tdlnrValue !== "")
      tdlnr2 = this.tdlnrValue ?? "";

    if (this.rolid.find(item => item === "ADMIN") === undefined) {
      if (tdlnr1 === "" && tdlnr2 === "") {
        alert("1차, 2차 운송사중 하나는 선택해야 합니다.", "알림");
        return;
      }
    }

    //포장재 or 임가공
    if (thisObj.selectCSpart !== "9999") {
      thisObj.isButtonLimit = false;
      this.orderGrid.instance.columnOption("POSNR", "visibleIndex", 23);
      this.orderGrid.instance.columnOption("NAME1", "visibleIndex", 33);
      this.orderGrid.instance.columnOption("POSNR", "caption", "납품품번");
      this.orderGrid.instance.columnOption("ZMENGE1", "caption", "주문수량");
      this.orderGrid.instance.columnOption("ZMENGE2", "caption", "납품수량");

      //if (this.selectStatus === "10")
      //  tdlnr1 = thisObj.tdlnrValue ?? "";
      //else
      //  tdlnr2 = thisObj.tdlnrValue ?? ""

      var zsdif = new ZSDIFPORTALSAPLE028SndModel("", "", "", "", "", "", "", thisObj.startDate, thisObj.endDate, "", "", thisObj.selectCSpart, "X",
        tdlnr1, tdlnr2, "", "", fixData.I_ZSHIPSTATUS, zsds6410);

      var model: ZSDIFPORTALSAPLE028SndModel[] = [zsdif];

      var resultModel = await thisObj.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028SndModel[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028SndModelList", model, QueryCacheType.None);
      
      thisObj.orderGridData = resultModel[0].IT_DATA;
      /*thisObj.orderGridData = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C");*/
      thisObj.orderGridData.forEach(async (row: ZSDS6410Model) => {
        row.LGOBE = thisObj.lgNmList.find(item => item.LGORT === row.LGORT)?.LGOBE;
        row.ZLGOBE = thisObj.lgNmList.find(item => item.LGORT === row.ZLGORT)?.LGOBE;

        var tdlnr2Text = this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.Z4PARVW);
        if (tdlnr2Text !== undefined)
          row.Z4PARVWTXT = tdlnr2Text.NAME1;
      });

    } else {
      thisObj.isButtonLimit = true;
      this.orderGrid.instance.columnOption("POSNR", "visibleIndex", 2);
      this.orderGrid.instance.columnOption("NAME1", "visibleIndex", 3);
      this.orderGrid.instance.columnOption("POSNR", "caption", "분할순번");
      this.orderGrid.instance.columnOption("ZMENGE1", "caption", "출하요청량");
      this.orderGrid.instance.columnOption("ZMENGE2", "caption", "출하지시량");

      thisObj.imOrderList = await thisObj.dataService.SelectModelData<ZMMT1321Join1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321Join1320List",
        [thisObj.appConfig.mandt, "1000", `'10', '20'`, thisObj.startDate.toString().replaceAll('-', ""), thisObj.endDate.toString().replaceAll('-', ""), tdlnr1, this.tdlnrValue == "" ? "X" : this.tdlnrValue, `'${fixData.I_ZSHIPSTATUS}'`, ""],
        "", "A.VBELN", QueryCacheType.None);
      thisObj.imOrderList.forEach(async (row: ZMMT1321Join1320Model) => {
        thisObj.orderGridData.push(new ZSDS6410Model(row.VBELN, row.POSNR == "000000" ? "000001" : row.POSNR, "", "", "", "", "", "", row.SC_R_DATE_R, row.IDNRK, row.MAKTX, row.SC_R_MENGE,  row.SC_L_MENGE,
          row.MEINS, "9999", row.SC_S_MENGE, row.SC_G_MENGE, undefined, 0, "", row.LGORT, "", row.LIFNR, row.NAME1, "", "", "", "", "", "", "", row.WERKS, "", row.TDLNR1, row.TDLNR2,
          row.ZCARTYPE, row.ZCARNO, row.ZDRIVER, "", row.ZPHONE, "", "", "", row.ZSHIP_STATUS, row.ZSHIPMENT_NO, row.SC_S_DATE, "", "", 0, "", "", "", "", "", "", row.BLAND_F_NM,
          this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.TDLNR1)?.NAME1, this.tdlnrEntery.gridDataSource._array.find(item => item.LIFNR === row.TDLNR2)?.NAME1, row.BLAND_T_NM));

      })
    } 

    thisObj.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR", "ZSEQUENCY"],
        data: thisObj.orderGridData
      });

    this.orderGrid.instance.getScrollable().scrollTo(0);
  }

  //배차등록
  public async createOrder(thisObj: ALRFComponent) {
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

    var zsd6420list: ZSDS6420Model[] = [];
    this.zmmt1320List = [];
    var zmmt1321List: ZMMT1321Model[] = [];
    var insertMod: ZSDIFPORTALSAPLE028RcvModel = new ZSDIFPORTALSAPLE028RcvModel("", "", []);
    var insertModel: ZSDIFPORTALSAPLE028RcvModel[] = [insertMod]
    var rowCount: number = 0;

    var selectedData = this.orderGrid.instance.getSelectedRowsData();

    var checkVSTEL = this.orderGrid.instance.getSelectedRowsData().find(item => item.VSTEL === "9999")

    //포장재 or 임가공 로직 분기
    if (checkVSTEL === undefined) {
      selectedData.forEach(async (row: ZSDS6410Model) => {
        var dataModel: ZSDS6410Model[] = [];
        var checkKey = zsd6420list.findIndex(item => item.VBELN === row.VBELN && item.POSNR === row.POSNR);
        if (checkKey === -1) {
          dataModel = thisObj.orderGridData.filter(item => item.VBELN === row.VBELN && item.POSNR === row.POSNR);
          dataModel.forEach(async (subRow: ZSDS6410Model) => {


            var now = new Date();
            var key = now.getFullYear().toString().substr(2, 2).padStart(2, '0') + now.getMonth().toString().padStart(2, '0') + now.getDay().toString().padStart(2, '0')
              + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');
            var carkey = subRow.ZCARNO.substr(subRow.ZCARNO.length - 4, subRow.ZCARNO.length - 1);

            zsd6420list.push(new ZSDS6420Model(subRow.VBELN, subRow.POSNR, subRow.ZSEQUENCY, subRow.VRKME, subRow.ZMENGE4,
              0, new Date(), subRow.Z3PARVW, subRow.Z4PARVW, subRow.ZCARTYPE,
              subRow.ZCARNO, subRow.ZDRIVER, subRow.ZDRIVER1, subRow.ZPHONE, subRow.ZPHONE1,
              subRow.ZVKAUS, subRow.ZUNLOAD, subRow.ZCARNO == "" ? subRow.ZSHIPSTATUS : "30", subRow.ZSHIPMENT_NO == "" ? subRow.ZSHIPMENT_NO.concat(key, carkey) : subRow.ZSHIPMENT_NO, subRow.ZSHIPMENT_DATE??new Date("0001-01-01"),
              subRow.ZPALLTP, subRow.ZPALLETQTY, subRow.ZCONFIRM_CUT, subRow.ZTEXT, "", ""));
          });
        }

      });

      var createModel = new ZSDIFPORTALSAPLE028RcvModel("", "", zsd6420list);
      var createModelList: ZSDIFPORTALSAPLE028RcvModel[] = [createModel];

      insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLE028RcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLE028RcvModelList", createModelList, QueryCacheType.None);
    } else {
      
      selectedData.forEach(async (row: ZSDS6410Model) => {
        var dataModel: ZSDS6410Model[] = [];
        var checkKey = zsd6420list.findIndex(item => item.VBELN === row.VBELN );
        if (checkKey === -1) {
          dataModel = thisObj.orderGridData.filter(item => item.VBELN === row.VBELN);
          var getData = this.imOrderList.find(item => item.VBELN === row.VBELN);
          dataModel.forEach(async (subRow: ZSDS6410Model) => {

            zmmt1321List.push(new ZMMT1321Model(this.appConfig.mandt, getData.VBELN, subRow.POSNR, getData.WERKS, getData.LIFNR, getData.IDNRK, getData.LGORT, getData.BWART
              , getData.MEINS, getData.SC_R_MENGE, getData.SC_R_DATE_R, getData.INCO1, getData.TDLNR1, subRow.Z4PARVW, subRow.ZCARTYPE, subRow.ZCARNO, subRow.ZDRIVER, subRow.ZPHONE
              , subRow.ZCARNO == "" ? (getData.ZSHIP_STATUS == "" ? "10" : getData.ZSHIP_STATUS) : "30", subRow.ZSHIPMENT_NO , getData.BLAND_F, getData.BLAND_F_NM, getData.BLAND_T, getData.BLAND_T_NM, subRow.ZMENGE4, subRow.ZSHIPMENT_DATE ?? new Date("0001-01-01")
              , 0, new Date("0001-01-01"), "000000", getData.ZPOST_RUN_MESSAGE, 0, new Date("0001-01-01"), "000000", "", getData.MBLNR, getData.MJAHR, getData.MBLNR_C, getData.MJAHR_C
              , getData.WAERS, getData.NETPR, getData.DMBTR, getData.BUKRS, getData.BELNR, getData.GJAHR, getData.BUDAT ?? new Date("0001-01-01"), getData.UNIQUEID, getData.SAVEKEY == "" ? this.appConfig.interfaceId : getData.ERNAM
              , getData.SAVEKEY == "" ? new Date() : getData.ERDAT, getData.SAVEKEY == "" ? formatDate(new Date(), "HH:mm:ss", "en-US") : getData.ERZET, this.appConfig.interfaceId
              , new Date(), formatDate(new Date(), "HH:mm:ss", "en-US"), "", "", getData.SAVEKEY == "" ? DIMModelStatus.Add : DIMModelStatus.Modify));
          });

          var row21Count = await this.dataService.ModifyModelData<ZMMT1321Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321ModelList", zmmt1321List);

          var zmmt1320Model = await thisObj.dataService.SelectModelData<ZMMT1320Model[]>(thisObj.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", [],
            `MANDT = '${this.appConfig.mandt}' AND VBELN = '${getData.VBELN}'`, "VBELN", QueryCacheType.None);

          var sumModel = await this.dataService.SelectModelData<ZMMT1321GroupByModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1321GroupByList", [thisObj.appConfig.mandt, getData.VBELN,"", "SC_S_MENGE"],
            "", "", QueryCacheType.None);
          zmmt1320Model[0].ModelStatus = DIMModelStatus.Modify; 
          zmmt1320Model[0].SC_S_MENGE_T = sumModel[0].SUM_VALUE;
          zmmt1320Model[0].ZSHIP_STATUS = "20";
          zmmt1320Model[0].SC_G_DATE = new Date("0001-01-01");
          zmmt1320Model[0].SC_R_DATE_C = zmmt1320Model[0].SC_R_DATE_C ??new Date("0001-01-01");
          zmmt1320Model[0].SC_L_DATE = zmmt1320Model[0].SC_L_DATE ??new Date("0001-01-01");
          zmmt1320Model[0].AENAM = this.appConfig.interfaceId;
          zmmt1320Model[0].AEDAT = new Date();
          zmmt1320Model[0].AEZET = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0') + ":" +
          new Date().getSeconds().toString().padStart(2, '0');

          this.zmmt1320List.push(zmmt1320Model[0]);
          

        }
        this.imUpdate();

      });
      /*if (rowCount > 0) {*/
      insertModel[0].E_MTY = "S";
    }

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
    if (this.loadePeCount >= 4) {

      this.loadePeCount = 0;

      var role = this.rolid.find(item => item !== "R07" && item !== "R17" && item !== "ADMIN");

      if (role !== undefined) {
        //this.isTdlnrEnabled = true;
        this.tdlnrValue = this.torgid;
        this.tdlnr1Value = "";
        this.selectcarSeq = "2";
        this.selectStatus = "20";

        //배차 권한 1차운송사부분 기능
        //this.tdlnr1Entery.SetDataFilter(["LIFNR", "=", this.torgid]);
      }

      var role2 = this.rolid.find(item => item === "R08" || item === "R18")
      if (role2 !== undefined)
        this.isTdlnrEnabled = true;

      var role3 = this.rolid.find(item => item === "R07" || item === "R17")
      if (role3 !== undefined)
        this.tdlnr1Value = this.torgid;

      setTimeout(() => {
        this.dataLoad(this);
        this.loadingVisible = false;
      }, 100);
    }
  }

  //저장 이벤트
  async refSaveData(e: any) {
    //if (await confirm("저장하시겠습니까?", "알림")) {

    //  if (this.orderGrid.instance.getSelectedRowsData().length > 0) {
    //    this.loadingVisible = true;
    //      var result = await this.createOrder();
    //      this.loadingVisible = false;
    //      var reMSG = "";
    //      result.T_DATA.forEach(async (row: ZSDS6440Model) => {
    //        if (row.MTY === "E")
    //          reMSG = row.MSG;
    //      });

    //      if (reMSG !== "") {
    //        alert(`배차등록 실패,\n\n오류 메세지: ${reMSG}`, "알림");
    //        return;
    //      }
    //      else if ((result.E_MTY === "S")) {
    //        alert("등록완료되었습니다.", "알림");
    //        /*            this.orderData.push(this.popupData);*/
    //        this.dataLoad();
    //      }
    //  } else {
    //    alert("2차운송사 정보를 저장행을 선택하세요.", "알림");
    //  }
    //}
  }

  //배차등록버튼
  async refAddOrder(e: any) {

    this.clearEntery();

    setTimeout(async () => {
      //this.dataLoad("search");
      this.popCarSetData = [];

      var selectData: ZSDS6410Model[] = this.orderGrid.instance.getSelectedRowsData();
      var ZMENGE = 0;
      if (selectData.length === 0) {
        alert("라인을 선택한 후 실행하세요.", "알림");
        return;
      } else if (selectData.length === 1) {
        if (selectData[0].ZMENGE4 === 0)
          ZMENGE = selectData[0].ZMENGE1;
        else
          ZMENGE = selectData[0].ZMENGE4;

        this.popCarSetData = {
          ZMENGE4: ZMENGE, ZCARTYPE: selectData[0].ZCARTYPE, ZCARNO: selectData[0].ZCARNO, ZDRIVER: selectData[0].ZDRIVER,
          ZPHONE: selectData[0].ZPHONE, ZSHIPMENT_DATE: new Date(), ZDRIVER1: selectData[0].ZDRIVER1, ZPHONE1: selectData[0].ZPHONE1, ZSHIPMENT_NO: selectData[0].ZSHIPMENT_NO
        }
        this.zcarnoModiValue = selectData[0].ZCARNO;
        /*this.zcarValue = selectData[0].ZCARTYPE;*/
      } else {
        this.popCarSetData = { ZMENGE4: 0, ZCARTYPE: "", ZCARNO: "", ZDRIVER: "", ZPHONE: "", ZSHIPMENT_DATE: new Date(), ZDRIVER1: "", ZPHONE1: "", ZSHIPMENT_NO: "" };
        this.zcarnoModiValue = "";
        /*this.zcarValue = "";*/

        //alert("한 라인만 선택하세요.", "알림");
        //return;
      }

      this.popupCarSetupVisible = true;

      //if (selectData.length > 1)
      //
    }, 100);
  }

  //수정더블클릭
  orderDBClick2(e: any) {

  }

  //하차
  onZunloadCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZUNLOAD = e.selectedValue;
    });
  }
  //용도
  onZvkausCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZVKAUS = e.selectedValue;
    });
  }
  //파레트유형
  onZpalltpCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZPALLTP = e.selectedValue;
    });
  }
  //화물차종
  onZcartypeCode1ValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZCARTYPE = e.selectedValue;
    });
  }

  //화물차종
  onZcartypeCode2ValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZCARTYPE = e.selectedValue;
    });
  }

  //수정 차량번호 선택이벤트
  onZcarno2CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popCarSetData.ZCARNO = e.selectedValue;
      this.popCarSetData.ZDRIVER = e.selectedItem.ZDRIVER;
      this.popCarSetData.ZPHONE = e.selectedItem.ZPHONE;
      this.popCarSetData.ZCARTYPE = this.zcarValue = e.selectedItem.ZCARTYPE;
    });
  }

  public clearEntery() {
    //팝업화면에 사용되는 엔트리 초기화
    //this.vsEntery.ClearSelectedValue();
    //this.lgEntery.ClearSelectedValue();
    //this.dd07tEntery.ClearSelectedValue();
    //this.tvlvEntery.ClearSelectedValue();
    //this.zpalEntery.ClearSelectedValue();
    this.dd07tCarEntery.ClearSelectedValue();
    //this.zcarnoCodeEntery.ClearSelectedValue();
    this.zcarnoModiCodeEntery.ClearSelectedValue();
  }

  //화물 위수탁증
  async print(e: any) {
    var selectData = this.orderGrid.instance.getSelectedRowsData();
    if (selectData.length === 0) {
      alert("라인을 선택해야합니다.", "알림");
      return;
    }

    if (selectData[0].VSTEL !== "9999") {
      var checkLgort = false;
      for (var row of selectData as ZSDS6410Model[]) {
        if (row.LGORT === "3000" || row.LGORT === "3200")
          checkLgort = true;
      }

      if (!checkLgort)
        return;


      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "itddatFrom": selectData[0].TDDAT,
        "itddatTo": selectData[0].TDDAT,
        "ivbeln": selectData[0].VBELN,
        "ivstel": selectData[0].VSTEL,
        "mandt": this.appConfig.mandt
      };

      setTimeout(() => { this.reportViewer.printReport("SHPQReport", params) });
    }
    else {
      //임가공 명세서
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "mandt": this.appConfig.mandt,
        "ivbeln": selectData[0].VBELN,
        "iposnr": selectData[0].POSNR
      };

      setTimeout(() => { this.reportViewer.printReport("SHPQReport2", params) });
    }
  }

  async getLgortNm() {

    let dataSet = await PossibleEntryDataStoreManager.getDataStoreDataSet(this.dataStoreKey, this.appConfig, this.lgCode);

    var resultModel = dataSet?.tables["CODES"].getDataObject(T001lModel);
    this.lgNmList = resultModel;
    return resultModel;
  }
  async imUpdate() {

      var row20Count = await this.dataService.ModifyModelData<ZMMT1320Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT1320ModelList", this.zmmt1320List);

  }
}

