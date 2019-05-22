import _service from './service';

export default {
  listCompany: (callback) => {
    _service({
      method: 'get',
      url: '/baseProject/listCompany'
    }).then((res) => {
      callback(res);
    })
  },
  listProject: (params, callback) => {
    _service({
      method: 'get',
      url: '/baseProject/listProject',
      params: params
    }).then((res) => {
      callback(res);
    })
  },
  templateData: (params, callback) => {
    _service({
      method: 'post',
      url: '/baseProject/createIncomeAndCost',
      data: params,
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [function (data) {
        data = JSON.stringify(data);
        return data
      }]
    }).then((res) => {
      callback(res);
    })
  },
  getFinaCost: (params, callback) => {
    _service({
      method: 'get',
      url: '/finaCost/getFinaCost',
      params: params
    }).then((res) => {
      callback(res);
    })
  },
  getIncome: (params, callback) => {
    _service({
      method: 'get',
      url: '/finaIncome/getIncome',
      params: params
    }).then((res) => {
      callback(res);
    })
  },
  costUpdate: (params, callback) => {
    _service({
      method: 'post',
      url: '/finaCost/update',
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [function (data) {
        data = JSON.stringify(data);
        return data
      }],
      data: params
    }).then((res) => {
      callback(res);
    })
  },
  costCommit: (params, callback) => {
    _service({
      method: 'post',
      url: '/finaCost/commit',
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [function (data) {
        data = JSON.stringify(data);
        return data
      }],
      data: params
    }).then((res) => {
      callback(res);
    })
  },
  costVersion: (params, callback) => {
    _service({
      method: 'post',
      url: '/finaCost/listVersion',
      params: params
    }).then((res) => {
      callback(res);
    })
  },
  incomeUpdate: (params, callback) => {
    _service({
      method: 'post',
      url: '/finaIncome/update',
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [function (data) {
        data = JSON.stringify(data);
        return data
      }],
      data: params
    }).then((res) => {
      callback(res);
    })
  },
  incomeVersion: (params, callback) => {
    _service({
      method: 'post',
      url: '/finaIncome/listVersion',
      params: params
    }).then((res) => {
      callback(res);
    })
  },
  incomeCommit: (params, callback) => {
    _service({
      method: 'post',
      url: '/finaIncome/commit',
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [function (data) {
        data = JSON.stringify(data);
        return data
      }],
      data: params
    }).then((res) => {
      callback(res);
    })
  },
  listAnalyse: (params, callback) => {
    _service({
      method: 'post',
      url: '/computation/listAnalyse',
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [function (data) {
        data = JSON.stringify(data);
        return data
      }],
      data: params
    }).then((res) => {
      callback(res);
    })
  }
}
