var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js')
var app = getApp()
Page({
  data: {
    hasLogin: false,
    userInfo: {},
    nickName: '点击登录',
    sign: "签到",
    hasSign: false,
    userHead: '/image/user/userhead.png',
    btnDisabled: false,
    integralOpacity: 0,
    animationData: {}
  },
  getStorage: function() {
    var that = this
    //调用应用实例的方法获取全局数据
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        if(res.data.user) {
          that.setData({
            hasLogin: true,
            userInfo: res.data,
            accessToken: res.data.user.accessToken,
            userName: res.data.user.username,
            nickName: res.data.user.nickName
          })
          
          var userHead = res.data.user.realHeadUrl.middleUrl
          
          if(userHead) {
            userHead = userHead
          } else {
            userHead = "/image/user/userhead.png";
          }
          that.setData({
            userHead: userHead
          })

          //获取积分，判断是否签到
          that.getData()
        }
      } 
    })
  },
  onLoad: function () {
    var that = this
    //如果用户已登录，获取用户本地信息
    // that.getStorage()
    
    var APIUrl = app.globalData.APIUrl

    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo: userInfo,
        APIUrl: APIUrl
      })
      console.log(userInfo)
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
