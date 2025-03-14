const appError = require('../utils/appError');

module.exports = (req, res, next) =>{
    // 401, '使用者尚未成為教練'
    if(!req.user || req.user.role !== 'COACH'){  //可以直接在 req 裡面取到登入後的資料
        next(appError(401, '使用者尚未成為教練'));
        return;
    }
    next();
}