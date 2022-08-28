import { Server } from 'node-osc';
const s = new Server(9001, '127.0.0.2', () => {
    s.close();
});