const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const logger = require('../utils/logger')
const { isUndefined, isValidString, isNumber } = require('../utils/validUtils')

const skillController = {
    async getSkills(req, res, next){
        const package = await dataSource.getRepository("Skill").find({
            select:["id", "name"]
        })
        res.status(200).json({
            status:"success",
            data:package
        })
    },

    async post_addSkill(req, res, next){
        const data = req.body;
        if(isUndefined(data.name) || !isValidString(data.name)){
            next(appError(400, "欄位未填寫正確"));  //優化
            return;
        }

        const skillRepo = await dataSource.getRepository('Skill');
        const existSkill = await skillRepo.find({
            where:{
                name: data.name
            }
        })
        if(existSkill.length > 0){
            res.status(409).json({
                status:"failed",
                message:"資料重複"
            })
            return;
        }
        const newPackage = await skillRepo.create({
            name: data.name
        })
        const result = await skillRepo.save(newPackage);
        res.status(200).json({
            status:"success",
            data: result
        })
    },

    async delete_assignSkill(req, res,next){
        const {skillId} = req.params;
        if(isUndefined(skillId) || isNumber(skillId)){
            res.status(400).json({
                status: "failed",
                message: "ID錯誤"
            })
            return;
        }
        const result = await dataSource.getRepository("Skill").delete(skillId);
        if(result.affected === 0){
            res.status(400).json({
                status:"failed",
                message:"ID錯誤"
            })
            return;
        }
        res.status(200).json({
            status:"success"
        })
    }
}

module.exports = skillController