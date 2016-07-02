const Telegraf = require('telegraf')
const TelegrafExperiments = require('../lib/experiments')

const experimentProfile = {
  feature1: ['A', 'B'],
  feature2: [
    {id: 'A', attachment: 'Hey A'},
    {id: 'B', attachment: 'Hey B'},
    {id: 'C', attachment: 'Hey C'}
  ]
}

const telegraf = new Telegraf(process.env.BOT_TOKEN)
const experiments = new TelegrafExperiments(experimentProfile)

experiments.register('feature3', {
  seed: (ctx) => ctx.from.id + 'salt',
  variants: [
    {id: 'A', attachment: () => 'Hey A'},
    {id: 'B', attachment: () => 'Hey B', audience: 0.2},
    {id: 'C', attachment: () => 'Hey C', audience: 0.1},
    {id: 'X', attachment: () => 'Lucky bastard!', audience: 0.01}
  ]
})

telegraf.use(experiments.middleware())

telegraf.command('/feature1', (ctx) => {
  const message = ctx.experiment.variant('feature1') === 'A' ? 'A group' : 'B group'
  return ctx.reply(message)
})

telegraf.command('/feature2', (ctx) => {
  const message = ctx.experiment.attachment('feature2')
  return ctx.reply(message)
})

telegraf.command('/feature3', (ctx) => {
  const messageFn = ctx.experiment.attachment('feature3')
  const message = messageFn()
  return ctx.reply(message)
})

telegraf.startPolling()
