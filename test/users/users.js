let UsersDB = require('../../models/user.model');
let TokenDB = require('../../models/token.model');
let TransactionsDB = require('../../models/transactions.model')
let constants = require('../../config/constant');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
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
        let gRes //globalResponse
        it('add a new user to db and return x-access-token with user auth data', async() => {
            const res = await chai.request(server).post('/users/register').send(registerData)
            expect(res.status).to.be.eq(202, 'status not 202');
            checkAuthData(res);
            gRes = res;
        });

        it("should have a new sign up transaction in db", async() => {
            const transaction = await TransactionsDB.findOne({pid : gRes.body.data.auth._id, txn_type: constants.TRANS_TYPES['signed_up']})
            expect(transaction).to.be.an('object', 'sign up transaction not added');
            expect(transaction.reward).to.be.eq(constants.REWARD_TYPES['signed_up']);
        })

        it("should have a new registration token in Token db", async() => {
            const token = await TokenDB.findOne({email: gRes.body.data.auth.email, type:  constants.TOKEN_TYPES['EMV']})
            expect(token).to.be.an('object', 'token not created');
        })


        it("should give user already exists error", (done) => {
            chai.request(server)
            .post('/users/register')
            .send(registerData)
            .end((err, res) => {
                expect(res.body.code).to.be.a('string').eq(constants.ERR_C['userAlExists']);
                done()
            })
        })

        
        
        it("should give validation error", async() => {
            const data = {...registerData, fn: undefined, prvcyPlcy: false}
            const res = await chai.request(server).post('/users/register').send(data)
            expect(res.status).to.be.eq(400);
            expect(res.body).to.have.property('code', constants.ERR_C['validationErr']);
            expect(res.body.data).to.be.an('object').to.have.property('validationErrors').an('array').length(1)
        })
    });


    describe('PUT /users/verify-email', () => {
        let gRes;
        let gToken;
        it('verifies user email, logs user in and removes email Token from token db', async() => {
            const doc = await TokenDB.findOne({email: registerData.email.toLowerCase()}); 
            expect(doc).to.be.an('object');
            gToken  = doc.tkn;
                
            const res = await chai.request(server).put("/users/verify-email").send({token : gToken})
            checkAuthData(res);
            expect(res.body.data.auth.ttl_reward).eq(constants.REWARD_TYPES.signed_up + constants.REWARD_TYPES.email_verified);
            gRes = res;
        });

        if('should have email verified transaction in transactions', async() => {
            const transaction = await TransactionsDB.findOne({pid : gRes.body.data.auth._id, type: constants.REWARD_TYPES['email_verified']})
            expect(transaction).to.be.an("object")
            expect(transaction).to.have.property('reward').eq(constants.REWARD_TYPES['email_verified']);
        })

        it("should not have sign up token in tokenDB", async() => {
            const token = await TokenDB.findOne({tkn : gToken}, {}, {})
            expect(token).to.be.null
        })

        it('should return emAlVerified code', async() => {
            const res = await chai.request(server).put('/users/verify-email').send({token: gToken})
            expect(res.status).to.be.eq(422)
            expect(res.body).to.have.property('code').eq(constants.ERR_C.tokenExpired)
        })
    })


    describe('POST /users/login', () => {
        it('logs in successfully and responds with x-access-token and user data', async() => {
            const res = await chai.request(server).post('/users/login').send({email: registerData.email, pswd: registerData.pswd})
            expect(res.status).to.be.eq(200);
            checkAuthData(res);
        })

        it('login should return 400', async() => {
            const res = await chai.request(server).post('/users/login').send({email : "unregistered@email.com", pswd : "somepassword"})
            expect(res.status).to.be.eq(400)
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
