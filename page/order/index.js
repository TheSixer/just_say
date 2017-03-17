var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js'),
    app = getApp()
Page({
  data:{
    isLoading: false    //是否请求中
  },
  pullUpLoad: function( e ) {
    var isLoading = this.data.isLoading

    if(!isLoading) {
      //loading动画
      this.loadingToast()

      this.setData( {
        page: this.data.page + 1
      })
      this.getData()
    }
      

    console.log( "上拉拉加载更多...." + this.data.page )

  },
  getData: function() {//请求数据
    var that = this;

    that.setData({    //正在请求。。。
      isloading: true
    })

    var url = this.data.url,
        data = {
          
        }

    http._get( url, data,
      function( res ) {

      }, function( res ) {
        console.log( res );
      });
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

  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    // wx.getSystemInfo( {
    //   success: ( res ) => {
    //     this.setData( {
    //       windowHeight: res.windowHeight,
    //       windowWidth: res.windowWidth
    //     })
    //   }
    // })
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})