var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js')
var app = getApp()
Page({
  data: {
    hasLogin: false,
    userInfo: {},
    nickName: '点击登录'
  },
  onLoad: function () {
    var that = this
    //如果用户已登录，获取用户本地信息
    // that.getStorage()
    
    var APIUrl = app.globalData.APIUrl,
        userInfo = app.globalData.userInfo

    that.setData({
      userInfo: userInfo,
      hasLogin: true
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
