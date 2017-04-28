var http = require('../../../service/request.js'),
    dealErr = require('../../../util/err_deal.js'),
    Dict = require('../../../util/dict.js'),
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
    double: false,
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
            hasRecord: false,
            playing: false,
            // active: true,
            double: true,
            // recording: false,
            // recordPlaying: false,
            loop: true,
            playTime: util.formatTime(0),
            li: parseInt(e.currentTarget.dataset.id),
            currentTag: e.currentTarget.dataset.id
          })

          if(that.data.recordPlaying) {
            that.setData({
              recordPlaying: false
            })
            wx.stopVoice({
              success: function(res){
                // success
              },
              fail: function(res) {
                // fail
              },
              complete: function(res) {
                // complete
                playOthers()
              }
            })
          } else if(that.data.recording) {
            that.setData({
              recording: false
            })
            wx.stopRecord({
              success: function(res){
                // success
              },
              fail: function(res) {
                // fail
              },
              complete: function(res) {
                // complete
                playOthers()
              }
            })
          } else {
            playOthers()
          }

          function playOthers() {
            that.audioCtx.seek(0) 
            that.audioCtx.pause()
            that.play()
          }
            
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
        duration: duration + 3
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
  startRecord: function () {
    var that = this
          
    that.setData({
      playing: false,
      active: false,
      playTime: util.formatTime(0),
      recording: true,
      hasRecord: false
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
        clearInterval(recordTimeInterval)
        that.setData({
          recording: false,
          // hasRecord: true,
          recordTime: 0,
          recordPlayTime: 0,
          tempFilePath: res.tempFilePath,
          playTime: util.formatTime(0)
        })
        //主动停止录音，不播放录音
        //录音状态下双击播放其他例句，不播放录音
        if(that.data.double) {
          that.setData({ 
            hasRecord: false,
            double: false
          })
        } else if(!that.data.active) {
          //播放录音
          that.setData({ hasRecord: true})
          that.playVoice()
        } else {
          that.setData({
            hasRecord: true,
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
    wx.stopRecord({
      success: function() {
        clearInterval(recordTimeInterval)

        that.setData({
          recording: false,
          hasRecord: false,
          recordTime: 0,
          playTime: util.formatTime(0)
        })
      }
    })
  },
  stopVoiceUnexpectedly: function () {
    var that = this

    wx.stopVoice({
      success: function(res){
        // success
        clearInterval(playTimeInterval)

        that.setData({
          recordPlaying: false,
          hasRecord: false,
          recordPlayTime: 0,
          playTime: util.formatTime(0)
        })
      }
    })
  },
  playVoice: function () {
    var that = this

    that.setData({
      recordPlaying: true
    })

    playTimeInterval = setInterval(function () {
      var recordPlayTime = that.data.recordPlayTime + 1

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
          recordPlayTime: 0,
          playTime: util.formatTime(0)
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
      if(that.data.li + 1 == that.data.max) {
        that.setData({
          li: -1
        })
      } else {
        that.setData({
          li: that.data.li + 1,
          once: true
        })
      }
    }

    if(that.data.li == -1 && !that.data.loop && !that.data.once) {
      app.globalData.studyProgramOfSpeak = true
      if(app.globalData.studyProgramOfLisen) {
        wx.showModal({
          title: '提示',
          cancelText: '留在当前',
          cancelColor: '#999',
          content: '本单元已学完，是否前往学习下一单元？',
          success: function(res) {
            //重置
            app.globalData.studyProgramOfLisen = false
            app.globalData.studyProgramOfSpeak = false

            wx.setStorage({
              key: 'studyProgram',
              data: that.data.num
            })

            if (res.confirm) {
              wx.switchTab({
                url: '/page/speakFan/index'
              })
            } else {
              that.setData({
                li: 0
              })
            }
          }
        })  
      } else {
        wx.showModal({
          title: '提示',
          cancelText: '留在当前',
          cancelColor: '#999',
          content: '已完成跟读练习，还未完成听力练习，立即前往？',
          success: function(res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '../listen/index?index=' + that.data.num
              })
            } else {
              that.setData({
                li: 0,
                once: true
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
    //显示loading
    dealErr.loading()
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