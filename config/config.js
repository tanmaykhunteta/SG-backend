
    exports.PORT = 3000
    exports.SERVER = "http://localhost:" + exports.PORT
    
    exports.FRONTEND = "http://localhost:4200"
    
    exports.DB = {}
    exports.DB["COLLECTION"] = "SG"
    exports.DB["URL"] = 'mongodb://localhost:27017/' + exports.DB.COLLECTION
    
    
    exports.JWT_CONFIG = {
        SECRET : "secret101",
        EXPIRES_IN : 3600
    }
    
    exports.NODE_MAILER = {}
    exports.NODE_MAILER["HOST"] = "smtp.ethereal.email"
    exports.NODE_MAILER["PORT"] = 587
    exports.NODE_MAILER["EMAIL"] = "geuikhwawc3sbunz@ethereal.email"
    exports.NODE_MAILER["PASSWORD"] = "TkwsYrtuhAb2Ce6PJM"

    exports.ACC_TKN_HDR = 'x-access-token'


if(process.env.NODE_ENV == "test") {
    exports.DB = {}
    exports.DB["COLLECTION"] = "SG-TEST";
    exports.DB["URL"] = 'mongodb://localhost:27017/' + exports.DB.COLLECTION


    exports.NODE_MAILER = {}
    exports.NODE_MAILER["HOST"] = "smtp.ethereal.email"
    exports.NODE_MAILER["PORT"] = 587
    exports.NODE_MAILER["EMAIL"] = "geuikhwawc3sbunz@ethereal.email"
    exports.NODE_MAILER["PASSWORD"] = "TkwsYrtuhAb2Ce6PJM"
}





