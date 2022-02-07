const constants = require('../config/constant');

exports.userSchema = {
    "$id": "user.schema.json",
    "title": "User",
    "description": "Survey Gravity User",
    "type": "object",
    "properties": {
        "apiPath" : {
            "description": "Temporary field available only till the validation, used for conditional 'required fields' based on route",
            "type" : "string"
        },
        "_id": {
            "description": "The unique identifier for a user (mongo doc id)",
            "type": "string"
        },
        "fn": { "type": "string" },
        "ln": { "type": "string" },
        "email" : { 
            "type" : "string", 
            "pattern": "^\\S+@\\S+\\.\\S+$",
            "minLength": 6,
            "maxLength": 127
        },
        "gndr" : {
            "description" : "User Gender",
            "type" : "string",
            "enum" : constants.GENDERS
        },
        "yob" : {
            "description" : "User's year of birth",
            "type" : "number"
        },
        "age" : { "type" : "number", "minimum": constants.MIN_AGE, "maximum": constants.MAX_AGE},
        "cnfm_pswd" : { "type" : "string", "const" : {"$data" : "1/pswd"}},
        "pswd" : { "type" : "string" },
        "cntry" : { "type" : "string" },
        "ttl_reward" : { "type" : "number" },
        "ttl_reward_claimed" : { "type" : "number" },
        "prvcyPlcy" : {
            "description" : "Privacy policy acceptance",
            "type" : "boolean",
            "const" : true
        }
    },

    "anyOf": [
        {   
            "if" : {"properties" : {"apiPath" : {"const" : "login"}}},
            "then" : {"required" : ["email", "pswd"]} 
        },
        {
          "if": {"properties" : {"apiPath" : {"const" : "register"}}},
          "then" : { "required" : ["fn", "ln", "email", "pswd", "cnfm_pswd", "cntry", "yob", "gndr", "prvcyPlcy"]}
        }
    ],

    "additionalProperties": false,
}