const errorHandle = (res, statusCode, statusMsg, errorMsg) =>{
    const headers = {};

    res.writeHead(statusCode, headers);
    res.write(JSON.stringify({
        status: statusMsg,
        message: errorMsg
    }));
    res.end();
};

//主程式需要時，再用呼叫帶入參數
//errorHamdle(res, 409, "failed", 資料重複)