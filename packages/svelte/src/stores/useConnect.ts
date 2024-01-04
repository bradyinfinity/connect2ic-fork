import { useSelector } from "@xstate/svelte"
import { getContext, onMount } from "svelte"
import { contextKey } from "../context"
import type { ContextState } from "../context"
import { derived, readable } from "svelte/store"
import type { Readable } from "svelte/store"

type Props = {
  onConnect?: () => void
  onDisconnect?: () => void
}

const useConnect = (props: Props = {}) => {
  const { onConnect = () => {}, onDisconnect = () => {} } = props
  const { client } = getContext<ContextState>(contextKey)
  //@ts-ignore
  const principal = useSelector(
    client._service,
    (state) => state.context.principal,
  )
  //@ts-ignore
  const activeProvider = useSelector(
    client._service,
    (state) => state.context.activeProvider,
  )
  const state = useSelector(client._service, (state) => state)
  //@ts-ignore
  const status = useSelector(client._service, (state) => state.value)
  //@ts-ignore
  const isConnected: Readable<boolean> = derived(state, ($state, set) => {
    //@ts-ignore
    set($state.matches({ idle: "connected" }) ?? false)
  })
  //@ts-ignore
  const isConnecting: Readable<boolean> = derived(state, ($state, set) =>
    set($state.matches({ idle: "connecting" }) ?? false),
  )
  //@ts-ignore
  const isInitializing: Readable<boolean> = derived(state, ($state, set) =>
    set($state.matches({ idle: "intializing" }) ?? false),
  )
  //@ts-ignore
  const isDisconnecting: Readable<boolean> = derived(state, ($state, set) =>
    set($state.matches({ idle: "disconnecting" }) ?? false),
  )
  //@ts-ignore
  const isIdle: Readable<boolean> = derived(state, ($state, set) =>
    set($state.matches({ idle: "idle" }) ?? false),
  )

  onMount(() => {
    const unsub = client.on("connect", onConnect)
    const unsub2 = client.on("disconnect", onDisconnect)
    return () => {
      unsub()
      unsub2()
    }
  })

  return {
    principal,
    status,
    activeProvider,
    isInitializing,
    isConnected,
    isConnecting,
    isDisconnecting,
    isIdle,
    connect: (provider: string) => {
      //@ts-ignore
      client.connect(provider)
    },
    cancelConnect: () => {
      client.cancelConnect()
    },
    disconnect: () => {
      client.disconnect()
    },
  }
}

export { useConnect }
