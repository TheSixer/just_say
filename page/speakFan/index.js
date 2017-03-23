var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js'),
    util = require('../../util/util.js'),
    app = getApp()
Page({
  data:{
    index: 0,
    array:[],
    hasOrder: false,
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
  checkOrderInfo: function() {
    var that = this
    wx.getStorage({
      key: 'orderInfo',
      success: function(res){
        // success
        that.setData({
          hasOrder: true,
          order: res.data
        })
      },
      fail: function() {
        that.getOrderInfo()
      }
    })
  },
  getStudyRecord: function() {
    var that = this
    wx.getStorage({
      key: 'studyProgram',
      success: function(res){
        // success
        console.log(res.data)
        that.setData({
          hasBegin: true,
          hasOrder: true,
          current: res.data
        })
        var arr = []
        for(var x = 0; x < res.data; x++) {
          var obj = {
            id: x + 1,
            course: x + 1
          }
          arr.push(obj)
        }
        console.log(arr)
        that.setData({
          array: arr
        })
        console.log(that.data.array)
      },
      fail: function() {
        that.setData({
          hasBegin: false
        })

        that.getOrderInfo()
      }
    })
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
        
        that.getStudyRecord()
      },
      fail: function() {
        // fail
        that.setData({
          order: false
        })
        var title = '提示',
            tips = '请删除小程序，重新搜索“说说看”，打开并允许微信登录授权！'
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

  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    this.getUserId()
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})