const Countries = require('../models/countries.model')
const countriesjson = require('../json/countries.json')
const mongoose = require('mongoose');
const config = require('../config/config');
const MaxBatchSize = 100;

mongoose.connect(config.DB.URL,{ useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("connected to mongoose")
    runAddCountries();
}).catch((error)=>{
    console.log('MongoDB connection error:', error);
})

const promises = [];

function runAddCountries() {
    let remainingBatch = countriesjson.reduce((batch, country) => {  
        batch.push({code: country.code.toLowerCase(), name: country.name.toLowerCase()})
        if(batch.length == MaxBatchSize) {
            promises.push(insert(batch));
            batch = [];
        }
        return batch
    }, [])


    if(remainingBatch.length > 0)
        promises.push(insert(remainingBatch));

    remainingBatch = [];

    Promise.allSettled(promises)
    .then((result) => {
        console.log(result);
        if(result.some((value) => value.status == 'rejected')) {
            console.log("========================= ended with error ============")
        } else {
            console.log("===================== Done ======="); 
        }
        // process.exit()
    })
}



function insert(batch) {
    new Promise((res, rej)=>{
        console.log("================ inserting batch with " + batch.length + " documents ====================");
        Countries.insertMany(batch, {}, (err, result) => {
            if(err) {
                console.log(err.message)
                return rej(err);
            }
            console.log(result);
            res(result);
        })
    })
}