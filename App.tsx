import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, PermissionsAndroid } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import RNFS from 'react-native-fs';
import AndroidShell from 'react-native-android-shell';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

class App extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchResult: '',
      searchQuery: '',
      copyPath: '',
      copyResult: ''
    };
  }

  requestExternalPerms = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ])
        .catch(error => {
          console.log(error);
        });

    } catch (err) {
      console.warn(err);
    }
  };

  componentDidMount() {
    this.requestExternalPerms();
  }

  getPackagePath = (name: string) => {
    AndroidShell.executeCommand("pm list packages", (result: string) => {
      const lines = result.split('\n');
      lines.forEach((line, index) => {
        if (line.includes(name)) {
          const packageName = line.replace('package:', '');
          AndroidShell.executeCommand("pm path " + packageName, (result: string) => {
            this.setState({ searchResult: result.replace('package:', '').replace('\n', '') })
          });
        }
      });
    });
  }

  copyToClipboard = (path: string) => {
    Clipboard.setString(path);
  };

  copyAPKToDownloadDir = (path: string) => {
    RNFS.copyFile(path, RNFS.ExternalStorageDirectoryPath + '/Download/exported_apk.apk')
      .then(() => {
        this.setState({ copyResult: "File has been copied successfully" });
      })
      .catch(error => {
        console.log(error);
        this.setState({ copyResult: "[ERROR]: " + error.message });
      })
  }

  render() {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#1B1B1B', alignItems: 'center' }}>
        <View style={{ paddingVertical: hp(3) }}>
          <Text style={{ color: 'orange', fontSize: wp(5), fontWeight: 'bold' }}>APK Puller</Text>
        </View>
        <View style={{ borderWidth: 1, borderRadius: 10, borderColor: 'orange', padding: wp(5), width: wp(80) }}>
          <Text style={{ color: 'orange', fontSize: wp(4) }}>Search for APK path</Text>
          <Text style={{ color: 'orange', fontSize: wp(3) }}>Enter part of name of targeted package</Text>
          <TextInput
            style={{ marginTop: hp(2), width: '100%', borderWidth: 1, borderRadius: 10, borderColor: 'orange', color: 'white' }}
            placeholder="type here"
            onSubmitEditing={(e) => {
              this.getPackagePath(e.nativeEvent.text);
            }}
            onChangeText={(text) => this.setState({ searchQuery: text })}
          />
          <TouchableOpacity
            style={{
              marginVertical: hp(2), paddingVertical: hp(1), width: '100%', borderRadius: 10, backgroundColor: 'orange',
              justifyContent: 'center', alignItems: 'center'
            }}
            onPress={() => this.getPackagePath(this.state.searchQuery)}
          >
            <Text style={{ color: '#1B1B1B', fontSize: wp(4) }}>Search</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: 'orange', fontSize: wp(4) }}>Result:</Text>
            <Text style={{ color: 'orange', fontSize: wp(2.4) }}>  (tap on the box to copy to clipboard)</Text>
          </View>
          <TouchableOpacity
            style={{ borderWidth: 1, borderRadius: 10, borderColor: 'orange', padding: wp(5), width: '100%' }}
            onPress={() => this.copyToClipboard(this.state.searchResult)}
          >
            <Text style={{ color: 'white', fontSize: wp(2.5) }}>{this.state.searchResult}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ borderWidth: 1, borderRadius: 10, borderColor: 'orange', padding: wp(5), width: wp(80), marginTop: hp(2) }}>
          <Text style={{ color: 'orange', fontSize: wp(4) }}>Pull installed APK file to Downloads</Text>
          <Text style={{ color: 'orange', fontSize: wp(3) }}>Enter full path of `base.apk` you targeted</Text>
          <TextInput
            style={{ marginTop: hp(2), width: '100%', borderWidth: 1, borderRadius: 10, borderColor: 'orange', color: 'white' }}
            placeholder="type path here"
            onChangeText={(text) => this.setState({ copyPath: text })}
          />
          <TouchableOpacity
            style={{
              marginVertical: hp(2), paddingVertical: hp(1), width: '100%', borderRadius: 10, backgroundColor: 'orange',
              justifyContent: 'center', alignItems: 'center'
            }}
            onPress={() => this.copyAPKToDownloadDir(this.state.copyPath)}
          >
            <Text style={{ color: '#1B1B1B', fontSize: wp(4) }}>Pull</Text>
          </TouchableOpacity>
          <Text style={{ color: 'orange', fontSize: wp(4) }}>Result:</Text>
          <View style={{ borderWidth: 1, borderRadius: 10, borderColor: 'orange', padding: wp(5), width: '100%' }}>
            <Text style={{ color: 'white', fontSize: wp(2.5) }}>{this.state.copyResult}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}

export default App;