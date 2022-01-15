import Router from 'koa-router'
const router = new Router()
import personsModel from '../models/personsModel'
import templesModel from '../models/templesModel'
// import redis from 'redis'
import config from 'config'
// const redisClient = redis.createClient(config.redis_uri);
import util from 'util'

import pageEvents from './page-events'

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

// templesModel.find({}).then((churches) => {
//   redisClient.set('churches', JSON.stringify(churches))
// })

router.get('/', pageEvents)
router.get('/login', (await import('./login')).get)
router.post('/login', (await import('./login')).post)
//router.get('/index', ensureAuthenticated, await import('./page-index'))
router.get('/about', (await import('./page-about')).default)

router.get('/video', (await import('./page-video')).default)
router.get('/events', (await import('./page-events')).default)
router.get('/logout', (await import('./logout')).get)

const churchesSelectParam = { 'name': 1, 'start': 1, 'place': 1, 'city': 1, 'dedicated': 1, 'pageUrl': 1, }
const personsSelectParam = { 'name': 1, 'birth': 1, 'surname': 1, 'monkname': 1, 'pageUrl': 1, }

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

const getChurches = async function (ctx, next) {

  // churches = await redisClient.get('churches')
  // if (!churches) return

  //! churches только с набором необходимых полей
  const churches = await templesModel.find({}).select(churchesSelectParam)

  // получение полного набора полей (долго по времени)
  // const churches = await templesModel.find({})

  // ctx.state = {'churches': JSON.parse(churches)}
  ctx.state = { 'churches': churches }
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

const getChurch = async function (ctx, next) {
  const church = await templesModel.find({ 'pageUrl': ctx.params.name })
  if (!church) return

  // churches = await redisClient.get('churches')
  // if (!churches) return

  // const churches = await templesModel.find({})

  ctx.state = { 'church': church[0], 'churches': [] }
  next()
}

router.get('/map/person/:name', getPerson, (await import('./page-events')).default)

router.get('/person', getPersons, (await import('./page-person')).default)
router.get('/person/:name', getPerson, (await import('./page-person')).default)

router.get('/church', getChurches, (await import('./page-church')).default)
router.get('/church/:name', getChurch, (await import('./page-church')).default)


export default router.routes()
