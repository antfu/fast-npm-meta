import { x } from 'tinyexec'

export default async function setup() {
  const PORT = 12452

  const process = x('pnpm', ['dev'], {
    nodeOptions: {
      env: {
        PORT: String(PORT),
      },
    },
  })

  await new Promise(resolve => setTimeout(resolve, 1000))

  return () => {
    process.kill()
  }
}
