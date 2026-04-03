import { app } from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Server]: Chess Engine API is running on http://localhost:${PORT}`);
  console.log(
    `[Server]: Ready to accept requests at POST http://localhost:${PORT}/api/v1/players/register`,
  );
});
