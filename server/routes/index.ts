import { version } from '../../package.json'

export default eventHandler(() => {
  const config = useRuntimeConfig()

  return {
    name: 'fast-npm-meta',
    version,
    docs: config.app.repoUrl,
    deployTime: config.app.deployTime,
    deployRevision: `${config.app.repoUrl}/commit/${config.app.revision}`,
  }
})
