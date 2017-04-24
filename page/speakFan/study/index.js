var http = require('../../../service/request.js'),
    dealErr = require('../../../util/err_deal.js'),
    app = getApp()
Page({
  data:{},
  getCourse: function() {
    var that = this
    var url = that.data.url + 'hh' + that.data.index + '.json',
        data = {}

    http._get(url, data,
      function(res) {
        //隐藏loading
        dealErr.hideToast()
        dealErr.dealErr(res, function() {
          that.setData({
            arr: res.data
          })
        })
      }, function(res) {
        dealErr.fail()
      })
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this,
        api = app.globalData.APIUrl,
        url = app.globalData.url

    that.setData({
      api: api,
      url: url,
      index: options.index
    })
    //显示loading
    dealErr.loading()
    that.getCourse()
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