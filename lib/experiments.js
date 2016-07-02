const debug = require('debug')('telegraf:experiments')
const seedrandom = require('seedrandom')

const defaultSeed = (ctx) => (ctx.from && ctx.from.id)

class TelegrafExperiments {

  constructor (profile, options) {
    for (let test in profile) {
      profile[test] = this.normalizeTest(profile[test])
    }
    this.profile = profile
    this.options = options
  }

  register (id, test) {
    this.profile[id] = this.normalizeTest(test)
  }

  normalizeTest (test) {
    if (Array.isArray(test)) {
      test = {
        variants: test
      }
    }

    test.variants = test.variants.map((variant) => {
      if (typeof variant !== 'object') {
        return {
          id: variant
        }
      }
      return Object.assign({}, variant)
    })

    const predefinedAudience = test.variants.filter((v) => v.audience)
    const undefinedAudience = test.variants.filter((v) => !v.audience)
    const audience = predefinedAudience.reduce((acc, v) => acc + v.audience, 0)
    if (undefinedAudience.length > 0) {
      const defaultAudience = (1 - audience) / undefinedAudience.length
      undefinedAudience.forEach((v) => v.audience = defaultAudience)
    }
    var treshold = 0
    test.variants.forEach((v) => {
      v.min = treshold
      v.max = v.audience + treshold
      treshold += v.audience
    })
    return Object.assign({
      seed: defaultSeed
    }, test)
  }

  middleware () {
    return (ctx, next) => {
      ctx.experiment = new ExperimentContext(ctx, this.profile)
      return next()
    }
  }
}

class ExperimentContext {

  constructor (ctx, profile) {
    this.ctx = ctx
    this.profile = profile
  }

  getVariant (id) {
    const profile = this.profile[id]
    if (!profile) {
      return
    }
    const seed = profile.seed(this.ctx)
    const magicNumber = seedrandom(seed)()
    return profile.variants.filter((v) => (magicNumber >= v.min && magicNumber < v.max))[0] || profile.variants[0]
  }

  variant (id) {
    return (this.getVariant(id) || {}).id
  }

  attachment (id) {
    return (this.getVariant(id) || {}).attachment
  }
}

module.exports = TelegrafExperiments
