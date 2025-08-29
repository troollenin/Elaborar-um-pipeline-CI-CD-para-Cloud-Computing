import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('CI/CD up and running!');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[app] listening on port ${port}`);
  });
}

export default app;
