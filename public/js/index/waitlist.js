window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.classList.contains('domain-setup-approve-button')) {
      const domain = document.querySelector('.domain-name-input').value;
      
      if (!domain || !domain.length) return;

      serverRequest('/domain/update', 'POST', {
        domain
      }, res => {
        if (res.success) return location.reload();

        return createConfirm({
          title: 'An unknown error occured',
          text: 'Please make sure your domain start in \'https://\' format. If the problem continues, reload the page and try again later',
          reject: 'Confirm'
        }, res => {});
      });
    }

    if (event.target.classList.contains('delete-domain-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this domain?',
        text: '',
        accept: 'Delete',
        reject: 'Cancel'
      }, res => {
        if (res) {
          serverRequest('/domain/delete', 'GET', {}, res => {
            if (res.success) return location.reload();

            return;
          });
        }
      });
    }

    if (event.target.classList.contains('check-domain-button')) {
      return location.reload();
    }
  })
})
