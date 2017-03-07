var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js')
var app = getApp()
Page({
  data: {
    hasLogin: false,
    userInfo: {},
    nickName: '点击登录'
  },
  getStorage: function() {
    var that = this
    //检查是否已有登录信息
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        
        if(res.data) {
          app.globalData.hasLogin = true
          app.globalData.userInfo = res.data

          that.setData({
            userInfo: res.data,
            hasLogin: true
          })
        }
      },
      fail: function(res) {
          that.getUserInfo()
      }
    })
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
          var userInfo = res.userInfo

          userInfo.code = code

          app.globalData.hasLogin = true
          app.globalData.userInfo = userInfo
          
          that.setData({
            userInfo: userInfo,
            hasLogin: true
          })

          try {
            wx.setStorageSync('userInfo', userInfo)
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
  onLoad: function () {
    var that = this
    //如果用户已登录，获取用户本地信息
    that.getStorage()
    
    var APIUrl = app.globalData.APIUrl

    that.setData({
      url: APIUrl
    })

  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})
