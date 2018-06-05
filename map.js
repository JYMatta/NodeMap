#!/usr/bin/env node

var validUrl = require('valid-url');
const getHrefs = require('get-hrefs');
const fs = require('fs');
var util = require('util');
var url = require('url');
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
    // traversePath(path);
    return;
  }
  console.log(path)

  request(domain.origin+path).then(function(response){
    var node = traversePath(path);
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

        if(! node.external) {
          node.external = [href];
        } else {
          node.external.push(href);
        }
        visited[href] = true;
        return;
      }

      processURL(curr.pathname);
    });
  }).catch(function(error){
    console.log(error);
    // delete visited[path];
    // processedURLs--;
  }).then(function(){
    processedURLs ++;
    if(processedURLs == totalURLs)  finished();
  });

}

function traversePath(path) {
  var bits = path.split('/');
  var curr = siteMap.tree;
  if(curr.length <= 0) return curr;

  for(var i=0; i< bits.length; i++) {
    if(!curr[bits[i]]){
      curr[bits[i]] = {};
    }

    curr = curr[bits[i]];
  }
  return curr;
}

function finished() {
  // Handle the output
  var output = JSON.stringify(siteMap);
  if(process.argv.length >= 4) {
    fs.writeFile(process.argv[3],  output, 'utf8', function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
  } else {
    console.log(output);
  }
}
