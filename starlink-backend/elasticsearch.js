// Intégration Elasticsearch pour stockage télémétrie
require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_USER && process.env.ELASTICSEARCH_PASS ? {
    username: process.env.ELASTICSEARCH_USER,
    password: process.env.ELASTICSEARCH_PASS
  } : undefined
});

async function storeTelemetry(data) {
  // Index "starlink-telemetry" avec timestamp
  await esClient.index({
    index: 'starlink-telemetry',
    document: {
      ...data,
      timestamp: new Date().toISOString()
    }
  });
}

module.exports = { esClient, storeTelemetry };
