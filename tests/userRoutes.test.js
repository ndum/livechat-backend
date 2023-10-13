const WebSocket = require('ws');
const request = require('supertest');
const chai = require('chai');
const app = require('../server');
const expect = chai.expect;

const wsURL = "ws://localhost:3000";

describe('Test User API Routes with WebSocket...', () => {
    let userId;
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
        userId = res.body.userId;

        await new Promise((resolve, reject) => {
            ws = new WebSocket(wsURL);
            ws.on('open', resolve);
            ws.on('error', reject);
        });
    });

    it('should retrieve all users', (done) => {
        request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should retrieve a single user', (done) => {
        request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('_id', userId);
                done();
            });
    });

    it('should update a user and receive a WebSocket notification for the update', (done) => {
        const timeout = setTimeout(() => {
            done(new Error('WebSocket message not received within the expected time frame.'));
        }, 5000);

        ws.on('message', (data) => {
            clearTimeout(timeout);
            const message = JSON.parse(data);
            expect(message.type).to.equal('changed_user');
            done();
        });

        const updatedUsername = 'updatedUsername';
        request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                username: updatedUsername
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body.username).to.equal(updatedUsername);
            });
    });

    it('should delete a user and receive a WebSocket notification for the deletion', (done) => {
        const timeout = setTimeout(() => {
            done(new Error('WebSocket message not received within the expected time frame.'));
        }, 5000);

        ws.on('message', (data) => {
            clearTimeout(timeout);
            const message = JSON.parse(data);
            expect(message.type).to.equal('deleted_user');
            done();
        });

        request(app)
            .delete(`/api/users/${userId}`)
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
})