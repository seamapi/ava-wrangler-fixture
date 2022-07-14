import test from "ava"
import getTestServer from "ava-wrangler-fixture"

test("test server should work", async (t) => {
  const { axios } = await getTestServer(t)

  const res = await axios.post("/", { hello: "world" })

  t.is(res.status, 200)
})
