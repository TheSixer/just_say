var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js'),
    app = getApp()
Page({
  data:{
    index: 0,
    isLoading: false    //是否请求中
  },
  toStudy: function() {
    var that = this
    wx.navigateTo({
      url: 'study/index?index=' + (that.data.index + 1)
    })
  },
  getOrderInfo: function() {
    var that = this

    that.setData({    //正在请求。。。
      isloading: true
    })

    var url = this.data.api + 'order',
        data = {
          id: 'only',
          user_id: that.data.info.user_id
        }

    http._get( url, data,
      function( res ) {
        dealErr.dealErr(res, function() {
          console.log(res.data)
        })
      }, function( res ) {
        dealErr.fail()
      });
  },
  getUserId: function() {
    var that = this
    wx.getStorage({
      key: 'info',
      success: function(res){
        // success
        that.setData({
          order: true,
          info: res.data
        })
        that.getOrderInfo()
      },
      fail: function() {
        // fail
        that.setData({
          order: false
        })
        var title = '提示',
            tips = '抱歉，您还未订阅任何课程！'
        dealErr.showTips(title, tips, function(){})
      }
    })
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

    that.getUserId()
    // that.getData()

  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){

  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})