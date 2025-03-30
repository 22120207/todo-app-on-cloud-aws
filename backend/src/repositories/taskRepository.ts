// src/repositories/taskRepository.ts
import { v4 as uuidv4 } from "uuid";
import { 
  PutCommand, 
  GetCommand, 
  DeleteCommand, 
  UpdateCommand, 
  ScanCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { getDocClient } from "../services/database.service";

// Define task interface
export interface ITask {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null; // DynamoDB stores dates as strings
  createdAt: string;
  updatedAt: string;
}

// Table name
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Tasks";

export const getAllTasks = async (): Promise<ITask[]> => {
  const docClient = getDocClient();
  
  // Scan the entire table
  const command = new ScanCommand({
    TableName: TABLE_NAME,
  });

  const response = await docClient.send(command);
  
  // Sort by dueDate
  const tasks = response.Items as ITask[];
  return tasks.sort((a, b) => {
    if (!a.dueDate) return -1;
    if (!b.dueDate) return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

export const getTaskById = async (id: string): Promise<ITask | null> => {
  const docClient = getDocClient();
  
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { id },
  });

  const response = await docClient.send(command);
  return response.Item as ITask || null;
};

export const createTask = async (title: string, dueDate?: Date): Promise<ITask> => {
  const docClient = getDocClient();
  
  const now = new Date().toISOString();
  const newTask: ITask = {
    id: uuidv4(),
    title,
    completed: false,
    dueDate: dueDate ? dueDate.toISOString() : null,
    createdAt: now,
    updatedAt: now
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: newTask,
  });

  await docClient.send(command);
  return newTask;
};

export const updateTask = async (id: string, data: Partial<ITask>): Promise<ITask | null> => {
  const docClient = getDocClient();
  
  // First, check if the task exists
  const existingTask = await getTaskById(id);
  if (!existingTask) {
    return null;
  }

  // Prepare update expressions
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    // Skip id since it's the primary key and shouldn't be updated
    if (key === 'id') return;
    
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  });

  // Always update the updatedAt timestamp
  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return response.Attributes as ITask;
};

export const deleteTask = async (id: string): Promise<void> => {
  const docClient = getDocClient();
  
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { id },
  });

  await docClient.send(command);
};