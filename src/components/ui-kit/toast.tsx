import { Fragment, useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  type?: ToastType
  title: string
  message?: string
  duration?: number
  onClose?: () => void
  isVisible: boolean
}

export function Toast({
  type = 'success',
  title,
  message,
  duration = 3000,
  onClose,
  isVisible
}: ToastProps) {
  const [show, setShow] = useState(isVisible)
  
  useEffect(() => {
    setShow(isVisible)
    
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false)
        if (onClose) onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])
  
  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />,
    error: <XCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />,
    info: <InformationCircleIcon className="h-6 w-6 text-zinc-500" aria-hidden="true" />,
    warning: <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" aria-hidden="true" />
  }
  
  const bgColors = {
    success: 'bg-white dark:bg-zinc-900',
    error: 'bg-white dark:bg-zinc-900',
    info: 'bg-white dark:bg-zinc-900',
    warning: 'bg-white dark:bg-zinc-900'
  }
  
  const borderColors = {
    success: 'border-green-500',
    error: 'border-red-500',
    info: 'border-zinc-500',
    warning: 'border-amber-500'
  }
  
  const textColors = {
    success: 'text-zinc-900 dark:text-zinc-100',
    error: 'text-zinc-900 dark:text-zinc-100',
    info: 'text-zinc-900 dark:text-zinc-100',
    warning: 'text-zinc-900 dark:text-zinc-100'
  }

  return (
    <div 
      aria-live="assertive" 
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={clsx(
            "pointer-events-auto w-full max-w-sm overflow-hidden rounded-md border shadow-lg",
            bgColors[type],
            borderColors[type]
          )}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {icons[type]}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={clsx("text-sm font-medium", textColors[type])}>{title}</p>
                  {message && (
                    <p className={clsx("mt-1 text-sm", textColors[type])}>{message}</p>
                  )}
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className={clsx(
                      "inline-flex rounded-md bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      textColors[type],
                      `focus:ring-${type === 'info' ? 'zinc' : type === 'success' ? 'green' : type === 'warning' ? 'amber' : 'red'}-500`
                    )}
                    onClick={() => {
                      setShow(false)
                      setTimeout(() => {
                        if (onClose) onClose()
                      }, 100)
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  )
}

// ToastContainer to manage multiple toasts
export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          isVisible={true}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </>
  )
}

// ToastContext for managing toasts application-wide
import { createContext, useContext, ReactNode } from 'react'

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, title, message }])
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={handleClose} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
