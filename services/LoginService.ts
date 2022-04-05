import {LoginModel} from "../App";
import axios, {AxiosResponse} from "axios";
import React from "react";

export class LoginService {

    private timoBase = "https://timo24.com";


    public async findServer(model: LoginModel, setLog: React.Dispatch<React.SetStateAction<string[]>>) {
        const adminResponse = await axios.get(this.timoBase + "/timoadmin/login?f=" + model.company);
        setLog((prevState: string[]) => {
            prevState.push("[" + new Date().toISOString() + "]" + JSON.stringify(adminResponse));
            return prevState;
        })
        return adminResponse.data.replace(/\s/g, "");
    }

    public async loginUser(model: LoginModel, setLog: React.Dispatch<React.SetStateAction<string[]>>, legacy: boolean, serverURL: string) {
        let response : AxiosResponse | boolean;
        if (legacy) {
            const fd = new FormData();
            fd.append("username", "admin");
            fd.append("company", "standalone");
            fd.append("password", "99999999");
            fd.append("pushNotificationToken", 'f');
            const formString = "username=" + model.username + "&company=" + model.company
                + "&password=" + model.password;
            response = await axios.post(serverURL + "services/rest/auth/checkLogin", formString, {
                headers: {'content-type': "application/x-www-form-urlencoded"},
            }).catch((e) => {
                setLog((prevState: string[]) => {
                    prevState.push("[" + new Date().toISOString() + "]" + JSON.stringify(e));
                    return prevState;
                })
                return false;
            })
            setLog((prevState: string[]) => {
                prevState.push("[" + new Date().toISOString() + "]" + JSON.stringify(response));
                return prevState;
            })
        } else {
            response = await axios.post(serverURL + "services/rest/auth/checkLoginNew", null,{
                data: JSON.stringify({
                    username: model.username,
                    password: model.password,
                    company: model.company,
                    pushNotificationToken: ""
                }),
                headers: {
                    'content-type': "application/json"
                },
            }).catch(e => {
                setLog((prevState: string[]) => {
                    prevState.push("[" + new Date().toISOString() + "]" + JSON.stringify(e));
                    return prevState;
                })
                return false;
            })
            setLog((prevState: string[]) => {
                prevState.push("[" + new Date().toISOString() + "]" + JSON.stringify(response));
                return prevState;
            })
        }
        //console.log(response);
        return true;
    }

}
