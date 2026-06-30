'use client'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

let toastFn: ((msg: string, type: ToastType) => void) | null = null

export function registerToast(fn: (msg: string, type: ToastType) => void) {
  toastFn = fn
}

export function toast(message: string, type: ToastType = 'info') {
  if (toastFn) {
    toastFn(message, type)
  } else {
    console.log(`[Toast ${type}]: ${message}`)
  }
}
