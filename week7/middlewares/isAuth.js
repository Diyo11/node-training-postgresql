const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const { verifyJWT } = require('../utils/jwtUtils');
const logger = require('../utils/logger')('isAuth');

const isAuth = async(req, res, next) =>{
    try{
        // 確認 token 是否存在並取出 token
        const authHeader = req.headers.authorization    //在header裡取到 token
        if(!authHeader || !authHeader.startsWith('Bearer')){
            next(appError(401, '你尚未登入'));
            return;
        }

        //分割出純 token
        const token = authHeader.split(' ')[1];     

        //驗證 token
        // {
        //     id: findUser.id,
        //     role: findUser.role
        // }
        const decoded = await verifyJWT(token)

        //在資料庫尋找對應 id 的使用者
        const currentUser = await dataSource.getRepository('User').findOne({
            where:{
                id: decoded.id
            }
        })
        if(!currentUser){
            next(appError(401, '無效的 token'));
            return;
        }

        //在 req 物件加入 user 欄位
        //方便後面可以呼叫使用
        req.user = currentUser;

        next();             //會傳到下一個middlewaves
    }catch(error){
        logger.error(error.message);
        next(error);
    }
};

module.exports = isAuth;


//使用方式
//在router上註明登入後才可以使用
/*
const isAuth = require('../middleware/auth');
router.post('/coaches/courses', isAuth, async (req, res, next) 
  // ...
});
*/
