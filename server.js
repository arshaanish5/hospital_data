const http = require('http');
const fs = require('fs').promises;

const filePath = './hospitals.json';

// Helper function to read JSON file
const readJSONFile = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
};

// Helper function to write JSON file
const writeJSONFile = async (data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing file:', err);
  }
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (url === '/hospitals') {
    if (method === 'GET') {
      // Retrieve all hospital data
      const hospitals = await readJSONFile();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(hospitals));

    } else if (method === 'POST') {
      // Add a new hospital
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        const newHospital = JSON.parse(body);
        const hospitals = await readJSONFile();
        hospitals.push(newHospital);
        await writeJSONFile(hospitals);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hospital added successfully' }));
      });

    } else if (method === 'PUT') {
      // Update an existing hospital
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        const updatedHospital = JSON.parse(body);
        const hospitals = await readJSONFile();
        const index = hospitals.findIndex(h => h.name === updatedHospital.name);
        if (index !== -1) {
          hospitals[index] = updatedHospital;
          await writeJSONFile(hospitals);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Hospital updated successfully' }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Hospital not found' }));
        }
      });

    } else if (method === 'DELETE') {
      // Delete a hospital
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        const { name } = JSON.parse(body);
        const hospitals = await readJSONFile();
        const filteredHospitals = hospitals.filter(h => h.name !== name);
        await writeJSONFile(filteredHospitals);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hospital deleted successfully' }));
      });

    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Method not allowed' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
