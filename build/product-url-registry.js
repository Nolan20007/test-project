'use strict';

const path = require('path');
const registry = require('../data/product-urls.json');

function getProductPath(groupKey, productId) {
  const group = registry.products && registry.products[groupKey];
  const entry = group && group[String(productId)];
  if (!entry || typeof entry.path !== 'string' || !entry.path.startsWith('/products/') || !entry.path.endsWith('.html')) {
    throw new Error('[product URL registry] Missing or invalid URL for ' + groupKey + '/' + productId);
  }
  return entry.path;
}

function getProductSlug(groupKey, productId) {
  return path.posix.basename(getProductPath(groupKey, productId)).slice(0, -5);
}

function getProductPathById(productId) {
  const id = String(productId);
  const matches = [];
  Object.keys(registry.products || {}).forEach(groupKey => {
    const group = registry.products[groupKey];
    if (Object.prototype.hasOwnProperty.call(group, id)) matches.push({ groupKey, path: getProductPath(groupKey, id) });
  });
  if (matches.length > 1) {
    throw new Error('[product URL registry] Product ID is ambiguous across groups: ' + id + ' (' + matches.map(item => item.groupKey).join(', ') + ')');
  }
  return matches.length ? matches[0].path : null;
}

function getAllProductPaths() {
  return Object.keys(registry.products || {}).flatMap(groupKey =>
    Object.keys(registry.products[groupKey]).map(productId => getProductPath(groupKey, productId))
  );
}

module.exports = { registry, getProductPath, getProductSlug, getProductPathById, getAllProductPaths };
