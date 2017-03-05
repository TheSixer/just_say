var config = require('./service/config.js')
App({
  onLaunch: function () {
    console.log('App Launch')
    var logs = wx.getStorageSync('logs') || []
    //检查是否已有登录信息
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        console.log(res)
        // this.globalData.userInfo = res.data
      } 
    })
    console.log(this.globalData.hasLogin)
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

    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function(res) {
          console.log(res)
          _getUserInfo(res.code)
        }
      });
    }

    function _getUserInfo(code) {
      wx.getUserInfo({
        success: function (res) {
          that.globalData.code = code
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  globalData: {
    hasLogin: false,
    userInfo: null,
    APIUrl: config.config.api
  }
})
