import { NextFunction, Request, Response } from "express";
import { LayerDocument, LayerModel } from "@models/layer";
import { BaseController } from "@controllers/baseController";

//region CRUD route handlers

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createRecord = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<LayerDocument>(LayerModel, req, res);
  await baseController.createRecord();
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRecord = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<LayerDocument>(LayerModel, req, res);
  await baseController.getRecordById();
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRecords = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<LayerDocument>(LayerModel, req, res);
  await baseController.getAllRecords();
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateRecord = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<LayerDocument>(LayerModel, req, res);
  await baseController.updateRecordById();
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteRecord = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<LayerDocument>(LayerModel, req, res);
  await baseController.deleteRecordById();
};

//endregion
