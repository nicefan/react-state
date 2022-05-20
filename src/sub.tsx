import { useCounter } from "./counter"

export default function Sub() {
  const {count, increment} = useCounter()
  return <div>
    <hr/>
    <h2>{count}</h2>
    <button onClick={increment}>increment</button>
  </div>
}