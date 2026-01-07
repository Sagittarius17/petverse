import * as React from "react"

import type { ToastProps } from "@/components/ui/toast" // Correct import path for ToastProps

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000 // This constant seems unused in the provided reducer, but kept as per original

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type Action = 
  | { type: typeof actionTypes.ADD_TOAST; toast: ToasterToast }
  | { type: typeof actionTypes.UPDATE_TOAST; toast: Partial<ToasterToast> }
  | { type: typeof actionTypes.DISMISS_TOAST; toastId?: ToasterToast["id"] }
  | { type: typeof actionTypes.REMOVE_TOAST; toastId?: ToasterToast["id"] }

interface State {
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action

      // ! Side effect ! - This will be helpful when we go to add batching. 
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => ({ ...t, open: false })),
      }

    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

// Global state and listeners for the toast system
const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = {
  id: string
  dismiss: () => void
  update: (props: Partial<ToasterToast>) => void
}

function createToast({ ...props }: ToastProps): Toast {
  const id = genId()

  const update = (props: Partial<ToasterToast>) =>
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { id, ...props } })
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({ type: actionTypes.ADD_TOAST, toast: { id, open: true, ...props } })

  return {
    id: id,
    dismiss,
    update,
  }
}

// This is the actual hook that components will use.
type UseToast = () => {
  toast: typeof createToast
}

export const useToast: UseToast = () => {
  return {
    toast: createToast,
  }
}

function genId() {
  return Math.random().toString(36).substring(2, 9)
}

// The ToastProvider and related UI components (Toast, ToastViewport etc.)
// are expected to be in src/components/ui/toast.tsx and consume this hook's state.
// They are not defined here as per the instruction to separate logic from UI.
// For example, in toast.tsx, you would have:
//
// export function Toaster() {
//   const [{ toasts }] = useToastState(); // Assuming useToastState is another hook or internal mechanism
//   return (
//     <ToastViewport>
//       {toasts.map(function ({ id, title, description, action, ...props }) {
//         return (
//           <Toast key={id} {...props}>
//             <div className="grid gap-1">
//               {title && <ToastTitle>{title}</ToastTitle>}
//               {description && (
//                 <ToastDescription>{description}</ToastDescription>
//               )}
//             </div>
//             {action}
//             <ToastClose />
//           </Toast>
//         )
//       })}
//       <Toast />
//     </ToastViewport>
//   )
// }
//
// And a separate context/state management if `useToast` itself is not meant to manage UI rendering.
// Given the prompt and provided content, the existing `toast.tsx` file would likely need
// to connect to this `useToast` hook via a `ToastProvider` or similar mechanism.

// For now, let's assume `ToastProvider` and the actual `Toast` UI components
// are correctly set up in `src/components/ui/toast.tsx` to listen to the
// state managed by this `useToast`'s internal dispatch system.
// The core request is to provide the `useToast` hook logic.