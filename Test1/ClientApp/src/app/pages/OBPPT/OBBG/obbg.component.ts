import { formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  DxDataGridComponent, DxFormComponent,
  DxPopupComponent
} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import 'devextreme/data/odata/store';
import { alert } from "devextreme/ui/dialog";
import { CommonCodeInfo, TableCodeInfo } from '../../../shared/app.utilitys';
import { CommonPossibleEntryComponent } from '../../../shared/components/comm-possible-entry/comm-possible-entry.component';
import { CodeInfoType, PossibleEnteryCodeInfo, PossibleEntryDataStoreManager } from '../../../shared/components/possible-entry-datastore';
import { TablePossibleEntryComponent } from '../../../shared/components/table-possible-entry/table-possible-entry.component';
import { ZMMBIDMstModel, ZMMS9000Model } from '../../../shared/dataModel/OBPPT/ZmmBidMst';
import { ImateInfo, QueryCacheType } from '../../../shared/imate/imateCommon';
import { ImateDataService } from '../../../shared/imate/imateDataAdapter';
import { AuthService } from '../../../shared/services';
import { AppInfoService } from '../../../shared/services/app-info.service';
import { AppConfigService } from '../../../shared/services/appconfig.service';

/*입찰신청투찰 Component*/


@Component({
  templateUrl: 'obbg.component.html',
  providers: [ImateDataService]
})

export class OBBGComponent {

  biddtDate: any;
  biznoValue: string;
  bidList!: ArrayStore;
  loadingVisible: boolean = false;

  constructor(private appConfig: AppConfigService, private dataService: ImateDataService, private appInfo: AppInfoService, private imInfo: ImateInfo, private authService: AuthService) {
    appInfo.title = AppInfoService.APP_TITLE + " | 입찰신청투찰";
    this.biznoValue = "202200003";
  }


  //리스트 조회 RFC
  public async dataLoad() {
    //고객번호 부분 대체 필요함
    /*
    var retrunModel: ZMMS9000Model; 
    var modelList: ZMMBIDMstModel[] = [new ZMMBIDMstModel(retrunModel, this.biddtDate, null, "",   )];
    var resultModel = await this.dataService.RefcCallUsingModel<ZMMBIDMstModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMBIDMstModelList", zps500List, QueryCacheType.Cached);

    this.orderData = new ArrayStore(
      {
        key: ["VBELN", "MATNR"],
        data: resultModel[0].E_RETURN
      });

    this.dataLoading = true;

    if (this.dataLoading == true && this.enteryLoading == true) {
      this.loadingVisible = false;
    }
    */
  }

  searchData(e: any) {


  }
}
