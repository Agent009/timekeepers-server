import http from "http";
import app from "./app";
import { constants } from "@lib/constants";

http.createServer(app).listen(constants.tks.port);
