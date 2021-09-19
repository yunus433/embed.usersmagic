// POST request to the given url, return the json objet
function serverRequest (url, method, data, callback) {
  if (!url || typeof url != 'string' || !method || typeof method != 'string' || (method != 'GET' && method != 'POST') || !data || typeof data != 'object')
    return callback({ success: false, error: 'bad_request' });

  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  
  if (method == 'POST') {
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(data));
  } else {
    xhr.send();
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status != 200)
      return callback({ success: false, error: 'network_error' })
    else if (xhr.readyState == 4 && xhr.responseText)
      return callback(JSON.parse(xhr.responseText));
  };
}
