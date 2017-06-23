var http = require('../../../service/request.js'),
    dealErr = require('../../../util/err_deal.js'),
    util = require('../../../util/util.js'),
    app = getApp(),
    updateTimeout
Page({
  data: {
    li: 0,
    loop: false,    // 循环
    playing: false,
    currentTag: 'a',
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
  getDict: function() {
    var that = this

    var url = that.data.url + '3800basedict.txt'

    http._get(url, {},
      function (res) {
        dealErr.dealErr(res, function() {
          var arr = res.data.match(/[^\r\n]+/g)
          var obj = {}
          for(var x in arr) {
            var obj1 = arr[x].split('  ')
            obj[obj1[0]] = obj1[1]
          }
          that.setData({
            dict: obj
          })
          that.getCourse()
        })
      }, function (res) {
        dealErr.fail()
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
        if (that.data.currentTag == e.currentTarget.dataset.id) {
          that.setData({
            loop: false,
            currentTag: 'a'
          })
        } else {
          that.setData({
            loop: true,
            li: parseInt(e.currentTarget.dataset.id),
            currentTag: parseInt(e.currentTarget.dataset.id)
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
    wx.pauseBackgroundAudio()
    that.setData({
      playing: false
    })
    app.globalData.backgroundAudioPlaying = false
  },
  afterStop: function() {
    var that = this

    clearInterval(this.updateInterval)
    
    wx.onBackgroundAudioStop(function() {
      if (!that.data.loop) {
        if (that.data.li + 1 == that.data.max) {
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
      if (that.data.li == 0 && !that.data.loop) {
        app.globalData.studyProgramOfLisen = true
        if (app.globalData.studyProgramOfSpeak) {
          wx.showModal({
            title: '提示',
            cancelText: '留在听力',
            cancelColor: '#999',
            content: '本单元已学完，是否前往学习下一单元？',
            success: function (res) {
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
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '../speak/index?index=' + that.data.num
                })
              }
            }
          })
        }
      } else if (that.data.stop) {

      } else {
        updateTimeout = setTimeout(function () {
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
      function (res) {
        dealErr.hideToast()
        dealErr.dealErr(res, function() {
          for (var x = 0; x < res.data.length; x++) {
            res.data[x].index = x
            res.data[x].wordsArr = []
      
            var wordsArr = res.data[x].words.split(' ')
            for (var y in wordsArr) {
              if (wordsArr[y] in that.data.dict) {
                res.data[x].wordsArr[y] = {
                  'word': wordsArr[y],
                  'dict': that.data.dict[wordsArr[y]]
                }
              }
            }
          }
          result = res.data.sort(sortByFirstWord)

          that.setData({
            arr: result,
            max: res.data.length
          })
          // if (!that.data.playing) {
          //   that.play()
          //   that.afterStop()
          // }
        })
      }, function(res) {
        dealErr.fail()
      })

    function sortByFirstWord(a, b) {
      var num1 = a.text_en.substr(0, 1).charCodeAt(),
          num2 = b.text_en.substr(0, 1).charCodeAt()
      if (num1 > 96) {
        num1 = num1 - 31.5
      }
      if (num2 > 96) {
        num2 = num2 - 31.5
      }  
      if (num1 > num2)
        return 1
      return -1
    }
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this

    wx.getSystemInfo( {
      success: ( res ) => {
        this.setData( {
          windowHeight: res.windowHeight,
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

    dealErr.loading()
    that.getDict()

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
    // this.setData({
    //   stop: false
    // })
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭

    // this.setData({
    //   stop: true
    // })
    // clearTimeout(this.updateTimeout)
    // clearInterval(this.updateInterval)
  }
})