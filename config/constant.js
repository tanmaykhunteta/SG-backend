exports.ERROR_CODES = {}
exports.ERROR_CODES['userAlExists'] = "user-already-exists"
exports.ERROR_CODES['tokenExpired'] = "token-expired";
exports.ERROR_CODES['emaAlVerified'] = "email-already-verified";
exports.ERROR_CODES['validationErr'] = "validation-errors"


exports.ROLES = {}
exports.ROLES['USER'] = 'user'


exports.GENDERS = ["male", "female", "others"]


exports.MAX_AGE = 100
exports.MIN_AGE = 14


exports.TRANS_TYPES = {};
exports.TRANS_TYPES["signed_up"] = 0
exports.TRANS_TYPES["email_verified"] = 1


exports.REWARD_TYPES = {}
exports.REWARD_TYPES["signed_up"] = 1000
exports.REWARD_TYPES["email_verified"] = 1000


exports.TRANS_ST = {}
exports.TRANS_ST["pending"] = 0,
exports.TRANS_ST["completed"] = 1



exports.TOKEN_MAX_AGE = 3600 // 1 hour
exports.TOKEN_TYPES = {}
exports.TOKEN_TYPES["EMV"] = 'emv'; //email verification
exports.TOKEN_TYPES["PSR"] = 'pswd_rst'; //password reset


exports.keyOf = function (value) {
    return Object.keys(this).find((key) => this[key] == value )
}

exports.keys = function () {
    return Object.keys(this)
}

exports.values = function () {
    return Object.values(this);
}


console.log('----------------- initializing constants -------------')
Object.keys(exports).map((key) => {
    if(exports[key] instanceof Object) {
        exports[key].keyOf = exports.keyOf
        const keys = exports.keys.call(exports[key])
        const values = exports.values.call(exports[key])
        exports[key].keys = keys;
        exports[key].values = values
    }
})

