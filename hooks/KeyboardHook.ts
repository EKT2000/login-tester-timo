import {useEffect, useState} from "react";
import {Keyboard} from "react-native";

export const KeyboardHook = () => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideListener = Keyboard.addListener('keyboardWillHide', (e) => {
            setKeyboardHeight(0);
        });

        return () => {
            showListener.remove();
            hideListener.remove();
        }
    }, [keyboardHeight, setKeyboardHeight])

    return keyboardHeight;

}
