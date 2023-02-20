var { expressjwt: jwt } = require('express-jwt');
var lib = require('@blackpear/jwt-claims-fhir');

module.exports = function (options) {
    options.jwt.requestProperty = 'auth';
    options.jwt.algorithms = ["RS256"];

    var verifyToken = jwt(options.jwt);

    return function (req, res, next) {
        try {
            verifyToken(req, res, function(err){
                if (err) {
                    return next(err);
                }

                try {
                    req.user = req[options.jwt.requestProperty].sub;

                    var params = lib.parser.parse(req, options.fhir);
                    if (lib.claims
                        .authorise()
                        .access(params.scope, req[options.jwt.requestProperty].fhir_scp)
                        .action(params.action, req[options.jwt.requestProperty].fhir_act)
                        .isAuthorised)
                    {
                        next();
                    }
                    else {
                        var err = new Error('Unauthorized');
                        err.status = 403;
                        next(err)
                    }
                }
                catch(err) {
                    next(err);
                }
            });
        }
        catch (err){
            next(err);
        }
    };
};

