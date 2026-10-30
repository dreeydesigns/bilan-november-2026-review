'use strict';
/**
 * Serve the exact two pre-existing BILAN client-review artwork variations
 * as public image URLs for Buffer. No redesign or image transformation.
 * Source: data_00.js through data_14.js, already in this repository.
 */
globalThis.window = globalThis.window || {};
globalThis.window.BILAN_POSTS = [];
require('../data_00.js');
require('../data_01.js');
require('../data_02.js');
require('../data_03.js');
require('../data_04.js');
require('../data_05.js');
require('../data_06.js');
require('../data_07.js');
require('../data_08.js');
require('../data_09.js');
require('../data_10.js');
require('../data_11.js');
require('../data_12.js');
require('../data_13.js');
require('../data_14.js');
const posts = new Map(globalThis.window.BILAN_POSTS.map(p => [p.id, p]));
module.exports = function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  const id = typeof req.query.id === 'string' ? req.query.id : '';
  const version = String(req.query.v || '1');
  const slide = Number(req.query.s || '1');
  if (!/^NOV26-\d{2}-[AB]$/.test(id) || !['1','2'].includes(version) || !Number.isInteger(slide) || slide < 1 || slide > 5) {
    return res.status(400).end('Invalid artwork request');
  }
  const post = posts.get(id);
  const dataUri = post?.slides?.[slide-1]?.[version === '1' ? 'original' : 'revised'];
  if (!dataUri || !dataUri.startsWith('data:image/webp;base64,')) return res.status(404).end('Artwork not found');
  const image = Buffer.from(dataUri.substring('data:image/webp;base64,'.length),'base64');
  res.setHeader('Content-Type', 'image/webp');
  res.setHeader('Content-Length', String(image.length));
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = 200;
  if (req.method === 'HEAD') return res.end();
  return res.end(image);
};
