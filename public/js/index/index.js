let pieChartColors = [];
let company;
let state;
let user;
let team;

window.addEventListener('load', () => {  
  is_demo = document.getElementById('is-demo') ? true : false;
  user = JSON.parse(document.getElementById('user').value);
  team = JSON.parse(document.getElementById('team').value);
  company = JSON.parse(document.getElementById('company').value);
  pieChartColors = JSON.parse(document.getElementById('pie-chart-colors').value);
  
  const dataContentWrapper = document.getElementById('data-content-wrapper');
  const analysisContentWrapper = document.getElementById('analysis-content-wrapper');
  const bannerContentWrapper = document.getElementById('banner-content-wrapper');
  const settingsContentWrapper = document.getElementById('settings-content-wrapper');

  document.addEventListener('click', event => {
    if (event.target.classList.contains('each-all-header-button') && !event.target.classList.contains('each-all-header-button-selected')) {
      document.querySelector('.each-all-header-button-selected').classList.remove('each-all-header-button-selected');
      event.target.classList.add('each-all-header-button-selected');

      dataContentWrapper.style.display = 'none';
      analysisContentWrapper.style.display = 'none';
      bannerContentWrapper.style.display = 'none';
      settingsContentWrapper.style.display = 'none';

      if (event.target.id == 'data-button')
        dataContentWrapper.style.display = 'flex';
      else if (event.target.id == 'analysis-button')
        analysisContentWrapper.style.display = 'flex';
      else if (event.target.id == 'banner-button')
        bannerContentWrapper.style.display = 'flex';
      else if (event.target.id == 'settings-button')
        settingsContentWrapper.style.display = 'flex';
    }

    if (event.target.classList.contains('copy-code-button') || event.target.parentNode.classList.contains('copy-code-button')) {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('copy-data'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      event.target.childNodes[0].innerHTML = 'Copied!';
      setTimeout(() => {
        event.target.childNodes[0].innerHTML = 'Copy';
      }, 1500);
    }
  });
});
