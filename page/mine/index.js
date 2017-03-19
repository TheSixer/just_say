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
      key: 'info',
      success: function(res){
        if(res.data) {
          that.getStorage()
        }
      },
      fail: function() {
        that.login()
      }
    })
  },
  serviceLogin: function() {
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
          that.getUserInfo()
      }
    })
  },
  getOpenId: function(code) {
    var that = this
    var url = that.data.url + '/wechat_login',
        data = {
          code: code
        }

    http._get(url, data, 
      function(res) {
        dealErr.dealErr(res, function() {
          that.getUserInfo()
          wx.setStorage({
            key: 'info',
            data: res.data
          })
        })
      }, function(res) {
        dealErr.fail()
      })
  },
  getUserInfo: function() {
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
  },
  login:function(){
    var that = this
    //调用登录接口
    wx.login({
      success: function(res) {
        that.getOpenId(res.code)
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

    // that.checkOpenId()
    wx.downloadFile({
      url: 'https://www.speakfan.net/wa/service/resource?file=inverse', //仅为示例，并非真实的资源
      success: function(res) {
        console.log(res)
        wx.playVoice({
          filePath: res.tempFilePath,
          success:function(res) {
            console.log(res)
          },
          fail:function(res) {
            console.log(res)
          }
        })
      }
    })
    wx.downloadFile({
      url: 'https://www.speakfan.net/sent2000/0/inverse.mp3', //仅为示例，并非真实的资源
      success: function(res) {
        console.log(res)
        wx.playVoice({
          filePath: res.tempFilePath,
          success:function(res) {
            console.log(res)
          },
          fail:function(res) {
            console.log(res)
          }
        })
      }
    })
    wx.playVoice({
      filePath: 'https://www.speakfan.net/sent2000/0/inverse.mp3',
      success:function(res) {
        console.log(res)
      },
      fail:function(res) {
        console.log(res)
      }
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
