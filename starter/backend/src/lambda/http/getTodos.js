import { getTodoList } from "../../businessLogic/todos.js"
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from "../utils.mjs"
import { createLogger } from "../../utils/logger.mjs"

const logger = createLogger("getTodo")

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    try {
      const userId = getUserId(event)
      const items = await getTodoList(userId)
      return {
        statusCode: 200,
        body: JSON.stringify({
          items
        })
      }
    } catch (e) {
      logger.info("error", e)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        
      })
    }
  })