import { deleteTodo } from "../../businessLogic/todos.js"
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from "../../utils/logger.mjs"

const logger = createLogger("deleteTodo")


export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    try {
      const todoId = event.pathParameters.todoId
      await deleteTodo(todoId)
      return {
        statusCode: 200,
        body: JSON.stringify({
          todoId
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
