import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { profileLoader } from '@/loaders/profile.loader'
import { FullScreenLoader } from '@/components/common/FullScreenLoader'
import Login from '@/pages/Login'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import UsersPage from '@/pages/UsersPage'
import CompaniesPage from '@/pages/CompaniesPage'
import PostsPage from '@/pages/PostsPage'
import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    },
  },
})

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    loader: () => null
  },
  {
    path: '/',
    element: <AppLayout />,
    loader: profileLoader,
    children: [
      {
        index: true,
        loader: () => {
          throw redirect('/dashboard')
        }
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'users',
        element: <UsersPage />
      },
      {
        path: 'companies',
        element: <CompaniesPage />
      },
      {
        path: 'posts',
        element: <PostsPage />
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
])

export function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <RouterProvider 
          router={router} 
          fallbackElement={<FullScreenLoader>Chargement...</FullScreenLoader>}
        />
      </TooltipProvider>
    </QueryClientProvider>
  )
}