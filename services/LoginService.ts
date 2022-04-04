import {LoginModel} from "../App";
import axios, {AxiosResponse} from "axios";
import React, {useReducer} from "react";

export class LoginService {

    private timoBase = "https://timo24.de";

    public async loginUser(model: LoginModel, setLog: React.Dispatch<React.SetStateAction<string[]>>, legacy: boolean) {
        const adminResponse = await axios.get(this.timoBase + "/timoadmin/login?f=" + model.company);
        setLog((prevState: string[]) => {
            prevState.push("[" + new Date().toISOString() + "]" + JSON.stringify(adminResponse));
            return prevState;
        })
        const serverURL = adminResponse.data.replace(/\s/g, "");
        let response : AxiosResponse;
        console.log(legacy)
        if (legacy) {
            const fd = new FormData();
            fd.append("username", "admin");
            fd.append("company", "standalone");
            fd.append("password", "99999999");
            fd.append("pushNotificationToken", 'f');
            const formString = "username=" + model.username + "&company=" + model.company
                + "&password=" + model.password;
            console.log(formString)
            console.log(serverURL + "/services/rest/auth/checkLogin")
            response = await axios.post(serverURL + "services/rest/auth/checkLogin", formString, {
                headers: {'content-type': "application/x-www-form-urlencoded"},
            })
            setLog((prevState: string[]) => {
                prevState.push("[" + new Date().toISOString() + "]" + JSON.stringify(response));
                return prevState;
            })
        } else {
            response = await axios.post(serverURL + "services/rest/auth/checkLoginNew", {
                data: JSON.stringify({
                    username: model.username,
                    password: model.password,
                    company: model.company,
                    pushNotificationToken: ""
                }),
                headers: {
                    'content-type': "application/json"
                },
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
