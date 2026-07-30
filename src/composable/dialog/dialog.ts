import { createApp, h, getCurrentInstance } from 'vue'
import type { VNode, App } from 'vue'
import ConfirmDialog from '../../components/custom/dialog/ConfirmDialog.vue'
import AlertDialog from '../../components/custom/dialog/AlertDialog.vue'
import FormDialog from '../../components/custom/dialog/FormDialog.vue'

interface ConfirmOptions {
  title?: string;
  description?: string;
  btnOk?: string;
  btnCancel?: string;
}

interface AlertOptions {
  title?: string;
  description?: string;
  btnCancel?: string;
}

interface DialogResult {
  confirmed: boolean;
  value?: any;
}

interface FormDialogOptions<T = any> {
  title?: string
  description?: string
  submitText?: string
  cancelText?: string

  schema: any
  fieldConfig?: any
  initialValues?: Partial<T>
}

interface FormDialogResult<T = any> {
  confirmed: boolean
  value?: T
}


/**
 * 확인 다이얼로그를 표시합니다.
 * @param options 다이얼로그 옵션
 * @returns Promise<DialogResult>
 */
function showConfirmDialog(options: ConfirmOptions): Promise<DialogResult> {
  return new Promise((resolve) => {
    // 다이얼로그를 마운트할 div 생성
    const dialogContainer = document.createElement('div')
    document.body.appendChild(dialogContainer)

    // 기본 옵션과 사용자 옵션 병합
    const dialogOptions = {
      title: options.title || '확인',
      description: options.description || '계속 진행하시겠습니까?',
      btnOk: options.btnOk || '확인',
      btnCancel: options.btnCancel || '취소'
    }

    // 다이얼로그 앱 생성
    const dialogApp = createApp({
      render() {
        return h(ConfirmDialog, {
          ...dialogOptions,
          ref: 'dialog',
          onVnodeMounted: (vnode: VNode) => {
            // 다이얼로그가 마운트되면 자동으로 열기
            setTimeout(() => {
              if (vnode.component && vnode.component.exposed) {
                vnode.component.exposed.openDialog()
                  .onOk((value: any) => {
                    resolve({ confirmed: true, value })
                    destroyDialog()
                  })
                  .onCancel(() => {
                    resolve({ confirmed: false })
                    destroyDialog()
                  })
              }
            }, 0)
          }
        })
      }
    })

    // 다이얼로그 마운트
    dialogApp.mount(dialogContainer)

    // 다이얼로그 제거 함수
    const destroyDialog = () => {
      dialogApp.unmount()
      document.body.removeChild(dialogContainer)
    }
  })
}

/**
 * 알림 다이얼로그를 표시합니다.
 * @param options 다이얼로그 옵션
 * @returns Promise<void>
 */
function showAlertDialog(options: AlertOptions): Promise<void> {
  return new Promise((resolve) => {
    // 다이얼로그를 마운트할 div 생성
    const dialogContainer = document.createElement('div')
    document.body.appendChild(dialogContainer)

    console.log('rmrj', options)

    // 기본 옵션과 사용자 옵션 병합
    const dialogInfo = {
      title: options.title || '알림',
      description: options.description || '',
      btnCancel: options.btnCancel || '확인'
    }

    console.log('2222', dialogInfo)

    // 다이얼로그 앱 생성
    const dialogApp = createApp({
      render() {
        return h(AlertDialog, {
          ...dialogInfo,
          ref: 'dialog',
          onVnodeMounted: (vnode: VNode) => {
            // 다이얼로그가 마운트되면 자동으로 열기
            setTimeout(() => {
              if (vnode.component && vnode.component.exposed) {
                vnode.component.exposed.openDialog()
              }
            }, 0)
          },
          onCancel: () => {
            resolve()
            destroyDialog()
          }
        })
      }
    })

    // 다이얼로그 마운트
    dialogApp.mount(dialogContainer)

    // 다이얼로그 제거 함수
    const destroyDialog = () => {
      dialogApp.unmount()
      document.body.removeChild(dialogContainer)
    }
  })
}


/**
 * AutoForm 다이얼로그를 표시합니다.
 * @param options 다이얼로그 옵션
 * @returns Promise<void>
 */
function showFormDialog<T = any>(options: FormDialogOptions<T>): Promise<FormDialogResult<T>> {
  return new Promise((resolve) => {
    const dialogContainer = document.createElement('div')
    document.body.appendChild(dialogContainer)

    const dialogApp = createApp({
      render() {
        return h(FormDialog, {
          ...options,
          onVnodeMounted: (vnode: VNode) => {
            setTimeout(() => {
              vnode.component?.exposed?.openDialog?.()
            }, 0)
          },
          onSubmit: (payload: any) => {
            resolve({ confirmed: true, value: payload as T })
            destroyDialog()
          },
          onCancel: () => {
            resolve({ confirmed: false })
            destroyDialog()
          },
        })
      },
    })

    dialogApp.mount(dialogContainer)

    const destroyDialog = () => {
      dialogApp.unmount()
      document.body.removeChild(dialogContainer)
    }
  })
}

/**
 * 전역 다이얼로그 메서드를 등록합니다.
 */
export function registerGlobalDialogs(app: App): void {
  // 전역 객체에 다이얼로그 메서드 추가
  app.config.globalProperties.$dialog = {
    confirm: showConfirmDialog,
    alert: showAlertDialog,
    form: showFormDialog,
  }
}

/**
 * 현재 컴포넌트 인스턴스의 다이얼로그 메서드를 가져옵니다.
 * 컴포넌트 내에서 사용할 때 유용합니다.
 */
export function useDialog() {
  const instance = getCurrentInstance()
  if (!instance) {
    // 컴포넌트 인스턴스가 없는 경우 (setup 외부에서 호출된 경우)
    console.warn('useDialog는 setup 함수 내에서만 사용할 수 있습니다.')
    return {
      confirm: showConfirmDialog,
      alert: showAlertDialog,
      form: showFormDialog
    }
  }

  // proxy를 통해 globalProperties에 접근
  return instance.appContext.config.globalProperties.$dialog
}

// 타입 선언 확장
declare global {
  interface Window {
    $dialog: {
      confirm: (options: ConfirmOptions) => Promise<DialogResult>
      alert: (options: AlertOptions) => Promise<void>
      form: <T = any>(options: FormDialogOptions<T>) => Promise<FormDialogResult<T>>
    }
  }
}

export default {
  registerGlobalDialogs,
  showConfirmDialog,
  showAlertDialog,
  showFormDialog,
  install: (app: App) => {
    app.config.globalProperties.$dialog = {
      confirm: showConfirmDialog,
      alert: showAlertDialog,
      form: showFormDialog
    }
  }
}


