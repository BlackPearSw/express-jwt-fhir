const lib = require('../lib');

const jose = require('jose');
const uuid = require('uuid');
const crypto = require('crypto');
const should = require('chai').should();

const PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\n" +
    "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\n" +
    "-----END RSA PRIVATE KEY-----"

const PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\n" +
    "MIICITANBgkqhkiG9w0BAQEFAAOCAg4AMIICCQKCAgBgp1IN3Hmz1YlbQGOKAUrr\n" +
    "bW5IrgtvFLzumOKuz6WOptogYY8nuRZYZZBOP+LNGWsHOA8wsv+rjs9EC8MUi4Ef\n" +
    "kb8sPnecXRJwXstaS23odPjuEhWfSskCOVdX1jStljIM3mjLezCm7y1xSGhHCnoO\n" +
    "ePtkzcHX0GhHGg5lJ7mahWy+yp8SxFKxpzFfYHbzQuvjtPyHv+Zf6IH1y8G7o9WQ\n" +
    "mnKl35g4TZkEjbbjEcxQmu04qh1ND1tZZmvJpVEzM5ZazjIGRliQ1cQiz1DH41Pi\n" +
    "rizcbai5scMLujyLo3jAakay/6LSNbYSfriiyw1wVTXRv2jXmqZ5bWf368v7hrC5\n" +
    "LsS+UlwoxUPWo2KYHRkazPdnmQs+tec5jgmmBe/B/g/d7LU7tagKgsQAZJQLCnYM\n" +
    "+URSn8wPU6sXUXeGT8U//U5BjwzZJXJaptpm8eaouLX2P+ibPZoQkRGzRaMEeo1F\n" +
    "Lm5DP9e0EdvQdqMWPcf7CDR9NTOoyFVjihspRJXGnUsx9ObaHJ546mA4WvH4wDMa\n" +
    "sHPow2YqD3Qz3f+L0p2Ps0wNaml1Dsb3jC9HGYZI1HgxBr4FwSmtqyTTPqTXOeah\n" +
    "vZ2A7qOYtKIQMIlSRt2kQPkLFhOkjER1+KntFsTIaKgmIecH4+TagJ37YClFcqj0\n" +
    "j04ldDECkUjmUfmriOVTMwIDAQAB\n" +
    "-----END PUBLIC KEY-----";

const SECRET = Buffer.from(PUBLIC_KEY);

describe('express-jwt-fhir', () => {
    describe('with fixed fhir base url', () => {
        const auth = lib({
            jwt: {
                requireCredentials: true,
                secret: SECRET,
                audience: 'https://fhir.example.net',
                issuer: 'https://auth.example.net'
            },
            fhir: {
                base: 'https://fhir.example.net/svc/fhir'
            }
        });

        let res;
        let req;
        const expected = {
            sub: 'user@example.net',
            aud: [
                'https://fhir.example.net',
                'https://fhir.example2.net'
            ],
            fhir_scp: ['*'],
            fhir_act: ['read:Foo']
        };

        beforeEach(async  () => {
            const jwk = crypto.createPrivateKey(PRIVATE_KEY);
            const claims = {
                fhir_scp: expected.fhir_scp,
                fhir_act: expected.fhir_act
            }
            const jwt = await new jose.SignJWT(claims)
                .setProtectedHeader({alg: 'RS256'})
                .setIssuer('https://auth.example.net')
                .setAudience(expected.aud)
                .setSubject(expected.sub)
                .setJti(uuid.v4())
                .setExpirationTime('1h')
                .sign(jwk);


            req = {
                headers: {
                    'authorization': 'Bearer ' + jwt,
                    'host': 'fhir.example.net'
                },
                originalUrl: '/svc/fhir/Foo/123',
                protocol: 'https',
                method: 'GET'
            };

            res = {
                status: 0,
                headers: {},
                set: function (key, value) {
                    this.headers[key] = value;
                },
                sendStatus: function (status) {
                    this.status = status;
                }
            };
        });

        it('should be implemented as a function', () =>  {
            should.exist(auth);
            auth.should.be.a('function');
        });

        it('should call next()', (done) =>  {
            auth(req, res, function (err) {
                should.not.exist(err);

                done();
            });
        });

        it('should populate req.user', (done) =>  {
            auth(req, res, function (err) {
                should.not.exist(err);

                req.user.should.equal(expected.sub);

                done();
            });
        });

        it('should return 403 when action not authorised',  (done) => {
            req.originalUrl = '/svc/fhir/Bar/123';
            auth(req, res, function (err) {
                err.status.should.equal(403);
                done();
            });
        });
    });

    describe('with regex fhir base url', () => {
        const auth = lib({
            jwt: {
                requireCredentials: true,
                secret: SECRET,
                audience: 'https://fhir.example.net/svc/Z99999',
                issuer: 'https://auth.example.net'
            },
            fhir: {
                base: {
                    regexString: '^https://fhir.example.net/svc/\\w\\d{5}/fhir'
                }
            }
        });

        let res;
        let req;
        const expected = {
            sub: 'user@example.net',
            aud: [
                'https://fhir.example.net/svc/Z99999'
            ],
            fhir_scp: ['*'],
            fhir_act: ['read:Foo']
        }

        beforeEach(async () => {

            const jwk = crypto.createPrivateKey(PRIVATE_KEY);
            const claims = {
                fhir_scp: expected.fhir_scp,
                fhir_act: expected.fhir_act
            }
            const jwt = await new jose.SignJWT(claims)
                .setProtectedHeader({alg: 'RS256'})
                .setIssuer('https://auth.example.net')
                .setAudience(expected.aud)
                .setSubject(expected.sub)
                .setJti(uuid.v4())
                .setExpirationTime('1h')
                .sign(jwk);


            req = {
                headers: {
                    'authorization': 'Bearer ' + jwt,
                    'host': 'fhir.example.net'
                },
                originalUrl: '/svc/Z99999/fhir/Foo/123',
                protocol: 'https',
                method: 'GET'
            };

            res = {
                status: 0,
                headers: {},
                set: function (key, value) {
                    this.headers[key] = value;
                },
                sendStatus: function (status) {
                    this.status = status;
                }
            };
        });

        it('should be implemented as a function', () => {
            should.exist(auth);
            auth.should.be.a('function');
        });

        it('should call next()', (done) => {
            auth(req, res, function (err) {
                should.not.exist(err);

                done();
            });
        });

        it('should populate req.user', (done) => {
            auth(req, res, function (err) {
                should.not.exist(err);

                req.user.should.equal(expected.sub);

                done();
            });
        });

        it('should return 403 when action not authorised', (done) => {
            req.originalUrl = '/svc/Z99999/fhir/Bar/123';
            auth(req, res, function (err) {
                err.status.should.equal(403);
                done();
            });
        });
    });

});

