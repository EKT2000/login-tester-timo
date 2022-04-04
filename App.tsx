import {
  Animated,
  Keyboard,
  Modal,
  SafeAreaView, ScrollView,
  StyleSheet, Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {KeyboardHook} from "./hooks/KeyboardHook";
import {TimerHook} from "./hooks/TimerHook";
import {LoginService} from "./services/LoginService";
import * as Clipboard from 'expo-clipboard';

export interface LoginModel {
  username: string,
  password: string,
  company: string,
  pushNotificationToken: string
}

export const generalShadow = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.22,
  shadowRadius: 2.22,

  elevation: 3,
}

export default function App() {

  const keyboardHeight = KeyboardHook();
  const [keyboardUp, setKeyboardUp] = useState(false);
  const [loginValues, setLoginValues] = useState({} as LoginModel)
  const animHeight = useRef(new Animated.Value(0)).current;
  const loginService = new LoginService();
  const {time, startTime, stopTime} = TimerHook();
  const [modalShown, setModalShown] = useState(false);
  const [logs, setLogs] = useState([] as string[]);
  const [legacy, setLegacy] = useState(true);

  const changeValue = useCallback((field: string, value: string) => {
    setLoginValues((prevState: LoginModel) => {
      switch (field) {
        case "company":
          return {...prevState, company: value};
        case "username":
          return {...prevState, username: value};
        case "password":
          return {...prevState, password: value};
      }
      return {...prevState, };
    })
  }, []);

  const loginUser = useCallback(async () => {
    setModalShown(true);
    startTime();
    Keyboard.dismiss();
    await loginService.loginUser(loginValues, setLogs, legacy);
    stopTime();
  },[loginValues])

  useEffect(() => {
    if (keyboardHeight > 0) {
      !keyboardUp ? moveButtonUp() : null;
    } else {
      moveButtonDown();
    }
  }, [keyboardHeight])

  const moveButtonUp = () => {
    Animated.spring(animHeight, {toValue: 300, useNativeDriver: false, bounciness: 1}).start(() => {
      setKeyboardUp(true);
    });
  }

  const moveButtonDown = () => {
    Animated.spring(animHeight, {toValue: 0, useNativeDriver: false}).start(() => {
      setKeyboardUp(false);
    });
  }

  const dismissModal = useCallback(() => {
    setModalShown(false);
  }, [])

  const copyText = useCallback(() => {
    Clipboard.setString(logs.join());
  }, [])

  return (
    <SafeAreaView style={styles.app}>
      <TouchableOpacity activeOpacity={1} style={styles.container} onPress={() => Keyboard.dismiss()}>
        <View style={styles.loginInputContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-around'}}>
            <Text style={{fontWeight: 'bold'}}>Use Legacy Login</Text>
            <Switch onValueChange={(prev) => setLegacy(prev)} value={legacy}/>
          </View>
          <TextInput placeholder={"Company"} onChangeText={(val) => {changeValue("company", val)}} defaultValue={loginValues.company} style={styles.textInput} value={loginValues.company}/>
          <TextInput placeholder={"Username"} onChangeText={(val) => {changeValue("username", val)}} defaultValue={loginValues.username} style={styles.textInput} value={loginValues.username}/>
          <TextInput placeholder={"Password"} onChangeText={(val) => {changeValue("password", val)}} defaultValue={loginValues.password} style={styles.textInput} value={loginValues.password} secureTextEntry={true}/>
        </View>
        <Animated.View style={[{marginBottom: animHeight, width: '90%'}]}>
          <TouchableOpacity onPress={() => loginUser()} style={styles.loginButton}>
            <Text style={{color: '#fff', fontWeight:"bold"}}>Test Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
      <Modal animationType={"slide"} presentationStyle={"pageSheet"} visible={modalShown}>
        <View style={modalStyles.container}>
          <Text style={{fontSize: 32, fontWeight: "bold"}}>Console</Text>
          <View style={modalStyles.counterContainer}>
            <Text style={{fontSize: 34}}>{time}</Text>
            <Text style={{fontSize: 12, color: '#ccc'}}>ms</Text>
          </View>
            <ScrollView contentContainerStyle={{padding: 10}} style={modalStyles.console}>
              {logs.map(log => {
                return <Text key={log + new Date().toISOString()}>{log}</Text>
              })}
            </ScrollView>
          <TouchableOpacity onPress={() => dismissModal()} style={{...styles.loginButton, backgroundColor: '#ff0000'}}>
            <Text style={{color: '#fff', fontWeight:"bold"}}>Test Login</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 20,
    backgroundColor: '#fff'
  },
  console: {
    flex: 1,
    margin: 15,
    backgroundColor: '#e1e1e1',
    borderRadius: 5
  },
  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
})

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    justifyContent: "space-around",
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  loginInputContainer: {
    width: '90%',
    alignItems: 'center',
  },
  textInput: {
    padding: 10,
    width: '90%',
    marginVertical: 25,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  loginButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#2fe53d',
    ...generalShadow
  }
});
