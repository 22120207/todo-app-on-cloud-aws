// src/services/database.service.ts
import dotenv from "dotenv";
import logger from "../logger";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Global DynamoDB client instances
let dynamoClient: DynamoDBClient;
let docClient: DynamoDBDocumentClient;

// Initialize Connection
export const connectToDatabase = async () => {
  dotenv.config();

  // Check if AWS credentials are set
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials are not defined in the environment variables");
  }

  const region = process.env.AWS_REGION || "us-east-1";

  try {
    // Create the DynamoDB client
    dynamoClient = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Create the DynamoDB Document client (higher-level abstraction)
    docClient = DynamoDBDocumentClient.from(dynamoClient);

    logger.info(`[server]: Successfully connected to DynamoDB in ${region}`);
  } catch (error) {
    logger.error(`[server]: Failed to connect to DynamoDB: ${error}`);
    throw error;
  }
};

// Export clients for use in other files
export const getDynamoClient = () => {
  if (!dynamoClient) {
    throw new Error("DynamoDB client not initialized. Call connectToDatabase first.");
  }
  return dynamoClient;
};

export const getDocClient = () => {
  if (!docClient) {
    throw new Error("DynamoDB document client not initialized. Call connectToDatabase first.");
  }
  return docClient;
};