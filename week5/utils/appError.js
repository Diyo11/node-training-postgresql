const appError = (status, errorMessage ,next) =>{
    const error = new Error(errorMessage);
    error.status = status;
    return error;
}

module.exports = appError;