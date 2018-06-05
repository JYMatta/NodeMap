#!/usr/bin/env node

var validUrl = require('valid-url');
var request = require('sync-request');
const getHrefs = require('get-hrefs');

if(process.argv.length < 3 || ! validUrl.isUri(process.argv[2])) {
  console.log("Usage: ./map.js <site> <target_file>");
  return 1;
}

var site = process.argv[2];
var jsonSiteMap = extractSiteMap(site);

function extractSiteMap(site) {
  var processQueue = [site];
  var visited = {};
  var output = {};
  output[site] = processNextQueueItem(processQueue, visited, site);
  console.log(output);
}

function processNextQueueItem(processQueue, visited, domain) {
  output = {};
  while (processQueue.length > 0) {
    site = processQueue.shift();
    if(! site.startsWith(domain) || visited[site]) {
      // console.log("%s not in %s", site, domain);
      continue;
    }

    if(! site && queue.length == 0){
      // reached the end
      return output;
    }

    // console.log("Got for <%s>", site);
    body = request("GET", site).getBody().toString('utf8');
    visited[site] = true;
    var hrefs = getHrefs(body);
    // console.log(hrefs);

    hrefs.forEach(function(href){
      output[site] = {href: null};
      if(href.startsWith("/"))  href = domain+href;
      if(!visited[href] && href.startsWith("http")){
        processQueue.push(href);
      }
    });
    // console.log(processQueue);
  }
  return output;
}
