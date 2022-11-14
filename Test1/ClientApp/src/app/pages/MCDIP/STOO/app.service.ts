import { Injectable } from '@angular/core';

//유류/화학구분
export class Gubun {
  code!: string;
  name!: string;
  zgubn!: string;
  werks!: string;
  ekorg!: string;
  ekgrp!: string;
  bukrs!: string;
}

const gubun: Gubun[] = [
  {
    code: "O",
    name: "유류",
    zgubn: "B",
    werks: "1000",
    ekorg: "1000",
    ekgrp: "301",
    bukrs: "1000"
  },
  {
    code: "W",
    name: "화학",
    zgubn: "C",
    werks: "1000",
    ekorg: "1000",
    ekgrp: "302",
    bukrs: "1000"
  }]


@Injectable()
export class Service {
  getGubun() {
    return gubun;
  }
}
