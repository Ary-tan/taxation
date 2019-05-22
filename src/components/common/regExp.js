export const int = (rule, value, callback) => {
  const regExp = /^\d+(\.\d{0,2})?$|^\.\d{1,2}$/;
  if (value === '') {
    callback(new Error('参数不能为空'));
  } else if (regExp.test(value)) {
    callback();
  } else {
    callback(new Error('请输入正数（小数后两位）'));
  }
};
export const percent = (rule, value, callback) => {
  const regExp = /^(\d|[1-9]\d|100)(\.\d{1,2})?$/;
  if (value === '') {
    callback(new Error('参数不能为空'));
  } else if (regExp.test(value) && value >= 0 && value <= 100) {
    callback();
  } else {
    callback(new Error('0-100，最多保留两位小数'));
  }
};
