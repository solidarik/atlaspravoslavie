import Router from 'koa-router'
const router = new Router()
import personsModel from '../models/personsModel.js'
import templesModel from '../models/templesModel.js'
// import redis from 'redis'
import config from 'config'
// const redisClient = redis.createClient(config.redis_uri);
import util from 'util'

import pageEvents from './page-events.js'

const ensureAuthenticated = async function (ctx, next) {
  if (ctx.isAuthenticated()) {
    return next()
  }

  ctx.session.returnTo = ctx.request.url
  ctx.body = ctx.render('login')
}

// redisClient.get = util.promisify(redisClient.get);
// redisClient.on('error', (err) => {
//   console.log(`Error in connection to Redis: ${err}`)
// })

// personsModel.find({}).then((persons) => {
//   redisClient.set('persons', JSON.stringify(persons))
// })

// templesModel.find({}).then((temples) => {
//   redisClient.set('temples', JSON.stringify(temples))
// })

router.get('/', pageEvents)
router.get('/login', (await import('./login.js')).get)
router.post('/login', (await import('./login.js')).post)
//router.get('/index', ensureAuthenticated, await import('./page-index'))
router.get('/about', (await import('./page-about.js')).default)

router.get('/video', (await import('./page-video.js')).default)
router.get('/events', (await import('./page-events.js')).default)
router.get('/logout', (await import('./logout.js')).get)

const templesSelectParam = { 'name': 1, 'start': 1, 'place': 1, 'city': 1, 'dedicated': 1, 'pageUrl': 1, }
const personsSelectParam = { 'sitename': 1, 'birth': 1, 'pageUrl': 1, }

const getPersons = async function (ctx, next) {
  // persons = await redisClient.get('persons')
  // if (!persons) return

  //! persons только с набором необходимых полей
  const persons = await personsModel.find({}).select(personsSelectParam)

  // получение полного набора полей (долго по времени)
  //const persons = await personsModel.find({})

  //ctx.state = {'persons': JSON.parse(persons)}
  ctx.state = { 'persons': persons }
  next()
}

const getTemples = async function (ctx, next) {

  // templees = await redisClient.get('templees')
  // if (!templees) return

  //! templees только с набором необходимых полей
  const temples = await templesModel.find({}).select(templesSelectParam)

  // получение полного набора полей (долго по времени)
  // const temples = await templesModel.find({})

  // ctx.state = {'temples': JSON.parse(temples)}
  ctx.state = { 'temples': temples }
  next()
}

const getPerson = async function (ctx, next) {
  const person = await personsModel.find({ 'pageUrl': ctx.params.name })
  if (!person) return

  // persons = await redisClient.get('persons')
  // if (!persons) return

  // const persons = await personsModel.find({})

  ctx.state = { 'person': person[0], 'persons': [] }
  next()
}

const getTemple = async function (ctx, next) {
  const temple = await templesModel.find({ 'pageUrl': ctx.params.name })
  if (!temple) return

  // temples = await redisClient.get('temples')
  // if (!temples) return

  // const temples = await templesModel.find({})

  ctx.state = { 'temple': temple[0], 'temples': [] }
  next()
}

router.get('/map/person/:name', getPerson, (await import('./page-events.js')).default)

router.get('/person', getPersons, (await import('./page-person.js')).default)
router.get('/person/:name', getPerson, (await import('./page-person.js')).default)

router.get('/temple', getTemples, (await import('./page-temple.js')).default)
router.get('/temple/:name', getTemple, (await import('./page-temple.js')).default)


export default router.routes()
