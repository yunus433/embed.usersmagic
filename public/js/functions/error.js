function throwError (err) {
  if (err)
    return createConfirm({
      title: 'An error occured',
      text: `An error occured, please reload the page and try again. Error Message: ${err}`,
      reject: 'Close'
    }, res => {});

  return createConfirm({
    title: 'An unknown error occured',
    text: 'An unknown error occured, please reload the page and try again',
    reject: 'Close'
  }, res => {});
};
