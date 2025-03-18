const express = require('express');

const router = express.Router();
const headleErrorAsync = require('../utils/handleErrorAsync')
const skillController = require('../controller/skill')

router.get('/', headleErrorAsync(skillController.getSkills))

router.post('/', headleErrorAsync(skillController.post_addSkill))

router.delete('/:skillId', headleErrorAsync(skillController.delete_assignSkill))

module.exports = router;
