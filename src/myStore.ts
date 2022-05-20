// type Store<
//   S extends Record<string, any> = {},
//   G /* extends GettersTree<S>*/ = {},
//   // has the actions without the context (this) for typings
//   A /* extends ActionsTree */ = {}
//   > = BaseStore &
//   S &
//   _StoreWithGetters<G> &
//   // StoreWithActions<A> &
//   (Obj<(...arg:any)=>any> extends A ? {} : A)

import { useMemo, useReducer } from "react"


type ActionHandler<A> = {
  [k in keyof A]: A[k] extends (...args: infer P) => infer R
  ? (...args: P) => R
  : never
}

type Getters<S extends Obj> = Record<
  string, ((state: S) => any) | (() => any)
  >

export type GetterRes<G> = {
  readonly [k in keyof G]: G[k] extends (...args: any[]) => infer R
  ? R
  : G[k]
}

type Obj<T = any> = Record<string, T>

type ModelOptions<S extends Obj, G, A> = {
  name?: string;
  initState: S | (() => S);
  getters?: G & Getters<S>  & ThisType<S & GetterRes<G>>
  actions?: A & ThisType<ActionHandler<A> & BaseStore & S & GetterRes<G>>
}
function getValueOfPath(target, path: string[]) {
  return path.reduce((result, key) => result[key], target)
  // let result
  // for (const key of path) {
  //   result = target[key]
  // }
  // return result
}
const accessor = (key:string, data:Obj, cb: (record: { path: string[], value: any })=>void ) => {
  const path: string[] = [key]
  const handler = {
    get(target, key:string) {
      const current = target[key]
      if (target && typeof target === 'object') {
        path.push(key)
        return new Proxy(current, handler) 
      } else {
        return current
      }
    },
    set(target, key, value) {
      cb({ path, value })
      return Reflect.set(target, key, value)
    }
  }
  return new Proxy(data, handler)
}

class BaseStore{
  #state: Obj
  forceUpdate!: ()=>void
  constructor({ initState, actions = {} }, forceUpdate) {
    this.forceUpdate = forceUpdate
    this.#state = typeof initState === 'function'? initState() : initState
    Object.keys(initState).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        get: () => this.#state[key]
      });
    })
    
    let changes:{path:string[], value: any}[] = []

    const context = new Proxy({}, {
          get: (target, key: string) => {
            const prop = this.#state[key]
            if (prop && typeof prop === 'object') {
              return accessor(key, prop, (record) => changes.push(record))
            } else {
              return Reflect.get(this, key)
            }
          },
      set: (target, key: string, value) => {
        if (Reflect.has(this.#state, key)) {
          if (this.#state[key] !== value) {
            Reflect.set(this.#state, key, value)
            changes.push({ path: [key], value })
          }
          return true
        } else {
          return Reflect.set(this, key, value)
        }
      }
    })
    Object.keys(actions).forEach((key) => {
      this[key] = (...args) => {
        changes=[]
        Reflect.apply(actions[key], context, args)
        console.log(changes)
        // TODO: 应用变化
        if (changes.length) {
          const newState = {...this.#state}
          changes.forEach(({ path, value }) => {
            let current = newState
            path.forEach((key, idx) => {
              if (idx === path.length - 1) {
                current[key] = value
              } else {
                current = current[key] = {...current[key]}
              }
            })
          })
          this.#state = newState
          this.forceUpdate()
        }
      }
    })
  }
}
function hook() {
  //     hook['p'] = {}
  // const proto = {}
  //   actions && Object.keys(actions).forEach((key) => {
  //     proto[key] = (...args) => {
  //       changes=[]
  //       Reflect.apply(actions[key], context, args)
  //       console.log(changes)
  //       // TODO: 应用变化
  //       if (changes.length) {
  //         this.forceUpdate()
  //       }
  //     }
  //   })
  const createHooks = () => {

  }
  return createHooks
}
export function defineStore<S extends Obj = {}, G = {}, A = {}>(config: ModelOptions<S, G, A>) {
  const {initState, actions} = config

  const user = new WeakMap()
  let temp: ActionHandler<A> & BaseStore & S | null
  const createModel = (forceUpdate, initState = config.initState) => {
    const model = temp || new BaseStore({ ...config, initState }, forceUpdate) as ActionHandler<A> & BaseStore & S
    if (temp) {
      user.set(forceUpdate, temp)
      model.forceUpdate = forceUpdate
      temp = null
    } else {
      temp = model
    }
    return model
  }

  function useModel(state?: S) {
    const [_, forceUpdate] = useReducer(d => d+1, 0)
    const model = useMemo(() => {
      return createModel(forceUpdate, state )
    }, [])
    // const model = user.get(forceUpdate) || createModel(forceUpdate, state)
    return model
  }

  const useStore = () => {

  }
  return {
    useModel
  }
}

const store = defineStore({
  // name: '',
  initState: {
    count: 0
  },
  getters: {
    bas(s) {
      return s.count
    },
    bat: (s) => {
      return s.count
    },
    abc() {
      return this.bas
    },
    // odc() {
    //   return this.count
    // }

  },
  actions: {
    test() {
      this.test()
      console.log(this.bas)
      this.increment('s')
    },
    increment(s:string) {
      this.count += 1
    }
  }
})

const useTest = () => {
  const [state, setState] = useMereState({
    count: 1,
    name: ''
  })
  setState('name', 'joe')
  setState({
    name: 'joe'
  })
  setState(d => {
    d.count += 1
  })

  return {
    setState
  }
}

function useMereState(arg0: { count: number; name: string }): [any, any] {
  throw new Error("Function not implemented.")
}
