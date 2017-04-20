var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js'),
    app = getApp()
Page({
  data:{
    isLoading: false    //是否请求中
  },
  order: function() {//请求数据
    var that = this

    dealErr.loading()

    that.setData({    //正在请求。。。
      isloading: true
    })

    var url = that.data.api + '/wa_unifiorder',
        data = {
          user_id: that.data.user_id,
          order_price: 1
        }

    http._get( url, data,
      function( res ) {
        dealErr.dealErr(res, function() {
          that.setData({
            payInfo: res.data
          })

          dealErr.hideToast()
          that.payment()
        })
      }, function( res ) {
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
      success:function(res){
        console.log(res)
        that.getOrderInfo()
      },
      fail:function(res){
        console.log(res)
      }
    })
  },
  getOrderInfo: function() {
    var that = this

    dealErr.loading()

    that.setData({    //正在请求。。。
      isloading: true
    })

    var url = that.data.api + 'order',
        data = {
          id: 'only',
          user_id: that.data.user_id
        }

    http._get( url, data,
      function( res ) {
        dealErr.hideToast()
        dealErr.dealErr(res, function() {
          console.log(res)
          if(res.data.length === 0) {
            that.setData({
              hasOrder: false
            })
          } else {
            var expire = parseInt(res.data[0].expire)
            res.data[0].expire = util.format(new Date(expire*1000))

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
      }, function( res ) {
        dealErr.fail()
      });
  },
  getStorageInfo: function () {
    var that = this

    if(!that.data.user_id) {
      wx.getStorage({
        key: 'info',
        success: function(res){
          // success
          that.setData({
            user_id: res.data.user_id
          })

          that.getOrderInfo()
        }
      })
    }

  },
  onLoad:function(options){
    //进入页面显示加载动画
    // dealErr.loading()
    // 页面初始化 options为页面跳转所带来的参数
    //获取全局data
    var that = this,
        APIUrl = app.globalData.APIUrl

    that.setData({
      api: APIUrl
    })

    that.getStorageInfo()
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