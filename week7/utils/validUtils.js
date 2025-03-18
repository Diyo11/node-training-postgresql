const isUndefined = (value) =>{
    return value === undefined;
}

const isValidString = (value) =>{
    return typeof value === 'string' && value.trim() !== '';
}

const isNumber = (value) => {
    return typeof value ==='number' && !isNaN(value);
}

const isValidPassword = (value) =>{                                     //檢查密碼
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/     //正規表達式檢驗是否符合
    // console.log(passwordPattern.test(value));
    return passwordPattern.test(value);
}

module.exports = {
    isUndefined,
    isNumber,
    isValidString,
    isValidPassword
}