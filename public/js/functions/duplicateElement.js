/*
  Duplicates a JS DOM element recursively and returns.
  Does not replicate element ids.
  Change width and height values to be in pxs.
  It duplicates only visually, does not preserve the functionality of the element.
  NOT SAME as DOM.cloneNode, also duplicates offset height and width!!!
*/

function duplicateElement (element) {
  const newElement = document.createElement(element.nodeName.toLowerCase());

  newElement.style.width = element.offsetWidth + "px";
  newElement.style.heigth = element.offsetHeight + "px";
  newElement.classList = element.classList;

  if (element.src)
    newElement.src = element.src;

  element.childNodes.forEach(node => {
    if (node.nodeName != "#text")
      newElement.appendChild(duplicateElement(node));
    else
      newElement.innerHTML = node.textContent;
  });

  return newElement;
}
