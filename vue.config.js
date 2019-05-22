module.exports = {
    publicPath: './',
    productionSourceMap: false,
    devServer: {
        proxy: {
            '/api': {
                target: 'http://10.10.200.21:8080',
                // target:'http://10.10.11.32:8080',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '/api': ''
                }
            }
        }
    }
};