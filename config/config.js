
exports.PORT = 3000
exports.SERVER = "http://localhost:" + exports.PORT

exports.FRONTEND = "http://localhost:4200"

exports.DB = {}
exports.DB["COLLECTION"] = "SG"
exports.DB["URL"] = 'mongodb://localhost:27017/' + exports.DB.COLLECTION


exports.ROLES = {}
exports.ROLES['USER'] = 'user'
exports.ROLES_ENUM = [exports.ROLES.USER]

exports.JWT_CONFIG = {
    SECRET : "secret101",
    EXPIRES_IN : '2m'
}

exports.NODE_MAILER = {}
exports.NODE_MAILER["HOST"] = "smtp.ethereal.email"
exports.NODE_MAILER["PORT"] = 587
exports.NODE_MAILER["EMAIL"] = ""
exports.NODE_MAILER["PASSWORD"] = ""


exports.TOKEN_MAX_AGE = 3600 // 1 hour
exports.TOKEN_TYPES = {}
exports.TOKEN_TYPES["EMV"] = 'emv'; //email verification
exports.TOKEN_TYPES["PSR"] = 'pswd_rst'; //password reset
exports.TOKEN_TYPES_ENUM = [exports.TOKEN_TYPES.EMV, exports.TOKEN_TYPES.PSR]