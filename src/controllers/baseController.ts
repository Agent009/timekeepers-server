import { Request, Response } from "express"; // NextFunction,
import mongoose, { Document, FilterQuery, Model } from "mongoose";
import { create, listAllOrNullOnError } from "@middleware/repository";

//region CRUD route handlers

export class BaseController<T extends Document> {
  constructor(
    // public doc: T,
    public model: Model<T>,
    public req: Request,
    public res: Response,
  ) {} // next: NextFunction,

  createRecord = async (data?: Partial<T>) => {
    create<T>(this.model, {
      _id: new mongoose.Types.ObjectId(),
      ...this.getPayload(data),
    })
      .then((result) => {
        console.log("baseController -> createRecord -> result", result);
        this.res.status(201).json({
          message: "Record created successfully",
          data: {
            ...result?.toJSON(),
            request: {
              description: "Fetch record",
              type: "GET",
              id: result?._id,
            },
          },
        });
      })
      .catch((err) => {
        console.error("baseController -> createRecord -> err", err);
        this.res.status(500).json({
          error: err,
        });
      });
  };

  getAllRecords = async (filter: FilterQuery<T> = {}) => {
    listAllOrNullOnError<T>(this.model, filter)
      .then((docs) => {
        console.log("BaseController -> getRecords -> docs", docs);
        const response = {
          count: docs?.length,
          data: docs?.map((doc) => {
            return {
              ...doc,
              request: {
                description: "Fetch records",
                type: "GET",
                id: doc._id,
              },
            };
          }),
        };
        this.res.status(200).json(response);
      })
      .catch((err) => {
        console.error("BaseController -> getRecords -> err", err);
        this.res.status(500).json({
          error: err,
        });
      });
  };

  getRecordById = async (id?: string) => {
    const recordId = id || this.req.params.recordId;
    this.model
      .findOne({ _id: recordId })
      .exec()
      .then((doc) => {
        console.log("BaseController -> getRecord -> doc", doc);
        const response = {
          data: {
            ...doc?.toJSON(),
            request: {
              description: "Fetch record",
              type: "GET",
              id: recordId,
            },
          },
        };
        this.res.status(doc?._id ? 200 : 404).json(response);
      })
      .catch((err) => {
        console.error("BaseController -> getRecord -> err", err);
        this.res.status(500).json({
          error: err,
        });
      });
  };

  updateRecordById = async (data?: Partial<T>, id?: string) => {
    const recordId = id || this.req.params.recordId;
    // { new: true } returns the updated document
    this.model
      .findOneAndUpdate({ _id: recordId }, this.getPayload(data), { new: true })
      .then((result) => {
        console.log("BaseController -> updateRecord -> result", result);

        if (!result) {
          this.res.status(400).json({
            error: "Could not update record. Ensure provided ID is correct.",
          });
          return;
        }

        this.res.status(201).json({
          message: "Record updated successfully",
          data: {
            ...result?.toJSON(),
            request: {
              description: "Fetch record",
              type: "GET",
              id: recordId,
            },
          },
        });
      })
      .catch((err) => {
        console.error("BaseController -> updateRecord -> err", err);
        this.res.status(500).json({
          error: err,
        });
      });
  };

  deleteRecordById = async (id?: string) => {
    this.model
      .deleteOne({ _id: id || this.req.params.recordId })
      .exec()
      .then((result) => {
        console.log("BaseController -> deleteRecord -> result", result);
        this.res.status(200).json({
          message: "Record deleted successfully",
        });
      })
      .catch((err) => {
        console.error("BaseController -> deleteRecord -> err", err);
        this.res.status(500).json({
          error: err,
        });
      });
  };

  getPayload = (data?: Partial<T>) => {
    // Dynamically fetch and assign document properties from request body
    let payload: Partial<T> = {};

    // Loop through the keys
    for (const key of Object.keys(this.req.body)) {
      if (key in this.model.schema.paths) {
        // Check if the key exists in the schema
        payload[key as keyof T] = this.req.body[key];
      }
    }

    // Apply explicitly provided data or overrides.
    if (data) {
      payload = { ...payload, ...data };
    }

    return payload;
  };
}

//endregion
