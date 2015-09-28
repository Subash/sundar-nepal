export function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.height = 800;
  canvas.width = 800;
  return canvas;
}

export function createImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.width = 800;
    img.height = 800;
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export function mergeImages(bottomImageUrl, topImageUrl) {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas();
    const ctx = canvas.getContext("2d");
    Promise.all([createImageFromUrl(bottomImageUrl), createImageFromUrl(topImageUrl)])
      .then( ([bottomImage, topImage]) => {

        ctx.drawImage(bottomImage, 0, 0, 800, 800);
        ctx.drawImage(topImage, 0, 0, 800, 800);
        resolve(canvas.toDataURL("image/jpeg"));

      }).catch(reject);
  })
}

export function postToFacebook({accessToken, image, message, userID}) {
  return new Promise((resolve, reject) => {

    const form = new FormData();
    form.append("access_token", accessToken);
    form.append("message", message);
    form.append("file", image);

    apiRequest(`https://graph.facebook.com/${userID}/photos`, {
      method: 'POST',
      body: form
    })
    .then(() => {
      resolve();
    })
    .catch((err) => {
      reject(err);
    });
  });
}

export function apiRequest(url, options) {

  return new Promise((resolve, reject)=> {

    const defaultOptions = {
       // Pass in the cookies; by default fetch doesn't send cookies and session
      credentials: 'same-origin'
    };

    // Merge options
    options = {...options, ...defaultOptions };

    fetch(url, options)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        resolve();
      } else {
        const error = new Error(response.statusText)
        error.response = response
        reject(error);
      }
    })
    .catch(err => {
      err = err.data ? err : new Error('An error occurred while connecting.');
      reject(err);
    });
  });
}

// http://stackoverflow.com/a/15754051
export function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
}
