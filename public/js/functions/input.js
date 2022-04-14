let lastOpenSelectInput = null;

function uploadImage (file, callback) {
  const formdata = new FormData();
  formdata.append('file', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/image/upload');
  xhr.send(formdata);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.responseText) {
      const res = JSON.parse(xhr.responseText);

      if (!res.success)
        return callback(res.error || 'unknown_error');

      return callback(null, res.url);
    }
  };
}

function createImagePicker (wrapper) {
  const settingsImagePicker = document.createElement('label');
  settingsImagePicker.classList.add('general-choose-image-input-text');

  const span = document.createElement('span');
  span.innerHTML = 'Click to choose an image from your device';
  settingsImagePicker.appendChild(span);

  const input = document.createElement('input');
  input.classList.add('display-none');
  input.classList.add('image-input');
  input.accept = 'image/*';
  input.type = 'file';

  settingsImagePicker.appendChild(input);

  wrapper.innerHTML = '';
  wrapper.appendChild(settingsImagePicker);
}

function createUploadedImage (url, wrapper) {
  const imageInputWrapper = document.createElement('div');
  imageInputWrapper.classList.add('general-image-input-wrapper');

  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('general-image-input-wrapper-image');
  const image = document.createElement('img');
  image.src = url;
  image.alt = 'usersmagic';
  imageWrapper.appendChild(image);
  imageInputWrapper.appendChild(imageWrapper);

  const i = document.createElement('i');
  i.classList.add('fas');
  i.classList.add('fa-times');
  i.classList.add('delete-image-button');
  imageInputWrapper.appendChild(i);

  wrapper.innerHTML = '';
  wrapper.appendChild(imageInputWrapper);
}

function makeElementInvisible (node) {
  node.style.position = 'absolute';
  node.style.visibility = 'hidden';
  node.style.left = (-1 * node.innerWidth) + 'px';
  node.style.top = (-1 * node.innerHeight) + 'px';
}

function makeElementVisible (node) {
  node.style.position = 'initial';
  node.style.visibility = 'initial';
  node.style.left = 'initial';
  node.style.top = 'initial';
}

window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.classList.contains('delete-image-button')) {
      const wrapper = event.target.parentNode.parentNode;
      const url = event.target.parentNode.childNodes[0].childNodes[0].src;

      serverRequest(`/image/delete?url=${url}`, 'GET', {}, res => {
        if (!res.success) return throwError(res.error);

        createImagePicker(wrapper);
      });
    }

    if (
      event.target.classList.contains('each-general-checked-input') || 
        (event.target.parentNode && 
          (event.target.parentNode.classList.contains('each-general-checked-input') || 
            (event.target.parentNode.parentNode && 
              event.target.parentNode.parentNode.classList.contains('each-general-checked-input'))))
    ) {
      const target = event.target.classList.contains('each-general-checked-input') ? event.target : (event.target.parentNode.classList.contains('each-general-checked-input') ? event.target.parentNode : event.target.parentNode.parentNode);
      const choice = target.childNodes[1].innerHTML.trim();
      const input = target.parentNode.childNodes[0];
      let selectedChoices = JSON.parse(input.value);
      
      if (target.classList.contains('each-general-checked-input-selected'))
        target.classList.remove('each-general-checked-input-selected');
      else
        target.classList.add('each-general-checked-input-selected');

      if (selectedChoices.includes(choice))
        selectedChoices = selectedChoices.filter(each => each != choice);
      else
        selectedChoices.push(choice);

      input.value = JSON.stringify(selectedChoices);
    }

    if (event.target.classList.contains('general-each-search-item-name')) {
      const selectedItems = document.querySelectorAll('.general-each-search-item-wrapper-selected');
      
      for (let i = 0; i < selectedItems.length; i++)
        selectedItems[i].classList.remove('general-each-search-item-wrapper-selected');

      event.target.parentNode.classList.add('general-each-search-item-wrapper-selected');
      event.target.parentNode.scrollIntoView(true);
    }

    if (event.target.classList.contains('general-select-input') || event.target.parentNode.classList.contains('general-select-input')) {
      const target = event.target.classList.contains('general-select-input') ? event.target : event.target.parentNode;

      if (lastOpenSelectInput) {
        lastOpenSelectInput.style.overflow = 'hidden';
        lastOpenSelectInput.style.borderBottomLeftRadius = '5px';
        lastOpenSelectInput.style.borderBottomRightRadius = '5px';
        lastOpenSelectInput.childNodes[0].style.borderBottomLeftRadius = '5px';
        lastOpenSelectInput.childNodes[0].style.borderBottomRightRadius = '5px';
      }

      lastOpenSelectInput = target;

      target.style.overflow = 'visible';
      target.style.borderBottomLeftRadius = '0px';
      target.style.borderBottomRightRadius = '0px';
      target.childNodes[0].style.borderBottomLeftRadius = '0px';
      target.childNodes[0].style.borderBottomRightRadius = '0px';
    } else if (event.target.classList.contains('each-general-select-input-option')) {
      const target = event.target.parentNode.parentNode;
      target.childNodes[0].innerHTML = event.target.innerHTML;
      target.childNodes[0].style.color = 'rgb(98, 98, 103)';
      target.childNodes[1].value = event.target.innerHTML;

      lastOpenSelectInput.style.overflow = 'hidden';
      lastOpenSelectInput.style.borderBottomLeftRadius = '5px';
      lastOpenSelectInput.style.borderBottomRightRadius = '5px';
      lastOpenSelectInput.childNodes[0].style.borderBottomLeftRadius = '5px';
      lastOpenSelectInput.childNodes[0].style.borderBottomRightRadius = '5px';

      lastOpenSelectInput = null;
    } else if (lastOpenSelectInput) {
      lastOpenSelectInput.style.overflow = 'hidden';
      lastOpenSelectInput.style.borderBottomLeftRadius = '5px';
      lastOpenSelectInput.style.borderBottomRightRadius = '5px';
      lastOpenSelectInput.childNodes[0].style.borderBottomLeftRadius = '5px';
      lastOpenSelectInput.childNodes[0].style.borderBottomRightRadius = '5px';
      lastOpenSelectInput = null;
    }
  });

  document.addEventListener('input', event => {
    if (event.target.classList.contains('general-search-input')) {
      const wrapper = event.target.nextElementSibling;
      const nodes = wrapper.children;
      const search = event.target.value.trim().split(' ').join('').toLocaleLowerCase();

      for (let i = 0; i < nodes.length; i++) {
        const text = nodes[i].childNodes[0].innerHTML.trim().split(' ').join('').toLocaleLowerCase();

        if (text.includes(search))
          makeElementVisible(nodes[i]);
        else
          makeElementInvisible(nodes[i]);
      }
    }
  });

  document.addEventListener('change', event => {
    if (event.target.classList.contains('image-input')) {
      const file = event.target.files[0];

      event.target.parentNode.style.cursor = 'progress';
      event.target.parentNode.childNodes[0].innerHTML = 'Uploading...';
      event.target.parentNode.childNodes[1].type = 'text';

      uploadImage(file, (err, url) => {
        if (err) return throwError(err);

        createUploadedImage(url, event.target.parentNode.parentNode);
      });
    }
  });
});
