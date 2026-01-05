import express from "express";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Hello from Express + TypeScript" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
