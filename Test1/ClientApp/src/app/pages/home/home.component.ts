import { Component } from '@angular/core';
import { AppInfoService } from '../../shared/services/app-info.service';
import { locale, loadMessages } from "devextreme/localization";
import { AppConfigService } from '../../shared/services/appconfig.service';
import { AuthService } from '../../shared/services';
import { ImateDataService } from '../../shared/imate/imateDataAdapter';
import { ZSDT7110Model } from '../../shared/dataModel/MLOGP/Zsdt7110';
import { QueryCacheType } from '../../shared/imate/imateCommon';
import { ZMMS9000Model, ZMMSTOGRDuelistModel } from '../../shared/dataModel/MFSAP/ZmmStoGrDuelistProxy';
import { formatDate } from '@angular/common';
import { alert } from "devextreme/ui/dialog"

@Component({
  templateUrl: 'home.component.html',
  styleUrls: [ './home.component.scss' ]
})

export class HomeComponent {


  constructor(private appInfo: AppInfoService, private appConfig: AppConfigService, private authService: AuthService, private dataService: ImateDataService) {
    appInfo.title = AppInfoService.APP_TITLE + " | Home";
    locale(navigator.language);

    //로그인 사용자 정보
    //let usrInfo = authService.getUser().data;
    //const corgid = usrInfo.orgOption.corgid.padStart(10, '0');
    //const rolid = usrInfo.role;

    //if(rolid.find(item => item === "ADMIN") === undefined)
    //  this.checkSTONoWorkList(corgid);

  }

  async checkSTONoWorkList(corgid: string) {
    try {
      var result7110Model = await this.dataService.SelectModelData<ZSDT7110Model[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZSDT7110ModelList", [],
        `MANDT = '${this.appConfig.mandt}' AND KUNNR = '${corgid}' `, "", QueryCacheType.None);

      if (result7110Model.length <= 0)
        return;

      var zmm9000model = new ZMMS9000Model("", "");
      var condiModel = new ZMMSTOGRDuelistModel(zmm9000model, "", "", result7110Model[0].LGORT ?? "", "", "", this.appConfig.plant, []);

      var condiModelList = [condiModel];

      var result = await this.dataService.RefcCallUsingModel<ZMMSTOGRDuelistModel[]>(this.appConfig.dbTitle, "NBPDataModels", "NAMHE.Model.ZMMSTOGRDuelistModelList", condiModelList, QueryCacheType.None);

      if (result[0].ET_LIST.length <= 0)
        return;

      var now = new Date();
      var cDate = formatDate(now.setDate(now.getDate() - 3), "yyyy-MM-dd", "en-US"); 
      var mDate = new Date(cDate);

      var checkDate = result[0].ET_LIST.find(item => new Date(item.WADAT_IST) < mDate);

      if (checkDate !== undefined)
        await alert("3일이 지난 미입고 STO목록이 있습니다.</br>STO입고 작업 진행해 주시기 바랍니다.", "알림");

    } catch (error) {
      return;
    } finally {
      return;
    }
    
  }
}
