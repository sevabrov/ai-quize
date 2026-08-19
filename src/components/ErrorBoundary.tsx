import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Замість зникнення екрану — конкретна помилка з можливістю перезапуску.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[quiz] React error:', error, info.componentStack)
  }

  private reset = () => {
    this.setState({ error: null })
  }

  private hardReset = () => {
    try {
      localStorage.clear()
    } catch {
      /* ignore */
    }
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <div className="w-full max-w-lg rounded-panel border border-line bg-white p-8 shadow-card">
          <span className="grid size-12 place-items-center rounded-full bg-amber-50 text-accent-amber">
            <TriangleAlert className="size-6" strokeWidth={2.25} />
          </span>
          <h1 className="mt-5 text-2xl">Щось зламалося</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Екран не вдалося показати. Ось технічна деталь — її достатньо, щоб виправити
            причину:
          </p>
          <pre className="mt-4 max-h-48 overflow-auto rounded-card bg-cream-100 p-4 text-xs leading-relaxed text-ink-soft">
            {error.message}
          </pre>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="md" onClick={this.reset}>
              <RefreshCw className="size-4" strokeWidth={2.5} />
              Спробувати ще раз
            </Button>
            <Button size="md" variant="secondary" onClick={this.hardReset}>
              Почати спочатку
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
