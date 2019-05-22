export const outputExcel = {
  methods: {
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]));
    },
    excel(tableData, listName, key, tableName) {
      this.$confirm('此操作将导出Excel表, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        require.ensure([], () => {
          const {export_json_to_excel} = require('./Export2Excel');
          const data = this.formatJson(key, tableData);
          export_json_to_excel(listName, data, tableName);
        })
      }).catch(() => {});
    }
  }
};
