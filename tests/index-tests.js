var lib = require('../lib');

var jwt = require('jsonwebtoken');
var uuid = require('uuid');
var SECRET = new Buffer('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64');

var should = require('chai').should();

describe('express-jwt-fhir', function() {
    describe('with fixed fhir base url', function () {
        var auth = lib({
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

        var options = {
            expiresIn: 3600,
            notBefore: 0,
            issuer: 'https://auth.example.net'
        };

        var res;
        var req;
        var payload;

        beforeEach(function () {
            payload = {
                sub: 'user@example.net',
                aud: [
                    'https://fhir.example.net',
                    'https://fhir.example2.net'
                ],
                fhir_scp: ['*'],
                fhir_act: ['read:Foo'],
                jti: uuid.v4()
            };

            req = {
                headers: {
                    'authorization': 'Bearer ' + jwt.sign(payload, SECRET, options),
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

        it('should be implemented as a function', function () {
            should.exist(auth);
            auth.should.be.a('function');
        });

        it('should call next()', function (done) {
            auth(req, res, function (err) {
                should.not.exist(err);

                done();
            });
        });

        it('should populate req.user', function (done) {
            auth(req, res, function (err) {
                should.not.exist(err);

                req.user.should.equal(payload.sub);

                done();
            });
        });

        it('should return 403 when action not authorised', function (done) {
            req.originalUrl = '/svc/fhir/Bar/123';
            auth(req, res, function (err) {
                err.status.should.equal(403);
                done();
            });
        });
    });

    describe('with regex fhir base url', function () {
        var auth = lib({
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

        var options = {
            expiresIn: 3600,
            notBefore: 0,
            issuer: 'https://auth.example.net'
        };

        var res;
        var req;
        var payload;

        beforeEach(function () {
            payload = {
                sub: 'user@example.net',
                aud: [
                    'https://fhir.example.net/svc/Z99999'
                ],
                fhir_scp: ['*'],
                fhir_act: ['read:Foo'],
                jti: uuid.v4()
            };

            req = {
                headers: {
                    'authorization': 'Bearer ' + jwt.sign(payload, SECRET, options),
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

        it('should be implemented as a function', function () {
            should.exist(auth);
            auth.should.be.a('function');
        });

        it('should call next()', function (done) {
            auth(req, res, function (err) {
                should.not.exist(err);

                done();
            });
        });

        it('should populate req.user', function (done) {
            auth(req, res, function (err) {
                should.not.exist(err);

                req.user.should.equal(payload.sub);

                done();
            });
        });

        it('should return 403 when action not authorised', function (done) {
            req.originalUrl = '/svc/Z99999/fhir/Bar/123';
            auth(req, res, function (err) {
                err.status.should.equal(403);
                done();
            });
        });
    });

});

