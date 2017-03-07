var config = require('./service/config.js'),
    dealErr = require('./util/err_deal.js')

App({
  onLaunch: function () {
    console.log('App Launch')
    var logs = wx.getStorageSync('logs') || []
  },
  onShow: function () {
    console.log('App Show')
    console.log(config)
  },
  onHide: function () {
    console.log('App Hide')
  },
  globalData: {
    APIUrl: config.config.api
  }
})
