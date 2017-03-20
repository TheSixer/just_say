var http = require('../../../service/request.js'),
    dealErr = require('../../../util/err_deal.js'),
    app = getApp()
Page({
  data: {
    index: 0,
    playing: false,
    currentTag: '',
    stop: false
  },
  doubleClick: function (e) {
    var that = this
    //触摸时间距离页面打开时间毫秒数
    var curTime = e.timeStamp
    //上一次触摸距离页面打开时间毫秒数
    var lastTime = this.data.lastTapDiffTime

    if(lastTime > 0) {
      //如果两次单击间隔小于300毫秒，认为是双击
      if(curTime - lastTime < 300) {
        //双击
        if(that.data.currentTag == e.currentTarget.id) {
          that.setData({
            currentTag: ''
          })
        } else {
          that.setData({
            currentTag: e.currentTarget.id
          })
        }
        console.log(e)
        console.log(e.timeStamp + '- double tap')
      } else {
        console.log(e.timeStamp + '- tap')
      }
    } else {
      console.log(e.timeStamp + '- first tap')
    }

    this.setData({
      lastTapDiffTime: curTime
    })
  },
  play: function (res) {
    var that = this
    
    wx.playBackgroundAudio({
      dataUrl: that.data.arr[that.data.index].mp3,
      complete: function (res) {
        that.setData({
          playing: true
        })
      }
    })
    // this._enableInterval()
    app.globalData.backgroundAudioPlaying = true
  },
  afterStop: function() {
    var that = this
    wx.onBackgroundAudioStop(function() {
      that.setData({
        playing: false,
        index: that.data.index + 1
      })
      app.globalData.backgroundAudioPlaying = false
      console.log(that.data.stop)
      if(that.data.index >= that.data.max || that.data.stop) {
        
      } else {
        that.updateTimeout = setTimeout(function(){
          that.play()
          that.afterStop()
        }, 2000)
      }
        
    })
  },
  _enableInterval: function () {
    var that = this
    update()
    this.updateInterval = setInterval(update, 500)
    function update() {
      wx.getBackgroundAudioPlayerState({
        success: function (res) {
          if(that.data.stop) {
            //已经退出页面，停止当前的播放
            wx.stopBackgroundAudio()
          }
          that.setData({
            playTime: res.currentPosition
          })
        }
      })
    }
  },
  getCourse: function() {
    var that = this
    var url = that.data.url + 'hh' + that.data.num + '.json',
        data = {}

    http._get(url, data,
      function(res) {
        dealErr.dealErr(res, function() {
          for(var x in res.data)
            res.data[x].index = x

          that.setData({
            arr: res.data,
            max: res.data.length
          })
          that.play()
          that.afterStop()
        })
      }, function(res) {
        dealErr.fail()
      })
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    that.audioCtx = wx.createAudioContext('myAudio')
    var api = app.globalData.APIUrl,
        url = app.globalData.url

    that.setData({
      api: api,
      url: url,
      num: options.index
    })

    that.getCourse()

    if (app.globalData.backgroundAudioPlaying) {
      this.setData({
        playing: true
      })
    }
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
    this.setData({
      stop: true
    })
    wx.stopBackgroundAudio()
    clearTimeout(this.updateTimeout)
    clearInterval(this.updateInterval)
  }
})