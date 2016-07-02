# Multivariate and A/B testing middleware for Telegraf

[![Build Status](https://img.shields.io/travis/telegraf/telegraf-experiments.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-experiments)
[![NPM Version](https://img.shields.io/npm/v/telegraf-experiments.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-experiments)

Multivariate and A/B testing middleware for [Telegraf (Telegram bot framework)](https://github.com/telegraf/telegraf).

## Installation

```js
$ npm install telegraf-experiments
```

## Example
  
```js
const Telegraf = require('telegraf')
const TelegrafExperiments = require('telegraf-experiments')

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
  // analytics.track('feature3', ctx.experiment.variant('feature3'))
  const messageFn = ctx.experiment.attachment('feature3')
  const message = messageFn()
  return ctx.reply(message)
})

telegraf.startPolling()

```

## License

The MIT License (MIT)

Copyright (c) 2016 Vitaly Domnikov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

