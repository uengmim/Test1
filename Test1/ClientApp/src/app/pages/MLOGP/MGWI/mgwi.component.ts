import { Component, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, Output, Input } from '@angular/core';
import 'devextreme/data/odata/store';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import 'devextreme/data/odata/store';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStore, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { DxDataGridComponent} from 'devextreme-angular';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { AuthService } from '../../../shared/services';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ThemeManager } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { formatDate } from '@angular/common';
import { DxiItemComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';
import { Router } from '@angular/router';
import { alert, confirm } from "devextreme/ui/dialog";
import { Service, Data } from '../MGWI/app.service';
import { ZIMATETESTStructModel, ZXNSCNEWRFCCALLTestModel } from '../../../shared/dataModel/ZxnscNewRfcCallTestFNProxy';


/**
 *
 * 정문 공차/중량계근I/F component
 * */


@Component({
  templateUrl: 'mgwi.component.html',
  providers: [ImateDataService, Service]
})

export class MGWIComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  dataSource: ArrayStore;

  //컬럼 리사이즈 모드
  columnResizeMode: string = ThemeManager.columnResizeMode;


  /* 수동클릭 */
  //수동 등록 팝업
  manualRegisPopupVisible = false;
  //수동 등록 닫기 버튼
  manualRegisPopupClose: any;
  //수동클릭 폼데이터
  manualRegisData: any;

  /* 계근시작 */
  //수동 등록 팝업
  weightStartPopupVisible = false;
  //수동 등록 닫기 버튼
  weightStartPopupClose: any;
  //수동클릭 폼데이터
  weightStartData: any;

  /* 날짜 */
  //날짜 조회
  startDate: any;
  endDate: any;
  now: any = new Date();
  value: Date = new Date(1981, 3, 27);
  min: Date = new Date(1900, 0, 1);
  dateClear = new Date(2015, 11, 1, 6);


  /* 줄선택 */
  //delete
  selectedItemKeys: any[] = [];
  selectedRowIndex = -1;


  //필터
  customOperations!: Array<any>;
  saleAmountHeaderFilter: any;
  popupPosition: any;

  //detail 편집 모드 설정
  startEditAction = 'click';
  selectTextOnEditStart = true;

  //상세팝업 오픈
  popupVisible = false;

  constructor(private dataService: ImateDataService, service: Service, private appInfo: AppInfoService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 정문 공차/중량계근I/F";
    //this._dataService = dataService;

    //메인데이터
    this.dataSource = new ArrayStore({
      key: 'turn',
      data: service.getData(),
    });
    const that = this;


    //수동클릭 닫기 버튼
    this.manualRegisPopupClose = {
      text: '닫기',
      onClick(e: any) {
        that.manualRegisPopupVisible = false;
      },
    };
    //계근시작 닫기 버튼
    this.weightStartPopupClose = {
      text: '닫기',
      onClick(e: any) {
        that.weightStartPopupVisible = false;
      },
    };
  }



  public async dataLoad(dataService: ImateDataService) {
    
    var itInput: ZIMATETESTStructModel[] = [];
    var input1 = new ZIMATETESTStructModel("ABCD", 1.21, 10000, new Date("2020-12-01"), "10:05:30.91");

    itInput.push(new ZIMATETESTStructModel("EGCH", 2.32, 20, new Date("2021-01-02"), "22:00:15.1"));
    itInput.push(new ZIMATETESTStructModel("IJKL", 3.43, 30, new Date("2022-05-11"), "09:20:27.540"));
    itInput.push(new ZIMATETESTStructModel("MNON", 4.54, 40, new Date("2022-04-20"), "16:00:20.101"));

    var rfcModel = new ZXNSCNEWRFCCALLTestModel(input1, itInput);
    var rfcMoelList: ZXNSCNEWRFCCALLTestModel[] = [rfcModel];

    var resultModel = await dataService.RefcCallUsingModel<ZXNSCNEWRFCCALLTestModel[]>("ISTN_INA", "TestModels", "ISTN.Model.ZXNSCNEWRFCCALLTestModelList",
                                                                          rfcMoelList, QueryCacheType.None);
    return resultModel[0].IT_RESULT;
  }

  //--------------------메인-------------------//
  //조회 클릭
  public refreshDataGrid(e: Object) {
    this.dataGrid.instance.refresh();
  }
  //수동등록 클릭
  manualRegis: any = async (thisObj: MGWIComponent) => {
    this.manualRegisPopupVisible = !this.manualRegisPopupVisible;
    this.manualRegisData = { grossWe: "", toleranceWe: "", actualWe: "" };

  }
  //계근시작 클릭
  weightStart: any = async (thisObj: MGWIComponent) => {
    this.weightStartPopupVisible = !this.weightStartPopupVisible;
    this.weightStartData = { grossWe: "", toleranceWe: "", actualWe: "" };

  }
  //삭제 클릭
  deleteRecords() {
    this.selectedItemKeys.forEach((key: any) => {
      this.dataSource.remove(key);
    });
    this.dataGrid.instance.refresh();
  }
  //데이터그리드 더블클릭
  orderDBClick(e: any) {
    this.manualRegisPopupVisible = !this.manualRegisPopupVisible;
  }
  //선택이벤트
  selectionChanged(data: any) {
    this.selectedRowIndex = data.component.getRowIndexByKey(data.currentSelectedRowKeys[0]);
    this.selectedItemKeys = data.currentSelectedRowKeys;

  }

    //--------------------팝업-------------------//
  //테스트
  test() {

  }
  //수동등록전표출력 클릭
  manualStatementOutput: any = async (thisObj: MGWIComponent) => {
    if (this.manualRegisData.grossWe == "") {
      alert("총 중량을 입력해주세요.", "알림");
    }
    else if (this.manualRegisData.toleranceWe == "") {
      alert("공차 중량을 입력해주세요.", "알림");
      return;
    }
    else if (this.manualRegisData.actualWe == "") {
      alert("실 중량을 입력해주세요.", "알림");
      return;
    }

    else {
      //출력이벤트 
    }
  }
  //수동등록전표출력 클릭
  weightStatementOutput: any = async (thisObj: MGWIComponent) => {
    if (this.weightStartData.grossWe == "") {
      alert("총 중량을 입력해주세요.", "알림");
    }
    else if (this.weightStartData.toleranceWe == "") {
      alert("공차 중량을 입력해주세요.", "알림");
      return;
    }
    else if (this.weightStartData.actualWe == "") {
      alert("실 중량을 입력해주세요.", "알림");
      return;
    }

    else {
      //출력이벤트
    }
  }



}
