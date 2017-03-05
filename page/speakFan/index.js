var http = require('../../service/request.js'),
    dealErr = require('../../util/err_deal.js'),
    app = getApp()
Page({
  data:{
    location: {},
    list: [],
    page: 1,
    order: 0,
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

    var url = this.data.url + '/moofun/dealer',
        data = {
          clientId: 'haima_mini_apps',
          deviceId: 'miniApps' ,
          source: 'miniApps',
          page: that.data.page,
          order: that.data.order,
          latitude: that.data.location.latitude,
          longitude: that.data.location.longitude,
        }

    http._get( url, data,
      function( res ) {
        that.setData({    //请求完成
          isloading: false
        })
        //请求完成，隐藏加载Toast
        that.hideToast()
        var data = res.data.data;
        
        for(var i = 0; i < data.length; i++) {
          if(!!data[i].avatar.middleUrl)
            data[i].avatar.middleUrl = data[i].avatar.middleUrl.replace(/http/, 'https')
          else
            data[i].avatar.middleUrl = '/image/page/store.png'
          
          if(data[i].hasOwnProperty('distance')) {
            data[i].distance = data[i].distance.toFixed(2)
            data[i].distance = data[i].distance + 'km'
          }
          that.data.list.push(data[i])
        }
        
        that.setData({
          list: that.data.list
        })
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