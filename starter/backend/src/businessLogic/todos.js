import { v4 as uuidv4 } from 'uuid';
import { create, update, getAll, deleteById } from "../dataLayer/todosAccess.js";

const bucket_name = process.env.IMAGES_S3_BUCKET;

export async function createTodo(newTodo, userId) {
    const todoId = uuidv4();
    newTodo.todoId = todoId
    newTodo.userId = userId
    newTodo.createdAt = new Date().toISOString();
    newTodo.attachmentUrl = getAttachmentUrl(userId);
    newTodo.done = false
    return await create(newTodo)
}

export async function updateTodo(todoId, updateTodo) {
    await update(todoId, updateTodo)
}

export async function getTodoList(userId) {
    return await getAll(userId);
}

export async function deleteTodo(todoId) {
    await deleteById(todoId)
}

function getAttachmentUrl(todoId) {
    return "https://" + bucket_name + ".s3.amazoneaws.com/" + todoId;
}