var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js'),
    app = getApp()
Page({
  data:{
    isLoading: false    //是否请求中
  },
  order: function() {//请求数据
    var that = this;

    that.setData({    //正在请求。。。
      isloading: true
    })

    var url = that.data.url + '/wa_unifiorder',
        data = {
          user_id: that.data.user_id,
          order_price: 1
        }

    http._get( url, data,
      function( res ) {
        dealErr.dealErr(res, function() {
          console.log(res.data)
          that.setData({
            payInfo: res.data
          })

          that.payment()
        })
      }, function( res ) {
        console.log( res );
      });
  },
  payment: function () {
    var that = this
    console.log(that.data.payInfo)
    
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
      },
      fail:function(res){
        console.log(res)
      }
    })
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
      url: APIUrl
    })

    // that.getData()
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