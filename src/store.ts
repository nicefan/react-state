import { createModel } from "hox";
import { useEffect, useState } from "react";

class State {
    name = ''
    money = 0
    updateTime = new Date()
}
function useMyModel() {
    const [myData, setMyData] = useState(new State())
    const dispatchMoney = (n: number) => {
        dispatch('money', myData.money + n)
        // dispatch('updateTime', new Date())
    }
    // const {money} = myData
    // useEffect(() => {
    //     dispatch('updateTime', new Date())
    // }, [myData.money])

    function dispatch<T extends keyof State>(key: T, val: State[T]) {
        setMyData({
            ...myData,
            [key]: val
        })
    }
    return {
        myData,
        money: myData.money,
        dispatchMoney,
        setMyData,
        dispatch
    }
}

export default createModel(useMyModel)