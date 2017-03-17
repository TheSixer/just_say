var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js')
var app = getApp()
Page({
  data: {
    hasLogin: false,
    userInfo: {}
  },
  checkOpenId: function() {
    var that = this
    wx.getStorage({
      key: 'openId',
      success: function(res){
        if(res.data.openid) {
          app.globalData.openId = res.data.openid
          that.getUserInfo()
          console.log(res.data)
        } else {
          that.login()
        }
      },
      fail: function() {
        that.login()
      }
    })
  },
  serviceLogin: function(code) {
    var that = this
    var url = that.data.url + 'wechat_login',
        data = {
          code: code
        }

    http._get(url, data, 
      function(res) {
        dealErr.dealErr(res, function() {
          console.log(res.openid)
          app.globalData.openId = res.openid
          wx.setStorage({
            key: 'openId',
            data: res.openid
          })
        })
      }, function(res) {
        dealErr.fail()
      })
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
          that.login()
      }
    })
  },
  login:function(){
    var that = this

    //调用登录接口
    wx.login({
      success: function(res) {
        console.log(res.code)
        app.globalData.code = res.code
        that.getUserInfo()
        that.serviceLogin(res.code)
      }
    })
  },
  getUserInfo: function () {
    var that = this

    wx.getUserInfo({
      success: function (res) {
        //将用户信息添加到全局
        var userInfo = res.userInfo

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
  },
  onLoad: function () {
    var that = this
    //如果用户已登录，获取用户本地信息
    
    var APIUrl = app.globalData.APIUrl

    that.setData({
      url: APIUrl
    })

    that.checkOpenId()
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
