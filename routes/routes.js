const Router = require('koa-router')
const router = new Router()
const PersonsModel = require('../models/personsModel')
const TemplesModel = require('../models/templesModel')
const redis = require('redis')
const config = require('config')
const redisClient = redis.createClient(config.redis_uri);
const util = require('util')

ensureAuthenticated = async function(ctx, next) {
  if (ctx.isAuthenticated()) {
    return next()
  }

  ctx.session.returnTo = ctx.request.url
  ctx.body = ctx.render('login')
}

redisClient.get = util.promisify(redisClient.get);
redisClient.on('error', (err) => {
  console.log(`Error in connection to Redis: ${err}`)
})

PersonsModel.find({}).then((persons) => {
  redisClient.set('persons', JSON.stringify(persons))
})

TemplesModel.find({}).then((churches) => {
  redisClient.set('churches', JSON.stringify(churches))
})

router.get('/', require('./page-events'))
router.get('/login', require('./login').get)
router.post('/login', require('./login').post)
//router.get('/index', ensureAuthenticated, require('./page-index'))
router.get('/about', require('./page-about'))

router.get('/video', require('./page-video'))
router.get('/events', require('./page-events'))
router.get('/logout', require('./logout').get)

getUsers = async function(ctx, next) {
  persons = await redisClient.get('persons')
  if (!persons) return

  ctx.state = {'persons': JSON.parse(persons)}
  next()
}

getChurches = async function(ctx, next) {

  churches = await redisClient.get('churches')
  if (!churches) return

  ctx.state = {'churches': JSON.parse(churches)}
  next()
}

getUser = async function(ctx, next) {
  person = await PersonsModel.find({'pageUrl': ctx.params.name})
  if (!person) return

  persons = await redisClient.get('persons')
  if (!persons) return

  ctx.state = {'person': person[0], 'persons': JSON.parse(persons)}
  next()
}

getChurch = async function(ctx, next) {
  church = await TemplesModel.find({'pageUrl': ctx.params.name})
  if (!church) return

  churches = await redisClient.get('churches')
  if (!churches) return

  ctx.state = {'church': church[0], 'churches': JSON.parse(churches)}
  next()
}

router.get('/map/person/:name', getUser, require('./page-events'))

router.get('/person', getUsers, require('./page-person'))
router.get('/person/:name', getUser, require('./page-person'))

router.get('/church', getChurches, require('./page-church'))
router.get('/church/:name', getChurch, require('./page-church'))



module.exports = router.routes()
