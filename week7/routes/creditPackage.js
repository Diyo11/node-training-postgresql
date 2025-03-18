const express = require('express')

const router = express.Router()
// exports.router = router
const logger = require('../utils/logger')('CreditPackage')
const handleErrorAsync = require('../utils/handleErrorAsync')
const isAuth = require('../middlewares/isAuth')
const creaditPackageController = require('../controller/creditPackage')

router.get('/', handleErrorAsync(creaditPackageController.get_CreditPackage))

router.post('/', handleErrorAsync(creaditPackageController.post_addCreditPackage))

router.delete('/:creditPackageId', handleErrorAsync(creaditPackageController.delete_CreditPackage))

// TODO week6 LV2
/*
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
}))*/

module.exports = router
