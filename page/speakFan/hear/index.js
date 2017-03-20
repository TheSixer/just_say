var http = require('../../../service/request.js'),
    dealErr = require('../../../util/err_deal.js'),
    util = require('../../../util/util.js'),
    app = getApp()
Page({
  data: {
    li: 0,
    loop: false,    // 循环
    playing: false,
    currentTag: '',
    stop: false,
    playTime: '00:00:00',
    mao: 4
  },
  goHash (e) {
      let hash = e.currentTarget.dataset.hash
      console.log(hash)
      this.setData({
          mao: hash
      })
  },
  doubleClick: function (e) {
    var that = this
    //触摸时间距离页面打开时间毫秒数
    var curTime = e.timeStamp
    //上一次触摸距离页面打开时间毫秒数
    var lastTime = this.data.lastTapDiffTime
    console.log(e)
    if(lastTime > 0) {
      //如果两次单击间隔小于300毫秒，认为是双击
      if(curTime - lastTime < 300) {
        //双击
        if(that.data.currentTag == e.currentTarget.dataset.id) {
          that.setData({
            loop: false,
            currentTag: ''
          })
        } else {
          that.setData({
            loop: true,
            li: parseInt(e.currentTarget.dataset.id),
            currentTag: e.currentTarget.dataset.id
          })
          that.play()
          that.afterStop()
        }
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
      dataUrl: that.data.arr[that.data.li].mp3,
      complete: function (res) {
        that.setData({
          playing: true
        })
        that._enableInterval()
      }
    })
    app.globalData.backgroundAudioPlaying = true
  },
  // seek: function (e) {
  //   clearInterval(this.updateInterval)
  //   var that = this
  //   wx.seekBackgroundAudio({
  //     position: e.detail.value,
  //     complete: function () {
  //       // 实际会延迟两秒左右才跳过去
  //       setTimeout(function () {
  //         that._enableInterval()
  //       }, 2000)
  //     }
  //   })
  // },
  pause: function () {
    var that = this
    wx.pauseBackgroundAudio({
      dataUrl: that.data.arr[that.data.li].mp3,
      success: function () {
        that.setData({
          playing: false
        })
      }
    })
    app.globalData.backgroundAudioPlaying = false
  },
  afterStop: function() {
    var that = this

    clearInterval(this.updateInterval)
    
    wx.onBackgroundAudioStop(function() {
      if(!that.data.loop) {
        that.setData({
          li: that.data.li + 1
        })
      }
      that.setData({
        playing: false,
        playTime: util.formatTime(0)
      })
      
      app.globalData.backgroundAudioPlaying = false
      
      if(that.data.li == that.data.max) {
        app.gloable.studyProgramOfLisen = num
      } else if(that.data.stop) {
        
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
    if(!that.data.stop) {
      this.updateInterval = setInterval(update, 500)
    } else {
      clearInterval(this.updateInterval)
    }
    function update() {
      wx.getBackgroundAudioPlayerState({
        success: function (res) {
          if(that.data.stop) {
            //已经退出页面，停止当前的播放
            that.setData({
              stop: true
            })
          }
          if(that.data.playing) {
            that.setData({
              playTime: util.formatTime(res.currentPosition)
            })
          }
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
          for(var x = 0; x < res.data.length; x++)
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

    wx.getSystemInfo( {
      success: ( res ) => {
        this.setData( {
          windowHeight: res.windowHeight - 140,
          windowWidth: res.windowWidth
        })
      }
    })

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
    this.setData({
      stop: false
    })
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭

    this.setData({
      stop: true
    })
    clearTimeout(this.updateTimeout)
    clearInterval(this.updateInterval)
  }
})