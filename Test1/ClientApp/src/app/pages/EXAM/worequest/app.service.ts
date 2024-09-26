import { Injectable } from '@angular/core';


export class Product {
  GCODE?: string;

  GCODENM?: string;

  SCODE?: string;

  SCODENM?: string;
}

const product: Product[] = [
  { GCODE: 'G01', GCODENM: '그룹1', SCODE: 'S01', SCODENM: '코드1' },
  { GCODE: 'G01', GCODENM: '그룹1', SCODE: 'S02', SCODENM: '코드2' },
  { GCODE: 'G02', GCODENM: '그룹2', SCODE: 'S03', SCODENM: '코드3' },
  { GCODE: 'G02', GCODENM: '그룹2', SCODE: 'S04', SCODENM: '코드4' },
];

const simpleProducts: string[] = [
  'HD Video Player',
  'SuperHD Video Player',
  'SuperPlasma 50',
  'SuperLED 50',
  'SuperLED 42',
  'SuperLCD 55',
  'SuperLCD 42',
  'SuperPlasma 65',
  'SuperLCD 70',
  'Projector Plus',
  'Projector PlusHT',
  'ExcelRemote IR',
  'ExcelRemote BT',
  'ExcelRemote IP',
];


@Injectable()
export class Service {

  getProduct() {
    return product;
  }

  getSimpleProducts(): string[] {
    return simpleProducts;
  }
}
