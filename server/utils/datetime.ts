export type SwapDatesWithStrings<T> = {
  [k in keyof T]: T[k] extends Date ? string : T[k];
};

type AnyType = string | number | boolean | null | Date | undefined;
type AnyArray = Array<AnyArray | AnyObject | AnyType>;
type AnyObject = { [k: string]: AnyType | AnyArray | AnyObject };

export function serializeDates<T extends AnyObject>(
  obj: T,
): SwapDatesWithStrings<T> {
  const recursiveResult: AnyObject = {
    ...obj,
  };

  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v && v instanceof Date) {
      recursiveResult[k] = v.toISOString();
    } else if (Array.isArray(v)) {
      const arrResult = serializeManyDates(v as AnyObject[]);
      recursiveResult[k] = arrResult;
    } else if (v?.constructor == Object && typeof v === "object") {
      recursiveResult[k] = serializeDates(v);
    }
  }

  return recursiveResult as SwapDatesWithStrings<T>;
}

export function serializeManyDates<T extends AnyObject>(
  objs: T[],
): (T & SwapDatesWithStrings<T>)[] {
  const result = [];
  for (const obj of objs) {
    if (obj?.constructor === Object && typeof obj === "object") {
      result.push(serializeDates(obj));
    } else if (Array.isArray(obj)) {
      result.push(serializeManyDates(obj));
    } else if (obj && obj instanceof Date) {
      result.push(obj.toISOString());
    } else {
      result.push(obj);
    }
  }
  return result as (T & SwapDatesWithStrings<T>)[];
}
