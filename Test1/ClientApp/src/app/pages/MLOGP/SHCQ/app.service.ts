import { Injectable } from '@angular/core';


export class Data {
  seq!: number;
  //구분
  sortation!: string;
  //거리1
  distance1!: number;
  //거리2
  distance2!: number;
  //단사
  shStory!: number;
  //비고
  comparison!: string;
}
//고정단가
const price: string[] = [
  '단가',
  '고정단가',
];
//테스트데이터
const data: Data[] = [{
  seq: 1,
  sortation: '고정단가',
  distance1: 0,
  distance2: 10,
  shStory: 2810,
  comparison: '비교',
},
{
  seq: 2,
  sortation: '고정단가',
  distance1: 11,
  distance2: 15,
  shStory: 3310,
  comparison: '비교',
  },
  {
  seq: 3,
  sortation: '고정단가',
  distance1: 13,
  distance2: 20,
  shStory: 4125,
  comparison: '비교',
  },
];

@Injectable()
export class Service {
  getData() {
    return data;
  }
  getprice(): string[] {
    return price;
  }
}
