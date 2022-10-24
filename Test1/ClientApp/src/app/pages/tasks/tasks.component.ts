import { Component } from '@angular/core';
import 'devextreme/data/odata/store';
import { Observable, Subscription } from 'rxjs';
import { CommonCodeInfo, TableCodeInfo } from '../../shared/app.utilitys';
import { AppConfigService } from '../../shared/services/appconfig.service';
import { CasResult, NbpAgentservice } from '../../shared/services/nbp.agent.service';


@Component({
  templateUrl: 'tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})

export class TasksComponent {
  dataSource: any;
  priority: any[];

  pp001Code: CommonCodeInfo;
  cm001Code: CommonCodeInfo;
  maraCode: TableCodeInfo;

  onCodeValueChanged: any;

  weight: number = -1;

  /**
 * 상태 구독
 */
  private casSubscription$: Subscription | null = null;
  /**
 * 상태 Observer
 */
  private casObserver$: Observable<CasResult[]> | null = null;

  /**
   * 생성자
   * @param appConfig
   * @param nbpAgetService
   */
  constructor(private appConfig: AppConfigService, private nbpAgetService: NbpAgentservice) {
    this.pp001Code = appConfig.commonCode("생산저장창고유형");
    this.cm001Code = appConfig.commonCode("결재코드");
    this.maraCode = appConfig.tableCode("제품코드");

    this.dataSource = {
      store: {
        type: 'odata',
        key: 'Task_ID',
        url: 'https://js.devexpress.com/Demos/DevAV/odata/Tasks'
      },
      expand: 'ResponsibleEmployee',
      select: [
        'Task_ID',
        'Task_Subject',
        'Task_Start_Date',
        'Task_Due_Date',
        'Task_Status',
        'Task_Priority',
        'Task_Completion',
        'ResponsibleEmployee/Employee_Full_Name'
      ]
    };
    this.priority = [
      { name: 'High', value: 4 },
      { name: 'Urgent', value: 3 },
      { name: 'Normal', value: 2 },
      { name: 'Low', value: 1 }
    ];

    this.onCodeValueChanged = (e: any) => {
      return;
    }

    //모니터링을 시작 한다.
    this.runMonitoring();
  }

  /**
  * RUN MONITOR
  **/
  runMonitoring() {
    if (this.casSubscription$ !== undefined && this.casSubscription$ !== null)
      return;

    var thisObj = this;
    //모니터링 시작
    this.casObserver$ = this.nbpAgetService.startCasResultPubulish(500);
    this.casSubscription$ = this.casObserver$.subscribe({
      next(info) {
        if (info.length > 0) {
          var casResult = info[info.length - 1];
          if (casResult.unit == "t")
            thisObj.weight = casResult.weight * 1000;
          else
            thisObj.weight = casResult.weight;
        }
      },
      error(err) { console.error('오류 발생: ' + err); },
      complete() { console.log('종료'); }
    });
  }

  /**
   * STOP MONITOR
   * */
  stopMonitoring() {
    if (this.casSubscription$ === undefined || this.casSubscription$ === null)
      return;

    this.nbpAgetService.stopCasResultPubulish();

    this.casSubscription$ = null;
    this.casObserver$ = null;
  }

  //onCodeValueChanged(e: any) {
  //  //alert(e);
  //  return;
  //}

  //-------------------------------------------------
  /**
   * 모니러링 중지 
   * @param e
   */
  stopMonitorClick(e: any) {
    this.stopMonitoring()
  }
  /**
   * 모니터링 시작 
   * @param e
   */
  startMonitorClick(e: any) {
      this.runMonitoring();
  }
  /**
   * COM PORT 닫기
   * @param e
   */
  async closeComClick(e: any) {
    let result = await this.nbpAgetService.casClose();
    if (result !== "ok")
      alert(result);
  }
  /**
   * COM PORT 열기
   * @param e
   */
  async openComClick(e: any) {
    let result = await this.nbpAgetService.casOpen();
    if (result !== "ok")
      alert(result);
  }
}
