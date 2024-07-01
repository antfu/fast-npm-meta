import { version } from '../../package.json'

export default eventHandler(() => {
  return {
    name: 'fast-npm-version',
    version,
    docs: 'https://github.com/antfu/fast-npm-meta',
  }
})
