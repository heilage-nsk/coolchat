var _ = require('lodash');
var versions = require('../../common/version-config');
var EventBus = require('../../common/eventBus');
/**
 * Routes
 * Authorization routes of 2 types:
 * - Initial routes for passport.js entry points
 * - Final callback entry points to be called from remote auth provider
 */
module.exports = function(app, passport) {
    // Initial
    app.get('/auth/vkontakte', passport.authenticate('vkontakte', { failureRedirect: '/failedToEnter/' }));
    app.get('/auth/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'}));

    // Callbacks

    app.get('/auth/vkontakte/callback',
        passport.authenticate('vkontakte', { failureRedirect: '/failedToEnter/' }),
        function(req, res) {
            EventBus.requestReaction('auth:saveUser', {
                id: req.user.id,
                name: req.user.name,
                displayName: req.user.displayName,
                profileUrl: req.user.profileUrl,
                gender: req.user.gender,
                avatar: req.user._json.photo
            }, function(reply) {
                res.redirect('/?' + versions.authCookieName + '=' + reply);
            });
        }
    );

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/failedToEnter/' }),
        function(req, res) {
            EventBus.requestReaction('auth:saveUser', {
                id: req.user.id,
                name: req.user.name,
                displayName: req.user.displayName,
                profileUrl: req.user._json.link,
                gender: req.user._json.gender,
                avatar: req.user._json.picture
            }, function(reply) {
                res.redirect('/?' + versions.authCookieName + '=' + reply);
            });
        });
};
