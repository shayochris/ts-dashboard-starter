import { AuthShowcase } from '#/routes/_auth/-components/auth-showcase'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { LayoutDashboardIcon } from 'lucide-react'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

const APP_NAME = 'Dashboard Starter'

function AuthLayout() {
  return (
    <div className="auth-theme relative isolate flex min-h-dvh flex-col overflow-hidden bg-card text-foreground sm:bg-muted">
      <BackgroundShapes />

      <main className="flex flex-1 items-center justify-center sm:px-6 sm:py-12 lg:py-16">
        <div className="grid w-full max-w-220 bg-card sm:rounded-md sm:shadow-[0_2px_30px_rgba(0,0,0,0.08)] lg:grid-cols-2">
          <aside className="hidden border-r border-border px-12 py-14 lg:flex">
            <AuthShowcase />
          </aside>

          <section className="flex flex-col px-6 py-10 sm:px-12 sm:py-14 lg:px-16">
            <div className="mx-auto w-full max-w-132 lg:mx-0">
              <a
                href="/"
                className="auth-brand mb-8 inline-flex items-center gap-2"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <LayoutDashboardIcon className="size-5" />
                </span>
                <span className="text-lg font-bold tracking-tight">
                  {APP_NAME}
                </span>
              </a>

              <Outlet />
            </div>
          </section>
        </div>
      </main>

      <footer className="px-6 pb-6 text-center text-sm text-muted-foreground sm:pb-8">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  )
}

function BackgroundShapes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden sm:block"
    >
      <div className="absolute inset-0 bg-background/50 [clip-path:polygon(0_0,30%_0,0_45%)]" />
      <div className="absolute inset-0 bg-background/40 [clip-path:polygon(12%_0,55%_0,20%_60%)]" />
      <div className="absolute inset-0 bg-background/40 [clip-path:polygon(100%_0,100%_40%,70%_10%)]" />
      <div className="absolute inset-0 bg-background/50 [clip-path:polygon(0_70%,40%_100%,0_100%)]" />
      <div className="absolute inset-0 bg-background/40 [clip-path:polygon(100%_60%,100%_100%,60%_100%)]" />
      <div className="absolute inset-0 bg-background/30 [clip-path:polygon(45%_80%,95%_65%,85%_100%,50%_100%)]" />
    </div>
  )
}
