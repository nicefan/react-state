import React, { useCallback, useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import useMyModel from './store'
import {useCreateState} from './myState';

const Subb = ({ money, updateTime, dispatchMoney }: any) => {
  // if (money === 0) {
  //   dispatchMoney(1)
  // } 

  console.log(updateTime)
  return (
      <div>
        <div>金额 {money} </div>
        <div>
          <button onClick={() => dispatchMoney(1)}>加</button>
          <button onClick={() => dispatchMoney(-1)}>减</button>
        </div>
        <div>时间 {updateTime.toLocaleString()} </div>
      </div>

  )
}

const useCount = () => {
  const { myData: {money}} = useMyModel()
  useEffect(() => {
    setCount(money)
  },[money])
  const [count, setCount] = useState<number>(0)
  console.log('useMoney', count)
  const addCount = useCallback((n:number) => {
    setCount(o => o + n)
  },[])
  return {
    count,
    addCount
  }
}
const useSubc = () => {
  // const useWatch = createState(useCount)
  const state = useCreateState({ count: 0, username: 's' })
  const { count } = state.$depend(_ => ({count: _.count, name:_.username}))
  const formBinds = state.$createFormBinds(_ => ({name: _.username}))
  const addCount = (n) => {
    state.$set({count: count + n, username: state.username + n})
  }
  console.log(count)
  return {count, addCount, formBinds}
}

function App() {
  const { myData, dispatchMoney, dispatch } = useMyModel()
  const { name, money, updateTime } = myData
  const {addCount, formBinds} = useSubc()
  if (!name) {
    dispatch('name', '新用户')
  } 
  const change = (n:number) => {
    addCount(n)
    // money < 2 &&
    //   dispatchMoney(n)
  }
  console.log(myData)
  let sort = 1
  useEffect(() => {
    sort += 1 
  }, [name])
  return (
    <div className="App">
      <header className="App-header">
        <h2>户名： {name}</h2>
        <input {...formBinds.name} />
        <Subb money = {money} updateTime={updateTime} dispatchMoney={change}></Subb>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
