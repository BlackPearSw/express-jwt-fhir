const lib = require('../lib');

const jose = require('jose');
const uuid = require('uuid');
const crypto = require('crypto');
const should = require('chai').should();

const PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\n" +
    "MIIEoQIBAAKCAQB1aecZSlltGWqpo2osMcto1ZPHscQvR+nWxT8geAeaXX6mjD4w\n" +
    "2mtw7FPhY6cwsQNVxq5WeoKnC14ky2p9JvMwsfL0sPigTr8QSKABZI/3dNNvkeDi\n" +
    "s3fbbXgqY25Nwh5XTU99jiyBD7BJhgaUsjzflV5EzKj+7JbjQCvmhAsWI4vpI6GD\n" +
    "u4zDdae1wUdpFihfSO56ADQmhsWgkR60eel/Rd6Xej1GqSDYGk4eMouG/ix2dfVb\n" +
    "c0jB5q+RCLq+w0eNpNp9QYnXfgYLGOOH0k34VXp8uwhO4APlFHrv95KnCYVVB6yz\n" +
    "2ELFD8LmnGVffIZ/vXOjOZdS7JKGd2SN3nmFAgMBAAECggEAXcWvyRYFJ8n10vft\n" +
    "UtCOCPMSbJl/+tbvXhT4XsEeKV3kSbWV8cRvrKdCMq85Fv04kaf1EqITeL/ud2py\n" +
    "aPPTpB9qz5wLZVSe6a1nBNXA2TxXpTKXrdbxsbDTGN+Cd93CB615/+etiYHzJDVD\n" +
    "Sjyzu0l7GW1uxvJDa8mThi4NAKdbY8ZLgKcm4Kdnp9rjvwRcykX30HqqFuWbAXx5\n" +
    "UJLNOmZdH1N3OOew7lLtcel/oNPiuoTHX2U1KSGO61P0u3/tXQFYqo1DR4yoOSNq\n" +
    "xlqyh8rXE6KkJydlani4bwmVxjAk6xwcrznxL2HTBikIH+rBTlCRjF05AvOZYhpZ\n" +
    "gPJg3QKBgQC6uhabCrxyN294wR2kUhDtwf6EhVmkl2QTUngOufhY29s+FlatVB+r\n" +
    "5oyr1Hd9TSSEkcgNFQpzQUjVAzxBLPBYl5nlTWw02k797WkdIj4j5kKctrvYhvD9\n" +
    "OKS7ExqUU7O2VQeUSyDZEAWiLXG0+yiuhl2zqxOaRqsnZIAj19uXZwKBgQCg+Pe7\n" +
    "v4bFy+76nuCwQwi2WUrQhI+oh6OdMe7jZZWTNwTqfz+EPw6evLOnIEFYXzrJ1vom\n" +
    "GLICrc+Ujy75eNZlnf8TAL47jALXtLA18S9sxs8i5om9cew3Qa4PseQMFcSEFBAo\n" +
    "jXbiR1MUfbEfKyH5UNSmgdELaXIbVmEOj+QwMwKBgAFYRcFoGmNYMt1TxrrgPG75\n" +
    "7rNVooek73uUJHk2ras2KiYQUx98c53xUyIJrbKhU5oA0sgFVsXtunCOTWjKwhBh\n" +
    "RyJ3pEfdKqR5iUBEdt4bUm9+gWvVzPaF6enPAWoAEFNH2X4f7GSj0OaSHTeId4qK\n" +
    "PTKGEOYTjDgEaUfYziQRAoGAfu/Va1g9Dv0iFr/yrwwtcp43QPdH0b4kZ3FY0Djr\n" +
    "GovodIKjs8WF4ecsRD5LSUTPNxsvZ5tRxIsLhjri8Bc5+if9XR7Y5FwkYbU6v07R\n" +
    "9xVPglYJiDqt62T/vaCqFF2V+hFYLKJhfU6BVUdIxStePxxelG8KSdV9BdG396PA\n" +
    "bcECgYA1zVJ8hMeDAkicJ0UbrEhN/B791kXvLzJTEUTWcnWDtC1MgMASaP5wwYBf\n" +
    "gcVbmXNrRsZ2gW3Vt0xNmeHg1U9fTMEKVd5x/RTkdPz6lNnx7IS5Op1fkY3O8DcJ\n" +
    "EgchkiuvIqj9oqOBKf3nPHXIbC6K+R3CoSKRUWHqwxbICWeZTA==\n" +
    "-----END RSA PRIVATE KEY-----"

const PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQB1aecZSlltGWqpo2osMcto\n" +
    "1ZPHscQvR+nWxT8geAeaXX6mjD4w2mtw7FPhY6cwsQNVxq5WeoKnC14ky2p9JvMw\n" +
    "sfL0sPigTr8QSKABZI/3dNNvkeDis3fbbXgqY25Nwh5XTU99jiyBD7BJhgaUsjzf\n" +
    "lV5EzKj+7JbjQCvmhAsWI4vpI6GDu4zDdae1wUdpFihfSO56ADQmhsWgkR60eel/\n" +
    "Rd6Xej1GqSDYGk4eMouG/ix2dfVbc0jB5q+RCLq+w0eNpNp9QYnXfgYLGOOH0k34\n" +
    "VXp8uwhO4APlFHrv95KnCYVVB6yz2ELFD8LmnGVffIZ/vXOjOZdS7JKGd2SN3nmF\n" +
    "AgMBAAE=\n" +
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

