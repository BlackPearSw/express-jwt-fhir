/*
  Not clear what role this serves!
 */

const basicAuth = require('basic-auth');
const request = require('superagent-bluebird-promise');
const Promise = require('bluebird');

const DEFAULT_URL = 'https://licensing.blackpear.com/mdmconfig/api';
const LOGINROUTE = '/users/?login=';
let AUTHORISATIONROUTE = '/serviceroledefinitions?servicetype={{service_pyrusapps}}&usersid=';
const ORGANISATIONROUTE = '/clients/';
const PYRUSAPPS = 'ccca0960-bd91-4702-c19d-1dd8f939750c';

module.exports = function (options) {
    options = options || {};
    options.url = options.url || DEFAULT_URL;
    options.service = options.service || PYRUSAPPS;

    AUTHORISATIONROUTE = '/serviceroledefinitions?servicetype=' + options.service + '&usersid=';

    return function (req, res, next) {
        function sendAuthRequired() {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            res.sendStatus(401);
        }

        function checkCredentials() {
            return Promise.try(function () {
                const credentials = basicAuth(req);
                if (!credentials) throw new Error();
                return credentials;
            });
        }

        function authenticate(credentials) {
            const loginurl = options.url + LOGINROUTE + credentials.name;
            return request
                .get(loginurl)
                .set('Authorization', req.headers.authorization)
                .promise();
        }

        function checkAuthenticated(res) {
            if (res.status !== 200) throw new Error();

            req.user = res.body.Login;
            req.authorisation = {
                clientId: res.body.ClientID,
                organisation: undefined,
                role: []
            };
            return res.body;
        }

        function authorise(user) {
            const authorisationurl = options.url + AUTHORISATIONROUTE + user.id;
            return request
                .get(authorisationurl)
                .set('Authorization', req.headers.authorization)
                .promise();
        }

        function checkAuthorised(res) {
            if (res.status !== 200) throw new Error();

            if (res.body.CanCreate) {
                req.authorisation.role.push('create');
            }

            if (res.body.CanRead) {
                req.authorisation.role.push('read');
            }

            if (res.body.CanWrite) {
                req.authorisation.role.push('write');
            }
        }

        function organise() {
            const organisationurl = options.url + ORGANISATIONROUTE + req.authorisation.clientId;
            return request
                .get(organisationurl)
                .set('Authorization', req.headers.authorization)
                .promise();
        }

        function checkOrganisation(res) {
            if (res.status !== 200) throw new Error();

            req.authorisation.organisation = {
                system: 'http://www.datadictionary.nhs.uk/data_dictionary/attributes/o/org/organisation_code_de.asp',
                value: res.body.ClientCode
            };
        }

        checkCredentials()
            .then(authenticate)
            .then(checkAuthenticated)
            .then(authorise)
            .then(checkAuthorised)
            .then(organise)
            .then(checkOrganisation)
            .then(next)
            .catch(function () {
                sendAuthRequired();
            })
    };
};

