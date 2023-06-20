import { Injectable } from '@angular/core';

export class CSpart {
  code!: string;
  name!: string;
}

const cspart: CSpart[] = [
  {
    code: "20",
    name: "탱크로리"
  },
  {
    code: "30",
    name: "카고"
  }
]



export class Product {
  ID!: number | string;
  Name!: string;
}

const products: Product[] = [
  {
    ID: "01",
    Name: "자가"
  },
  {
    ID: "02",
    Name: "임대"
  },
]

@Injectable()
export class Service {
  getCSpart(): CSpart[] {
    return cspart;
  }
  getProducts(): Product[] {
    return products;
  }

}
