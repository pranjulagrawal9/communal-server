const success= (statusCode, result)=>{
    return {
        status: 'ok',
        statusCode,
        result
    }
}

const err= (statusCode, message)=>{
    return {
        status: 'error',
        statusCode,
        message
    }
}

module.exports= {
    success,
    err
}