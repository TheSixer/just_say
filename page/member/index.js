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
  sign: function () {
    this.setData({
      integralOpacity: 1
    })

    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear', // "linear","ease","ease-in","ease-in-out","ease-out","step-start","step-end"
      delay: 0,
      transformOrigin: '50% 50% 0',
      success: function(res) {
        console.log(res);
      }
    });

    this.animation = animation;
    animation.opacity(0).translateY(-30).step();

    this.setData({
      hasSign: true,
      sign: "已签到",
      animationData:animation.export()
    })
  },
  http_sign: function() {
    if(!this.data.hasLogin) {
      var title = '提示',
          tips = '您还未登陆账号，请先登录！'

      dealErr.showTips(title, tips, null)

      return false
    }
    //loading
    dealErr.loading()

    var that = this,
        token = '?clientId=haima_mini_apps&deviceId=miniApps&source=miniApps&accessToken=' + that.data.accessToken
    var url = that.data.APIUrl + '/moofun/integral/miniApps' + token,
        data = {
          uid: that.data.userInfo.user.uid,
          carId: that.data.userInfo.car[0].carId
        }

    http._post(url, data, 
      function(res) {
        //统一处理
        dealErr.dealErr(res, function() {
          //success
          dealErr.succeed('success')
          //改变状态
          that.sign()
        })
      }, function(res) {
        //处理失败
        dealErr.fail()
      })
  },
  getData: function() {   //获取积分，判断是否签到
    var that = this
    var url = that.data.APIUrl + '/moofun/integral/' + this.data.userInfo.user.uid,
        data = {
          clientId: 'haima_mini_apps',
          deviceId: 'miniApps' ,
          source: 'miniApps',
          carId: that.data.userInfo.car[0].carId,
          accessToken: that.data.accessToken
        }
    
    http._get(url, data, 
      function(res) {
        //统一处理
        dealErr.dealErr(res, function() {
          var data = res.data.data
          if(data.list[0].status === '1')
            that.setData({
              hasSign: true,
              sign: "已签到"
            })
        })
      }, function (res) {
        //处理失败
        dealErr.fail()
      })
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

    this.setData({
      APIUrl: APIUrl
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var that = this
    //如果用户已登录，获取用户本地信息
    that.getStorage()
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})
