import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT;
import routes from "./routes/index.ts";
import dbConfig from "./dbConfig/index.ts";

dbConfig();

app.use(express.json());

app.use(routes);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
