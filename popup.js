// Set power setting
function setPower(setting) {
  chrome.storage.local.set({ 'power': setting });
  var powerImage = document.getElementById('powerImage');
  powerImage.src = 'images/power-' + setting + '.png';
  powerImage.alt = 'Indie Wiki Buddy is ' + setting;

  chrome.runtime.sendMessage({
    action: 'updateIcon',
    value: setting
  });
}

// Populate BreezeWiki dropdown when enabled
async function loadBreezeWikiOptions() {
  // Load BreezeWiki options:
  chrome.storage.sync.get(['breezewikiHostOptions', 'breezewikiHostFetchTimestamp', 'breezewikiHost'], function (item) {
    let hostOptions = item.breezewikiHostOptions;
    let hostFetchTimestamp = item.breezewikiHostFetchTimestamp;
    let host = item.breezewikiHost;
    // Fetch and cache list of BreezeWiki hosts if first time,
    // or if it has been 24 hrs since last refresh
    if (!host || !hostOptions || !hostFetchTimestamp || (Date.now() - 86400000 > hostFetchTimestamp)) {
      fetch('https://bw.getindie.wiki/instances.json')
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Indie Wiki Buddy failed to get BreezeWiki data.');
        }).then((breezewikiHosts) => {
          breezewikiHosts = breezewikiHosts.filter(host =>
            chrome.runtime.getManifest().version.localeCompare(host.iwb_version,
              undefined, 
              { numeric: true, sensitivity: 'base' }
            ) >= 0
          );
          // If host isn't set, or currently selected host is no longer available, select random host:
          if (!host || !breezewikiHosts.some(item => item.instance === host)) {
            // Check if BreezeWiki's main site is available
            let breezewikiMain = breezewikiHosts.filter(host => host.instance === 'https://breezewiki.com');
            if (breezewikiMain.length > 0) {
              host = breezewikiMain[0].instance;
            } else {
              // If BreezeWiki.com is not available, set to a random mirror
              try {
                host = breezewikiHosts[Math.floor(Math.random() * breezewikiHosts.length)].instance;
              } catch (e) {
                console.log('Indie Wiki Buddy failed to get BreezeWiki data: ' + e);
              }
            }
          }
          // Populate dropdown selection of hosts
          const breezewikiHostSelect = document.getElementById('breezewikiHostSelect');
          while (breezewikiHostSelect.firstChild) {
            // Remove any existing options
            breezewikiHostSelect.removeChild(breezewikiHostSelect.lastChild);
          }
          for (var i = 0; i < breezewikiHosts.length; i++) {
            let option = document.createElement('option');
            option.value = breezewikiHosts[i].instance;
            let textContent = breezewikiHosts[i].instance.replace('https://', '');
            const numberOfPeriods = (textContent.match(/\./g)||[]).length;
            if (numberOfPeriods > 1) {
              textContent = textContent.substring(textContent.indexOf('.') + 1);
            }
            option.textContent = textContent;
            breezewikiHostSelect.appendChild(option);
            if (option.value === host) {
              breezewikiHostSelect.value = host;
            }
          }
          // Store BreezeWiki host details
          chrome.storage.sync.set({ 'breezewikiHost': host });
          chrome.storage.sync.set({ 'breezewikiHostOptions': breezewikiHosts });
          chrome.storage.sync.set({ 'breezewikiHostFetchTimestamp': Date.now() });
        }).catch((e) => {
          console.log('Indie Wiki Buddy failed to get BreezeWiki data: ' + e);

          // If fetch fails and no host is set, default to breezewiki.com:
          if (!host) {
            chrome.storage.sync.set({ 'breezewikiHost': 'https://breezewiki.com'});
          }
        });
    } else {
      // If currently selected host is no longer available, select random host:
      if (!hostOptions.some(item => item.instance === host)) {
        host = hostOptions[Math.floor(Math.random() * hostOptions.length)].instance;
      }
      // Populate dropdown selection of hosts
      const breezewikiHostSelect = document.getElementById('breezewikiHostSelect');
      while (breezewikiHostSelect.firstChild) {
        // Remove any existing options
        breezewikiHostSelect.removeChild(breezewikiHostSelect.lastChild);
      }
      for (var i = 0; i < hostOptions.length; i++) {
        let option = document.createElement('option');
        option.value = hostOptions[i].instance;
        let textContent = hostOptions[i].instance.replace('https://', '');
        const numberOfPeriods = (textContent.match(/\./g)||[]).length;
        if (numberOfPeriods > 1) {
          textContent = textContent.substring(textContent.indexOf('.') + 1);
        }
        option.textContent = textContent;
        breezewikiHostSelect.appendChild(option);
        if (option.value === host) {
          breezewikiHostSelect.value = host;
        }
      }
      // Store BreezeWiki host details
      chrome.storage.sync.set({ 'breezewikiHost': host });
    }
  });
}

// Set power setting
function setPower(setting, storeSetting = true) {
  if (storeSetting) {
    chrome.storage.local.set({ 'power': setting });
  }
  var powerImage = document.getElementById('powerImage');
  powerImage.src = 'images/power-' + setting + '.png';
  powerImage.alt = 'Indie Wiki Buddy is ' + setting;
  if (setting === 'on') {
    document.getElementById('powerCheckbox').checked = true;
  } else {
    document.getElementById('powerCheckbox').checked = false;
  }

  chrome.runtime.sendMessage({
    action: 'updateIcon',
    value: setting
  });
}

// Set notifications setting
function setNotifications(setting, storeSetting = true) {
  if (storeSetting) {
    chrome.storage.sync.set({ 'notifications': setting });
  }
  if (setting === 'on') {
    document.getElementById('notificationsCheckbox').checked = true;
  } else {
    document.getElementById('notificationsCheckbox').checked = false;
  }
}

// Set search filter setting
function setSearchSetting(setting, storeSetting = true) {
  if (storeSetting) {
    chrome.storage.sync.set({ 'searchSetting': setting });
  }
  if (setting === 'hide') {
    document.getElementById('searchFilteringHideRadio').checked = true;
  } else if (setting === 'nothing') {
    document.getElementById('searchFilteringNothingRadio').checked = true;
  } else {
    document.getElementById('searchFilteringReplaceRadio').checked = true;
  }
}

// Set BreezeWiki settings
function setBreezeWiki(setting, storeSetting = true) {
  if (storeSetting) {
    chrome.storage.sync.set({ 'breezewiki': setting });
  }
  if (setting === 'on') {
    document.getElementById('breezewikiCheckbox').checked = true;
  } else {
    document.getElementById('breezewikiCheckbox').checked = false;
  }
  var breezewikiHost = document.getElementById('breezewikiHost');
  if (setting === 'on') {
    breezewikiHost.style.display = 'block';
    chrome.storage.sync.get({ 'breezewikiHost': null }, function (host) {
      if (!host.breezewikiHost) {
        fetch('https://bw.getindie.wiki/instances.json')
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Indie Wiki Buddy failed to get BreezeWiki data.');
          }).then((breezewikiHosts) => {
            breezewikiHosts = breezewikiHosts.filter(host =>
              chrome.runtime.getManifest().version.localeCompare(host.iwb_version,
                undefined, 
                { numeric: true, sensitivity: 'base' }
              ) >= 0
            );
            // Check if BreezeWiki's main site is available
            let breezewikiMain = breezewikiHosts.filter(host => host.instance === 'https://breezewiki.com');
            if (breezewikiMain.length > 0) {
              host.breezewikiHost = breezewikiMain[0].instance;
            } else {
              // If BreezeWiki.com is not available, set to a random mirror
              try {
                host.breezewikiHost = breezewikiHosts[Math.floor(Math.random() * breezewikiHosts.length)].instance;
              } catch (e) {
                console.log('Indie Wiki Buddy failed to get BreezeWiki data: ' + e);
              }
            }
            chrome.storage.sync.set({ 'breezewikiHost': host.breezewikiHost });
            chrome.storage.sync.set({ 'breezewikiHostOptions': breezewikiHosts });
            chrome.storage.sync.set({ 'breezewikiHostFetchTimestamp': Date.now() });
            document.getElementById('breezewikiHostSelect').value = host.breezewikiHost;
          }).catch((e) => {
            console.log('Indie Wiki Buddy failed to get BreezeWiki data: ' + e);

            // If fetch fails and no host is set, default to breezewiki.com:
            if (!host) {
              chrome.storage.sync.set({ 'breezewikiHost': 'https://breezewiki.com'});
            }
          });
      } else {
        document.getElementById('breezewikiHostSelect').value = host.breezewikiHost;
      }
    });
  } else {
    breezewikiHost.style.display = 'none';
  }
}

// Main function that runs on-load
document.addEventListener('DOMContentLoaded', function () {  
  // If running Chromium, show warning about service worker bug
  if (navigator.userAgent.match(/Chrom[e|ium]/)) {
    const notificationBannerChromeBug = document.getElementById('notificationBannerChromeBug');
    chrome.storage.local.get({ 'hideChromeBugNote': false }, function (item) {
      if (!item.hideChromeBugNote) {
        notificationBannerChromeBug.style.display = 'block';

        document.getElementById('chromeBugHideLink').addEventListener('click', function () {
          chrome.storage.local.set({ 'hideChromeBugNote': true });
          notificationBannerChromeBug.style.display = 'none';
        });
      }
    });
  }

  // If running Opera, show note about search engine access
  if (navigator.userAgent.match(/OPR\//)) {
    const notificationBannerOpera = document.getElementById('notificationBannerOpera');
    chrome.storage.local.get({ 'hideOperaPermissionsNote': false }, function (item) {
      if (!item.hideOperaPermissionsNote) {
        notificationBannerOpera.style.display = 'block';

        document.getElementById('operaPermsHideLink').addEventListener('click', function () {
          chrome.storage.local.set({ 'hideOperaPermissionsNote': true });
          notificationBannerOpera.style.display = 'none';
        });
      }
    });
  }

  loadBreezeWikiOptions();

  // Listener for settings page in new tab:
  document.getElementById('openSettings').addEventListener('click', function () {
    chrome.tabs.create({'url': chrome.runtime.getURL('settings.html')});
    window.close();
  });

  // Set setting toggle values:
  chrome.storage.local.get({ 'power': 'on' }, function (item) {
    setPower(item.power, false);
  });
  chrome.storage.sync.get({ 'notifications': 'on' }, function (item) {
    setNotifications(item.notifications, false);
  });
  chrome.storage.sync.get({ 'searchSetting': 'replace' }, function (item) {
    setSearchSetting(item.searchSetting, false);
  });
  chrome.storage.sync.get({ 'breezewiki': 'off' }, function (item) {
    setBreezeWiki(item.breezewiki, false);

    // Load BreezeWiki options if BreezeWiki is enabled
    if(item.breezewiki === 'on') {
      loadBreezeWikiOptions();
    }
  });

  // Add event listeners for setting toggles
  document.getElementById('powerCheckbox').addEventListener('change', function () {
    chrome.storage.local.get({ 'power': 'on' }, function (item) {
      if (item.power === 'on') {
        setPower('off');
      } else {
        setPower('on');
      }
    });
  });
  document.getElementById('notificationsCheckbox').addEventListener('change', function () {
    chrome.storage.sync.get({ 'notifications': 'on' }, function (item) {
      if (item.notifications === 'on') {
        setNotifications('off');
      } else {
        setNotifications('on');
      }
    });
  });
  document.getElementById('searchFilteringReplaceRadio').addEventListener('change', function () {
    setSearchSetting('replace');
  });
  document.getElementById('searchFilteringHideRadio').addEventListener('change', function () {
    setSearchSetting('hide');
  });
  document.getElementById('searchFilteringNothingRadio').addEventListener('change', function () {
    setSearchSetting('nothing');
  });
  document.getElementById('breezewikiCheckbox').addEventListener('change', function () {
    chrome.storage.sync.get({ 'breezewiki': 'off' }, function (item) {
      if (item.breezewiki === 'on') {
        setBreezeWiki('off');
      } else {
        setBreezeWiki('on');
        loadBreezeWikiOptions();
      }
    });
  });
  var breezewikiHostSelect = document.getElementById("breezewikiHostSelect");
  breezewikiHostSelect.addEventListener('change', function () {
    chrome.storage.sync.set({ 'breezewikiHost': breezewikiHostSelect.value });
  });
});