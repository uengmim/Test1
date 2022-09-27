import { Component } from '@angular/core';
import 'devextreme/data/odata/store';
import { CommonCodeInfo, TableCodeInfo } from '../../shared/app.utilitys';
import { AppConfigService } from '../../shared/services/appconfig.service';


@Component({
  templateUrl: 'tasks.component.html'
})

export class TasksComponent {
  dataSource: any;
  priority: any[];

  pp001Code: CommonCodeInfo;
  cm001Code: CommonCodeInfo;
  maraCode: TableCodeInfo;

  onCodeValueChanged: any;

  constructor(private appConfig: AppConfigService) {
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
  }

  //onCodeValueChanged(e: any) {
  //  //alert(e);
  //  return;
  //}

}
