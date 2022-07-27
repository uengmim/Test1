import { Component } from '@angular/core';

@Component({
  templateUrl: 'profile.component.html',
  styleUrls: [ './profile.component.scss' ]
})

export class ProfileComponent {
  employee: any;
  colCountByScreen: object;

  constructor() {
    this.employee = {
      ID: 7,
      FirstName: 'Chae',
      LastName: 'Seungmin',
      Prefix: 'Ms.',
      Position: 'Controller',
      Picture: 'images/employees/06.png',
      BirthDate: new Date('1998/10/14'),
      HireDate: new Date('2022/07/18'),
      /* tslint:disable-next-line:max-line-length */
      Notes: 'My name is Chaeseungmin.',
      Address: 'Seoul.'
    };
    this.colCountByScreen = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4
    };
  }
}
