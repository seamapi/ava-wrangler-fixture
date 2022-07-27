/**
 * Unforunately, as of 2022-06-21 wrangler/miniflare doesn't support an easy
 * way for me to create a server programmatically, so we'll need to call out
 * to shell
 */

import child_process from "child_process"
import chalk from "chalk"
import getPort from "get-port"
import defaultAxios from "axios"
import { ExecutionContext } from "ava"
import axiosMonkeypatch from "axios-error-monkeypatch"

interface Options {
  silent: boolean
}

export const getTestServer = async (
  t: ExecutionContext,
  options: Options = { silent: false }
) => {
  axiosMonkeypatch()
  const port = await getPort()
  const { silent } = options

  const proc = child_process.spawn(
    `npx`,
    ["wrangler", "dev", "-l", "--port", port.toString(), "./src/index.ts"],
    {
      shell: true,
    }
  )

  let isClosed = false,
    hasStarted = false
  proc.stdout.on("data", (data: any) => {
    if (!silent) {
      console.log(chalk.yellow(data.toString()))
    }
    if (data.toString().includes("Listening on localhost")) {
      console.log("has started")
      hasStarted = true
    }
  })

  proc.stderr.on("data", (data: any) => {
    if (!silent) {
      console.log(chalk.red(data.toString()))
    }
  })

  proc.on("close", (code: any) => {
    console.log({ close: true })
    isClosed = true
  })

  t.teardown(() => {
    if (!isClosed) {
      proc.kill("SIGINT")
    }
  })

  const serverUrl = `http://localhost:${port}`

  const axios = defaultAxios.create({
    baseURL: serverUrl,
  })

  while (!hasStarted) {
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  return {
    serverUrl,
    axios,
  }
}

export default getTestServer
