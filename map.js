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
  var output = {};
  var visited = {};

  output = processHref(site, visited, site);
  console.log(output);
}

function processHref(site, visited, domain) {
  if(! site.startsWith("http")) return "Not a page";
  if(! site.startsWith(domain)) return "External";
  if(visited[site]) return visited[site];

  // console.log("Got for <%s>", site);
  body = request("GET", site).getBody().toString('utf8');
  var hrefs = getHrefs(body);
  // console.log(hrefs);

  output = {};
  visited[site] = output;
  for(var i =0; i < hrefs.length; i ++){
    href = hrefs[i];
    if(href.startsWith("/"))  href = site+href;   // Relative link, add the domain ahead of it

    var subtree = processHref(href, visited, domain);
    // console.log(subtree);
    if(subtree) output[href] = subtree;
    // console.log(output);
  }
  return output;
}

function removeTrailinSlash(site)
{
    return site.replace(/\/$/, "");
}
