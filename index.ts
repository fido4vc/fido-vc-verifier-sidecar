import express, { Request, Response } from 'express';
import { getCryptosuiteForDocument } from 'fido-vc-cryptosuite-ts'
import morgan from 'morgan';

const port = process.env.PORT || 8081;
const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/test', (req, res) => {
  res.json({
    message: 'LD verifier is working!',
    timestamp: new Date().toISOString(),
    endpoint: '/test'
  });
});

app.post('/verify', async (req: Request, res: Response) => {
  try {
      const document = req.body;
      const cryptosuite = getCryptosuiteForDocument(document);
      const verificationResult = await cryptosuite.verify(document);
      const status = verificationResult.verified ? 200 : 400;
      res.status(status).json(verificationResult);
  } catch (error) {
      res.status(400).json({ verified: false, error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`LD verifier running at http://localhost:${port}`);
});