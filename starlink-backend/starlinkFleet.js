// Gestion du parc Starlink
const { esClient } = require('./elasticsearch');

// Récupère la télémétrie agrégée par terminal sur les 6 dernières heures
async function getFleetStatus() {
  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const response = await esClient.search({
    index: 'starlink-telemetry',
    size: 0,
    query: {
      range: {
        timestamp: {
          gte: sixHoursAgo.toISOString(),
          lte: now.toISOString()
        }
      }
    },
    aggs: {
      by_terminal: {
        terms: { field: 'terminal_id', size: 100 },
        aggs: {
          avg_rx: { avg: { field: 'rx_bytes' } },
          avg_tx: { avg: { field: 'tx_bytes' } },
          error_count: { sum: { field: 'error_count' } },
          last_status: { top_hits: { size: 1, sort: [{ timestamp: { order: 'desc' } }], _source: ['status'] } }
        }
      }
    }
  });
  return response.aggregations.by_terminal.buckets.map(bucket => ({
    terminal_id: bucket.key,
    avg_rx: bucket.avg_rx.value,
    avg_tx: bucket.avg_tx.value,
    error_count: bucket.error_count.value,
    last_status: bucket.last_status.hits.hits[0]._source.status
  }));
}

module.exports = { getFleetStatus };
