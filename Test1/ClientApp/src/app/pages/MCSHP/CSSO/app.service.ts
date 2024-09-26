import { Injectable } from '@angular/core';


export class ChemTRP {
  HWAMUL?: string;
  TANK?: string;
  RACK?: string;
  PIPE?: string;
}

const chemTRPList: ChemTRP[] = [
  {
    HWAMUL: "H98",
    TANK: "204",
    RACK: "06",
    PIPE: "6"
  },
  {
    HWAMUL: "H99",
    TANK: "204",
    RACK: "06",
    PIPE: "6"
  },
  {
    HWAMUL: "HB1",
    TANK: "109B",
    RACK: "05",
    PIPE: "8"
  },
  {
    HWAMUL: "I15",
    TANK: "109D",
    RACK: "05",
    PIPE: "5"
  },
  {
    HWAMUL: "P43",
    TANK: "109C",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "HY3",
    TANK: "430A",
    RACK: "05",
    PIPE: "8"
  },
  {
    HWAMUL: "N20",
    TANK: "201C",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "N25",
    TANK: "201A",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "N28",
    TANK: "201B",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "N29",
    TANK: "104A",
    RACK: "05",
    PIPE: "4"
  },
  {
    HWAMUL: "NHX",
    TANK: "501",
    RACK: "07",
    PIPE: "7"
  },
]

@Injectable()
export class Service {

  getChemTRP() {
    return chemTRPList;
  }
}
