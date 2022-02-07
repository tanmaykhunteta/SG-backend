let mongoose = require("mongoose");
let UsersDB = require('../../models/user.model');
let TokenDB = require('../../models/token.model');
let TransactionsDB = require('../../models/transactions.model')
let constants = require('../../config/constant');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
const { object } = require("joi");
let expect = chai.expect;


chai.use(chaiHttp);

describe('Users', () => {
    const registerData = {
        "fn" : "  deEEpak",
        "ln" : "   sharmma",
        "email" : "tesEEnEEeIS33311T5@gmail.com",
        "gndr" : "female",
        "cntry" : "iNdai",
        "yob" : 1920,
        "prvcyPlcy" : true,
        "pswd" : "Deepak123@",
        "cnfm_pswd" : "Deepak123@",
        "reCaptcha" : "xya"
    }

    before(() => {
        const promise = [
            UsersDB.deleteMany({}),
        
            TransactionsDB.deleteMany({}),

            TokenDB.deleteMany({})
        ]

        return Promise.allSettled(promise)
    });


    describe('/POST register user', () => {
        it('add a new user to db, add a signup reward transaction, new token for email verification and return auth token and auth details', (done) => {
            chai.request(server)
            .post('/users/register')
            .set('Content-Type', 'application/json')
            .send(registerData)
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.be.eq(202, 'status not 202');
                checkAuthData(res);
                TransactionsDB.findOne({pid : res.body.data.auth._id, txn_type: constants.TRANS_TYPES['signed_up']}, {}, {}, (err, transaction) => {
                    expect(err).to.be.null
                    expect(transaction).to.be.an('object', 'sign up transaction not added');
                    expect(transaction.reward).to.be.eq(constants.REWARD_TYPES['signed_up']);
                    TokenDB.findOne({email: res.body.data.auth.email, type:  constants.TOKEN_TYPES['EMV']}, (err, token) => {
                        expect(err).to.be.null
                        expect(token).to.be.an('object', 'token not created');
                        done()
                    })
                });
            })
        });


        it("should give user already exists error", (done) => {
            chai.request(server)
            .post('/users/register')
            .set("content-type", "application/json")
            .send(registerData)
            .end((err, res) => {
                expect(res.body.code).to.be.a('string').eq(constants.ERR_C['userAlExists']);
                done()
            })
        })

        
        
        it("should give validation error", (done) => {
            const data = {...registerData, fn: undefined, prvcyPlcy: false}
            chai.request(server)
            .post('/users/register')
            .set("content-type", 'application/json')
            .send(data)
            .end((err, res) => {
                expect(res.status).to.be.eq(400);
                expect(res.body).to.have.property('code', constants.ERR_C['validationErr']);
                expect(res.body.data).to.be.an('object').to.have.property('validationErrors').an('array').length(1)
                console.log(res.body);
                done()
            })
        })
    });


    describe('PUT /users/verify-email', () => {
        it('verifies user email, logs user in and removes email Token from token db', (done) => {
            TokenDB.findOne({email: registerData.email.toLowerCase()}, (err, doc) => {
                expect(doc).to.be.an('object');
                const token  = doc.tkn;
                
                chai.request(server)
                .put("/users/verify-email")
                .set("content-type", "application/json")
                .send({token})
                .end((err, res) => {
                    console.log(res.body);
                    expect(err).to.be.null;
                    checkAuthData(res);
                    
                    TokenDB.findOne({tkn : token}, {}, {}, (err, doc)=> {
                        expect(doc).to.be.null
                        done()
                    })
                })
            })
        })
    })

    describe('POST /users/login', () => {
        it('logs in successfully and responds with x-access-token and user data', (done) => {
            chai.request(server)
            .post('/users/login')
            .set("content-type", "application/json")
            .send({email: registerData.email, pswd: registerData.pswd})
            .end((err, res) => {
                expect(res.status).to.be.eq(200);
                checkAuthData(res);
                console.log(res.body);
                done()
            })
        })
    })
});



function checkAuthData(res) {
    expect(res.header).to.have.property('x-access-token').to.be.an('string')
    expect(res.body).to.have.property('data').to.be.an('object', 'data invalid');
    expect(res.body.data).to.have.property('auth').to.be.an('object')
    expect(res.body.data.auth).to.have.property('ttl_reward').to.be.a('number').greaterThan(0);
    expect(res.body.data.auth.email).to.be.eq(res.body.data.auth.email.toLowerCase())
    expect(res.body.data.auth).to.not.have.property('pswd');
    expect(res.body.data.auth).to.have.property('type').eq('user');
}
