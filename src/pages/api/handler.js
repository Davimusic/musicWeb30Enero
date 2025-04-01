export default function handler(req, res) {//este es para saber cuanta memoria consume el cliente
    const memoryUsage = process.memoryUsage();
    res.status(200).json({
      rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + " MB", // Memoria total usada
      heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + " MB", // Memoria usada por el heap
      heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + " MB", // Memoria total asignada
    });
}
  