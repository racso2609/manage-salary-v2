import express from "express";
import environment from "./env";

const app = express();

app.listen(environment.PORT, () => {
  console.log(`Server listening on port: ${environment.PORT}`);
});

export default app;
