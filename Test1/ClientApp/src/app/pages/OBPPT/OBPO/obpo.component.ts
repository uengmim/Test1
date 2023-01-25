import { formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  DxDataGridComponent, DxFormComponent,
  DxPopupComponent
} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import 'devextreme/data/odata/store';
import { confirm, alert } from "devextreme/ui/dialog";
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { ZMMPOCHANGEConfirmModel, ZMMS0170Model } from '../../../shared/dataModel/OBPPT/ZmmPoChangeConfirm';
import { ZMMPODISPLAYObewModel } from '../../../shared/dataModel/OBPPT/ZmmPoDisplayObew';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { AuthService } from '../../../shared/services';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { AppConfigService } from '../../../shared/services/appconfig.service';
import { Service, YnGubun } from '../OBPO/app.service';

/*구매발주확인 Component*/


@Component({
  templateUrl: 'obpo.component.html',
  providers: [ImateDataService, Service]
})

export class OBPOComponent {
  @ViewChild('poGrid', { static: false }) poGrid!: DxDataGridComponent;

  poDate: any;
  bizNo: string;
  comNm: string;
  name: string;
  poData!: ArrayStore;

  userInfo: any;

  ynList: any;
  selectBoxValue: any;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, service : Service, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 구매발주확인";

    // 로그인정보 가져오기
    this.userInfo = this.authService.getUser().data;

    this.bizNo = this.userInfo?.pin ?? "";
    this.comNm = this.userInfo?.deptName ?? "";
    this.name = this.userInfo?.userName ?? "";


    // 접수구분 콤보박스 세팅

    this.ynList = service.getYnGubun();
    this.selectBoxValue = "ALL";


    this.poDate = formatDate(new Date(), "yyyy-MM-dd", "en-US");
    this.dataLoad();
  }

  searchData(e: any) {
    this.dataLoad();
  }

  async saveData(e: any) {
    var selectData = this.poGrid.instance.getSelectedRowsData();

    if (selectData.length > 0) {
      if (await confirm("발주확인하시겠습니까 ?", "알림")) {
        var model = new ZMMPOCHANGEConfirmModel(new ZMMS0170Model(selectData[0].EBELN, formatDate(new Date(), "yyyyMMdd", "en-US")), []);
        var modelList: ZMMPOCHANGEConfirmModel[] = [model];

        var resultModel = await this.dataService.RefcCallUsingModel<ZMMPOCHANGEConfirmModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMPOCHANGEConfirmModelList", modelList, QueryCacheType.None);
        var count = 0;
        var message = "";

        resultModel[0].ET_RETURN.forEach((array: any) => {
          if (array.TYPE == "E") {
            message = array.MESSAGE;
            return;
          }
        });
        if (message.length > 0) {
          alert(`${message}`, "오류");
        }
        else {
          alert("발주확인이 완료되었습니다.", "알림");
          this.dataLoad();
        }
      }
    }
    else {
      alert("발주확인 데이터가 선택되지 않았습니다.", "알림");
    }
  }
  cancelData(e: any) {

  }


  //고객주문리스트 조회 RFC
  public async dataLoad() {
    //고객번호 부분 대체 필요함
    
    var playModel = new ZMMPODISPLAYObewModel(this.poDate, new Date(9998, 12, 31), this.userInfo?.deptId ?? "", []);

    var modelList: ZMMPODISPLAYObewModel[] = [playModel];
    var resultModel = await this.dataService.RefcCallUsingModel<ZMMPODISPLAYObewModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMPODISPLAYObewModelList", modelList, QueryCacheType.Cached);
    
    this.poData = new ArrayStore(
      {
        key: ["EBELN", "EBELP"],
        data: resultModel[0].ET_DATA
      });
    /*
    this.poData = new ArrayStore(
      {
        key: ["EBELN", "EBELP"],
        data: [{ AEDAT  : '2022-12-08', EBELN :"2200224500" , EBELP : "00020" , ZZCONTRACT_NO : "2202555124", ZZCONTRACT : "001", CONNM : "공고명 11111", LABNR : '', MATNR : "A00010", TXZ01 : "테스트자재", "MENGE" : 20, NETPR : "5000", WAERS : "KRW", ZAMT : "2500000"}]
      });
      */
  }

  selectApply(e: any) {
    if (e.value == "ALL") {
      this.poGrid.instance.clearFilter();
    } else if (e.value == "X") {
      this.poGrid.instance.filter(['LABNR', '<>', ""]);
    } else {
      this.poGrid.instance.filter(['LABNR', '=', ""]);
    }
  }


}
