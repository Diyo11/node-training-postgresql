const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const { isUndefined, isNumber, isValidString } = require('../utils/validUtils')     //引入驗證機制
const handleErrorAsync = require('../utils/handleErrorAsync')
const isAuth = require('../middlewares/isAuth')
const appError = require('../utils/appError')

router.get('/', async (req, res, next) => {
    try{
        const packages = await dataSource.getRepository("CreditPackage").find({
            select: ["id", "name", "credit_amount", "price"]
        })
        res.status(200).json({
            status:"success",
            data:packages
        })
    }catch(error){
        next(error);
    } 
})

router.post('/', async (req, res, next) => {
    try{
        const data = req.body;   
        console.log(data);
        if(isUndefined(data.name) || !isValidString(data.name) ||
            isUndefined(data.credit_amount) || !isNumber(data.credit_amount)||
            isUndefined(data.price) || !isNumber(data.price))
        // const { name, credit_amount, price} = req.body;   
        // if(isUndefined(name) || isValidString(name) ||
        //     isUndefined(credit_amount) || isValidString(credit_amount)||
        //     isUndefined(price) || isValidString(price))
        {
            res.status(400).json({
            status:"failed",
            message: "欄位未填寫正確"
            })
            return;
        }
        const creaditPackageRepo = await dataSource.getRepository("CreditPackage")   //讀取資料表
        const existPackage = await creaditPackageRepo.find({                            //找到對應資料                         
            where:{
                name: data.name
            }
        })
        if(existPackage.length > 0)
        {
            res.status(409).json({
                status: "failed",
                message: "資料重複"
            })
            return
        }

        const newPackage = await creaditPackageRepo.create({          //新增資料
          name: data.name,
          credit_amount: data.credit_amount,
          price: data.price
        })
        const result = await creaditPackageRepo.save(newPackage)
        res.status(200).json({
            status: "success",
            data: result
        })
    }catch(error){
        next(error);
    }
})

router.delete('/:creditPackageId', async (req, res, next) => {
    try{
        const { creditPackageId } = req.params;     //擷取傳入 url 的 ID
        console.log(creditPackageId);
        if(isUndefined(creditPackageId) || isNumber(creditPackageId)){
            res.status(400).json({
            status: "failed",
            message: "ID錯誤1"
          })
          return;
        }
  
        const result = await dataSource.getRepository("CreditPackage").delete(creditPackageId)   //刪除
        if(result.affected === 0){   
            res.status(400).json({
                status: "failed",
                message: "ID錯誤"
            })
            return;
        }
  
        res.status(200).json({
            status: "success"
        })
      }catch(error){
        console.error(error);
        next(error);
    }
})

// TODO week6 LV2
router.post('/:creditPackageId', isAuth, handleErrorAsync(async(req, res, next)=>{
    const { id } = req.user;
    const { creditPackageId } = req.params;
    const creaditPackageRepo = dataSource.getRepository('CreditPackage');
    const creaditPackage = await creaditPackageRepo.findOne({
        where:{
            id: creditPackageId
        }
    })
    if(!creaditPackage){
        next(appError(400, 'ID錯誤'));
        return;
    }

    const creditPurchaseRepo = dataSource.getRepository('CreditPurchase');
    const newPurchase = await creditPurchaseRepo.create({
        user_id: id,
        credit_package_id: creditPackageId,
        purchased_credits: creditPackageId.credit_amount,
        price_paid: creditPackageId.price,
        purchaseAt: new Date().toISOString()
    })
    await creditPurchaseRepo.save(newPurchase)
    res.status(200).json({
        status: 'success'
    })
}))

module.exports = router
