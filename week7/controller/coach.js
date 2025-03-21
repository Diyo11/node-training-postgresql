const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')
const appError = require('../utils/appError')
const { isUndefined, isNumber, isValidString } = require('../utils/validUtils')

const coachesController = {
    ////[GET] 取得教練列表
    async get_coachList(req, res, next){
        const{ per, page } = req.query;
        if(!isValidString(per) || isValidString(page)){
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
        }

        const coachRepo = dataSource.getRepository('Coach');
        const coachData = await coachRepo
            .createQueryBuilder("Coach")
            .innerJoinAndSelect("Coach.user", "User")
            .select(["Coach.id","User.name"])
            .take(Number(per))
            .skip(Number(page))
            .getMany();
        // ? 取得教練列表後，參數要用在哪邊???

        res.status(200).json({
            status: "success",
            data:coachData
        })
    },

    ////[GET] 取得教練詳細資訊
    async get_coachInfo(req, res, next){
        const { coachId } = req.params;
        if(!isValidString(coachId)){
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確"
            })
            return;
        }
        
        const coachRepo = dataSource.getRepository('Coach');
        const userRepo = dataSource.getRepository('User');
        //---找出資料表內容1--//
        // const coachData = await coachRepo.findOne({
        //     where:{
        //         id:coachId
        //     }
        // }) 
        
        //---找出資料表內容2--//
        const coachData = await coachRepo.findOneBy({"id": coachId});
        const userData = await userRepo.findOneBy({"id": coachData.user_id})

        //---找出資料表內容3--//
        // const coachData = await coachRepo
        //     .createQueryBuilder("coach")
        //     .where("coach.id = :id", {id:coachId})
        //     .getOne();
        // console.log("coachId.user_id:", coachData.user_id); //如果用了 coachId.user_id會出現 undefind 然後沒有資料
        // const userData = await userRepo
        //     .createQueryBuilder("user")
        //     .where("user.id = :id", {id:coachData.user_id})
        //     .getOne();

        if(!coachData){
            res.status(400).json({
                status: "failed",
                message: "使用者不存在"
            })
            return;
        }

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    name: userData.name,
                    role: userData.role
                },
                coach: coachData
            }            
        })
    }
}

module.exports = coachesController