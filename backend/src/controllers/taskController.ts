// src/controllers/taskController.ts
import { Request, Response } from "express";
import * as taskRepository from "../repositories/taskRepository";
import { http } from "../constants/httpStatusCodes";
import logger from "../logger";

export const getTasks = async (_req: Request, res: Response) => {
  try {
    const tasks = await taskRepository.getAllTasks();
    res.status(http.OK).json(tasks);
  } catch (error) {
    logger.error(`Error getting tasks: ${error}`);
    res.status(http.INTERNAL_SERVER_ERROR).json({ message: "Error fetching tasks" });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskRepository.getTaskById(id);

    if (!task) {
      return res.status(http.NOT_FOUND).json({ message: "Task not found" });
    }

    res.status(http.OK).json(task);
  } catch (error) {
    logger.error(`Error getting task by ID: ${error}`);
    res.status(http.INTERNAL_SERVER_ERROR).json({ message: "Error fetching task" });
  }
};

export const addTask = async (req: Request, res: Response) => {
  try {
    const { title, dueDate } = req.body;
    
    if (!title) {
      return res.status(http.BAD_REQUEST).json({ message: "Title is required" });
    }
    
    // Parse dueDate if provided
    const parsedDueDate = dueDate ? new Date(dueDate) : undefined;
    
    const newTask = await taskRepository.createTask(title, parsedDueDate);
    res.status(http.CREATED).json(newTask);
  } catch (error) {
    logger.error(`Error adding task: ${error}`);
    res.status(http.INTERNAL_SERVER_ERROR).json({ message: "Error adding task" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Convert dueDate string to Date if present
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate).toISOString();
    }
    
    const updatedTask = await taskRepository.updateTask(id, updateData);

    if (!updatedTask) {
      return res.status(http.NOT_FOUND).json({ message: "Task not found" });
    }

    res.status(http.OK).json(updatedTask);
  } catch (error) {
    logger.error(`Error updating task: ${error}`);
    res.status(http.INTERNAL_SERVER_ERROR).json({ message: "Error updating task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await taskRepository.deleteTask(id);
    res.status(http.OK).json({ message: "Task deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting task: ${error}`);
    res.status(http.INTERNAL_SERVER_ERROR).json({ message: "Error deleting task" });
  }
};