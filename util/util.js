function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

function format(now){     
  var year=now.getFullYear();   
  var month=now.getMonth()<9?'0'+(now.getMonth()+1):now.getMonth()+1;     
  var date=now.getDate()<10?'0'+now.getDate():now.getDate();     
  var hour=now.getHours()<10?'0'+now.getHours():now.getHours();     
  var minute=now.getMinutes()<10?'0'+now.getMinutes():now.getMinutes();     
  var second=now.getSeconds()<10?'0'+now.getSeconds():now.getSeconds();  

  return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;     
}     

module.exports = {
  formatTime: formatTime,
  format: format
}