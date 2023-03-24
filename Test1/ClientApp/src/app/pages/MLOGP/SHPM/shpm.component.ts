import { NgModule, Component, enableProdMode, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ImateInfo, QueryCacheType, QueryDataType, QueryMessage, QueryParameter, QueryRunMethod } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CommonCodeInfo, ParameterDictionary, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { formatDate } from '@angular/common';
import { Service, ChemTRP, CSpart } from '../SHPM/app.service';
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

import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZSDIFPORTALSAPGIYCLIQRcvModel, ZSDS6450Model, ZSDT6460Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapGiYcliqRcvProxy';
import { CalculChem, HeaderData, OilDepot } from '../SHPC/app.service';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { ZSDT7020Model } from '../../../shared/dataModel/MFSAP/Zsdt7020Proxy';
import { async } from 'rxjs';
import { ZMMOILBLGrinfoModel, ZMMS3200Model, ZMMS9900Model } from '../../../shared/dataModel/MCDIP/ZmmOilBlGrinfo';
import { ZMMOILGirecvModel, ZMMS3210Model } from '../../../shared/dataModel/MCDIP/ZmmOilGirecv';
import { UTIGGDENFCustomModel } from '../../../shared/dataModel/MCSHP/UTIGGDENFCustomProxy';
import { ShipStatus } from './app.service';
import { ZCMT0020CustomModel } from '../../../shared/dataModel/MCSHP/Zcmt0020CustomProxy';
import { TestDataList } from '../SHPB/app.service';
import { TestInData } from '../../../shared/dataModel/MLOGP/TestInData';

//필터
const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};

@Component({
  templateUrl: 'shpm.component.html',
  providers: [ImateDataService, Service]
})



export class SHPMComponent {
  @ViewChild('reportViewer', { static: false }) reportViewer!: ReportViewerComponent;
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild('orderGrid', { static: false }) orderGrid!: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) dxForm!: DxFormComponent;
  @ViewChild(DxPopupComponent, { static: false }) dxPop!: DxPopupComponent;
  @ViewChild('matnrCodeDynamic', { static: false }) matnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('tdlnrEntery', { static: false }) tdlnrCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('tdlnr1Entery', { static: false }) tdlnr1CodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('zcarnoCodeEntery', { static: false }) zcarnoCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('unloadInfoCodeDynamic', { static: false }) unloadInfoCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('truckTypeCodeDynamic', { static: false }) truckTypeCodeDynamic!: CommonPossibleEntryComponent;
  @ViewChild('carDataCodeEntery', { static: false }) carDataCodeEntery!: CommonPossibleEntryComponent;

  /* Entry  선언 */
  //제품코드
  matnrCode!: TableCodeInfo;
  //하차 방법
  unloadInfoCode!: TableCodeInfo;
  //화물차종
  truckTypeCode!: TableCodeInfo;
  //1차운송사
  tdlnr1Code!: TableCodeInfo;
  //2차운송사
  tdlnrCode!: TableCodeInfo;
  //차량번호
  zcarnoCode!: TableCodeInfo;

  /*Entery value 선언*/
  //제품구분(비료:10, 친환경:40)
  matnrValue!: string | null;
  //허차정보
  unloadInfoValue: string | null;
  //화물차종
  truckTypeValue!: string | null;
  //1차운송사
  tdlnr1Value!: string | null;
  //2차운송사
  tdlnrValue!: string | null;
  //차량번호
  zcarnoValue!: string | null;
  checarnoValue!: string | null;
  carnoValue!: string | null;

  //UI 데이터 로딩 패널
  loadingVisible: boolean = false;
  loadingVisible2: boolean = false;

  //파서블 엔트리 로딩 패널 안보이게함
  showDataLoadingPanel = false;
  private loadePeCount: number = 0;

  cSpart: CSpart[];

  selectStatus: string = "10";
  selectCSpart: string = "20";

  /**
 * 데이터 스토어 키
 * */
  dataStoreKey: string = "shpc";

  dataSource: any;
  //거래처

  numberPattern: any = /^[^0-9]+$/;
  //정보
  orderData: any;
  orderGridData: ZSDS6430Model[] = [];
  chemTrp: ChemTRP[];

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
  popupData: ZSDS6450Model[] = []; // 팝업 안 그리드
  carFormData: any = {};  //차량 배차 메인 폼데이터
  //출고팝업 헤더정보
  popHeaderData: HeaderData = new HeaderData();
  chepopHeaderData: HeaderData = new HeaderData();
  //출고팝업 아이템정보
  popItemData!: ZSDS6450Model;
  chepopItemData!: ZSDS6450Model;
  //출고팝업 유창정보
  popOilDepot: any

  popOilDepotData: OilDepot[] = [];

  //유창정보 온오프
  isPopVisible: boolean = true;

  popTabIndex: number = 0;

  //필터
  popupPosition: any;
  saleAmountHeaderFilter: any;
  customOperations!: Array<any>;
  closeButtonOptions: any;
  closeButtonOptions2: any;
  closeButtonOptions3: any;
  closeButtonOptions4: any;
  oilPopupCloseButtonOptions: any;
  chePopupCloseButtonOptions: any;
  GiButtonOptions: any;
  CGiButtonOptions: any;
  cheGiButtonOptions: any;

  popupVisible = false;
  chePopupVisible = false;
  popupVisible3 = false;
  popupVisible4 = false;
  collapsed: any;

  //사내창고코드 픽스
  intLGORT: string = "6000";
  oilSubData: any;
  oilSubGridData: ZMMS3200Model[] = [];
  oilSubFormData: any = {};   //유류 메인 폼데이터
  oilFormData: any = {};   //유류 메인 폼데이터
  rowCount: any;

  shipStatus: ShipStatus[] = [];

  sStatus: string = "30";

  calculChemList: CalculChem[];

  resultS: TestDataList[] = [];

  //배차팝업 선택값
  selectGrid2Data: ZSDS6450Model[] = [];
  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 수동출고등록";

    let thisObj = this;
    this.loadingVisible = true;
    this.chemTrp = service.getChemTRP();

    this.shipStatus = service.getShipStatus();

    this.calculChemList = service.getCalculChem();

    //화학, 유류 구분
    this.cSpart = service.getCSpart();

    //파서블엔트리 초기화
    this.unloadInfoCode = appConfig.tableCode("RFC_하차정보");
    this.truckTypeCode = appConfig.tableCode("RFC_화물차종");
    this.tdlnrCode = appConfig.tableCode("운송업체");
    this.tdlnr1Code = appConfig.tableCode("운송업체");

    this.popTabIndex = 0;

    if (this.selectCSpart === "20") {
      this.zcarnoCode = appConfig.tableCode("화학차량");
      this.matnrCode = appConfig.tableCode("화학제품명");
      this.isPopVisible = true;
    } else {
      this.zcarnoCode = appConfig.tableCode("유류차량");
      this.matnrCode = appConfig.tableCode("유류제품명");
      this.isPopVisible = false;
    }

    //this.zcarnoCode = appConfig.tableCode("유류차량");
    //this.matnrCode = appConfig.tableCode("유류제품명");

    //----------------------------------------------------------------------------------------------------------
    let codeInfos = [
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.matnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.truckTypeCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnrCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.tdlnr1Code),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.zcarnoCode),
      new PossibleEnteryCodeInfo(CodeInfoType.tableCode, this.unloadInfoCode),
    ];
    PossibleEntryDataStoreManager.setDataStore(this.dataStoreKey, codeInfos, appConfig, dataService);
    //---------------------------------------------------------------------------------------------------------
    //this._dataService = dataService;

    //선택값 초기화
    this.unloadInfoValue = "10";
    this.matnrValue = "";
    this.truckTypeValue = "";
    this.tdlnrValue = "";
    this.tdlnr1Value = "";
    this.zcarnoValue = "";
    this.checarnoValue = "";
    this.carnoValue = "";
    const that = this;
    this.oilSubGridData = [];

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 14), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US")

    this.dataLoad();

    this.popOilDepot = new ArrayStore(
      {
        key: ["C_PART"],
        data: thisObj.popOilDepotData
      });

    //조회버튼
    this.searchButtonOptions = {
      text: "검색",
      onClick: async () => {
        this.loadingVisible = true;
        await this.dataLoad();
        this.loadingVisible = false;
      },
    };

    //출고처리버튼
    this.GiButtonOptions = {
      text: "출고처리",
      onClick: async () => {
        var GIData = this.popItemData;

        console.log(that.carFormData.load6)
        console.log(that.carFormData.load7)
        if (GIData.ZMENGE3 === null || GIData.ZMENGE3 === 0 || GIData.ZMENGE3 === undefined) {
          alert("출고수량 은 필수입니다.", "알림");
          return;
        }

        if (GIData.WADAT_IST === null || GIData.WADAT_IST === undefined) {
          alert("출고전기일자는 필수입니다.", "알림");
          return;
        }
        if (GIData.Z_N_WEI_NET === null || GIData.Z_N_WEI_NET === 0 || GIData.Z_N_WEI_NET === undefined) {
          alert("정산수량은 필수입니다.", "알림");
          return;
        }
        if (GIData.ZRACK === null || GIData.ZRACK === undefined || GIData.ZRACK === "") {
          alert("RACK은 필수입니다.", "알림");
          return;
        }
        if (GIData.ZPUMP === null || GIData.ZPUMP === undefined || GIData.ZPUMP === "") {
          alert("PUMP는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZTANK === null || GIData.ZTANK === undefined || GIData.ZTANK === "") {
          alert("TANK는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZTEMP === null || GIData.ZTEMP === undefined || GIData.ZTEMP === "") {
          alert("온도는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZSHIPMENT_NO === null || GIData.ZSHIPMENT_NO === undefined || GIData.ZSHIPMENT_NO === "") {
          alert("배차번호는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZSHIPMENT_DATE === null || GIData.ZSHIPMENT_DATE === undefined) {
          alert("배차일자는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZCARTYPE === null || GIData.ZCARTYPE === undefined || GIData.ZCARTYPE === "") {
          alert("화물차종은 필수입니다.", "알림");
          return;
        }
        if (GIData.ZCARNO === null || GIData.ZCARNO === undefined || GIData.ZCARNO === "") {
          alert("차량번호는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZDRIVER === null || GIData.ZDRIVER === undefined || GIData.ZDRIVER === "") {
          alert("운전기사는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZUNLOAD === null || GIData.ZUNLOAD === undefined || GIData.ZUNLOAD === "") {
          alert("하차정보는 필수입니다.", "알림");
          return;
        }
        if (that.carFormData.load1 !== undefined && that.carFormData.load1 !== "" && that.carFormData.load1 !== 0) {
          if (that.carFormData.outData1 == undefined) {
            alert("출고1 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime1 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime1 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load1 < this.carFormData.outData1) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (that.carFormData.load2 !== undefined && that.carFormData.load2 !== "" && that.carFormData.load2 !== 0) {
          if (that.carFormData.outData2 == undefined) {
            alert("출고2 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime2 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime2 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load2 < this.carFormData.outData2) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (that.carFormData.load3 !== undefined && that.carFormData.load3 !== "" && that.carFormData.load3 !== 0) {
          if (that.carFormData.outData3 == undefined) {
            alert("출고3 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime3 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime3 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load3 < this.carFormData.outData3) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (that.carFormData.load4 !== undefined && that.carFormData.load4 !== "" && that.carFormData.load4 !== 0) {
          if (that.carFormData.outData4 == undefined) {
            alert("출고4 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime4 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime4 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load4 < this.carFormData.outData4) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (that.carFormData.load5 !== undefined && that.carFormData.load5 !== "" && that.carFormData.load5 !== 0) {
          if (that.carFormData.outData5 == undefined) {
            alert("출고5 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime5 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime5 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load5 < this.carFormData.outData5) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (that.carFormData.load6 !== undefined && that.carFormData.load6 !== "" && that.carFormData.load6 !== 0) {
          if (that.carFormData.outData6 == undefined) {
            alert("출고6 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime6 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime6 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load6 < this.carFormData.outData6) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (that.carFormData.load7 !== undefined && that.carFormData.load7 !== "" && that.carFormData.load7 !== 0) {
          if (that.carFormData.outData7 == undefined) {
            alert("출고7 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime7 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime7 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load7 < this.carFormData.outData7) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (that.carFormData.load8 !== undefined && that.carFormData.load8 !== "" && that.carFormData.load8 !== 0) {
          if (that.carFormData.outData8 == undefined) {
            alert("출고8 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime8 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime8 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load8 < this.carFormData.outData8) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (that.carFormData.load9 !== undefined && that.carFormData.load9 !== "" && that.carFormData.load9 !== 0) {
          if (that.carFormData.outData9 == undefined) {
            alert("출고9 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime9 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime9 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load9 < this.carFormData.outData9) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (that.carFormData.load10 !== undefined && that.carFormData.load10 !== "" && that.carFormData.load10 !== 0) {
          if (that.carFormData.outData10 == undefined) {
            alert("출고10 수량을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.startTime10 == undefined) {
            alert("시작시간을 입력해주세요.", "알림");
            return;
          } if (that.carFormData.endTime10 == undefined) {
            alert("종료시간을 입력해주세요.", "알림");
            return;
          }
        //if (this.carFormData.load10 < this.carFormData.outData10) {
        //  alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
        //  return;
        //}
        }
        if (await confirm("출고 처리하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          var result = await thisObj.saveData(thisObj);
          this.loadingVisible = false;
          if (result.E_MTY === "E")
            alert(result.E_MSG, "알림");
          else {
            var resultMessage = "";
            for (var row of result.T_DATA) {
              if (row.ZSAPSTATUS === "E") {
                resultMessage = resultMessage.concat(row.ZSAPMESSAGE, "</br>");
              }
            }

            if (resultMessage === "") {
              await alert("출고 처리되었습니다.", "알림");
              that.popupVisible = false;
              await this.printRef(null);
              await this.dataLoad();
            } else {
              await alert(resultMessage, "오류");
            }
          }
        }
      },
    };
    //유류팝업닫기버튼
    this.oilPopupCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.popupVisible = false;
      }
    }
    //유류팝업닫기버튼
    this.chePopupCloseButtonOptions = {
      text: '닫기',
      onClick(e: any) {
        that.chePopupVisible = false;
      }
    }
    //출고처리버튼
    this.cheGiButtonOptions = {
      text: "출고처리",
      onClick: async () => {
        var GIData = this.chepopItemData;

        if (GIData.ZMENGE3 === null || GIData.ZMENGE3 === 0 || GIData.ZMENGE3 === undefined) {
          alert("출고수량은 필수입니다.", "알림");
          return;
        }

        if (GIData.WADAT_IST === null || GIData.WADAT_IST === undefined) {
          alert("출고전기일자는 필수입니다.", "알림");
          return;
        }

        if (GIData.Z_N_WEI_EMP === null || GIData.Z_N_WEI_EMP === 0 || GIData.Z_N_WEI_EMP === undefined) {
          alert("공차중량은 필수입니다.", "알림");
          return;
        }
        if (GIData.Z_N_WEI_TOT === null || GIData.Z_N_WEI_TOT === 0 || GIData.Z_N_WEI_TOT === undefined) {
          alert("만차중량은 필수입니다.", "알림");
          return;
        }
        if (GIData.Z_N_WEI_NET === null || GIData.Z_N_WEI_NET === 0 || GIData.Z_N_WEI_NET === undefined) {
          alert("정산수량은 필수입니다.", "알림");
          return;
        }
        if (GIData.ZRACK === null || GIData.ZRACK === undefined || GIData.ZRACK === "") {
          alert("RACK은 필수입니다.", "알림");
          return;
        }
        if (GIData.ZPUMP === null || GIData.ZPUMP === undefined || GIData.ZPUMP === "") {
          alert("PUMP는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZTANK === null || GIData.ZTANK === undefined || GIData.ZTANK === "") {
          alert("TANK는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZSHIPMENT_NO === null || GIData.ZSHIPMENT_NO === undefined || GIData.ZSHIPMENT_NO === "") {
          alert("배차번호는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZSHIPMENT_DATE === null || GIData.ZSHIPMENT_DATE === undefined) {
          alert("배차일자는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZCARTYPE === null || GIData.ZCARTYPE === undefined || GIData.ZCARTYPE === "") {
          alert("화물차종은 필수입니다.", "알림");
          return;
        }
        if (GIData.ZCARNO === null || GIData.ZCARNO === undefined || GIData.ZCARNO === "") {
          alert("차량번호는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZDRIVER === null || GIData.ZDRIVER === undefined || GIData.ZDRIVER === "") {
          alert("운전기사는 필수입니다.", "알림");
          return;
        }
        if (GIData.ZUNLOAD === null || GIData.ZUNLOAD === undefined || GIData.ZUNLOAD === "") {
          alert("하차정보는 필수입니다.", "알림");
          return;
        }
        if (await confirm("출고 처리하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          var result = await thisObj.cheSaveData(thisObj);
          this.loadingVisible = false;


          if (result.E_MTY === "E")
            alert(result.E_MSG, "알림");
          else {
            var resultMessage = "";
            for (var row of result.T_DATA) {
              if (row.ZSAPSTATUS === "E") {
                resultMessage = resultMessage.concat(row.ZSAPMESSAGE, "</br>");
              }
            }

            if (resultMessage === "") {
              await alert("출고 처리되었습니다.", "알림");
              that.chePopupVisible = false;
              await this.printRef(null);
              await this.dataLoad();
            } else {
              await alert(resultMessage, "오류");
            }
          }
        }
      },
    };
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

  }

  onShipStatusValueChanged(e: any) {
    this.sStatus = e.value;
  }

  //화학, 유류 구분
  onCSpartValueChanged(e: any) {
    this.loadingVisible = true;
    setTimeout(async () => {
      this.selectCSpart = e.value;

      if (this.selectCSpart === "20") {
        this.zcarnoCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("화학차량"), "ZCARNO", "%ZCARNO%", "차량정보");
        this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("화학제품명"), "MATNR", "%MAKTX%(%MATNR%)", "자재명");
        this.popTabIndex = 0;
        this.isPopVisible = true;

      } else {
        this.zcarnoCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("유류차량"), "ZCARNO", "%ZCARNO%", "차량정보");
        this.matnrCodeDynamic.ChangeCodeInfo(this.appConfig.tableCode("유류제품명"), "MATNR", "%MAKTX%(%MATNR%)", "자재명");
        this.popTabIndex = 0;
        this.isPopVisible = false;

      }
      await this.dataLoad();
      this.loadingVisible = false;

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

  //첫화면 데이터 조회 RFC
  public async dataLoad() {

    var zsds6430: ZSDS6430Model[] = [];
    if (this.selectCSpart === "20")
      this.intLGORT = "";
        else
      this.intLGORT = "6000";

    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", this.intLGORT, "", this.selectCSpart, this.startDate, this.endDate, "", "", "4000", "X", "", "", "", "", "", zsds6430);

    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);

    /*this.orderGridData = resultModel[0].IT_DATA.filter(item => item.WBSTK !== "C");*/
    this.orderGridData = resultModel[0].IT_DATA.filter(item => item.ZSHIPSTATUS == "30" || item.ZSHIPSTATUS == "40");
    this.loadingVisible = true;

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR", "ZSEQUENCY"],
        data: this.orderGridData
      });
    this.loadingVisible = false;
  }
  //유류서브데이터로드   //ZMMOILBLGrinfoModel(RFC 조회)
  public async oilSubDataLoad() {
    this.oilSubData = [];
    var selectedData = [];
    selectedData = this.orderGrid.instance.getSelectedRowsData();
    var insertData = this.popItemData;

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

  //public async cheSubDataLoad(thisObj : SHPMComponent) {
  //  debugger;
  //  var insertData = thisObj.chepopItemData;

  //  var resultModel = await this.dataService.SelectModelData<ZCMT0020CustomModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020CustomModelList",
  //    [this.appConfig.mandt, insertData.MATNR], "", "", QueryCacheType.None);

  //  var resultValue = this.chemTrp.find(item => item.HWAMUL === resultModel[0].ZCM_CODE2)
  //  this.chepopItemData.ZRACK = resultValue.RACK
  //  this.chepopItemData.ZPUMP = resultValue.PIPE
  //  this.chepopItemData.ZTANK = resultValue.TANK
  //}


  //데이터 저장로직
  public async saveData(thisObj: SHPMComponent) {
    try {
      var selectData: ZSDS6430Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
      var GIData = thisObj.popItemData;
      var carData = thisObj.carFormData;
      let minTime = formatDate(new Date("0001-01-01"), "HH:mm:ss", "en-US");

      let oilDate = new Date();
      let oilTime = formatDate(new Date(), "HH:mm:ss", "en-US");
      var model: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [];

      GIData.ZUNLOAD = this.unloadInfoValue;

      if (GIData.ZMENGE3 === 0) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("출고수량입력은 필수입니다.", "E"));
        return model[0];
      }

      if (GIData.WADAT_IST === null) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("출고전기일자는 필수입니다.", "E"));
        return model[0];
      }

      if (GIData.Z_N_WEI_NET === null || GIData.Z_N_WEI_NET === 0 || GIData.Z_N_WEI_NET === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("정산수량은 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZRACK === null || GIData.ZRACK === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("RACK은 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZPUMP === null || GIData.ZPUMP === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("PUMP는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZTANK === null || GIData.ZTANK === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("TANK는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZTEMP === null || GIData.ZTEMP === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("온도는 필수입니다.", "E"));
        return model[0];
      }

      if (GIData.ZSHIPMENT_NO === null || GIData.ZSHIPMENT_NO === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("배차번호는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZSHIPMENT_DATE === null || GIData.ZSHIPMENT_DATE === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("배차일자는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZCARTYPE === null || GIData.ZCARTYPE === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("화물차종은 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZCARNO === null || GIData.ZCARNO === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("차량번호는 필수입니다.", "E"));
        return model[0];
      }
      if (GIData.ZDRIVER === null || GIData.ZDRIVER === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("운전기사는 필수입니다.", "E"));
        return model[0];
      }

      if (GIData.ZUNLOAD === null || GIData.ZUNLOAD === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("하차정보는 필수입니다.", "E"));
        return model[0];
      }

      if (selectData[0].VSBED === "Z4") {
        await alert("온도기준 출고수량은 정산량으로 설정됩니다.", "알림");
        GIData.ZMENGE3 = GIData.Z_N_WEI_NET;
      }

      GIData.ZREQTYPE = "I";
      GIData.Z_N_WEI_EMP = 1;
      GIData.Z_N_WEI_TOT = 1;
      GIData.Z_N_WEI_TOT_OIL = 1;

      GIData.ZSTARTTIME = GIData.ZSTARTTIME.substr(0, 2) + ":" + GIData.ZSTARTTIME.substr(2, 2) + ":" + GIData.ZSTARTTIME.substr(4, 2)
      GIData.ZENDTIME = GIData.ZENDTIME.substr(0, 2) + ":" + GIData.ZENDTIME.substr(2, 2) + ":" + GIData.ZENDTIME.substr(4, 2)
      this.loadingVisible = true;

      var zsdt6460: ZSDT6460Model;
      var zsdt6460List: ZSDT6460Model[] = [];
      if (carData.load1 == "" || carData.load1 == null) {
        carData.load1 = 0 
      }
      if (carData.load2 == "" || carData.load2 == null) {
        carData.load2 = 0
      }
      if (carData.load3 == "" || carData.load3 == null) {
        carData.load3 = 0
      }
      if (carData.load4 == "" || carData.load4 == null) {
        carData.load4 = 0
      }
      if (carData.load5 == "" || carData.load5 == null) {
        carData.load5 = 0
      }
      if (carData.load6 == "" || carData.load6 == null) {
        carData.load6 = 0
      }
      if (carData.load7 == "" || carData.load7 == null) {
        carData.load7 = 0
      }
      if (carData.load8 == "" || carData.load8 == null) {
        carData.load8 = 0
      }
      if (carData.load9 == "" || carData.load9 == null) {
        carData.load9 = 0
      }
      if (carData.load10 == "" || carData.load10 == null) {
        carData.load10 = 0
      }
      if (this.selectCSpart === "30") {
        zsdt6460 = new ZSDT6460Model(thisObj.appConfig.mandt, GIData.VBELN, GIData.POSNR, GIData.ZSHIPMENT_NO, GIData.ZCARNO, GIData.KUNAG, GIData.VRKME,
          "01", carData.ZTANKLITER1 ?? "0", carData.load1 ?? "0", carData.outData1 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime1 ?? "54000000", 'HH:mm:ss', "en-US")), formatDate(carData.endTime1 ?? "54000000", 'HH:mm:ss', "en-US"),
          "02", carData.ZTANKLITER2 ?? "0", carData.load2 ?? "0", carData.outData2 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime2 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime2 ?? "54000000", 'HH:mm:ss', "en-US")),
          "03", carData.ZTANKLITER3 ?? "0", carData.load3 ?? "0", carData.outData3 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime3 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime3 ?? "54000000", 'HH:mm:ss', "en-US")),
          "04", carData.ZTANKLITER4 ?? "0", carData.load4 ?? "0", carData.outData4 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime4 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime4 ?? "54000000", 'HH:mm:ss', "en-US")),
          "05", carData.ZTANKLITER5 ?? "0", carData.load5 ?? "0", carData.outData5 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime5 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime5 ?? "54000000", 'HH:mm:ss', "en-US")),
          "06", carData.ZTANKLITER6 ?? "0", carData.load6 ?? "0", carData.outData6 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime6 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime6 ?? "54000000", 'HH:mm:ss', "en-US")),
          "07", carData.ZTANKLITER7 ?? "0", carData.load7 ?? "0", carData.outData7 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime7 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime7 ?? "54000000", 'HH:mm:ss', "en-US")),
          "08", carData.ZTANKLITER8 ?? "0", carData.load8 ?? "0", carData.outData8 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime8 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime8 ?? "54000000", 'HH:mm:ss', "en-US")),
          "09", carData.ZTANKLITER9 ?? "0", carData.load9 ?? "0", carData.outData9 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime9 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime9 ?? "54000000", 'HH:mm:ss', "en-US")),
          "10", carData.ZTANKLITER10 ?? "0", carData.load10 ?? "0", carData.outData10 ?? "0",
          await this.changeTimeToString(formatDate(carData.startTime10 ?? "54000000", 'HH:mm:ss', "en-US")), await this.changeTimeToString(formatDate(carData.endTime10 ?? "54000000", 'HH:mm:ss', "en-US")),
          "", this.appConfig.interfaceId, oilDate, oilTime, this.appConfig.interfaceId, oilDate, oilTime, DIMModelStatus.Add);

        zsdt6460List = [zsdt6460];
      } else {
        zsdt6460List = [];

      }

      var gidataList = [GIData]

      var liqModel = new ZSDIFPORTALSAPGIYCLIQRcvModel("", "", gidataList, zsdt6460List);
      var modelList: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [liqModel];
      console.log(liqModel)
      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPGIYCLIQRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPGIYCLIQRcvModelList", modelList, QueryCacheType.None);


      //ZMMOILGirecvModel
      var insertData = thisObj.oilFormData;
      let oilCVTIme = formatDate(new Date(), "HH:mm:ss", "en-US");
      let oilNowDate = new Date();
      let minDate = new Date("0001-01-01");
      let minTtime = formatDate(new Date("0001-01-01"), "HHmmss", "en-US");
      var werks = selectData[0].WERKS
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


      var zmms3210ModelList: ZMMS3210Model[] = [];
      var jaego = insertData.ZMENGE4

      sorted_list.forEach(async (array: any) => {

        if (jaego > 0 && jaego > array.ChulHaJaeGo) {
          jaego = jaego - array.ChulHaJaeGo
          zmms3210ModelList.push(new ZMMS3210Model("R", giGubun, insertData.VBELN, insertData.POSNR, array.MATNR, array.ZTANK, array.ZIIPNO, array.BUDAT, array.GRTYP, "R", "",
            insertData.ZMENGE2, jaego, 0, 0, oilNowDate, oilCVTIme, minDate, minTime, "", minDate, minTime, DIMModelStatus.Add));

        } else if (jaego > 0 && jaego < array.ChulHaJaeGo) {
          jaego = jaego - array.ChulHaJaeGo
          zmms3210ModelList.push(new ZMMS3210Model("R", giGubun, insertData.VBELN, insertData.POSNR, array.MATNR, array.ZTANK, array.ZIIPNO, array.BUDAT, array.GRTYP, "R", "",
            insertData.ZMENGE2, jaego, 0, 0, oilNowDate, oilCVTIme, minDate, minTime, "", minDate, minTime, DIMModelStatus.Add));

        }
      });
      var oilSub = new ZMMOILGirecvModel(zmms9900, "R", werks, zmms3210ModelList);

      var oilSubModelList: ZMMOILGirecvModel[] = [oilSub];
      this.rowCount = await this.dataService.RefcCallUsingModel<ZMMOILGirecvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMOILGirecvModelList", oilSubModelList, QueryCacheType.None);

      this.loadingVisible = false;

      return resultModel[0];
    } catch (error) {
      alert("error", "알림");
      return null;

    }
  }

  //데이터 저장로직
  public async cheSaveData(thisObj: SHPMComponent) {
    try {
      var selectData: ZSDS6430Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
      var GIData = thisObj.chepopItemData;
      var carData = thisObj.carFormData;
      var headData = thisObj.chepopHeaderData;
      let minTime = formatDate(new Date("0001-01-01"), "HH:mm:ss", "en-US");

      let oilDate = new Date();
      let oilTime = formatDate(new Date(), "HH:mm:ss", "en-US");
      var model: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [];

      GIData.ZUNLOAD = this.unloadInfoValue;

      if (GIData.ZMENGE3 === 0) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("출고수량입력은 필수입니다.", "E"));
        return model[0];
      }

      if (GIData.WADAT_IST === null) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("출고전기일자는 필수입니다.", "E"));
        return model[0];
      }

      if (GIData.ZSHIPMENT_DATE === null) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("배차일자는 필수입니다.", "E"));
        return model[0];
      }

      if (GIData.ZUNLOAD === null || GIData.ZUNLOAD === undefined) {
        model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("하차정보는 필수입니다.", "E"));
        return model[0];
      }


      //if (selectData[0].VSBED === "Z4") {
      //  await alert("온도기준 출고수량은 정산량으로 설정됩니다.", "알림");
      //  GIData.ZMENGE3 = GIData.Z_N_WEI_NET;
      //}

      GIData.ZREQTYPE = "I";
      GIData.ZTEMP = "1";

      GIData.ZSTARTTIME = GIData.ZSTARTTIME.substr(0, 2) + ":" + GIData.ZSTARTTIME.substr(2, 2) + ":" + GIData.ZSTARTTIME.substr(4, 2)
      GIData.ZENDTIME = GIData.ZENDTIME.substr(0, 2) + ":" + GIData.ZENDTIME.substr(2, 2) + ":" + GIData.ZENDTIME.substr(4, 2)
      console.log(GIData)
      this.loadingVisible = true;

      var zsdt6460List: ZSDT6460Model[] = [];
      var gidataList = [GIData]


      var liqModel = new ZSDIFPORTALSAPGIYCLIQRcvModel("", "", gidataList, zsdt6460List);
      var modelList: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [liqModel];

      var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPGIYCLIQRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPGIYCLIQRcvModelList", modelList, QueryCacheType.None);
      this.loadingVisible = false;

      return resultModel[0];
    } catch (error) {
      alert("error", "알림");
      return null;

    }
  }
  public async changeTimeToString(oldStr: string) {
    var newStr: string = "";
    if (oldStr === undefined) newStr = "00:00:00";
    else newStr = oldStr;

    return newStr;
  }



  /**
 * 파서블 엔트리 데이터 로딩 완료
 * @param e
 */
  onPEDataLoaded(e: any) {
    this.loadingVisible = true;

    this.loadePeCount++;
    console.info(`DATA LOAD COUNT: ${this.loadePeCount}`);
    /*
     if (e.component.ClearSelectedValue != undefined) {
       setTimeout(() => {
         e.component.ClearSelectedValue();
       });
     }
     */
    if (this.loadePeCount >= 6) {
      this.loadingVisible = false;
      this.loadePeCount = 0;
    }
  }

  //메인데이터 더블클릭 이벤트
  async mainDBClick(e: any) {
    this.loadingVisible = true;

    //파서블엔트리 초기화
    this.clearEntery();
    this.oilSubDataLoad();
    this.loadingVisible = false;

    setTimeout(async (
    ) => {


      //유창정보 초기화
      this.popOilDepotData = [];

      if (this.selectCSpart === "20") {
        this.loadingVisible = true;

        var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();

        let testInData = new TestInData(selectData[0].MATNR, selectData[0].ARKTX);
        let testDataStr = JSON.stringify(testInData);
        let queryParam = new QueryParameter("testIn", QueryDataType.String, testDataStr, "", "", "", "");

        let TestResultQuery = new QueryMessage(QueryRunMethod.Alone, "testResult", "#func", "NBPDataModels@NAMHE.CustomFunction.QmsTestResultInterface", [], [queryParam]);
        var resultSet = await this.dataService.dbSelectToDataSet([TestResultQuery]);
        this.resultS = resultSet.getDataObject("tData", TestDataList);


        //팝업 헤더정보 입력
        this.chepopHeaderData.VBELN = selectData[0].VBELN;
        this.chepopHeaderData.POSNR = selectData[0].POSNR;
        this.chepopHeaderData.ZMENGE2 = selectData[0].ZMENGE2;
        this.chepopHeaderData.ZMENGE4 = selectData[0].ZMENGE4;
        
        //팝업 아이템정보 입력
        this.chepopItemData = new ZSDS6450Model(selectData[0].VBELN, selectData[0].POSNR, "", selectData[0].ZSHIPSTATUS, selectData[0].KZPOD, selectData[0].VGBEL,
          selectData[0].VGPOS, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL, selectData[0].ZMENGE3,
          new Date(), selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].KUNNR, selectData[0].KUNAG, selectData[0].SPART,
          selectData[0].WERKS, selectData[0].LFART, 0, 0, 0, 0, "", "", "", "", "000000", "000000", selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE,
          selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, "", selectData[0].ZPHONE, selectData[0].ZPHONE1, "", "10", selectData[0].ZSHIPMENT_NO,
          selectData[0].ZSHIPMENT_DATE, "", "", DIMModelStatus.UnChanged);
        var resultModel = await this.dataService.SelectModelData<ZCMT0020CustomModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZCMT0020CustomModelList",
          [this.appConfig.mandt, selectData[0].MATNR], "", "", QueryCacheType.None);

        if (resultModel.length > 0) {
        var resultValue = this.chemTrp.find(item => item.HWAMUL === resultModel[0].ZCM_CODE2)
          this.chepopItemData.ZRACK = resultValue.RACK
          this.chepopItemData.ZPUMP = resultValue.PIPE
          this.chepopItemData.ZTANK = resultValue.TANK
        }
        //파서블엔트리 값설정
        this.matnrValue = selectData[0].MATNR;
        this.checarnoValue = selectData[0].ZCARNO;
        this.tdlnrValue = selectData[0].Z4PARVW;
        this.tdlnr1Value = selectData[0].Z3PARVW;
        this.truckTypeValue = selectData[0].ZCARTYPE;
        this.chepopItemData.ZMENGE3 = selectData[0].ZMENGE4;
        this.loadingVisible = false;

        this.chePopupVisible = true;

      } else {
        this.loadingVisible = true;

        var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();
        this.oilFormData = selectData[0];
        this.carnoValue = selectData[0].ZCARNO;
        console.log(this.carnoValue)
        Object.assign(this.oilFormData, { CHJANG: "1", OrderDate: new Date(), jisija: "30189", gubun: "1" });

        //팝업 헤더정보 입력
        this.popHeaderData.VBELN = selectData[0].VBELN;
        this.popHeaderData.POSNR = selectData[0].POSNR;
        this.popHeaderData.ZMENGE2 = selectData[0].ZMENGE2;
        this.popHeaderData.ZMENGE4 = selectData[0].ZMENGE4;

        //팝업 아이템정보 입력
        this.popItemData = new ZSDS6450Model(selectData[0].VBELN, selectData[0].POSNR, "", selectData[0].ZSHIPSTATUS, selectData[0].KZPOD, selectData[0].VGBEL,
          selectData[0].VGPOS, selectData[0].MATNR, selectData[0].ARKTX, selectData[0].ZMENGE2, selectData[0].VRKME, selectData[0].VSTEL, selectData[0].ZMENGE3,
          new Date(), selectData[0].BRGEW, selectData[0].GEWEI, selectData[0].LGORT, selectData[0].KUNNR, selectData[0].KUNAG, selectData[0].SPART,
          selectData[0].WERKS, selectData[0].LFART, 0, 0, 0, 0, "", "", "", "", "000000", "000000", selectData[0].Z3PARVW, selectData[0].Z4PARVW, selectData[0].ZCARTYPE,
          selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, "", selectData[0].ZPHONE, selectData[0].ZPHONE1, "", "10", selectData[0].ZSHIPMENT_NO,
          selectData[0].ZSHIPMENT_DATE, "", "", DIMModelStatus.UnChanged);

        //파서블엔트리 값설정
        this.matnrValue = selectData[0].MATNR;
        this.zcarnoValue = selectData[0].ZCARNO;
        this.tdlnrValue = selectData[0].Z4PARVW;
        this.tdlnr1Value = selectData[0].Z3PARVW;
        this.truckTypeValue = selectData[0].ZCARTYPE;
        this.popItemData.ZMENGE3 = selectData[0].ZMENGE4;
        this.loadingVisible = false;

        this.popupVisible = true;
      }
    }, 100);
  }

  async printRef(e: any) {
    if (this.orderGrid.instance.getSelectedRowsData().length > 1) {
      alert("단일 행 선택 후 전표 출력이 가능합니다.", "알림");
      return;
    }
    else {

      let selectData = this.orderGrid.instance.getSelectedRowsData()[0];
      let params: ParameterDictionary =
      {
        "dbTitle": this.appConfig.dbTitle,
        "Ivbeln": selectData.VBELN,
        "Tddat": selectData.TDDAT
      };

      if (selectData.SPART === "20")
        setTimeout(() => { this.reportViewer.printReport("MeterTicket", params) });
      else
        setTimeout(() => { this.reportViewer.printReport("MeterTicketOil", params) });
    }
  }

  //운송사 변경 이벤트
  onTdlnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.Z4PARVW = e.selectedValue;
      /*this.tdlnrValue = e.selectedValue;*/
    });
  }

  //운송사 변경 이벤트
  onTdlnr1CodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.Z3PARVW = e.selectedValue;
      /*this.tdlnrValue = e.selectedValue;*/
    });
  }

  //하차
  onzunloadCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.ZUNLOAD = e.selectedValue;
      /*this.unloadInfoValue = e.selectedValue;*/
    });
  }
  //화물차종
  onzcartypeCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.ZCARTYPE = e.selectedValue;
      /*this.truckTypeValue = e.selectedValue;*/
    });
  }

  //자재명 변경이벤트
  onmatnrCodeValueChanged(e: any) {
    setTimeout(() => {
      this.popItemData.MATNR = e.selectedValue;
      /*this.matnrValue = e.selectedValue;*/
    });
  }

  //차량번호 선택이벤트
  async onZcarnoCodeValueChanged(e: any) {
    /*    setTimeout(() => {*/
    this.zcarnoValue = e.selectedValue;
    this.popItemData.ZCARNO = e.selectedValue;
    if (e.selectedItem !== null) {
      this.popItemData.ZDRIVER = e.selectedItem.ZDERIVER1;
      this.popItemData.ZPHONE = e.selectedItem.ZPHONE1;
      this.popItemData.ZCARTYPE = e.selectedItem.ZCARTYPE1;
    }
    var zcarno = this.zcarnoValue
    var selectResultData = await this.dataService.SelectModelData<ZSDT7020Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7020ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND ZCARNO = '${zcarno}' `, "", QueryCacheType.None);
    this.carFormData = selectResultData[0];
    if (selectResultData.length > 0) {
      //출고량
      var total = this.popItemData.ZMENGE3;
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
    }
  }
  /* Entry Data Form에 바인딩 */
  //분할 차량번호 선택이벤트
  async ZcarNoCodeValueChanged(e: any) {
    setTimeout(() => {
      this.carnoValue = e.selectedValue;
      console.log(this.carnoValue)
      this.oilFormData.ZCARNO = e.selectedValue;
      if (e.selectedItem !== null) {
        this.oilFormData.ZDRIVER = e.selectedItem.ZDERIVER1;
        this.oilFormData.ZPHONE = e.selectedItem.ZPHONE1;
        this.oilFormData.ZRFID = e.selectedItem.ZRFID;
      }
    });
  }

  async cheZcarNoCodeValueChanged(e: any) {
    setTimeout(() => {
      this.checarnoValue = e.selectedValue;
      this.chepopItemData.ZCARNO = e.selectedValue;
      if (e.selectedItem !== null) {
        this.chepopItemData.ZDRIVER = e.selectedItem.ZDERIVER1;
        this.chepopItemData.ZPHONE = e.selectedItem.ZPHONE1;
      }
    });
  }
  async DataChanged(e: any) {
    if (e.dataField === "ZTANK") {
      this.oilSubDataLoad();
    }
    if (e.dataField === "ZTEMP") {
      var temp = this.popItemData.ZTEMP;
      var ggdenSelectResult = await this.dataService.SelectModelData<UTIGGDENFCustomModel[]>(this.appConfig.ncoilTitle, "NBPDataModels", "NAMHE.Model.UTIGGDENFCustomModelList", ["1", temp],
        "", "", QueryCacheType.None);

      this.popItemData.Z_N_WEI_NET = this.popItemData.ZMENGE3 * ggdenSelectResult[0].GGVCF
    }
    if (e.dataField === "ZMENGE3") {
    Object.assign(this.carFormData, { load1: "", load2: "", load3: "", load4: "", load5: "", load6: "", load7: "", load8: "", load9: "", load10: "" });

      //출고량
      var total = this.popItemData.ZMENGE3;
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


    }

    //if (e.dataField === "ZSTARTTIME") {
    //  this.carFormData.startTime1 = e.value;
    //}

    if (e.dataField === "ZENDTIME") {

      if (this.popItemData.ZSTARTTIME === "000000" || this.popItemData.ZSTARTTIME === "")
        return;
      
      var startDateTime = new Date(1, 1, 1, Number(this.popItemData.ZSTARTTIME.substr(0, 2)),
        Number(this.popItemData.ZSTARTTIME.substr(2, 2)), Number(this.popItemData.ZSTARTTIME.substr(4, 2)));
      var endDateTime = new Date(1, 1, 1, Number(this.popItemData.ZENDTIME.substr(0, 2)),
        Number(this.popItemData.ZENDTIME.substr(2, 2)), Number(this.popItemData.ZENDTIME.substr(4, 2)));

      var defTime = endDateTime.getTime() - startDateTime.getTime();
      if (defTime === 0)
        return;

      var realTankCount = 0;
      for (var i = 1; i <= this.carFormData.ZCARTANK; i++) {
        const load = "load" + i;      //시작시간필드

        if (this.carFormData[load] === 0)
          break;

        realTankCount = realTankCount + 1;
      }

      var defConvTime = defTime / 1000 / 60;
      var defSetTime = defConvTime / realTankCount * 100;
      var sTime = Number(this.popItemData.ZSTARTTIME);
      var eTime = Number(this.popItemData.ZENDTIME);   

      for (var i = 1; i <= realTankCount; i++) {
        const start = "startTime" + i;      //시작시간필드
        const end = "endTime" + i; //종료시간필드

        /*this.carFormData[start] = sTime.toString().substr(0, 2) + ":" + sTime.toString().substr(2, 2) + ":" + sTime.toString().substr(4, 2);*/
        this.carFormData[start] = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(),
          Number(sTime.toString().substr(0, 2)), Number(sTime.toString().substr(2, 2)), Number(sTime.toString().substr(4, 2)));
        sTime = sTime + defSetTime;
        if (i === this.carFormData.ZCARTANK)
          sTime = eTime;

        this.carFormData[end] = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(),
          Number(sTime.toString().substr(0, 2)), Number(sTime.toString().substr(2, 2)), Number(sTime.toString().substr(4, 2)));
        //this.carFormData[end] = sTime.toString().substr(0, 2) + ":" + sTime.toString().substr(2, 2) + ":" + sTime.toString().substr(4, 2);
      }
    }
  }


  async cheform_fieldDataChanged(e: any) {
    //정산수량 수정 예정
    this.chepopItemData.Z_N_WEI_TOT_OIL = this.chepopItemData.Z_N_WEI_TOT - this.chepopItemData.Z_N_WEI_EMP
    this.chepopItemData.ZMENGE3 = this.chepopItemData.Z_N_WEI_TOT_OIL

    var calcul = this.calculChemList.find(item => item.MATNR === this.chepopItemData.MATNR);
    if (calcul !== undefined) {
      if (calcul.TYPE === "VAL") {
        this.chepopItemData.Z_N_WEI_NET = calcul.VAL * this.chepopItemData.ZMENGE3;
      } else {

        var testitm = this.resultS.find(item => item.testitem.startsWith("H2SO4"));
        if (testitm !== undefined) {
          this.chepopItemData.Z_N_WEI_NET = (Number(testitm.val) / 100) * this.chepopItemData.ZMENGE3;
        } else {
          this.chepopItemData.Z_N_WEI_NET = this.chepopItemData.ZMENGE3;
        }
      }
    } else {
      this.chepopItemData.Z_N_WEI_NET = this.chepopItemData.ZMENGE3;
    }
  }
  //팝업화면에 사용되는 엔트리 초기화
  public clearEntery() {
    /*this.unloadInfoCodeDynamic.ClearSelectedValue()*/
    this.matnrCodeDynamic.ClearSelectedValue();
    this.truckTypeCodeDynamic.ClearSelectedValue();
    this.tdlnrCodeDynamic.ClearSelectedValue();
    this.zcarnoCodeDynamic.ClearSelectedValue();
  }

}
