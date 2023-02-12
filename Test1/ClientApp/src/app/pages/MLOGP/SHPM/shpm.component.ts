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

import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ZSDIFPORTALSAPGIYCLIQRcvModel, ZSDS6450Model, ZSDT6460Model } from '../../../shared/dataModel/MLOGP/ZsdIfPortalSapGiYcliqRcvProxy';
import { HeaderData, OilDepot } from '../SHPC/app.service';
import { ReportViewerComponent } from '../../../shared/components/reportviewer/report-viewer';
import { ZSDT7020Model } from '../../../shared/dataModel/MFSAP/Zsdt7020Proxy';
import { async } from 'rxjs';

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
  //출고팝업 아이템정보
  popItemData!: ZSDS6450Model;
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

  //배차팝업 선택값
  selectGrid2Data: ZSDS6450Model[] = [];
  //_dataService: ImateDataService;

  enteryLoading: boolean = false;
  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 수동출고등록";

    let thisObj = this;

    this.loadingVisible = true;

    //화학, 유류 구분
    this.cSpart = service.getCSpart();

    //파서블엔트리 초기화
    this.unloadInfoCode = appConfig.tableCode("하차정보");
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
    this.unloadInfoValue = "";
    this.matnrValue = "";
    this.truckTypeValue = "";
    this.tdlnrValue = "";
    this.tdlnr1Value = "";
    this.zcarnoValue = "";
    const that = this;

    //date
    var now = new Date();
    this.startDate = formatDate(now.setDate(now.getDate() - 7), "yyyy-MM-dd", "en-US");
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
        if (that.carFormData.load1 !== undefined) {
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
        }
        if (that.carFormData.load2 !== undefined) {
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
        }
        if (that.carFormData.load3 !== undefined) {
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
        }
        if (that.carFormData.load4 !== undefined) {
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
        }
        if (that.carFormData.load5 !== undefined) {
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
        }
        if (that.carFormData.load6 !== undefined) {
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
        }
        if (that.carFormData.load7 !== undefined) {
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
        }
        if (that.carFormData.load8 !== undefined) {
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
        }
        if (that.carFormData.load9 !== undefined) {
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
        }
        if (that.carFormData.load10 !== undefined) {
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
        }
        if (this.carFormData.load1 < this.carFormData.outData1) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        } if (this.carFormData.load2 < this.carFormData.outData2) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        } if (this.carFormData.load3 < this.carFormData.outData3) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        } if (this.carFormData.load4 < this.carFormData.outData4) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        } if (this.carFormData.load5 < this.carFormData.outData5) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        } if (this.carFormData.load6 < this.carFormData.outData6) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        } if (this.carFormData.load7 < this.carFormData.outData7) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        } if (this.carFormData.load8 < this.carFormData.outData8) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        } if (this.carFormData.load9 < this.carFormData.outData9) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        } if (this.carFormData.load10 < this.carFormData.outData10) {
          alert("출고수량은 납품수량을 넘을 수 없습니다.", "알림");
          return;
        }
        if (await confirm("출고 처리하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          await thisObj.saveData(thisObj);
          await alert("출고 처리되었습니다.", "알림");
          this.loadingVisible = false;

          await this.dataLoad();
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
        if (await confirm("출고 처리하시겠습니까?", "알림")) {
          this.loadingVisible = true;
          var result = await thisObj.saveData(thisObj);
          await alert("출고 처리되었습니다.", "알림");
          this.loadingVisible = false;

          //if (result.E_MTY === "E")
          //  alert(result.E_MSG, "알림");
          //else {
          //  await alert("저장되었습니다.", "알림");
          //  await this.printRef(null);
          //}


          await this.dataLoad();
        }
      },
    };
    //출고취소버튼
    this.CGiButtonOptions = {
      text: "출고취소",
      onClick: async () => {

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
  }

  //Data refresh 날짜 새로고침 이벤트
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();

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
    let fixData = { I_ZSHIPSTATUS: "30" };
    var zsds6430: ZSDS6430Model[] = [];
    if (this.selectCSpart === "20")
      this.intLGORT = "";
    else
      this.intLGORT = "6000";

    var zsdif = new ZSDIFPORTALSAPLELIQSndModel("", "", "", "", "", this.intLGORT, "", this.selectCSpart, this.startDate, this.endDate, "", "", "", "", "", "", fixData.I_ZSHIPSTATUS, zsds6430);

    var model: ZSDIFPORTALSAPLELIQSndModel[] = [zsdif];

    var resultModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQSndModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQSndModelList", model, QueryCacheType.None);

    this.orderGridData = resultModel[0].IT_DATA;

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "POSNR", "ZSEQUENCY"],
        data: this.orderGridData
      });
    this.loadingVisible = false;
  }

  //데이터 저장로직
  public async saveData(thisObj: SHPMComponent) {
    try {
      var selectData: ZSDS6430Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
      var GIData = thisObj.popItemData;
      var carData = thisObj.carFormData;
      var headData = thisObj.popHeaderData;
      let minTime = formatDate(new Date("0001-01-01"), "HH:mm:ss", "en-US");

      let oilDate = new Date();
      let oilTime = formatDate(new Date(), "HH:mm:ss", "en-US");
      var model: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [];

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

      this.loadingVisible = false;

      if (selectData[0].VSBED === "Z4") {
        await alert("온도기준 출고수량은 정산량으로 설정됩니다.", "알림");
        GIData.ZMENGE3 = GIData.Z_N_WEI_NET;
      }

      GIData.ZREQTYPE = "I";
      //if (GIData.ZMENGE3 > selectData[0].ZMENGE3) {
      //  model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("출고수량은 납품수량을 넘을 수 없습니다.", "E"));
      //  return model[0];
      //}

      this.loadingVisible = true;


      //var zsdt6460 = new ZSDT6460Model(thisObj.appConfig.mandt, GIData.VBELN, GIData.POSNR, GIData.ZSHIPMENT_NO, GIData.ZCARNO, GIData.KUNAG, GIData.VRKME,
      //  "01", carData.ZTANKLITER1 ?? "0", carData.load1 ?? "0", carData.outData1 ?? "0", formatDate(carData.startTime1 ?? new Date("00:00:00 +9:00:00"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime1 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "02", carData.ZTANKLITER2 ?? "0", carData.load2 ?? "0", carData.outData2 ?? "0", formatDate(carData.startTime2 ?? new Date("0001-01-01 +9:00:00"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime2 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "03", carData.ZTANKLITER3 ?? "0", carData.load3 ?? "0", carData.outData3 ?? "0", formatDate(carData.startTime3 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime3 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "04", carData.ZTANKLITER4 ?? "0", carData.load4 ?? "0", carData.outData4 ?? "0", formatDate(carData.startTime4 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime4 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "05", carData.ZTANKLITER5 ?? "0", carData.load5 ?? "0", carData.outData5 ?? "0", formatDate(carData.startTime5 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime5 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "06", carData.ZTANKLITER6 ?? "0", carData.load6 ?? "0", carData.outData6 ?? "0", formatDate(carData.startTime6 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime6 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "07", carData.ZTANKLITER7 ?? "0", carData.load7 ?? "0", carData.outData7 ?? "0", formatDate(carData.startTime7 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime7 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "08", carData.ZTANKLITER8 ?? "0", carData.load8 ?? "0", carData.outData8 ?? "0", formatDate(carData.startTime8 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime8 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "09", carData.ZTANKLITER9 ?? "0", carData.load9 ?? "0", carData.outData9 ?? "0", formatDate(carData.startTime9 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime9 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "10", carData.ZTANKLITER10 ?? "0", carData.load10 ?? "0", carData.outData10 ?? "0", formatDate(carData.startTime10 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime10 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
      //  "", this.appConfig.interfaceId, oilDate, oilTime, this.appConfig.interfaceId, oilDate, oilTime, DIMModelStatus.Add);



      var zsdt6460 = new ZSDT6460Model(thisObj.appConfig.mandt, GIData.VBELN, GIData.POSNR, GIData.ZSHIPMENT_NO, GIData.ZCARNO, GIData.KUNAG, GIData.VRKME,
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

      var zsdt6460List: ZSDT6460Model[] = [zsdt6460];
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

  //데이터 저장로직
  public async cheSaveData(thisObj: SHPMComponent) {
    try {
      var selectData: ZSDS6430Model[] = thisObj.orderGrid.instance.getSelectedRowsData();
      var GIData = thisObj.popItemData;
      var carData = thisObj.carFormData;
      var headData = thisObj.popHeaderData;
      let minTime = formatDate(new Date("0001-01-01"), "HH:mm:ss", "en-US");

      let oilDate = new Date();
      let oilTime = formatDate(new Date(), "HH:mm:ss", "en-US");
      var model: ZSDIFPORTALSAPGIYCLIQRcvModel[] = [];

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

      this.loadingVisible = false;

      if (selectData[0].VSBED === "Z4") {
        await alert("온도기준 출고수량은 정산량으로 설정됩니다.", "알림");
        GIData.ZMENGE3 = GIData.Z_N_WEI_NET;
      }

      GIData.ZREQTYPE = "I";
      //if (GIData.ZMENGE3 > selectData[0].ZMENGE3) {
      //  model.push(new ZSDIFPORTALSAPGIYCLIQRcvModel("출고수량은 납품수량을 넘을 수 없습니다.", "E"));
      //  return model[0];
      //}

      this.loadingVisible = true;


      var zsdt6460 = new ZSDT6460Model(thisObj.appConfig.mandt, GIData.VBELN, GIData.POSNR, GIData.ZSHIPMENT_NO, GIData.ZCARNO, GIData.KUNAG, GIData.VRKME,
        "01", carData.ZTANKLITER1 ?? "0", carData.load1 ?? "0", carData.outData1 ?? "0", formatDate(carData.startTime1 ?? new Date("00:00:00 +9:00:00"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime1 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "02", carData.ZTANKLITER2 ?? "0", carData.load2 ?? "0", carData.outData2 ?? "0", formatDate(carData.startTime2 ?? new Date("0001-01-01 +9:00:00"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime2 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "03", carData.ZTANKLITER3 ?? "0", carData.load3 ?? "0", carData.outData3 ?? "0", formatDate(carData.startTime3 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime3 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "04", carData.ZTANKLITER4 ?? "0", carData.load4 ?? "0", carData.outData4 ?? "0", formatDate(carData.startTime4 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime4 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "05", carData.ZTANKLITER5 ?? "0", carData.load5 ?? "0", carData.outData5 ?? "0", formatDate(carData.startTime5 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime5 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "06", carData.ZTANKLITER6 ?? "0", carData.load6 ?? "0", carData.outData6 ?? "0", formatDate(carData.startTime6 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime6 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "07", carData.ZTANKLITER7 ?? "0", carData.load7 ?? "0", carData.outData7 ?? "0", formatDate(carData.startTime7 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime7 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "08", carData.ZTANKLITER8 ?? "0", carData.load8 ?? "0", carData.outData8 ?? "0", formatDate(carData.startTime8 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime8 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "09", carData.ZTANKLITER9 ?? "0", carData.load9 ?? "0", carData.outData9 ?? "0", formatDate(carData.startTime9 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime9 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "10", carData.ZTANKLITER10 ?? "0", carData.load10 ?? "0", carData.outData10 ?? "0", formatDate(carData.startTime10 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"), formatDate(carData.endTime10 ?? new Date("0001-01-01"), 'HH:mm:ss', "en-US"),
        "", this.appConfig.interfaceId, oilDate, oilTime, this.appConfig.interfaceId, oilDate, oilTime, DIMModelStatus.Add);



      var zsdt6460List: ZSDT6460Model[] = [zsdt6460];
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

  //배차등록
  public async createOrder() {
    var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();
    var modelList: ZSDS6450Model[] = [];
    selectData.forEach(async (row: ZSDS6430Model) => {

    });

    //var zsd6440list: ZSDS6440Model[] = this.popupData;

    //zsd6440list.forEach(async (row: ZSDS6440Model) => {
    //  row.ZSHIPSTATUS = "30";
    //});

    //var createModel = new ZSDIFPORTALSAPLELIQRcvModel("", "", modelList);
    //var createModelList: ZSDIFPORTALSAPLELIQRcvModel[] = [createModel];

    //var insertModel = await this.dataService.RefcCallUsingModel<ZSDIFPORTALSAPLELIQRcvModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDIFPORTALSAPLELIQRcvModelList", createModelList, QueryCacheType.None);
    //return insertModel[0];

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
    if (this.loadePeCount >= 6) {
      this.loadingVisible = false;
      this.loadePeCount = 0;
    }
  }

  //메인데이터 더블클릭 이벤트
  async mainDBClick(e: any) {
    //파서블엔트리 초기화
    this.clearEntery();

    setTimeout(async (
    ) => {
      var selectData: ZSDS6430Model[] = this.orderGrid.instance.getSelectedRowsData();

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
        selectData[0].ZCARNO, selectData[0].ZDRIVER, selectData[0].ZDRIVER1, "", selectData[0].ZPHONE, selectData[0].ZPHONE1, "", "", selectData[0].ZSHIPMENT_NO,
        selectData[0].ZSHIPMENT_DATE, "", "", DIMModelStatus.UnChanged);

      //파서블엔트리 값설정
      this.matnrValue = selectData[0].MATNR;
      this.zcarnoValue = selectData[0].ZCARNO;
      this.tdlnrValue = selectData[0].Z4PARVW;
      this.tdlnr1Value = selectData[0].Z3PARVW;
      this.truckTypeValue = selectData[0].ZCARTYPE;
      this.popItemData.ZMENGE3 = selectData[0].ZMENGE4;


      //유창정보 초기화
      this.popOilDepotData = [];

      var zcarno = selectData[0].ZSHIPMENT_NO


      //selectResultData.forEach(async (array: any) => {
      //  var model = new OilDepot();
      //  model.ZTANKLITER = array.ZLITER
      //  model.N_ALLOC = array.ZCARTANK

      //  this.popOilDepotData.push(model);
      //});


      //this.popOilDepot = new ArrayStore(
      //  {
      //    key: ["C_PART"],
      //    data: this.popOilDepotData
      //  });

      if (this.selectCSpart === "20") {
        this.chePopupVisible = true;
      } else {
        this.popupVisible = true;
      }
    }, 100);
  }

  async getOilDepot() {
    return this.popOilDepotData;
  }

  //저장 이벤트
  async refSaveData(e: any) {
    if (await confirm("저장하시겠습니까?", "알림")) {

      if (this.orderGrid.instance.getSelectedRowsData().length > 0) {
        this.loadingVisible = true;
        var result = await this.createOrder();
        this.loadingVisible = false;
        var reMSG = "";
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
      } else {

      }
    }
  }

  async oilDistClick(e: any) {

  }

  async refConfirmGI(e: any) {


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
        "sPart": selectData.SPART,
        "Ivbeln": selectData.VBELN,
        "Tddat": selectData.TDDAT
      };

      setTimeout(() => { this.reportViewer.OpenReport("MeterTicket", params) });
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
    /*this.zcarnoValue = e.selectedValue;*/
    this.popItemData.ZCARNO = e.selectedValue;
    this.popItemData.ZDRIVER = e.selectedItem.ZDERIVER1;
    this.popItemData.ZPHONE = e.selectedItem.ZPHONE1;
    this.popItemData.ZCARTYPE = e.selectedItem.ZCARTYPE1;

    var zcarno = this.zcarnoValue
    var selectResultData = await this.dataService.SelectModelData<ZSDT7020Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7020ModelList", [],
      `MANDT = '${this.appConfig.mandt}' AND ZCARNO = '${zcarno}' `, "", QueryCacheType.None);
    this.carFormData = selectResultData[0];

    var result = Math.trunc(this.popItemData.ZMENGE3 / (this.carFormData.ZLITER / this.carFormData.ZCARTANK));
    var remainder = this.popItemData.ZMENGE3 % (this.carFormData.ZLITER / this.carFormData.ZCARTANK)
    for (var i = 1; i <= result; i++) {
      const name = "load" + i;
      Object.assign(this.carFormData, { [name]: (this.carFormData.ZLITER / this.carFormData.ZCARTANK) });
    }
    const name = "load" + (result + 1);
    Object.assign(this.carFormData, { [name]: remainder });
    /*    });*/
  }
  async form_fieldDataChanged(e: any) {
    Object.assign(this.carFormData, { load1: "", load2: "", load3: "", load4: "", load5: "", load6: "", load7: "", load8: "", load9: "", load10: "" });

    var result = Math.trunc(this.popItemData.ZMENGE3 / (this.carFormData.ZLITER / this.carFormData.ZCARTANK));
    var remainder = this.popItemData.ZMENGE3 % (this.carFormData.ZLITER / this.carFormData.ZCARTANK)
    for (var i = 1; i <= result; i++) {

      const name = "load" + i;

      Object.assign(this.carFormData, { [name]: (this.carFormData.ZLITER / this.carFormData.ZCARTANK) });
    }
    const name = "load" + (result + 1);
    Object.assign(this.carFormData, { [name]: remainder });

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

