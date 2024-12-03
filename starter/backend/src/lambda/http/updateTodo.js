import { updateTodo } from "../../businessLogic/todos.js"
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { createLogger } from "../../utils/logger.mjs"

const logger = createLogger("updateTodo")

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
      const updatedTodo = JSON.parse(event.body)
      await updateTodo(todoId, updatedTodo)  
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
