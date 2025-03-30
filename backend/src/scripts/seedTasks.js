// src/scripts/seedTasks.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

async function seedTasks() {
  console.log("Seeding tasks started...");
  
  // Create DynamoDB clients
  const region = process.env.AWS_REGION || "us-east-1";
  const tableName = process.env.DYNAMODB_TABLE_NAME || "Tasks";
  
  const client = new DynamoDBClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  
  const docClient = DynamoDBDocumentClient.from(client);
  
  // Create sample due dates (ranging from today to 10 days later)
  const today = new Date();
  const now = today.toISOString();
  
  const tasks = [
    { 
      id: uuidv4(),
      title: "Learn TypeScript", 
      completed: false, 
      dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), 
      createdAt: now,
      updatedAt: now
    },
    { 
      id: uuidv4(),
      title: "Build a Todo App", 
      completed: false, 
      dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
      createdAt: now,
      updatedAt: now
    },
    { 
      id: uuidv4(),
      title: "Deploy to AWS", 
      completed: false, 
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
      createdAt: now,
      updatedAt: now
    },
    {
      id: uuidv4(),
      title: "Write API documentation",
      completed: false,
      dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now
    },
    {
      id: uuidv4(),
      title: "Refactor authentication logic",
      completed: false,
      dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now
    },
    {
      id: uuidv4(),
      title: "Implement unit tests",
      completed: false,
      dueDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now
    },
    {
      id: uuidv4(),
      title: "Optimize database queries",
      completed: false,
      dueDate: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now
    },
  ];

  try {
    // Using BatchWrite for better performance with multiple items
    const batchSize = 25; // DynamoDB batch operations can handle up to 25 items
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      
      const batchWriteCommand = new BatchWriteCommand({
        RequestItems: {
          [tableName]: batch.map(task => ({
            PutRequest: {
              Item: task
            }
          }))
        }
      });
      
      await docClient.send(batchWriteCommand);
    }
    
    console.log(`${tasks.length} tasks added successfully.`);
  } catch (error) {
    console.error("Error inserting tasks:", error);
    throw error;
  }
}

// Run if this script is executed directly
if (require.main === module) {
  seedTasks()
    .then(() => console.log("Seeding completed."))
    .catch(err => console.error("Seeding failed:", err));
}

module.exports = { seedTasks };