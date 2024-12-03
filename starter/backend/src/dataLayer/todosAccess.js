import AWS from "aws-sdk";
import { createLogger } from "../utils/logger.mjs"
import AWSXRay from 'aws-xray-sdk-core';
AWS.config.update({
    region: "us-east-1",
});

const bucket_name = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.URL_EXPIRATION;

const s3 = AWSXRay.captureAWSClient(new AWS.S3({ region: 'us-east-1' }));

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TODOS_TABLE;

const logger = createLogger('todoAccess')

export async function create(newItem) {
    const params = {
        TableName: tableName,
        Item: newItem,
    };

    try {
        await dynamoDb.put(params).promise();
        return newItem;
    } catch (error) {
        logger.info("Error creating item:", error);
        throw error;
    }
}

export async function update(todoId, updateTodo) {
    const todo = await getTodoById(todoId);
    const params = {
        TableName: tableName,
        Key: {
            todoId: todoId,
            createdAt: todo.createdAt
        },
        UpdateExpression: "SET #name = :name, #dueDate = :dueDate, #done = :done",
        ExpressionAttributeNames: {
            "#name": "name",
            "#dueDate": "dueDate",
            "#done": "done",
        },
        ExpressionAttributeValues: {
            ":name": updateTodo.name,
            ":dueDate": updateTodo.dueDate,
            ":done": updateTodo.done,
        },
        ReturnValues: "ALL_NEW",
    };

    try {
        const result = await dynamoDb.update(params).promise();
        return result.Attributes;
    } catch (error) {
        logger.info("Error updating todo:", error);
        throw error;
    }
}

export async function getAll(userId) {
    logger.info("Fetching todos for userId:", userId);

    const params = {
        TableName: tableName,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId,
        },
    };

    try {
        const result = await dynamoDb.scan(params).promise();
        return result.Items || [];
    } catch (error) {
        logger.info("Error fetching todos:", error);
        return [];
    }
}

export async function deleteById(todoId) {
    const todo = await getTodoById(todoId);
    const params = {
        TableName: tableName,
        Key: {
            todoId: todoId,
            createdAt: todo.createdAt
        },
    };

    try {
        await dynamoDb.delete(params).promise();
        return { message: "Todo deleted successfully" };
    } catch (error) {
        logger.info("Error deleting todo:", error);
        throw error;
    }
}

export async function getUploadUrl(todoId) {
    try {
        const url = s3.getSignedUrl('putObject', {
            Bucket: bucket_name,
            Key: todoId,
            Expires: parseInt(urlExpiration), 
        });

        const todo = await getTodoById(todoId);
        const params = {
            TableName: tableName,
            Key: {
                todoId: todoId,
                createdAt: todo.createdAt
            },
            UpdateExpression: "SET #attachmentUrl = :attachmentUrl",
            ExpressionAttributeNames: {
                "#attachmentUrl": "attachmentUrl"
            },
            ExpressionAttributeValues: {
                ":attachmentUrl": todoId
            },
            ReturnValues: "ALL_NEW",
        };

        try {
            const result = await dynamoDb.update(params).promise();
        } catch (error) {
            logger.info("Error updating todo:", error);
            throw error;
        }

        return url;
    } catch (e) {
        console.log("Error generating signed URL:", e);
        throw new Error("Error generating signed URL");
    }
}

export async function getTodoById(todoId) {
    const params = {
        TableName: tableName,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
            ':todoId': todoId,
        },
    };

    try {
        const result = await dynamoDb.query(params).promise();
        if (result.Items && result.Items.length > 0) {
            return result.Items[0];
        } else {
            throw new Error('Todo not found');
        }
    } catch (error) {
        logger.info("Error fetching todo by id:", error);
        throw error;
    }
}
