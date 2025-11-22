const WebSocket = require('ws');
const request = require('supertest');
const chai = require('chai');
const { app, server } = require('../server');
const expect = chai.expect;

const TEST_PORT = 3001;
const wsURL = `ws://localhost:${TEST_PORT}`;

describe('Test Auth and Chat Routes...', () => {
    let messageId;
    let token;
    let ws;
    let serverInstance;

    before(async () => {
        // Start the server on test port
        await new Promise((resolve) => {
            serverInstance = server.listen(TEST_PORT, resolve);
        });

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testUser',
                password: 'testPassword'
            });

        if (registerRes.statusCode !== 201 && registerRes.statusCode !== 400) {
            throw new Error(`Registration failed with status ${registerRes.statusCode}: ${JSON.stringify(registerRes.body)}`);
        }

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testUser',
                password: 'testPassword'
            });

        if (res.statusCode !== 200) {
            throw new Error(`Login failed with status ${res.statusCode}: ${JSON.stringify(res.body)}`);
        }

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

    after((done) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
        if (serverInstance) {
            serverInstance.close(done);
        } else {
            done();
        }
    });
});