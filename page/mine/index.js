var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js')
var app = getApp()
Page({
  data: {
    hasLogin: false,
    userInfo: {}
  },
  checkCode: function() {
    var that = this

    if(app.globalData.code) {
      that.getStorage()

      that.serviceLogin()
    } else {
      that.login()
    }
  },
  checkOpenId: function() {
    var that = this
    wx.getStorage({
      key: 'openId',
      success: function(res){
        if(res.data.openId) {
          console.log(res.data)
        }
      },
      fail: function() {
        that.checkCode()
      }
    })
  },
  serviceLogin: function(code) {
    var that = this
    var url = that.data.url + 'wechat_login',
        data = {
          code: app.globalData.code
        }
    http._get(url, data, 
      function(res) {
        dealErr.dealErr(res, function() {
          console.log(res)
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
    var that = this;

    //调用登录接口
    wx.login({
      success: function(res) {
        console.log(res.code)
        getOpenId(res.code)
        // _getUserInfo(res.code)
      }
    })

    function getOpenId(code) {
      var url = that.data.url + '/wechat_login',
          data = {
            code: code
          }
      http._get(url, data, 
        function(res) {
          dealErr.dealErr(res, function() {
            console.log(res)
            wx.setStorage({
              key: 'openId',
              data: res.data
            })
          })
        }, function(res) {
          console.log(res)
          dealErr.fail()
        })
    }

    function _getUserInfo() {
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
          console.log(res)
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
    // that.checkCode()
    
    var APIUrl = app.globalData.APIUrl

    that.setData({
      url: APIUrl
    })

    that.login()
    // wx.checkSession({
    //   success: function(res){
    //     console.log(res)
    //   },
    //   fail: function(res){
    //     console.log(res)
    //     //登录态过期
    //     wx.login() //重新登录
        
    //   }
    // })

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
