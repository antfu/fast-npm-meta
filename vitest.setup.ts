import { x } from 'tinyexec'
import waitPort from 'wait-port'

export default async function setup() {
  const PORT = 12452

  const process = x('pnpm', ['dev'], {
    nodeOptions: {
      env: {
        PORT: String(PORT),
      },
    },
  })

  await waitPort({ port: PORT })

  return () => {
    process.kill()
  }
}
