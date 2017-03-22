var http = require('../../../service/request.js'),
    dealErr = require('../../../util/err_deal.js'),
    util = require('../../../util/util.js'),
    app = getApp()
var playTimeInterval
var recordTimeInterval
var recordTimeout
var updateTimeout
Page({
  data: {
    li: 0,
    loop: false,    // 循环
    playing: false,
    currentTag: 'a',
    stop: false,
    playTime: '00:00:00',
    mao: 0,

    first: true,

    once: true,
    recording: false,
    recordPlaying: false,
    hasRecord: false,
    recordTime: 0,
    recordPlayTime: 0,
    active: false, //主动停止录音
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

    if(lastTime > 0) {
      //如果两次单击间隔小于300毫秒，认为是双击
      if(curTime - lastTime < 300) {
        //双击
        if(that.data.currentTag == e.currentTarget.dataset.id) {
          that.setData({
            loop: false,
            currentTag: 'a'
          })
        } else if(that.data.li == e.currentTarget.dataset.id) {
          that.setData({
            loop: true,
            li: parseInt(e.currentTarget.dataset.id),
            currentTag: e.currentTarget.dataset.id
          })
        } else {
          clearInterval(recordTimeInterval)
          clearInterval(playTimeInterval)
          clearTimeout(recordTimeout)
          clearTimeout(updateTimeout)

          that.setData({
            loop: true,
            playTime: util.formatTime(0),
            li: parseInt(e.currentTarget.dataset.id),
            currentTag: e.currentTarget.dataset.id
          })
          that.audioCtx.seek(0)
          that.audioCtx.pause()
          that.play()
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
  play: function () {
    var that = this
    //清除Timeout
    clearTimeout(updateTimeout)

    // 使用 wx.createAudioContext 获取 audio 上下文 context
    that.audioCtx = wx.createAudioContext('myAudio' + that.data.li)

    that.audioCtx.play()

    that.setData({
      playing: true
    })
    app.globalData.audioPlaying = true
  },
  timeupdate: function(e) {
    var that = this
    var p = parseInt(e.detail.currentTime)
    var rp = parseInt(e.detail.currentTime)
    var duration = parseInt(e.detail.duration)
    
    if(rp > that.data.rp + 2) {

    } else {
      this.setData({
        playTime: util.formatTime(p)
      })      
    }
    //取第一次比较准确
    if(that.data.first) {
      that.setData({
        first: false,
        duration: duration + 4
      })
    }
    that.setData({
      rp: rp
    })
  },
  pause: function () {
    var that = this
    //暂停播放
    that.audioCtx.pause()

    that.setData({
      playing: false
    })

    app.globalData.audioPlaying = false
  },
  stop: function() {
    var that = this

    that.setData({
      first: true
    })

    app.globalData.audioPlaying = false
    //开始录音
    that.startRecord()
    recordTimeout = setTimeout(function() {
      that.stopRecord()
    }, that.data.duration*1000)

  },
  getCourse: function() {
    var that = this
    var url = that.data.url + 'hh' + that.data.num + '.json',
        data = {}

    http._get(url, data,
      function(res) {
        dealErr.hideToast()
        dealErr.dealErr(res, function() {
          for(var x = 0; x < res.data.length; x++)
            res.data[x].index = x

          that.setData({
            arr: res.data,
            max: res.data.length
          })
        })
      }, function(res) {
        dealErr.hideToast()
        dealErr.fail()
      })
  },
  startRecord: function () {
    var that = this
          
    that.setData({
      playing: false,
      playTime: util.formatTime(0),
      recording: true
    })

    recordTimeInterval = setInterval(function () {
      var recordTime = that.data.recordTime += 1
      that.setData({
        playTime: util.formatTime(that.data.recordTime),
        recordTime: recordTime
      })
    }, 1000)

    wx.startRecord({
      success: function (res) {
        console.log('record success')

        that.setData({
          recording: false,
          hasRecord: true,
          recordTime: 0,
          tempFilePath: res.tempFilePath,
          playTime: util.formatTime(0)
        })
        //主动停止录音，不播放录音
        if(!that.data.active) {
          //播放录音
          that.playVoice()
        } else {
          that.setData({
            active: false
          })
        }
      }
    })
  },
  stopRecord: function(e) {
    if(e) {
      this.setData({
        active: true
      })
    }
    //停止录音，结束到时停止录音callback
    clearTimeout(recordTimeout)
    clearInterval(recordTimeInterval)

    wx.stopRecord()
  },
  stopRecordUnexpectedly: function () {
    var that = this
    wx.stopRecord()

    clearInterval(recordTimeInterval)

    that.setData({
      recording: false,
      hasRecord: false,
      recordTime: 0,
      playTime: util.formatTime(0)
    })
  },
  playVoice: function () {
    var that = this

    that.setData({
      recordPlaying: true
    })

    playTimeInterval = setInterval(function () {
      var recordPlayTime = that.data.recordPlayTime + 1
      console.log('update recordPlayTime', recordPlayTime)
      that.setData({
        playTime: util.formatTime(recordPlayTime),
        recordPlayTime: recordPlayTime
      })
    }, 1000)

    wx.playVoice({
      filePath: that.data.tempFilePath,
      success: function () {
        clearInterval(playTimeInterval)
        var playTime = 0
        that.setData({
          recordPlaying: false,
          playTime: util.formatTime(playTime)
        })
        
        that.clear()
        that.checkLoop()
      }
    })
  },
  pauseVoice: function () {
    clearInterval(playTimeInterval)

    wx.pauseVoice()

    this.setData({
      recordPlaying: false
    })
  },
  checkLoop: function() {
    var that = this
    if(that.data.loop || that.data.once) {
      that.setData({
        once: false
      })
    } else {
      that.setData({
        li: that.data.li + 1,
        once: true
      })
    }

    if(that.data.li == that.data.max) {
      app.gloable.studyProgramOfRepeat = that.data.num
    } else if(that.data.stop) {
      
    } else {
      updateTimeout = setTimeout(function(){
        that.play()
      }, 2000)
    }
  },
  clear: function () {
    clearInterval(playTimeInterval)
    clearInterval(recordTimeInterval)
    wx.stopRecord()
    this.setData({
      recordPlaying: false,
      hasRecord: false,
      tempFilePath: '',
      playTime: util.formatTime(0),
      recordTime: 0,
      recordPlayTime: 0
    })
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this

    dealErr.loading()
    
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

    if (app.globalData.backgroundAudioPlaying) {
      this.setData({
        playing: true
      })
    }

    that.getCourse()
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
    if (this.data.playing) {
      this.stopVoice()
    } else if (this.data.recording) {
      this.stopRecordUnexpectedly()
    }

    this.setData({
      stop: true
    })
    clearTimeout(updateTimeout)
  },
  onUnload:function(){
    // 页面关闭
    if (this.data.playing) {
      this.stopVoice()
    } else if (this.data.recording) {
      this.stopRecordUnexpectedly()
    }

    this.setData({
      stop: true
    })
    clearTimeout(updateTimeout)
  }
})