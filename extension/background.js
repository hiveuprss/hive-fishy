// CONFIGURATION

hiveTx.config.node = 'https://anyx.io'

DEFAULT_BADGE_ICON = 'assets/hive32.png'
DEFAULT_BADGE_TEXT = ''
DEFAULT_BADGE_COLOR = 'black'


FISH_BADGE_ICONS = {
  'plankton': 'assets/plankton32.png',
  'redfish':  'assets/redfish32.png',
  'minnow':   'assets/minnow32.png',
  'dolphin':  'assets/dolphin32.png',
  'orca':     'assets/orca32.png',
  'whale':    'assets/whale32.png'
}

FISH_BADGE_COLORS = {
  'plankton': 'purple',
  'redfish':  'red',
  'minnow':   'silver',
  'dolphin':  'green',
  'orca':     'black',
  'whale':    'blue'
}

FISH_BADGE_TEXT = {
  'plankton': 'P',
  'redfish':  'R',
  'minnow':   'M',
  'dolphin':  'D',
  'orca':     'O',
  'whale':    'W'
}

URL_FILTERS = {url: [{hostEquals:'peakd.com'},
         {hostEquals:'hive.blog'},
         {hostEquals:'leofinance.io'},
         {hostEquals:'ecency.com'}]}


// Global state

ACCOUNT_NAME = 'None'
ACCOUNT_HIVE_POWER = ''
ACCOUNT_FISH_NAME = ''


// Chrome event listeners

chrome.webNavigation.onBeforeNavigate.addListener(
  res => {
    let url = new URL(res['url'])
    handleNavigation(url)
  },
  URL_FILTERS)


chrome.webNavigation.onHistoryStateUpdated.addListener(
  res => {
    let url = new URL(res['url'])
    handleNavigation(url)
  },
  URL_FILTERS)

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.greeting == "getInfo")
      sendResponse({accountname: ACCOUNT_NAME, hivepower: ACCOUNT_HIVE_POWER, fishname: ACCOUNT_FISH_NAME});
  });

// helper functions

function handleNavigation(url) {
  // if it's not a user profile, reset
    if (!url.pathname.includes('@')) {
      console.log('Reset')
      resetBadge()
      return
    }

    let accountname = url.pathname.split('@')[1].split('/')[0]
    console.log(`NAME: ${accountname}`)
    getVestingShares(accountname)
}


function convertVestsToHivePower(vesting_shares) {
 // TODO : call condenser_api.get_dynamic_global_properties to get real-time
 // values for total_vesting_fund_steem and total_vesting_shares

 //total_vesting_fund_steem * user_vests / total_vesting shares
 return 137122453.377 * vesting_shares / 265195898567.901155
}

function getFishName (hive_power) {
  if (hive_power > 500000) {
    return 'whale'
  } else if (hive_power > 50000){
    return 'orca'
  } else if (hive_power > 5000){
    return 'dolphin'
  } else if (hive_power > 500){
    return 'minnow'
  } else if (hive_power > 100){
    return 'redfish'
  } else {
    return 'plankton'
  }
}

function resetBadge () {
  ACCOUNT_NAME = 'None'
  ACCOUNT_HIVE_POWER = ''
  ACCOUNT_FISH_NAME = ''


  chrome.browserAction.setBadgeText(
    {text: DEFAULT_BADGE_TEXT}
  )

  chrome.browserAction.setBadgeBackgroundColor(
    {color: DEFAULT_BADGE_COLOR}
  )

  chrome.browserAction.setIcon(
    {path: DEFAULT_BADGE_ICON}
  )
}

function updateBadge (fish_name) {
  chrome.browserAction.setBadgeText(
    {text: FISH_BADGE_TEXT[ fish_name ]}
  )

  chrome.browserAction.setBadgeBackgroundColor(
    {color: FISH_BADGE_COLORS[ fish_name ]}
  )

  chrome.browserAction.setIcon(
    {path: FISH_BADGE_ICONS[ fish_name ]}
  )
}

function getVestingShares(account_name) {
  hiveTx
    .call('condenser_api.get_accounts', [[account_name]])
    .then(res => {
      let vestingshares = parseFloat(res['result'][0]['vesting_shares'])
      console.log(`VESTS: ${vestingshares}`)
      let hivepower = convertVestsToHivePower(vestingshares)
      console.log(`HP: ${hivepower}`)
      let fishname = getFishName(hivepower)
      console.log(`FISH: ${fishname}`)
      updateBadge(fishname)

      ACCOUNT_NAME = account_name
      ACCOUNT_HIVE_POWER = hivepower
      ACCOUNT_FISH_NAME = fishname
    })
}






