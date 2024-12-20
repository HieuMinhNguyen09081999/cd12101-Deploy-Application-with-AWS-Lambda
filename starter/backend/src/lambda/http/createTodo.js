import { createTodo } from "../../businessLogic/todos.js"
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from "../utils.mjs"
import { createLogger } from "../../utils/logger.mjs"

const logger = createLogger("createTodo")

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
      let newTodo = JSON.parse(event.body)
      newTodo = await createTodo(newTodo, userId)
        return {
          statusCode: 200,
          body: JSON.stringify({
            newTodo
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

