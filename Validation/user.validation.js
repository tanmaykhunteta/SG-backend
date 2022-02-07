const Joi = require('joi');

exports.schemas = { 
  fn: Joi.string().trim() 
}; 


// const Joi = require('joi'); 
 exports.registration = (req, res, next) => { 

    registrationSchema = Joi.object({ 
       fn: exports.schemas.fn,

      }) 
      
    //   registrationSchema.validate
    registrationSchema.validateAsync(req.body,(error) => {
        console.log(error);
    }); 
    const valid = error == null; 
    
    if (valid) { 
      next(); 
    } else { 
      const { details } = error; 
      const message = details.map(i => i.message).join(',');
   
      console.log("error", message); 
     res.status(422).json({ error: message }) } 
    } ;
