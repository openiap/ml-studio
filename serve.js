const express = require('express');
const fs = require('fs');
const url = require('node:url');
const path = require('path');
const app = express();
const port = 3000;

// Special handling for config.json
app.get('/config.json', (req, res) => {
  console.debug(req.url);
var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'dist', 'config.json'), 'utf8'));
if(process.env.oidc_config != null && process.env.oidc_config != '') {
  console.log("Updated config.json based of " + process.env.oidc_config)
  var _url = url.parse(process.env.oidc_config);
  config = Object.assign({}, config, {
    VUE_APP_CONFIG_URL: _url.protocol + '//' + _url.host + "/config",
    VUE_APP_AUTHORITY: _url.protocol + '//' + _url.host + "/oidc",
  });
} else {
  console.log("No oidc_config environment variable set, using default config.json")
}
res.json(config);
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache static files for 1 day, adjust as needed
  etag: false,  // Can disable ETag if versioning/hashing is used in filenames
}));

// For any other requests, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => console.debug(`App listening on port ${port}!`));


// const express = require('express');
// const fs = require('fs');
// const url = require('node:url');
// const path = require('path');
// const app = express();
// const port = 3000;

// // app.use(express.static('dist'));
// app.get('*', (req, res) => {
//   console.debug(req.url);
//   if(req.url === '/config.json') {
//     var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'dist', 'config.json'), 'utf8'));
//     if(process.env.oidc_config != null && process.env.oidc_config != '') {
//       var _url = url.parse(process.env.oidc_config);
//       config = Object.assign({}, config, {
//         VUE_APP_CONFIG_URL: _url.protocol + '//' + _url.host + "/config",
//         VUE_APP_AUTHORITY: _url.protocol + '//' + _url.host + "/oidc",
//       });
//     }
//     res.json(config);
//     return;
//   }
//   if(fs.existsSync(path.join(__dirname, 'dist', req.url))) {
//     res.sendFile(path.join(__dirname, 'dist', req.url));
//     return;
//   } else {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
//   }
// });
  
// app.listen(port, () => console.debug(`Example app listening on port ${port}!`));

