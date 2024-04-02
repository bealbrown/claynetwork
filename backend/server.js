const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('../../db/ceramics_lineage.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

app.get('/api/network', (req, res) => {
  const nodesQuery = "SELECT * FROM nodes";
  const edgesQuery = "SELECT * FROM edges";

  db.all(nodesQuery, [], (err, nodes) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    db.all(edgesQuery, [], (err, edges) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      res.json({ nodes, edges });
    });
  });
});

// Leave this alone for now -- seems like maybe we want to just filter in frontend? 

// // New endpoint to return nodes with a configurable number of connections
// app.get('/api/network/filtered', (req, res) => {
//   // Extract the desired number of connections from query parameters
//   console.log(req.query)
//   const { connections } = req.query;
  
//   if(!connections) {
//     console.log("failed, no connections in query")
//     return res.status(400).json({ error: 'Please specify the number of connections as a query parameter.' });
//   }

//   const nodesWithConnectionsQuery = `
//     SELECT n.*, COUNT(e.id) as connectionCount
//     FROM nodes n
//     LEFT JOIN edges e ON n.wikibase_item = e.source OR n.wikibase_item = e.target
//     GROUP BY n.wikibase_item
//     HAVING connectionCount = ?`;

//   db.all(nodesWithConnectionsQuery, [connections], (err, nodes) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }

//     console.log("nodes are", nodes)

//     res.json({ nodes });
//   });
// });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access it via http://localhost:${PORT} on this machine`);
  console.log(`Or via http://<Your-Machine-IP>:${PORT} from other machines on the network`);
});