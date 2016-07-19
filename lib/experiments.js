const debug = require('debug')('telegraf:experiments')
const seedrandom = require('seedrandom')

const defaultSeed = (ctx) => (ctx.from && ctx.from.id)

class TelegrafExperiments {

  constructor (profile, options) {
    debug('init')
    this.profile = {}
    for (let test in profile) {
      this.profile[test] = this.normalizeTest(profile[test])
    }
    this.options = options
  }

  register (id, test) {
    this.profile[id] = this.normalizeTest(test)
  }

  normalizeTest (test) {
    if (Array.isArray(test)) {
      test = {groups: test}
    }
    test.groups = test.groups.map((group) => {
      return (typeof group !== 'object') ? {id: group} : Object.assign({}, group)
    })
    const predefinedAudience = test.groups.filter((group) => group.audience)
    const undefinedAudience = test.groups.filter((group) => !group.audience)
    const audience = predefinedAudience.reduce((acc, group) => acc + group.audience, 0)
    if (undefinedAudience.length > 0) {
      const defaultAudience = (1 - audience) / undefinedAudience.length
      undefinedAudience.forEach((group) => {
        group.audience = defaultAudience
      })
    }
    var treshold = 0
    test.groups.forEach((group) => {
      group.min = treshold
      group.max = group.audience + treshold
      treshold += group.audience
    })
    return Object.assign({
      seed: defaultSeed
    }, test)
  }

  middleware () {
    return (ctx, next) => {
      ctx.experiments = (id) => {
        const profile = this.profile[id]
        if (!profile) {
          return
        }
        const seed = profile.seed(ctx)
        const magicNumber = seedrandom(seed)()
        return profile.groups.filter((group) => (magicNumber >= group.min && magicNumber < group.max))[0] || profile.groups[0]
      }
      return next()
    }
  }
}

module.exports = TelegrafExperiments
