var config = require('./service/config.js'),
    dealErr = require('./util/err_deal.js')

App({
  onLaunch: function () {
    console.log('App Launch')
    var logs = wx.getStorageSync('logs') || [],
        that = this
    //检查是否已有登录信息
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        
        if(res.data) {
          that.globalData.hasLogin = true
          that.globalData.userInfo = res.data
        }
      },
      fail: function(res) {
          that.getUserInfo()
      }
    })
  },
  onShow: function () {
    console.log('App Show')
    console.log(config)
  },
  onHide: function () {
    console.log('App Hide')
  },
  getUserInfo:function(cb){
    var that = this;

    //调用登录接口
    wx.login({
      success: function(res) {
        _getUserInfo(res.code)
      }
    })

    function _getUserInfo(code) {
      wx.getUserInfo({
        success: function (res) {
          //将用户信息添加到全局
          that.globalData.hasLogin = true
          that.globalData.userInfo = res.userInfo
          that.globalData.userInfo.code = code
          
          try {
            wx.setStorageSync('userInfo', that.globalData.userInfo)
          } catch (e) {    
            var title = 'tips',
                tips = '程序异常，请联系客服！'
            dealErr.showTips(title, tips, function(){})
          }
        },
        fail: function() {
          var title = 'tips',
              tips = '获取登录信息失败！'
          dealErr.showTips(title, tips, function(){})
        }
      })
    }
  },
  globalData: {
    APIUrl: config.config.api
  }
})
