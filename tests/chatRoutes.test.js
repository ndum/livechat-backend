const WebSocket = require('ws');
const request = require('supertest');
const chai = require('chai');
const app = require('../server');
const expect = chai.expect;

const wsURL = "ws://localhost:3000";

describe('Test Auth and Chat Routes...', () => {
    let messageId;
    let token;
    let ws;

    before(async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testUser',
                password: 'testPassword'
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testUser',
                password: 'testPassword'
            });

        token = res.body.token;

        await new Promise((resolve, reject) => {
            ws = new WebSocket(wsURL);
            ws.on('open', resolve);
            ws.on('error', reject);
        });
    });

    it('should post a new message and receive a WebSocket notification', (done) => {
        const timeout = setTimeout(() => {
            done(new Error('WebSocket message not received within the expected time frame.'));
        }, 5000);
    
        ws.on('message', (data) => {
            clearTimeout(timeout);
            const message = JSON.parse(data);
            expect(message.type).to.equal('new_message');
            done();
        });
    
        request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${token}`)
            .send({
                message: 'Hello, this is a test message!'
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.have.property('_id');
                expect(res.body.username).to.equal('testUser');
                expect(res.body.message).to.equal('Hello, this is a test message!');
                messageId = res.body._id;
            });
    });

    it('should update a message and receive a WebSocket notification for the change', (done) => {
        const timeout = setTimeout(() => {
            done(new Error('WebSocket message not received within the expected time frame.'));
        }, 5000);
    
        ws.on('message', (data) => {
            clearTimeout(timeout);
            const message = JSON.parse(data);
            expect(message.type).to.equal('changed_message');
            done();
        });
    
        request(app)
            .put(`/api/messages/${messageId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                message: 'Updated test message'
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body.username).to.equal('testUser');
                expect(res.body.message).to.equal('Updated test message');
            });
    });

    it('should retrieve all messages', (done) => {
        request(app)
            .get('/api/messages')
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should retrieve a single message', (done) => {
        request(app)
            .get(`/api/messages/${messageId}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('_id', messageId);
                done();
            });
    });

    it('should delete a message and receive a WebSocket notification for the deletion', (done) => {
        const timeout = setTimeout(() => {
            done(new Error('WebSocket message not received within the expected time frame.'));
        }, 5000);
    
        ws.on('message', (data) => {
            clearTimeout(timeout);
            const message = JSON.parse(data);
            expect(message.type).to.equal('deleted_message');
            done();
        });
    
        request(app)
            .delete(`/api/messages/${messageId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('success', true);
            });
    });

    afterEach(() => {
        ws.removeAllListeners('message');
    });

    after(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    });
});