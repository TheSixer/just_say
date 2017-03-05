/**
 * url 请求地址
 * success 成功的回调
 * fail 失败的回调
 */
function _get( url, data, success, fail ) {

    console.log( "------start---_get----" );
    wx.request( {
        url: url,
        data: data,
        header: {
            // 'Content-Type': 'application/json'
        },
        success: function( res ) {
            success( res );
        },
        fail: function( res ) {
            fail( res );
        }
    });

    console.log( "----end-----_get----" );
}

/**
 * url 请求地址
 * success 成功的回调
 * fail 失败的回调
 */
function _post_form(url,data, success, fail ) {
     console.log( "----_post--start-------" );
     wx.request( {
        url: url,
        header: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        method:'POST',
        data:{data: data},
        success: function( res ) {
            success( res );
        },
        fail: function( res ) {
            fail( res );
        }
    });
     console.log( "----end-----_get----" );
}

 /**
 * url 请求地址
 * success 成功的回调
 * fail 失败的回调
 */
function _post_json(url,data, success, fail ) {
     console.log( "----_post--start-------" );
    wx.request( {
        url: url,
        header: {
            'content-type': 'application/json',
        },
        method:'POST',
        data:data,
        success: function( res ) {
            success( res );
        },
        fail: function( res ) {
            fail( res );
        }
    });

    console.log( "----end----_post-----" );
}

 /**
 * url 请求地址
 * success 成功的回调
 * fail 失败的回调
 */
function _put_json(url,data, success, fail ) {
     console.log( "----put--start-------" );
    wx.request( {
        url: url,
        header: {
            'content-type': 'application/json',
        },
        method:'PUT',
        data:data,
        success: function( res ) {
            success( res );
        },
        fail: function( res ) {
            fail( res );
        }
    });

    console.log( "----end----_put-----" );
}
module.exports = {
    _get: _get,
    _post_form:_post_form,
    _post:_post_json,
    _put: _put_json
}