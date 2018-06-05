# Node Map: _Command line sitemap tool_
A simple node.js command line tool to generate a JSON object containing a site map for any domain by following available links on the HTML body.

## Installation & Usage
#### Requirements
1. Node.js version 8+
2. npm
3. Internet connection

#### Installation
1. Make sure you have all dependencies installed first.
2. Clone the repository to your local machine
  > $ git clone https://github.com/JYMatta/NodeMap.git

  Or download the [zip](https://github.com/JYMatta/NodeMap/archive/master.zip) then extract it and rename the folder to nodemap
1. Change directory to the new folder  
  > $ cd nodemap

1. Install dependencies
  > $ npm install

#### Using the tool
USAGE:
from withing the project directory

> $ ./map.js **_[site]_** _[targetfile]_

**_[site]_ (required)**: Replace with the URL you want to generate the sitemap for.

_[targetfile]_ **(optional)**: Replace with filename, when provided, the tool with write the final JSON output to that file.

## Reasoning
I decided to implement the task described [here](https://github.com/buildit/org-design/blob/master/Recruitment/Exercises/engineering_lead.md), using Node.JS since I am applying to a Node.JS position, and the node engine is really optimized for asynchronous processing.  
I knew that a crawler would initiate a lot of web requests and there is no sense in performing them serially since they aren't dependent, which made was in favor of using Node.JS and it's native support for async functions.

#### Trade-offs
* ##### Using the [_get-hrefs_](https://www.npmjs.com/package/get-hrefs) instead of manually writing it.
  It makes more sense to use a package that does the work instead of manually re-inventing the wheel and losing time debugging it.  
  Plus it is a straight forward RegEx match, and I'm confident that given the time I can implement it.

## Improvements
* Using command line modules to display number of links parsed and the number of links detected as progress instead of just logging the links to indicate work.
* Using a logging tool.
