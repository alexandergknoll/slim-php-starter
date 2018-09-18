global.urlParams = {};

// Get query string params: https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript#answer-2880929
(window.onpopstate = function () {
  var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);

  urlParams = {};
  while (match = search.exec(query))
      urlParams[decode(match[1])] = decode(match[2]);
})();

$(function () {
  require('./app/global.js');
});