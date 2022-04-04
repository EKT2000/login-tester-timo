import {useCallback, useEffect, useState} from "react";
import dayjs from "dayjs";

export const TimerHook = () => {
    const [begin, setBegin] = useState(new Date());
    const [time, setTime] = useState("0")
    const [timeRunning, setTimeRunning] = useState(true);

    const startTime = () => {
        setTime("0");
        setBegin(new Date());
        setTimeRunning(true);
    }

    const stopTime = () => {
        console.log("hi")
        setTimeRunning(false);
    }

    const refreshClock = useCallback(() => {
        if (timeRunning) {
            const dateBegin = dayjs(begin);
            const currDate = dayjs(new Date());
            const diffMS = currDate.diff(dateBegin, "ms");
            setTime(diffMS.toString())
        }
    }, [begin, timeRunning])


    useEffect(() => {
        if (timeRunning) {
            const interval = setInterval(refreshClock, 20)
            return () => {
                clearInterval(interval)
            }
        }
    }, [refreshClock])


    return {time, startTime, stopTime};


}
