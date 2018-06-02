import {
  Linking,
  Platform
} from 'react-native'; // eslint-disable-line import/no-unresolved, max-len
import SafariView from 'react-native-safari-view';

let previousOnLinkChange;

export const dance = (authUrl) => {
  // Use SafariView on iOS
  if (Platform.OS === 'ios') {
    if (previousOnLinkChange) {
      Linking.removeEventListener('url', previousOnLinkChange);
    }
    return SafariView.show({
      url: authUrl,
      readerMode: false,
      fromBottom: true,
      tintColor: '#000',
      barTintColor: '#fff'
    }).then(() => new Promise((resolve, reject) => {
      const handleUrl = (url) => {
        if (!url || url.indexOf('fail') > -1) {
          reject(url);
        } else {
          resolve(url);
        }
        SafariView.dismiss();
      };

      const onLinkChange = ({url}) => {
        Linking.removeEventListener('url', onLinkChange);
        previousOnLinkChange = undefined;
        handleUrl(url);
      };

      Linking.addEventListener('url', onLinkChange);

      previousOnLinkChange = onLinkChange;
    }));
  }
  // Or Linking.openURL on Android
  else {
    if (previousOnLinkChange) {
      Linking.removeEventListener('url', previousOnLinkChange);
    }
    return Linking.openURL(authUrl)
      .then(() => new Promise((resolve, reject) => {
        const handleUrl = (url) => {
          if (!url || url.indexOf('fail') > -1) {
            reject(url);
          } else {
            resolve(url);
          }
        };

        const onLinkChange = ({url}) => {
          Linking.removeEventListener('url', onLinkChange);
          previousOnLinkChange = undefined;
          handleUrl(url);
        };

        Linking.addEventListener('url', onLinkChange);

        previousOnLinkChange = onLinkChange;
      }));
  }
};

export const request = fetch
