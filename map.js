#!/usr/bin/env node

var validUrl = require('valid-url');
const getHrefs = require('get-hrefs');
const fs = require('fs');
var util = require('util');
var url = require('url');
// const request = require('request');
const { promisify } = require('util');
var request = promisify(require("request"));

if(process.argv.length < 3 || ! validUrl.isUri(process.argv[2])) {
  console.log("Usage: ./map.js <site> <target_file>");
  return 1;
}

var site = process.argv[2];
const domain = new url.URL(site);
var visited = {};
var siteMap = {site: domain.origin, tree: {'': {}}, external: {}};
var totalURLs = 0;
var processedURLs = 0;
processURL('/');  //Start at the root

function processURL(path){
  if(! visited[path]) {
    totalURLs ++;
  } else {
    traversePath(path);
    return;
  }
  traversePath(path);
  console.log(path)

  request(domain.origin+path).then(function(response){
    visited[path] = true;
    var hrefs = getHrefs(response.body);
    hrefs.forEach(function(href){
      if(href.startsWith("/"))  href = domain.origin + href;
      if(href.startsWith("#"))  href = domain.origin + path + href;

      var curr = new url.URL(href);
      if(curr.hostname != domain.hostname) {
        // External link
        if(!siteMap.external[href]){
          siteMap.external[href] = 0;
        }
        siteMap.external[href] ++;
        return;
      }

      processURL(curr.pathname);
    });
  }).catch(function(error){
    console.log(error);
  }).then(function(){
    processedURLs ++;
    if(processedURLs == totalURLs)  finished();
  });

}

function traversePath(path) {
  var bits = path.split('/');
  var curr = siteMap.tree;
  if(curr.length <= 0) return;
  for(var i=0; i< bits.length; i++) {
    if(!curr[bits[i]]){
      curr[bits[i]] = {};
    }

    curr = curr[bits[i]];
  }
}

function finished() {
  // Handle the output
  if(process.argv.length >= 4) {
    fs.writeFile(process.argv[3],  JSON.stringify(siteMap), 'utf8', function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
  } else {
    console.log(siteMap);
  }
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
