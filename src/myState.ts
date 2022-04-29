import { useMemo, useReducer, useRef, useState } from "react"
function createStore() {

}

class BaseState<T extends object> {
  private _data: T
  #dep = new Map()
  _changeFlag = false
  get _dep() {return this.#dep}
  private _keys = []
  private _proxy: T
  constructor(data: T, private _updater:()=>void) {
    this._data = data
    this._proxy = createProxy(this._data, this)
    this._keys = Object.keys(data)
    for (const k of this._keys) {
      Object.defineProperty(this, k, { get: () => data[k]});
    }
  }
  // #changeEvt = () =>{}
  // bindChange(updater:()=>void) {
  //   this.#changeEvt = updater
  // }
  _emitChange() {
    if (!this._changeFlag) {
      this._changeFlag = true
      Promise.resolve().then(() => {
        this._updater()
        this._changeFlag = false
      })
    }
  }
  _subscriber() {

  }
  $depend<R extends (data: T) => any>(selector: R) {
    const subs = []
    const proxy = subscriber(this._data, (key) => subs.push(key))
    const res = selector(proxy)
    if (subs.length) {
      subs.forEach(key => {
        this.#dep.set(key, this._data[key])
      })
    } else {
      // 全部更新
    }
    return res
  }
  $set(data: Partial<T>) {
    for (const key in data) {
      this._proxy[key] = data[key]
    }
    // this._updater()
  }
  #binds
  $createFormBinds<R extends (data: T) => any>(selector: R) {
    if (this.#binds) {
      Object.values(this.#binds).forEach((item:any) => {
        item.input.value = this._data[item.key]
      })
      return this.#binds
    }
    const proxy = new Proxy({}, {
      get(target, key: string) {
        return key
      }
    }) as T
    const res = this.#binds = selector(proxy)
    //TODO:返回自身时。。。
    
    Object.keys(res).forEach(name => {
      const prop = res[name]
      let ref
      let defaultValue = this._data[prop]
      res[name] = {
        key:prop,
        ref:(input) => ref = input,
        defaultValue,
        onInput: (e) => {
          this._proxy[prop] = e.target.value
        } 
      }
      Object.defineProperty(res[name], 'input', {
        get(){ return ref}
      })
    })
    return res
  }
}
function subscriber(data, listener:(key:string)=>void) {
  return new Proxy(data, {
    get(target, key:string) {
      listener(key)
      return target[key]
    }
  })
}
function createProxy<T extends object>(data: T, container: BaseState<T>) {
  const dep = container._dep
  const proxy = new Proxy(data, {
    set(target, key, value) {
      if (dep.has(key) && target[key] !== value) {
        container._emitChange()
        dep.set(key, value)
      }
      target[key] = value
      return true
    },
    // get(target, key) {
    //   if (!dep.has(key)) {
    //     dep.set(key, target[key])
    //   }
    //   return dep.get(key)
    // }
  })
  return proxy
}

class Handler {
  private dep = new Map()
  hasChange = false
  set(target, key, value) {
    if (this.dep.has(key) && target[key] !== value) {
      this.hasChange = true
      this.dep.set(key, value)
    }
    target[key] = value
    return true
  }
  get(target, key) {
    if (!this.dep.has(key)) {
      this.dep.set(key, target[key])
    }
    return this.dep.get(key)
  }
}
function useCreateState<T extends object>(data: T) {
  const [_, forceUpdate] = useReducer(d=>Symbol(),null)
  const state = useMemo(() => {
    return new BaseState(data, forceUpdate) as BaseState<T> & T
  }, [])
  return state
  // function getState<U extends (proxy: T) => any>(use: U) {
  //   return use(proxy) as ReturnType<U>
  // } 
  // function setState (data: Partial<T>) {
  //     for (const key in data) {
  //       proxy[key] = data[key]
  //     }
  //   }
  // return [getState, setState] as [typeof getState, typeof setState]
}
export {
  useCreateState
}
class State {
  useFormBind(selector?: ()=>any) {

  }

}