var http = require('../../service/request.js'),
    util = require('../../util/util.js'),
    dealErr = require('../../util/err_deal.js')
var app = getApp()
Page({
  data: {
    hasLogin: false,
    userInfo: {},
    order: {}
  },
  data: {
    isLoading: false    //是否请求中
  },
  order: function () {//请求数据
    var that = this

    dealErr.loading()

    that.setData({    //正在请求。。。
      isloading: true
    })

    var url = that.data.url + '/wa_unifiorder',
      data = {
        user_id: that.data.user_id,
        order_price: 5000
      }

    http._get(url, data,
      function (res) {
        dealErr.dealErr(res, function () {
          that.setData({
            payInfo: res.data
          })

          dealErr.hideToast()
          that.payment()
        })
      }, function (res) {
        dealErr.fail()
      });
  },
  payment: function () {
    var that = this

    var data = that.data.payInfo
    data.timeStamp = String(data.timeStamp)

    wx.requestPayment({
      appId: data.appid,
      timeStamp: data.timeStamp,
      nonceStr: data.nonce_str,
      'package': 'prepay_id=' + data.prepay_id,
      signType: 'MD5',
      paySign: data.paySign,
      success: function (res) {
        //支付成功，获取订单详情
        that.getOrderInfo()
      },
      fail: function (res) {
        var title = '提示',
          tips = '支付失败！'
        dealErr.showTips(title, tips, function () { })
      }
    })
  },
  checkOpenId: function() {
    var that = this
    wx.getStorage({
      key: 'info',
      success: function(res){
        if(res.data) {
          app.globalData.openId = res.data.openid
          that.setData({
            user_id: res.data.user_id
          })
          that.getStorage()
          that.getOrderInfo()
        } else {
          that.login()
        }
      },
      fail: function() {
        that.login()
      }
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
          var user_id = res.data.user_id
          that.setData({
            user_id: user_id
          })
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
  getOrderInfo: function () {
    var that = this

    dealErr.loading()

    that.setData({    //正在请求。。。
      isloading: true
    })

    var url = that.data.url + 'order',
      data = {
        id: 'only',
        user_id: that.data.user_id
      }

    http._get(url, data,
      function (res) {
        dealErr.hideToast()
        dealErr.dealErr(res, function () {
          console.log(res.data)
          if (res.data.length === 0) {
            that.setData({
              hasOrder: false
            })
          } else {
            var expire = parseInt(res.data[0].expire)
            res.data[0].expire = '有效期：' + util.format(new Date(expire * 1000))

            that.setData({
              hasOrder: true,
              order: res.data[0]
            })
            wx.setStorage({
              key: 'orderInfo',
              data: res.data[0]
            })
          }
        })
      }, function (res) {
        dealErr.fail()
      });
  },
  getUserInfo: function () {  // 获取微信用户信息
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
        // 获取订阅信息
        that.getOrderInfo()

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
    
    var APIUrl = app.globalData.APIUrl,
        url = app.globalData.url

    that.setData({
      url: APIUrl,
      api: url
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
