const { hasOwnProperty } = Object.prototype;

export default (obj: any, prop: string | number | symbol) => hasOwnProperty.call(obj, prop);
