// middleware est un module qui s'éxécute lors de l'éxecution de la requête (le mot clé use = middleware)

exports.success = function(result) {
    return {
        status: 'success',
        result: result
    }
}

exports.error = function(messageError) {
    return {
        status: 'error',
        result: messageError
    }
}