function dealErr(res, success) {
    if(res.statusCode === 200) {
        success()
    } else {
        var title = '错误',
            tips = res.data.message

        showTips(title, tips, function() {
            //跳转到初始页面
            wx.switchTab({
                url: '/page/mine/index'
            })
        })
    }
}

function showTips(title, tips, success) {
    wx.showModal({
        title: title,
        content: tips,
        showCancel: false,
        success: function(res) {
            if (res.confirm) {
                success()
            }
        }
    })
}

function fail() {
    var title = '提示',
        tips = '服务器异常，请联系客服！'

    showTips(title, tips, function() {
        //跳转到初始页面
        wx.switchTab({
            url: '/page/mine/index'
        })
    })
}

function loading() {
    wx.showToast({
        title: 'loading',
        icon: 'loading',
        duration: 10000
    })
}

function hideToast(){
    wx.hideToast()
}

function successToast(title) {
    wx.showToast({
        title: title,
        icon: 'success',
        duration: 1000
    })
}

function loadingTitle() {
    wx.showNavigationBarLoading()
}

function hideLoadingTitle() {
    wx.showNavigationBarLoading()
}

module.exports = {
  dealErr:  dealErr,
  fail: fail,
  showTips: showTips,
  loading: loading,
  hideToast: hideToast,
  succeed: successToast,
  loadingTitle: loadingTitle,
  hideLt: hideLoadingTitle
}