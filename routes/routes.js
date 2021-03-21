const Router = require('koa-router')
const router = new Router()

ensureAuthenticated = async function(ctx, next) {
  if (ctx.isAuthenticated()) {
    return next()
  }

  ctx.session.returnTo = ctx.request.url
  ctx.body = ctx.render('login')
}

//router.get('/', require('./page-about'))
router.get('/', require('./page-events'))
router.get('/login', require('./login').get)
router.post('/login', require('./login').post)
//router.get('/index', ensureAuthenticated, require('./page-index'))
router.get('/index', require('./page-index'))
router.get('/about', require('./page-about'))
router.get('/person', require('./page-person'))
router.get('/churches', require('./page-churches'))
router.get('/video', require('./page-video'))
router.get('/events', require('./page-events'))
router.get('/logout', require('./logout').get)

module.exports = router.routes()
