import { formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Service, YnGubun } from '../OBPC/app.service';
import {
    DxDataGridComponent, DxFormComponent,
    DxPopupComponent,
    DxSelectBoxComponent,
    DxTextBoxComponent
} from 'devextreme-angular';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import ArrayStore from 'devextreme/data/array_store';
import 'devextreme/data/odata/store';
import dxDataGrid from 'devextreme/ui/data_grid';
import { alert, confirm } from "devextreme/ui/dialog";
import dxTextBox from 'devextreme/ui/text_box';
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { ZMMT8700Model } from '../../../shared/dataModel/OBPPT/Zmmt8700';
import { DIMModelStatus } from '../../../shared/imate/dimModelStatusEnum';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { AuthService } from '../../../shared/services';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { ZMMCONMstModel } from '../../../shared/dataModel/OBPPT/ZmmConMst';
import { ZMMS9000Model } from '../../../shared/dataModel/OBPPT/ZmmBidMst';

/* 구매계약확인 Component*/


@Component({
  templateUrl: 'obpc.component.html',
  providers: [ImateDataService, Service]
})



export class OBPCComponent {

  @ViewChild('dataList', { static: false }) dataList!: DxDataGridComponent;
  @ViewChild('bizNoText', { static: false }) bizNoText!: DxTextBoxComponent;
  @ViewChild('companyText', { static: false }) companyText!: DxTextBoxComponent;

  //날짜 선언
  startDate: any;
  endDate: any;

  //로그인 정보 담기
  userInfo: any;

  bizNoValue: string;
  comNmValue: string;

  //그리드 데이터
  gridList!: ArrayStore;
  conFormData: any;

  //접수구분 데이터소스
  ynList: YnGubun[] = [];
  selectBoxValue: string;

  //접수버튼
  btnDisabledValue: boolean = true;

  applyButtonText: string = "계약서<br>접수";


  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service: Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 구매계약확인";

    // 로그인정보 가져오기
    this.userInfo = this.authService.getUser().data;

    this.bizNoValue = this.userInfo?.pin ?? "";
    this.comNmValue = this.userInfo?.deptName ?? "";

    // 접수구분 콤보박스 세팅

    this.ynList = service.getYnGubun();
    this.selectBoxValue = "ALL";

    this.startDate = formatDate(new Date().setDate(new Date().getDate() - 7), "yyyy-MM-dd", "en-US");
    this.endDate = formatDate(new Date(), "yyyy-MM-dd", "en-US");
    this.dataLoad();

    

  }


  // 데이터 조회
  public async dataLoad() {
    try {

      var zmms9000Model = new ZMMS9000Model("", "");

      var zmmconmstModel = new ZMMCONMstModel(zmms9000Model, "X", this.startDate, this.endDate, this.userInfo?.deptId ?? "", []);

      var modeldtlList: ZMMCONMstModel[] = [zmmconmstModel];

      var result = await this.dataService.RefcCallUsingModel<ZMMCONMstModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMCONMstModelList", modeldtlList, QueryCacheType.None);


      this.gridList = new ArrayStore(
        {
          key: ["CONNO"],
          data: result[0].ET_DATA
        });


      //return resultModel;

    } catch (error) {
      console.log(error);
      alert("오류", "오류");
      return error;
    }
  }

  onDateChange(e: any) {
    var staDate = new Date(this.startDate);
    var endDate = new Date(this.endDate);

    var diffDay = Math.floor(Math.abs((staDate.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000)));

    if (diffDay >= 60) {
      alert("조회기간을 최대 60일로 설정해주세요.", "알림");
    } else {
      this.dataLoad();
    }

  }
  selectedChanged(e: any) {
    
    var selectData = this.dataList.instance.getSelectedRowsData();
    this.conFormData = { CONNM: selectData[0].CONNM, CONDT: selectData[0].CONDT, CONNO: selectData[0].CONNO, BIZDT: selectData[0].BIZDT };

    if (selectData[0].BIZAPPYN == "") {
      this.btnDisabledValue = false;
    } else {
      this.btnDisabledValue = true;
    }
  }
  async apply() {
    if (await confirm("계약서를 접수하시겠습니까 ?", "알림")) {

      var selectData = this.dataList.instance.getSelectedRowsData()[0];
      var model: ZMMT8700Model;

      var result = await this.dataService.SelectModelData<ZMMT8700Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8700ModelList", [], `MANDT = '${this.appConfig.mandt}' AND CONNO = '${selectData.CONNO}'`, "", QueryCacheType.None);
      model = result[0];
      model.ModelStatus = DIMModelStatus.Modify;
      model.BIZAPPYN = "X";
      model.BIZDT = new Date();

      var resultRow = this.dataService.ModifyModelData<ZMMT8700Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMT8700ModelList", [model]);
    
      alert("접수완료", "알림");
      this.dataLoad();
    }
  }
  selectApply(e: any) {
    if (e.value == "ALL") {
      this.dataList.instance.clearFilter();
    } else {
      this.dataList.instance.filter(['BIZAPPYN', '=', e.value]);
    }
  }
  

}
