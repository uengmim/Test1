import { Injectable } from '@angular/core';

export class Category {
  Id!: string;

  Name!: string;
}

export class Role {
  ID!: string;
  Name!: string;
}

const category: Category[] = [{
    Id: "1",
    Name: '수리공사'
  }, {
  Id: "2",
    Name: '고정자산구매'
  }, {
  Id: "3",
    Name: '고정자산매각'
  }, {
  Id: "4",
    Name: '판촉물'
  }, {
  Id: "5",
    Name: '폐기물'
  }, {
  Id: "6",
    Name: '저장품내자'
  }, {
  Id: "7",
    Name: '저장품외자'
  }, {
  Id: "8",
    Name: '원재료'
  }, {
  Id: "9",
    Name: '상품'
  }]

const roles: Role[] = [
  {
  ID: '1',
  Name: '[1]사업자',
  }];




@Injectable()
export class Service {
  getcategory(): Category[] {
    return category;
  }
  getRoles() {
    return roles;
  }

}
