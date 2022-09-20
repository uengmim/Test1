import { Injectable } from '@angular/core';


export class Regis {
  //배차일자
  dispcDate?: string;
  //거래처명
  clientName?: string;
  //차량번호
  vehNum?: string;
  //제품
  product?: string;
  //RACK
  rack?: number;
  //지시량
  indiQuan?: number;
  //배차번호
  dispcNum?: number;
  //지시번호
  indiNum?: number;
  //C-PART
  cPart?: string;
  //유창
  yuChang?: number;
  //용량
  capacity?: number;
  //배분량
  distriQuan?: number;
}

export class AddData {
  //유창
  yuChang?: number;
  //용량
  capacity?: number;
  //배분량
  distriQuan?: number;
}
export class Data {
  //유창
  dDispcNumv?: number;
  //용량
  dIndiNum?: number;
  //배분량
  dIndiQuan?: number;
}
const regis: Regis[] = [{

  dispcDate: '2022-07-01',

  clientName: '도곡농협주유소',

  vehNum: '전남81바4238',

  product: '등유-실내',

  rack: 8,

  indiQuan: 8000,

  dispcNum: 12414252512132,

  indiNum: 12412321,

  cPart: '',
}, {

  dispcDate: '2022-07-02',

  clientName: '순천원예농협주유소',

  vehNum: '전남81바4238',

  product: '등유-실내',

  rack: 8,

  indiQuan: 4000,

  dispcNum: 456435478,

  indiNum: 978543434,

  cPart: '',
}, {

  dispcDate: '2022-07-13',

  clientName: '서포농협서포주유소',

  vehNum: '경북82아5422',

  product: '등유-실내',

  rack: 8,

  indiQuan: 8000,

  dispcNum: 83897893,

  indiNum: 78943453,

  cPart: '',
}, {

  dispcDate: '2022-07-14',

  clientName: '합천호농형 대병지점',

  vehNum: '전남81바4238',

  product: '등유-실내',

  rack: 8,

  indiQuan: 12000,

  dispcNum: 984815151,

  indiNum: 45217611667,

  cPart: '',
}, {

  dispcDate: '2022-07-22',

  clientName: '광양농협주유소',

  vehNum: '전남81바4478',

  product: '등유-실내',

  rack: 8,

  indiQuan: 4000,

  dispcNum: 64121415617,

  indiNum: 264951512232,

  cPart: '',
},
]

const adddata: AddData[] = [{
  yuChang: 123123,
  capacity: 12311,
  distriQuan: 51266
},
{
  yuChang: 6234,
  capacity: 253241,
  distriQuan: 123123
  }]
const data: Data = {
  dDispcNumv: 512312,
  dIndiNum: 7234323762,
  dIndiQuan: 26235
}
@Injectable()
export class Service {


  getRegis() {
    return regis;
  }
  getAddData() {
    return adddata;
  }
  getData() {
    return data;
  }
}
