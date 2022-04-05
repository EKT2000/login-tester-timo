import {
  Animated,
  Keyboard,
  Modal, Platform,
  SafeAreaView, ScrollView,
  StyleSheet, Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {KeyboardHook} from "./hooks/KeyboardHook";
import {LoginService} from "./services/LoginService";
import React from "react";
import dayjs from "dayjs";

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
  const loginService = useMemo(() => new LoginService(),[]);
  const [diffTotal, setDiffTotal] = useState(0);
  const [diffCompany, setDiffCompany] = useState(0);
  const [diffLogin, setDiffLogin] = useState(0);
  const [modalShown, setModalShown] = useState(false);
  const [logs, setLogs] = useState([] as string[]);
  const [legacy, setLegacy] = useState(true);
  const logRef = useRef({} as any);

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
    const begin = dayjs()
    Keyboard.dismiss();
    const serverUrl = await loginService.findServer(loginValues,setLogs);
    const middle = dayjs();
    setDiffCompany(middle.diff(begin))
    await loginService.loginUser(loginValues, setLogs, legacy, serverUrl);
    const end = dayjs()
    setDiffLogin(end.diff(middle));
    setDiffTotal(end.diff(begin));
  },[loginService, loginValues, legacy])


  useEffect(() => {
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

    if (keyboardHeight > 0) {
      !keyboardUp ? moveButtonUp() : null;
    } else {
      moveButtonDown();
    }
  }, [animHeight, keyboardHeight, keyboardUp])

  const dismissModal = useCallback(() => {
    setModalShown(false);
    setDiffTotal(0);
    setDiffCompany(0)
    setDiffLogin(0)
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
        <Animated.View style={[{marginBottom: Platform.OS == "ios" ? animHeight : 0, width: '90%'}]}>
          <TouchableOpacity onPress={() => loginUser()} style={styles.loginButton}>
            <Text style={{color: '#fff', fontWeight:"bold"}}>Test Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
      <Modal animationType={"slide"} presentationStyle={"pageSheet"} visible={modalShown}>
        <View style={modalStyles.container}>
          <Text style={{fontSize: 32, fontWeight: "bold"}}>Console</Text>
          <View style={{flexDirection: "row", width: '100%', justifyContent: 'space-around'}}>
            <View style={modalStyles.counterContainer}>
              <Text>Company fetch</Text>
              <Text style={{fontSize: 34}}>{diffCompany}</Text>
              <Text style={{fontSize: 12, color: '#ccc'}}>ms</Text>
            </View>
            <View style={modalStyles.counterContainer}>
              <Text>Login fetch</Text>
              <Text style={{fontSize: 34}}>{diffLogin}</Text>
              <Text style={{fontSize: 12, color: '#ccc'}}>ms</Text>
            </View>
            <View style={modalStyles.counterContainer}>
              <Text>Total</Text>
              <Text style={{fontSize: 34}}>{diffTotal}</Text>
              <Text style={{fontSize: 12, color: '#ccc'}}>ms</Text>
            </View>
          </View>
            <ScrollView ref={logRef} onContentSizeChange={() => logRef.current.scrollToEnd({animated: true})} contentContainerStyle={{padding: 10}} style={modalStyles.console}>
              {logs.map(log => {
                return <Text key={log + new Date().toISOString()}>{log}</Text>
              })}
            </ScrollView>
          <TouchableOpacity onPress={() => dismissModal()} style={{...styles.loginButton, backgroundColor: '#ff0000'}}>
            <Text style={{color: '#fff', fontWeight:"bold"}}>Close</Text>
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
    marginVertical: 15,
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
