import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { initSocket } from './socket';

const PORT = env.PORT;

const httpServer = createServer(app);
const io = initSocket(httpServer);

// Make io accessible globally if needed, or pass it to services
// For simplicity, we can export it or attach to app, but here we just init it.

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
