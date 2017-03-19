var http = require('../../../service/request.js'),
    dealErr = require('../../../util/err_deal.js'),
    app = getApp()
var util = require('../../../util/util.js')
var dataUrl = 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46'
Page({
  onLoad: function () {
    this._enableInterval()

    if (app.globalData.backgroundAudioPlaying) {
      this.setData({
        playing: true
      })
    }
  },
  data: {
    playing: false,
    playTime: 0,
    formatedPlayTime: '00:00:00'
  },
  play: function (res) {
    var that = this
    wx.playBackgroundAudio({
      dataUrl: that.data.dataUrl,
      title: '此时此刻',
      coverImgUrl: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000',
      complete: function (res) {
        that.setData({
          playing: true
        })
      }
    })
    this._enableInterval()
    app.globalData.backgroundAudioPlaying = true
  },
  seek: function (e) {
    clearInterval(this.updateInterval)
    var that = this
    wx.seekBackgroundAudio({
      position: e.detail.value,
      complete: function () {
        // 实际会延迟两秒左右才跳过去
        setTimeout(function () {
          that._enableInterval()
        }, 2000)
      }
    })
  },
  pause: function () {
    var that = this
    wx.pauseBackgroundAudio({
      dataUrl: that.data.dataUrl,
      success: function () {
        that.setData({
          playing: false
        })
      }
    })
    app.globalData.backgroundAudioPlaying = false
  },
  stop: function () {
    var that = this
    wx.stopBackgroundAudio({
      dataUrl: that.data.dataUrl,
      success: function (res) {
        that.setData({
          playing: false,
          playTime: 0,
          formatedPlayTime: util.formatTime(0)
        })
      }
    })
    app.globalData.backgroundAudioPlaying = false
  },
  _enableInterval: function () {
    var that = this
    update()
    this.updateInterval = setInterval(update, 500)
    function update() {
      wx.getBackgroundAudioPlayerState({
        success: function (res) {
          that.setData({
            playTime: res.currentPosition,
            formatedPlayTime: util.formatTime(res.currentPosition + 1)
          })
        }
      })
    }
  },
  onUnload: function () {
    clearInterval(this.updateInterval)
  },
  getCourse: function() {
    var that = this
    var url = that.data.url + 'hh' + that.data.index + '.json',
        data = {}

    http._get(url, data,
      function(res) {
        dealErr.dealErr(res, function() {
          that.setData({
            arr: res.data,
            dataUrl: res.data[0].mp3
          })
          console.log(res.data[0].mp3)
          
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
      index: options.index
    })

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