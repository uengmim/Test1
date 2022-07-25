/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => { cp.push(v); });
    return cp.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
    Object.keys(cp).forEach(k => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};

/**
 * 저심도 복사를 한다.
 *  
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 */
export const shallowCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }

  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => { cp.push(v); });

    return cp.map((n: any) => shallowCopy<any>(n)) as any;
  }

  if (typeof target === 'object' && target !== {}) {

    var cloneObj = new ((<any>target).constructor());
    for (var attribut in target) {
      if (typeof target[attribut] === "object") {
        cloneObj[attribut] = shallowCopy(target[attribut]);
      } else {
        cloneObj[attribut] = target[attribut];
      }
    }

    return <T>cloneObj;
  }

  return target;
};

/**
 * Object를 업데이터한다.(src => des)
 * 
 * @param src 소스 객체
 * @param des 목적지 객체
 */
export const updateObject = <T>(src: T, des: T) => {
  for (let attribut in src) {
    if (typeof src[attribut] === "object" && src[attribut] != null) {
      updateObject(src[attribut], des[attribut]);
    }
    else {
      des[attribut] = src[attribut];
    }
  }
};

/**
 * 프로퍼티 이름을 변경 한다.
 * 
 * @param obj
 * @param oldName
 * @param newName
 */
export const setProperty = (obj: any, propName: string, value : any) => {

  if (obj.hasOwnProperty(propName))
    obj[propName] = value;

  return obj;
};

/**
 * 프로퍼티 이름을 변경 한다.
 * 
 * @param obj
 * @param oldName
 * @param newName
 */
export const renameProperty = (obj : any, oldName : string , newName : string) => {

  if (obj.hasOwnProperty(oldName)) {
    obj[newName] = obj[oldName];
    delete obj[oldName];
  }

  return obj;
};

/**
 * 프로퍼티를 삭제 한다.
 * 
 * @param obj
 * @param oldName
 */
export const deleteProperty = (obj : any, oldName : string) => {

  if (obj.hasOwnProperty(oldName)) {
    delete obj[oldName];
  }

  return obj;
}


