import { Linking, Platform, AppState } from 'react-native'; // eslint-disable-line import/no-unresolved, max-len
import SafariView from 'react-native-safari-view';

let appStateTimeout;
let previousLinkingCallback;
let previousAppStateCallback;

const cleanup = () => {
  clearTimeout(appStateTimeout);

  if (previousLinkingCallback) {
    Linking.removeEventListener('url', previousLinkingCallback);
    previousLinkingCallback = null;
  }

  if (previousAppStateCallback) {
    AppState.removeEventListener('change', previousAppStateCallback);
    previousAppStateCallback = null;
  }
};

const _openUrl = (authUrl) => {
  if (Platform.OS === 'ios') {
    return SafariView.show({
      url: authUrl,
      readerMode: false,
      fromBottom: true,
      tintColor: '#000',
      barTintColor: '#fff'
    });
  } else {
    return Linking.openURL(authUrl);
  }
};

export const dance = (authUrl) => {
  cleanup();

  return _openUrl(authUrl)
    .then(() => new Promise((resolve, reject) => {
      const handleUrl = (url) => {
        if (!url || url.indexOf('fail') > -1) {
          reject(url);
        } else {
          resolve(url);
        }
      };

      const linkingCallback = ({ url }) => {
        cleanup();
        handleUrl(url);
      };

      Linking.addEventListener('url', linkingCallback);
      previousLinkingCallback = linkingCallback;

      const appStateCallback = (state) => {
        // Give time for Linking event to fire.
        appStateTimeout = setTimeout(() => {
          if (state === 'active') {
            cleanup();
            reject('cancelled');
          }
        }, 100);
      };

      AppState.addEventListener('change', appStateCallback);
      previousAppStateCallback = appStateCallback;
    }));
};

export const request = fetch;
