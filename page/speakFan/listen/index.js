var http = require('../../../service/request.js'),
    dealErr = require('../../../util/err_deal.js'),
    Dict = require('../../../util/dict.js'),
    util = require('../../../util/util.js'),
    app = getApp(),
    updateTimeout,
    updateInterval
Page({
  data: {
    li: 0,
    loop: false,    // 循环
    playing: false,
    currentTag: 'a',
    stop: false,
    playTime: '00:00:00',
    mao: 4,

    poster: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000',
    src: '',
    last: false
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
        } else {
          that.setData({
            loop: true,
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
    
    if(rp > that.data.rp + 2) {

    } else {
      this.setData({
        playTime: util.formatTime(p)
      })      
    }

    that.setData({
      rp: rp
    })
  },
  pause: function () {
    var that = this

    that.audioCtx.pause()
    that.setData({
      playing: false
    })
  },
  stop: function() {
    var that = this

    if(!that.data.loop) {
      if(that.data.li + 1 == that.data.max) {
        that.setData({
          li: 0
        })
      } else {
        that.setData({
          li: that.data.li + 1
        })
      }
    }
    that.setData({
      playing: false,
      playTime: util.formatTime(0)
    })
    

    app.globalData.audioPlaying = false
    console.log(that.data.li + ' - ' + that.data.max)
    if(that.data.li == 0 && !that.data.loop) {
      app.globalData.studyProgramOfLisen = true
      if(app.globalData.studyProgramOfSpeak) {
        wx.showModal({
          title: '提示',
          cancelText: '留在听力',
          cancelColor: '#999',
          content: '本单元已学完，是否前往学习下一单元？',
          success: function(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '/page/speakFan/index'
              })
            }
            //重置
            app.globalData.studyProgramOfLisen = false
            app.globalData.studyProgramOfSpeak = false

            wx.setStorage({
              key: 'studyProgram',
              data: that.data.num
            })
          }
        })  
      } else {
        wx.showModal({
          title: '提示',
          cancelText: '留在听力',
          cancelColor: '#999',
          content: '已完成听力练习，前往跟读练习？',
          success: function(res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '../speak/index?index=' + that.data.num
              })
            }
          }
        })  
      }
    } else if(that.data.stop) {
      
    } else {
      updateTimeout = setTimeout(function(){
        that.play()
      }, 2000)
    }
  },
  getCourse: function() {
    var that = this
    var url = that.data.url + 'hh' + that.data.num + '.json',
        data = {}

    http._get(url, data,
      function(res) {
        dealErr.hideToast()
        dealErr.dealErr(res, function() {
          for(var x = 0; x < res.data.length; x++) {
            res.data[x].index = x
            res.data[x].wordsArr = []

            var wordsArr = res.data[x].words.split(' ')
            for(var y in wordsArr) {
              if(wordsArr[y] in Dict.dict) {
                res.data[x].wordsArr[y] = {
                  'word': wordsArr[y],
                  'dict': Dict.dict[wordsArr[y]]
                }
              }
            }
          }
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
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this

    dealErr.loading()

    that.audioCtx = wx.createAudioContext('myAudio0')

    wx.getSystemInfo( {
      success: ( res ) => {
        this.setData( {
          windowHeight: res.windowHeight - 80,
          windowWidth: res.windowWidth
        })
      }
    })

    var api = app.globalData.APIUrl,
        url = app.globalData.url

    that.setData({
      api: api,
      url: url,
      num: options.index
    })

    dealErr.loading()
    // that.getCourse()

  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    this.setData({
      stop: false
    })
    this.getCourse()
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭

    this.setData({
      stop: true,
      playing: false
    })
    clearTimeout(updateTimeout)
  }
})