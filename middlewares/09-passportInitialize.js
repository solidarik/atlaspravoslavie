import passport from '../libs/passport'
export function init(app) { return app.use(passport.initialize()) }
