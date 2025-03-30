// src/scripts/createTable.ts
import { 
    DynamoDBClient, 
    CreateTableCommand, 
    ListTablesCommand 
  } from "@aws-sdk/client-dynamodb";
  import dotenv from "dotenv";
  
  async function createTasksTable() {
    dotenv.config();
  
    // Check if AWS credentials are set
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS credentials are not defined in the environment variables");
    }
  
    const region = process.env.AWS_REGION || "us-east-1";
    const tableName = process.env.DYNAMODB_TABLE_NAME || "Tasks";
  
    const client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  
    // Check if the table already exists
    const listTablesCommand = new ListTablesCommand({});
    const tableList = await client.send(listTablesCommand);
    
    if (tableList.TableNames?.includes(tableName)) {
      console.log(`Table ${tableName} already exists.`);
      return;
    }
  
    // Define the table structure
    const createTableCommand = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        { AttributeName: "id", KeyType: "HASH" }, // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" }, // String
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });
  
    try {
      const response = await client.send(createTableCommand);
      console.log(`Table ${tableName} created successfully:`, response);
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
      throw error;
    }
  }
  
  // Run if this script is executed directly
  if (require.main === module) {
    createTasksTable()
      .then(() => console.log("Table creation process completed."))
      .catch((err) => console.error("Failed to create table:", err));
  }
  
  export { createTasksTable };